package com.example.demo.review.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ProductReviewSummary {

    private double averageRating;
    private long totalReviews;
    private List<ReviewResponse> reviews;
}
