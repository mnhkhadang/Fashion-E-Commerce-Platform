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

    // true nếu có ít nhất 1 item có vấn đề (hết hàng / giá thay đổi / inactive)
    // frontend dùng để hiển thị banner cảnh báo tổng quát
    private boolean hasWarning;

    @Getter
    @AllArgsConstructor
    public static class CartItemResponse{
        private long itemId;
        private String productName;
        private String productSlug;

        // giá hiện tại sản phẩm
        private BigDecimal currentPrice;
        //Giá lúc user thêm vào cart
        private BigDecimal addedPrice;


        @Min(value = 1, message = "Quantity must be greater than 0")
        private int quantity;
        private BigDecimal subTotal;

        // --- Warning flags ---

        // Giá đã thay đổi so với lúc thêm vào cart
        // null addedPrice → không warning (data cũ)
        private boolean priceChanged;

        // Sản phẩm không đủ hàng cho số lượng hiện tại trong cart
        private boolean outOfStock;

        // Sản phẩm đã bị ẩn/ngừng bán
        private boolean inactive;

    }
}
