package com.example.demo.review.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private int rating;
    private String comment;
    private List<ReviewMediaResponse> mediaResponseList;
    private String username;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean canEdit;
}
