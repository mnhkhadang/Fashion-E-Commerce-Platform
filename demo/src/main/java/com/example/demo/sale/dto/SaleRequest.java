package com.example.demo.sale.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class SaleRequest {

    private String name;
    private int discountPercent;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private List<String> productIds;
}
