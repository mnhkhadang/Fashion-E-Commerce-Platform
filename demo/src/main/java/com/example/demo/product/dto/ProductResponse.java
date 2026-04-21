package com.example.demo.product.dto;

import com.example.demo.product.entity.ProductMedia;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class ProductResponse {

    private UUID id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private int stock;
    private boolean active;
    private int sold;
    private String shopName;
    private String categoryName;
    private List<MediaResponse> mediaList;

    private BigDecimal salePrice;
    private Integer discountPercent;
    private String saleSource;

    @Getter
    @AllArgsConstructor
    public static class MediaResponse{
        private String url;
        private ProductMedia.MediaType type;
        private int sortOrder;
    }
}
