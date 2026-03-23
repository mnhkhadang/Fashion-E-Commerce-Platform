package com.example.demo.order.service;


import com.example.demo.auth.service.EmailService;
import com.example.demo.common.exception.NotFoundException;
import com.example.demo.common.exception.UnprocessableException;
import com.example.demo.order.dto.OrderResponse;
import com.example.demo.order.entity.Order;
import com.example.demo.order.entity.OrderItem;
import com.example.demo.order.entity.OrderStatus;
import com.example.demo.order.repository.OrderRepository;
import com.example.demo.payment.entity.PaymentMethod;
import com.example.demo.payment.service.PaymentService;

import com.example.demo.product.repository.ProductRepository;
import com.example.demo.reservation.service.ReservationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;

import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ReservationService reservationService;
    private final EmailService emailService;

    // @Lazy để tránh circular dependency:
    // PaymentService → OrderService (completeCodPaymentIfReady)
    // OrderService   → PaymentService (updateStatus DELIVERED)
    private final @Lazy PaymentService paymentService;

    public List<OrderResponse> getMyOrders(String email){
        return orderRepository.findByUserEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse getByOrderCode(String email, String orderCode){
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(()-> new NotFoundException("Order not found"));
        if (!order.getUser().getEmail().equals(email)){
            throw new NotFoundException("Order not found");
        }

        return toResponse(order);
    }
    /**
     * User hủy đơn hàng.
     *
     * Chỉ được hủy khi PENDING hoặc CONFIRMED.
     * Flow:
     * 1. Validate trạng thái
     * 2. Hoàn stock thật nếu đã bị trừ:
     *    - COD confirmed    → stock đã trừ khi checkout → cần hoàn
     *    - VNPay confirmed  → stock đã trừ sau callback → cần hoàn
     *    - VNPay pending    → stock chưa trừ → chỉ release reservation
     * 3. Release reservation → hoàn reservedStock
     * 4. Order → CANCELLED
     */
    @Transactional
    public OrderResponse cancelOrder(String email, String orderCode, String cancelReason){
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(()-> new NotFoundException("Order not found"));

        if (!order.getUser().getEmail().equals(email)){
            throw new NotFoundException("Order not found");
        }

        if(order.getStatus() != OrderStatus.PENDING &&
           order.getStatus() != OrderStatus.CONFIRMED){
            throw new UnprocessableException("Cannot cancel order. Status: "+ order.getStatus());
        }

        // Hoàn stock thật nếu đã bị trừ
        if (isStockDeducted(order)){
            restoreStock(order);
        }

        // Release reservation → hoàn reservedStock
        reservationService.releaseByOrderIds(List.of(order.getId()));

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(cancelReason);
        order.setUpdatedAt(LocalDateTime.now());

        log.info("Order cancelled: orderCode = {} user= {} reason = {}", orderCode, email, cancelReason);
        return toResponse(order);
    }

    //shop
    public List<OrderResponse> getShopOrders(String email){
        return orderRepository.findByShopOwnerEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Shop cập nhật trạng thái đơn hàng.
     *
     * Transitions hợp lệ:
     *   VNPay: PENDING → CONFIRMED → SHIPPING → DELIVERED
     *   COD:   CONFIRMED → SHIPPING → DELIVERED
     *
     * Khi DELIVERED (COD):
     *   → gọi completeCodPaymentIfReady() để trừ stock thật + complete payment
     */
    @Transactional
    public OrderResponse updateStatus(String email, String orderCode, OrderStatus newStatus){
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(()-> new NotFoundException("Order not found"));
        boolean belongToShop = order.getItems().stream()
                .anyMatch(item -> item.getShop().getOwner().getEmail().equals(email));

        if (!belongToShop){
            throw new NotFoundException("Order not found");
        }

        validateStatusTransition(order.getStatus(), newStatus);

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        // Trong updateStatus() — sau dòng orderRepository.save(order):
        emailService.sendOrderStatusUpdateEmail(
                order.getUser().getEmail(),
                orderCode,
                newStatus.name()
        );

        // COD: khi giao hàng thành công → trừ stock thật + complete payment
        if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());

            if (order.getPayment() != null &&
                    order.getPayment().getMethod() == PaymentMethod.COD) {
                paymentService.completeCodPaymentIfReady(order);
            }
        }

        log.info("Order status updated: orderCode = {} {} -> {}",orderCode, order.getStatus(), newStatus);
        return toResponse(order);
    }


    /**
     * Kiểm tra stock thật đã bị trừ chưa để quyết định có cần hoàn không.
     *
     * COD:          stock bị trừ ngay khi checkout → luôn cần hoàn
     * VNPay PENDING:   stock chưa trừ → không cần hoàn stock thật
     * VNPay CONFIRMED: stock đã trừ sau callback → cần hoàn
     */
    private boolean isStockDeducted(Order order){
        if (order.getPayment() == null)
            return false;
        return switch (order.getPayment().getMethod()){
            case COD -> true;
            case VNPAY -> order.getStatus() == OrderStatus.CONFIRMED;
        };
    }

    /**
     * Hoàn stock thật khi cancel.
     * Dùng productId thay vì productSlug (slug có thể thay đổi, id thì không).
     */

    private void restoreStock(Order order){
        for (OrderItem item : order.getItems()){
            if (item.getProductId() == null)
                continue;
            productRepository.findByIdWithLock(item.getProductId()).ifPresent(product -> {
                product.setStock(product.getStock() + item.getQuantity());
                product.setSold(product.getSold() - item.getQuantity());
                productRepository.save(product);
                log.info(" Restored stock: product = {} quantity = {} ", product.getName(), item.getQuantity());
            });
        }
    }
    /**
     * Validate chuyển trạng thái.
     *
     * PENDING   → CONFIRMED  (VNPay: sau callback, shop confirm thủ công)
     * CONFIRMED → SHIPPING
     * SHIPPING  → DELIVERED
     *
     * COD order bắt đầu từ CONFIRMED (bỏ qua PENDING)
     * nên shop chỉ thấy CONFIRMED → SHIPPING → DELIVERED.
     */
    private void validateStatusTransition(OrderStatus current, OrderStatus next){
        boolean valid = switch (current){
            case PENDING   -> next == OrderStatus.CONFIRMED;
            case CONFIRMED -> next == OrderStatus.SHIPPING;
            case SHIPPING  -> next == OrderStatus.DELIVERED;
            default        -> false;
        };

        if (!valid){
            throw new UnprocessableException("Invalid status transition" + current + " -> "+ next);
        }
    }

    private OrderResponse toResponse(Order order){
        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems()
                .stream()
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
    }
}
