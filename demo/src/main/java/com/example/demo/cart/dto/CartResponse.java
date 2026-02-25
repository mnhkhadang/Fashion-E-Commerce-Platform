package com.example.demo.cart.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class CartResponse {

    private UUID cartId;
    private List<CartItemResponse> items;
    private BigDecimal totalPrice;

    @Getter
    @AllArgsConstructor
    public static class CartItemResponse{
        private long itemId;
        private String productName;
        private String productSlug;
        private BigDecimal price;
        @Min(value = 1, message = "Quantity must be greater than 0")
        private int quantity;
        private BigDecimal subTotal;
    }
}
