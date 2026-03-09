package com.example.demo.order.service;

import com.example.demo.cart.entity.Cart;
import com.example.demo.cart.entity.CartItem;
import com.example.demo.cart.repository.CartRepository;
import com.example.demo.order.dto.OrderRequest;
import com.example.demo.order.dto.OrderResponse;
import com.example.demo.order.entity.Order;
import com.example.demo.order.entity.OrderItem;
import com.example.demo.order.entity.OrderStatus;
import com.example.demo.order.repository.OrderRepository;
import com.example.demo.product.entity.Product;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.shippingaddress.entity.ShippingAddress;
import com.example.demo.shippingaddress.repository.ShippingAddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ShippingAddressRepository shippingAddressRepository;
    private final ProductRepository productRepository;



    // xem danh sách đơn hàng
    public List<OrderResponse> getMyOrders(String email){
        return orderRepository.findByUserEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    //xem chi tiết đơn hàng theo orderCode;
    public OrderResponse getByOrderCode(String email, String orderCode){
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(()-> new RuntimeException("Order not found"));

        if(!order.getUser().getEmail().equals(email)){
            throw new RuntimeException("Order not found");
        }

        return toResponse(order);
    }

        //user hủy đơn hàng
        @Transactional
        public OrderResponse cancelOrder(String email, String orderCode){
            Order order = orderRepository.findByOrderCode(orderCode)
                    .orElseThrow(()-> new RuntimeException("Order not found"));

            if(!order.getUser().getEmail().equals(email)){
                throw new RuntimeException("Order not found");
            }

            // chỉ cho hủy khi pending or confirm
            if(order.getStatus() != OrderStatus.PENDING &&
               order.getStatus() != OrderStatus.CONFIRMED){
                throw new RuntimeException("Cannot cancel order. Please use return process");
            }
            // hoàn lại stock
            order.getItems().forEach(item -> {
                productRepository.findBySlug(item.getProductSlug()).ifPresent(product -> {
                    product.setStock(product.getStock()+item.getQuantity());
                    product.setSold(product.getSold() - item.getQuantity());
                    productRepository.save(product);
                });
            });

            order.setStatus(OrderStatus.CANCELLED);
            return toResponse(orderRepository.save(order));

        }

    //shop xem đơn hàng của mình
    public List<OrderResponse> getShopOrders(String email){
        return orderRepository.findByShopOwnerEmail(email)
                .stream()
                .map(this::toResponse)
                .toList();
    }
    //shop cập nhật trạng thái đơn hàng
    @Transactional
    public OrderResponse updateStatus(String email, String orderCode, OrderStatus newStatus){
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(()-> new RuntimeException("Order not found"));
        //kiểm tra đơn hàng có thuộc shop này hong
        boolean belongToShop = order.getItems().stream()
                .anyMatch(item -> item.getShop().getOwner().getEmail().equals(email));
        if(!belongToShop){
            throw new RuntimeException("Order not found");
        }
        //validate chuyển trạng thái
        validateStatusTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next){
        switch (current){
            case PENDING -> {
                if(next != OrderStatus.CONFIRMED)
                    throw new RuntimeException("Invalid status transition");
            }
            case CONFIRMED -> {
                if(next != OrderStatus.SHIPPING)
                    throw new RuntimeException("Invalid status transition");
            }
            case SHIPPING -> {
                if(next != OrderStatus.DELIVERED)
                    throw new RuntimeException("Invalid status transition");
            }
            default -> throw new RuntimeException("Cannot change status from: "+current);
        }
    }

    private static OrderItem getOrderItem(CartItem cartItem, Order order, Product product) {
        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProductName(product.getName());
        orderItem.setProductSlug(product.getSlug());
        orderItem.setPrice(product.getPrice());
        orderItem.setQuantity(cartItem.getQuantity());
        orderItem.setSubTotal(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        orderItem.setShop(product.getShop());
        return orderItem;
    }


    private String generateOrderCode(){
        String data = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%05d", new Random().nextInt(999999));
        return "ORD_" +data + "-" + random;
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
                order.getShippingFullName(),
                order.getShippingPhone(),
                order.getShippingStreetAddress(),
                order.getShippingDistrict(),
                order.getShippingProvince(),
                itemResponses
        );
    }
}
