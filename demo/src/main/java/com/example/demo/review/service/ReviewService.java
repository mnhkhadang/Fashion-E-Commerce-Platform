package com.example.demo.review.service;

import com.example.demo.order.repository.OrderRepository;
import com.example.demo.product.entity.Product;
import com.example.demo.product.repository.ProductRepository;
import com.example.demo.review.dto.*;
import com.example.demo.review.entity.Review;
import com.example.demo.review.entity.ReviewMedia;
import com.example.demo.review.repository.ReviewRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.chrono.ChronoLocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    private static final int COOLDOWN_MINUTES = 30;

    //lấy danh sách đánh giá
    @Transactional(readOnly = true)
    public ProductReviewSummary getProductReviews(String productSlug, String currentUserEmail){
        List<Review> reviews = reviewRepository.findByProductSlugOrderByCreatedAtDesc(productSlug);
        Double avg = reviewRepository.findAverageRatingByProductSlug(productSlug);
            long total = reviewRepository.countByProductSlug(productSlug);

        List<ReviewResponse> response = reviews.stream()
                .map(r -> toResponse(r, currentUserEmail))
                .toList();
        return  new ProductReviewSummary(avg != null ? avg : 0.0, total,response);
    }
    //create
    @Transactional
    public ReviewResponse createReview(String email, String  productSlug, ReviewRequest request){


        User user = userRepository.findByEmail(email)
                .orElseThrow( ()-> new RuntimeException("User not found"));
        Product product = productRepository.findBySlug(productSlug)
                .orElseThrow(()-> new RuntimeException("Product not found"));

        if(!orderRepository.existsDeliveredOrderWithProduct(user.getId(), product.getSlug())){
            throw new RuntimeException("Bạn cần mua và nhận hàng trước khi đánh giá sản phẩm "+product.getName());
        }

        if(reviewRepository.findByUserIdAndProductId(user.getId(), product.getId()).isPresent()){
            throw new RuntimeException("Bạn đã đánh giá sản phầm này rồi. Hãy chỉnh sửa lại đánh giá trước đó ");
        }

        if(request.getRating() < 1 || request.getRating() > 5){
            throw new RuntimeException("Số sao phải từ 1 đến 5");
        }


        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        setMediaList(review, request.getMediaRequestList());

        return toResponse(reviewRepository.save(review),email);
    }

    //update
    @Transactional
    public ReviewResponse update(String email, Long reviewId, ReviewRequest request){
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(()-> new RuntimeException("Review not found"));

        if(!review.getUser().getEmail().equals(email)){
            throw new RuntimeException("Bạn không có quyền thay đổi nội dung đánh giá");
        }

        LocalDateTime canEditAfter = review.getUpdatedAt().plusMinutes(COOLDOWN_MINUTES);
        if(LocalDateTime.now().isBefore(canEditAfter)){
            long minutesLeft = ChronoUnit.MINUTES.between(LocalDateTime.now(), canEditAfter) + 1;
            throw new RuntimeException("Bạn chỉ có thể chỉnh sửa sau "+minutesLeft+" phút nữa");
        }
        if(request.getRating() < 1 || request.getRating() > 5){
            throw new RuntimeException("Số sao phải từ 1 đến 5");
        }
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.getMediaList().clear();
        setMediaList(review, request.getMediaRequestList());
        review.setUpdatedAt(LocalDateTime.now());
        return  toResponse(reviewRepository.save(review), email);

    }

    //delete
    @Transactional
    public void deleteReview(String email, Long reviewId){
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(()-> new RuntimeException("Review not found"));

        if(!review.getUser().getEmail().equals(email)){
            throw new RuntimeException("Bạn không có quyền xóa đánh giá này");
        }

        reviewRepository.delete(review);
    }

    private void setMediaList(Review review, List<ReviewMediaRequest> mediaRequests){
        if (mediaRequests == null || mediaRequests.isEmpty())
            return;
        List<ReviewMedia> mediaList = new ArrayList<>();
        for ( ReviewMediaRequest m : mediaRequests){
            ReviewMedia media = new ReviewMedia();
            media.setUrl(m.getUrl());
            media.setType(ReviewMedia.MediaType.valueOf(m.getType().toUpperCase()));
            media.setSortOrder(m.getSortOrder());
            media.setReview(review);
            mediaList.add(media);
        }

    }



    private ReviewResponse toResponse(Review review, String currentUserEmail){
        boolean canEdit = currentUserEmail != null
                && review.getUser().getEmail().equals(currentUserEmail)
                && LocalDateTime.now().isAfter(review.getCreatedAt().plusMinutes(COOLDOWN_MINUTES));

        List<ReviewMediaResponse> mediaResponse = review.getMediaList().stream()
                .sorted((a,b) -> Integer.compare(a.getSortOrder(),b.getSortOrder()))
                .map(m -> new ReviewMediaResponse(m.getId(), m.getUrl(), m.getType().name(),m.getSortOrder()))
                .toList();
        return  new ReviewResponse(
                review.getId(),
                review.getRating(),
                review.getComment(),
                mediaResponse,
                review.getUser().getUsername(),
                review.getCreatedAt(),
                review.getUpdatedAt(),
                canEdit
        );
    }
}
