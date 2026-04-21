package com.example.demo.sale.dto;

import com.example.demo.sale.entity.Sale;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class SaleResponse {
    private Long id;
    private String name;
    private int discountPercent;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Sale.SaleCreatedBy createdBy;  // PLATFORM | SHOP
    private Sale.SaleStatus status;        // UPCOMING | ACTIVE | ENDED
    private String shopName;               // null nếu PLATFORM
    private List<SaleProductItem> products;
    private LocalDateTime createdAt;

    @Getter
    @AllArgsConstructor
    public static class SaleProductItem {
        private String productId;
        private String productName;
        private String productSlug;
    }
}