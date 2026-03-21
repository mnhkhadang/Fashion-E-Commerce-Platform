package com.example.demo.review.repository;

import com.example.demo.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByUserIdAndProductId(UUID userId, UUID productId);

    List<Review> findByProductSlugOrderByCreatedAtDesc(String productSlug);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.slug = :productSlug")
    Double findAverageRatingByProductSlug(@Param("productSlug") String productSlug);

    long countByProductSlug(String productSlug);
}
