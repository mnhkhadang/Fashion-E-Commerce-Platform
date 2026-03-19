package com.example.demo.order.dto;

import com.example.demo.order.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class OrderResponse {

    private String orderCode;
    private OrderStatus orderStatus;
    private BigDecimal totalPrice;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


    //thông tin giao hàng
    private String shippingFullName;
    private String shippingPhone;
    private String shippingStreetAddress;
    private String shippingDistrict;
    private String shippingProvince;

    private List<OrderItemResponse> items;

    @Getter
    @AllArgsConstructor
    public static class OrderItemResponse{
        private String productName;
        private String productSlug;
        private BigDecimal price;
        private int quantity;
        private BigDecimal subTotal;
        private String shopName;
    }
}
