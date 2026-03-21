package com.example.demo.review.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReviewMediaResponse {

    private Long id;
    private String url;
    private String type;
    private int sortOrder;
}
