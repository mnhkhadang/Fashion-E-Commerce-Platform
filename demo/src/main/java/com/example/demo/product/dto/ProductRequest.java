package com.example.demo.product.dto;

import com.example.demo.product.entity.ProductMedia;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private int stock;
    private Long categoryId;
    private List<MediaRequest> mediaList;

    @Getter
    @Setter
    public static class MediaRequest {
        private String url;
        private ProductMedia.MediaType type; // IMAGE hoặc VIDEO
        private int sortOrder;
    }
}