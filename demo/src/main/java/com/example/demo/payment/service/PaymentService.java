package com.example.demo.payment.service;

import com.example.demo.cart.entity.Cart;
import com.example.demo.cart.entity.CartItem;
import com.example.demo.cart.repository.CartItemRepository;
import com.example.demo.cart.repository.CartRepository;
import com.example.demo.order.dto.OrderResponse;
import com.example.demo.order.entity.Order;
import com.example.demo.order.entity.OrderItem;
import com.example.demo.order.repository.OrderRepository;
import com.example.demo.payment.dto.CheckoutRequest;
import com.example.demo.payment.dto.PaymentResponse;
import com.example.demo.payment.entity.Payment;
import com.example.demo.payment.entity.PaymentStatus;
import com.example.demo.payment.repository.PaymentRepository;
import com.example.demo.product.entity.Product;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.shippingaddress.entity.ShippingAddress;
import com.example.demo.shippingaddress.repository.ShippingAddressRepository;
import com.example.demo.shop.entity.Shop;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final ShippingAddressRepository shippingAddressRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;

    //checkout
    @Transactional
    public PaymentResponse checkout(String email, CheckoutRequest request){
        //lấy giỏ hàng
        Cart cart = cartRepository.findByOwnerEmail(email)
                .orElseThrow(()-> new RuntimeException("Cart not found"));

        if(cart.getItems().isEmpty()){
            throw new RuntimeException("Cart is empty");
        }

        //lọc các item được chọn
        List<CartItem> selectItems = cart.getItems().stream()
                .filter(item -> request.getSlugs().contains(item.getProduct().getSlug()))
                .toList();
        if(selectItems.isEmpty()){
            throw new RuntimeException("No item selected");
        }

        //lấy địa chỉ giao hàng
        ShippingAddress shippingAddress = shippingAddressRepository.findById(request.getShippingAddressId())
                .orElseThrow(()-> new RuntimeException("Shipping address not found"));

        if(!shippingAddress.getOwner().getEmail().equals(email)){
            throw new RuntimeException("Shipping address not found");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("User not found"));

        // nhóm sản phẩm theo shop
        Map<Shop, List<CartItem>> itemByShop = selectItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getShop()));

        // tạo payment
        Payment payment = new Payment();
        payment.setPaymentCode(generatePaymentCode());
        payment.setMethod(request.getPaymentMethod());
        payment.setUser(user);

        //tạo order cho từng shop
        Set<Order> orders = new HashSet<>();
        for(Map.Entry<Shop, List<CartItem>> entry : itemByShop.entrySet()){
            Shop shop = entry.getKey();
            List<CartItem> shopItems = entry.getValue();

            Order order = new Order();
            order.setOrderCode(generateOrderCode());
            order.setNote(request.getNote());
            order.setUser(user);
            order.setPayment(payment);

            //snapshot địa chỉ
            order.setShippingFullName(shippingAddress.getFullName());
            order.setShippingPhone(shippingAddress.getPhone());
            order.setShippingStreetAddress(shippingAddress.getStreetAddress());
            order.setShippingDistrict(shippingAddress.getDistrict().getName());
            order.setShippingProvince(shippingAddress.getProvince().getName());

            //tạo order items
            List<OrderItem> orderItems = shopItems.stream()
                    .map(cartItem -> {
                        Product product = cartItem.getProduct();

                        if(product.getStock() < cartItem.getQuantity()){
                            throw new RuntimeException("Not enough stock for "+product.getName());
                        }

                        product.setStock(product.getStock() - cartItem.getQuantity());
                        product.setSold(product.getSold() + cartItem.getQuantity());
                        productRepository.save(product);

                        OrderItem orderItem = new OrderItem();
                        orderItem.setOrder(order);
                        orderItem.setProductName(product.getName());
                        orderItem.setProductSlug(product.getSlug());
                        orderItem.setPrice(product.getPrice());
                        orderItem.setQuantity(cartItem.getQuantity());
                        orderItem.setSubTotal(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
                        orderItem.setShop(shop);
                        return orderItem;
                    }).toList();

            order.setItems(orderItems);
            BigDecimal orderTotal = orderItems.stream()
                    .map(OrderItem::getSubTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            order.setTotalPrice(orderTotal);
            orders.add(order);
        }

        payment.setOrders(orders);

        // tính tổng tiền payment
        BigDecimal totalAmount = orders.stream()
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO,BigDecimal::add);
        payment.setTotalAmount(totalAmount);

        // nếu COD thì status là PENDING, nếu là VNPAY thì xử lí khác
        payment.setStatus(PaymentStatus.PENDING);

        paymentRepository.save(payment);

        //xóa item khỏi giỏ hàng
        List<String> slugs = request.getSlugs();
        cart.getItems().removeIf(item -> slugs.contains(item.getProduct().getSlug()));
        cartItemRepository.deleteByCartIdAndProductSlugIn(cart.getId(), slugs);
        cartRepository.save(cart);
        cartRepository.save(cart);

        return toResponse(payment);
    }
    //user xem danh sánh paymet
    public List<PaymentResponse> getMyPayments(String email){
        return paymentRepository.findByUserEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    // xem chi tiết payment
    public PaymentResponse getByPayment(String email, String paymentCode) {
        Payment payment = paymentRepository.findByPaymentCodeAndUserEmail(paymentCode, email)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return toResponse(payment);
    }


    private String generatePaymentCode(){
        String data = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%05d", new Random().nextInt(999999));
        return "PAY-"+data+"-"+random;
    }

    private String generateOrderCode(){
        String data = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%05d",new Random().nextInt(999999));
        return "ORD-"+data+"-"+random;
    }

    private PaymentResponse toResponse(Payment payment){
        List<OrderResponse> orderResponses = payment.getOrders().stream()
                .map(order -> {
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
                orderResponses
        );
    }

}
