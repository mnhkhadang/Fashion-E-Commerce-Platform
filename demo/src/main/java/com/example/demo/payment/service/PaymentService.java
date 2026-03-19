package com.example.demo.payment.service;

import com.example.demo.cart.entity.Cart;
import com.example.demo.cart.entity.CartItem;
import com.example.demo.cart.repository.CartItemRepository;
import com.example.demo.cart.repository.CartRepository;
import com.example.demo.order.dto.OrderResponse;

import com.example.demo.order.entity.Order;
import com.example.demo.order.entity.OrderItem;
import com.example.demo.order.entity.OrderStatus;
import com.example.demo.order.repository.OrderRepository;
import com.example.demo.payment.dto.CheckoutRequest;
import com.example.demo.payment.dto.CheckoutResponse;
import com.example.demo.payment.dto.PaymentResponse;
import com.example.demo.payment.entity.Payment;
import com.example.demo.payment.entity.PaymentMethod;
import com.example.demo.payment.entity.PaymentStatus;
import com.example.demo.payment.repository.PaymentRepository;
import com.example.demo.product.entity.Product;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.reservation.entity.Reservation;
import com.example.demo.reservation.repository.ReservationRepository;
import com.example.demo.reservation.service.ReservationService;
import com.example.demo.shippingaddress.entity.ShippingAddress;
import com.example.demo.shippingaddress.repository.ShippingAddressRepository;

import com.example.demo.shop.entity.Shop;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final ShippingAddressRepository shippingAddressRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final ReservationService reservationService;
    private final ReservationRepository reservationRepository;

    /**
     * Checkout flow mới:
     *
     * 1. Validate cart + shipping address
     * 2. Reserve từng product (pessimistic lock, TTL 15p)
     *    → tăng reservedStock, KHÔNG trừ stock thật ở đây
     * 3. Tạo Payment
     * 4. Tạo Orders nhóm theo shop
     *    → COD:   OrderStatus.CONFIRMED ngay
     *    → VNPay: OrderStatus.PENDING chờ callback
     * 5. Complete reservations → link orderId
     * 6. COD: trừ stock thật + tăng sold ngay
     *    VNPay: chờ callback mới trừ
     * 7. Xóa item khỏi cart
     */

    @Transactional
    public CheckoutResponse checkout(String email, CheckoutRequest request){

        // --- 1. Validate cart ---
        Cart cart = cartRepository.findByOwnerEmail(email)
                .orElseThrow(()-> new RuntimeException("Cart not found"));

        if(cart.getItems().isEmpty()){
            throw new RuntimeException("Cart is empty");
        }

        List<CartItem> selectedItems = cart.getItems().stream()
                .filter( item -> request.getSlugs().contains(item.getProduct().getSlug()))
                .toList();

        if(selectedItems.isEmpty()){
            throw new RuntimeException("Not item selected");
        }

        // --- Validate shipping address ---
        ShippingAddress shippingAddress = shippingAddressRepository
                .findById(request.getShippingAddressId())
                .orElseThrow(()-> new RuntimeException("Shipping address not found"));

        if(!shippingAddress.getOwner().getEmail().equals(email)){
            throw new RuntimeException("Shipping address not found");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("User not found"));

        // --- 2. Reserve từng product (pessimistic lock) ---
        // Nếu bất kỳ product nào không đủ stock → toàn bộ transaction rollback
        // reservedStock tăng lên tương ứng, stock thật chưa bị trừ
        List<Reservation> reservations = new ArrayList<>();
        for(CartItem cartItem: selectedItems ){
            Reservation reservation = reservationService.reserve(
                    user,
                    cartItem.getProduct().getId(),
                    cartItem.getQuantity()
            );
            reservations.add(reservation);
        }

        // Lấy TTL sớm nhất để trả về frontend (countdown timer)
        LocalDateTime reservationExpiredAt = reservations.stream()
                .map(Reservation::getExpiresAt)
                .min(LocalDateTime::compareTo)
                .orElse(null);
        // --- 3. Tạo Payment ---
        Payment payment = new Payment();
        payment.setPaymentCode(generatePaymentCode());
        payment.setMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setUser(user);

        // --- 4. Tạo Orders nhóm theo shop ---
        Map<Shop, List<CartItem>> itemByShop = selectedItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getShop()));

        Set<Order> orders = new HashSet<>();
        for(Map.Entry<Shop, List<CartItem>> entry : itemByShop.entrySet()){
            Shop shop = entry.getKey();
            List<CartItem> shopItems = entry.getValue();

            Order order = new Order();

            order.setOrderCode(generateOrderCode());
            order.setNote(request.getNote());
            order.setUser(user);
            order.setPayment(payment);
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());

            // Snapshot địa chỉ tại thời điểm đặt hàng
            order.setShippingFullName(shippingAddress.getFullName());
            order.setShippingPhone(shippingAddress.getPhone());
            order.setShippingStreetAddress(shippingAddress.getStreetAddress());
            order.setShippingDistrict(shippingAddress.getDistrict().getName());
            order.setShippingProvince(shippingAddress.getProvince().getName());

            // COD → CONFIRMED ngay vì không cần chờ payment gateway
            // VNPay → PENDING chờ callback
            order.setStatus(
                    request.getPaymentMethod() == PaymentMethod.COD
                            ? OrderStatus.CONFIRMED
                            : OrderStatus.PENDING
            );

            // Tạo order items — snapshot giá tại thời điểm order
            List<OrderItem> orderItems = shopItems.stream()
                    .map(cartItem -> {
                        Product product = cartItem.getProduct();
                        OrderItem orderItem = new OrderItem();
                        orderItem.setOrder(order);
                        orderItem.setProductId(product.getId());
                        orderItem.setProductName(product.getName());
                        orderItem.setProductSlug(product.getSlug());
                        orderItem.setPrice(product.getPrice());
                        orderItem.setQuantity(cartItem.getQuantity());
                        orderItem.setSubTotal(
                                product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()))
                        );
                        orderItem.setShop(shop);
                        return orderItem;
                    }).toList();
            order.setItems(orderItems);
            order.setTotalPrice(
                    orderItems.stream()
                            .map(OrderItem::getSubTotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add)
            );
            orders.add(order);
        }

        payment.setOrders(orders);
        payment.setTotalAmount(
                orders.stream()
                        .map(Order::getTotalPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
        );

        // Save payment + orders cascade
        paymentRepository.save(payment);
        // Bước 5 — CHỈ link orderId, không complete
        for (Reservation reservation : reservations) {
            UUID productId = reservation.getProduct().getId();
            orders.stream()
                    .filter(o -> o.getItems().stream()
                            .anyMatch(item -> item.getProductId().equals(productId)))
                    .findFirst()
                    .ifPresent(o -> {
                        reservation.setOrderId(o.getId());
                        // Không gọi reservationService.complete() ở đây
                    });
        }
        // Cần save reservations sau khi set orderId
        reservationRepository.saveAll(reservations);

        // --- 6. COD: trừ stock thật + tăng sold ngay ---
        // VNPay: stock thật sẽ bị trừ trong confirmVnpayPayment() sau callback
        if (request.getPaymentMethod() == PaymentMethod.COD){
            deductStock(orders);
        }
        // --- 7. Xóa item đã checkout khỏi cart ---
        List<String> checkOutSlugs = request.getSlugs();
        cart.getItems().removeIf(item -> checkOutSlugs.contains(item.getProduct().getSlug()));
        cartItemRepository.deleteByCartIdAndProductSlugIn(cart.getId(),checkOutSlugs);
        cartRepository.save(cart);

        log.info("Checkout success: user={} payment={} method={}",email, payment.getPaymentCode(), payment.getMethod());
        // VNPay: tạo redirect URL (Bước 5 sẽ implement)
        String vnpayUrl = null;
        if (request.getPaymentMethod() == PaymentMethod.VNPAY){
            // vnpayUrl = vnpayService.createPaymentUrl(payment);
            vnpayUrl = "VNPAY_URL_PLACEHOLDER";
        }
        return toCheckoutResponse(payment, reservationExpiredAt, vnpayUrl);
    }
    // ─── VNPay ───────────────────────────────────────────────────────────────

    /**
     * Xác nhận thanh toán VNPay thành công.
     * Gọi từ PaymentController.vnpayCallback() sau khi verify hash.
     *
     * 1. Payment PENDING → COMPLETED
     * 2. Orders PENDING → CONFIRMED
     * 3. Trừ stock thật + giảm reservedStock + tăng sold
     */
    @Transactional
    public void confirmVnpayPayment(String paymentCode) {
        Payment payment = paymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentCode));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            // Idempotent: VNPay có thể callback nhiều lần
            log.warn("Payment {} already processed: {}", paymentCode, payment.getStatus());
            return;
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        payment.getOrders().forEach(order -> {
            order.setStatus(OrderStatus.CONFIRMED);
            order.setUpdatedAt(LocalDateTime.now());
        });

        deductStock(payment.getOrders());
        log.info("VNPay payment confirmed: paymentCode={}", paymentCode);
    }

    /**
     * Xử lý thanh toán VNPay thất bại.
     * Gọi từ PaymentController.vnpayCallback() khi responseCode != "00".
     *
     * 1. Payment PENDING → FAILED
     * 2. Orders → CANCELLED
     * 3. Release reservations → hoàn reservedStock
     * Stock thật không bị ảnh hưởng vì chưa trừ.
     */
    @Transactional
    public void failVNPayPayment(String paymentCode) {
        Payment payment = paymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentCode));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            return;
        }

        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);

        payment.getOrders().forEach(order -> {
            order.setStatus(OrderStatus.CANCELLED);
            order.setCancelReason("VNPay payment failed");
            order.setUpdatedAt(LocalDateTime.now());
        });

        List<UUID> orderIds = payment.getOrders().stream()
                .map(Order::getId).toList();
        reservationService.releaseByOrderIds(orderIds);

        log.info("VNPay payment failed: paymentCode={}", paymentCode);
    }

    // ─── COD ─────────────────────────────────────────────────────────────────
    /**
     * COD: complete payment khi order DELIVERED.
     * Gọi từ OrderService.updateStatus() khi chuyển → DELIVERED.
     *
     * 1. Trừ stock thật + giảm reservedStock + tăng sold
     * 2. Nếu TẤT CẢ orders trong payment đều DELIVERED → Payment COMPLETED
     *
     * Lý do check tất cả: một payment có thể chứa nhiều orders (nhiều shop),
     * cần tất cả giao xong mới complete payment.
     */
    @Transactional
    public void completeCodPaymentIfReady(Order deliveredOrder) {
        Payment payment = deliveredOrder.getPayment();
        if (payment == null || payment.getMethod() != PaymentMethod.COD) return;
        if (payment.getStatus() == PaymentStatus.COMPLETED) return; // idempotent



        // Stock thật đã bị trừ ngay lúc checkout() cho COD → KHÔNG trừ lại ở đây
        // Chỉ complete payment khi TẤT CẢ orders đều DELIVERED

        boolean allDelivered = payment.getOrders().stream()
                .allMatch(o -> o.getId().equals(deliveredOrder.getId())
                        || o.getStatus() == OrderStatus.DELIVERED);

        if (allDelivered) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.info("COD payment completed: paymentCode={}", payment.getPaymentCode());
        }
    }

    /**
     * Xem danh sách payment của user.
     */

    public List<PaymentResponse> getMyPayments(String email){
        return paymentRepository.findByUserEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    /**
     * Xem chi tiết payment theo paymentCode.
     */
    public PaymentResponse getByPaymentCode(String email, String paymentCode){
        Payment payment = paymentRepository.findByPaymentCodeAndUserEmail(email, paymentCode)
                .orElseThrow( ()-> new RuntimeException("Payment not found"));

        return toResponse(payment);
    }


    /**
     * Trừ stock thật, giảm reservedStock, tăng sold.
     *
     * Gọi sau khi reservation đã COMPLETED nên reservedStock phải giảm.
     * Dùng pessimistic lock để tránh race condition.
     */
    private void deductStock (Set<Order> orders){
        for (Order order : orders){
            for (OrderItem orderItem : order.getItems()){
                productRepository.findByIdWithLock(orderItem.getProductId()).ifPresent(product -> {
                    product.setStock(product.getStock() - orderItem.getQuantity());
                    product.setSold(product.getSold() + orderItem.getQuantity());
                    // Giảm reservedStock vì reservation đã COMPLETED
                    int newReserved = Math.max(0, product.getReservedStock() - orderItem.getQuantity());
                    product.setReservedStock(newReserved);
                    productRepository.save(product);
                });
            }
        }
    }




    // --- Private helpers ---
    private String generatePaymentCode(){
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%06d", new Random().nextInt(999999));
        return "PAY-" +date+ "-" + random;
    }


    private String generateOrderCode(){
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%06d", new Random().nextInt(999999));
        return "ORDER-"+date+"-"+random;
    }

    private CheckoutResponse toCheckoutResponse(Payment payment,
                                                LocalDateTime reservationExpiredAt,
                                                String vnpayUrl){
        return new CheckoutResponse(
                toResponse(payment),
                reservationExpiredAt,
                vnpayUrl
        );
    }

    private PaymentResponse toResponse(Payment payment){
        List<OrderResponse> orderResponses = payment.getOrders().stream()
                .map( order -> {
                    List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                            .map(item -> new OrderResponse.OrderItemResponse(
                                    item.getProductName(),
                                    item.getProductSlug(),
                                    item.getPrice(),
                                    item.getQuantity(),
                                    item.getSubTotal(),
                                    item.getShop().getName()
                            )).toList();
                    return new OrderResponse(
                            order.getOrderCode(),
                            order.getStatus(),
                            order.getTotalPrice(),
                            order.getNote(),
                            order.getCreatedAt(),
                            order.getUpdatedAt(),
                            order.getShippingFullName(),
                            order.getShippingPhone(),
                            order.getShippingStreetAddress(),
                            order.getShippingDistrict(),
                            order.getShippingProvince(),
                            itemResponses
                    );
                }).toList();
        return new PaymentResponse(
                payment.getPaymentCode(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getTotalAmount(),
                payment.getCreatedAt(),
                payment.getPaidAt(),
                orderResponses
        );
    }



}
