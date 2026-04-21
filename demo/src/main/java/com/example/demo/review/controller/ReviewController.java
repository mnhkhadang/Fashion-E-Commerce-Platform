package com.example.demo.review.controller;


import com.example.demo.review.dto.ProductReviewSummary;
import com.example.demo.review.dto.ReviewRequest;
import com.example.demo.review.dto.ReviewResponse;
import com.example.demo.review.repository.ReviewRepository;
import com.example.demo.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    //lấy danh sách review của product
    @GetMapping("/product/{productSlug}")
    public ResponseEntity<ProductReviewSummary> getAllReview(
            @PathVariable String productSlug,
            @AuthenticationPrincipal UserDetails userDetails
            ){
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(reviewService.getProductReviews(productSlug,email));
    }

    //create review
    @PostMapping("/product/{productSlug}")
    public ResponseEntity<ReviewResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String productSlug,
            @RequestBody ReviewRequest request
            ){
        return ResponseEntity.ok(reviewService.createReview(userDetails.getUsername(), productSlug, request));
    }

    //update
    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reviewId,
            @RequestBody ReviewRequest request
    ){
        return ResponseEntity.ok(reviewService.update(userDetails.getUsername(), reviewId,request));
    }

    //delete
    @DeleteMapping("{reviewId}")
    public ResponseEntity<String> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reviewId
    ){
        reviewService.deleteReview(userDetails.getUsername(), reviewId);
        return ResponseEntity.ok("Xóa đánh giá thành công");
    }
}
