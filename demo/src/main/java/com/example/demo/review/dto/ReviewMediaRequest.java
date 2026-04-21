package com.example.demo.review.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewMediaRequest {

    private String url;
    private String type; // IMAGE or VIDEO
    private int sortOrder;
}
