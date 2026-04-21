package com.example.demo.chat.repository;

import com.example.demo.chat.entity.ProductAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductAttributeRepository extends JpaRepository<ProductAttribute, Long> {

    Optional<ProductAttribute> findByProductId(UUID productId);

    // Dùng sau khi Pinecone trả về list productId
    @Query("SELECT pa FROM ProductAttribute pa " +
            "JOIN FETCH pa.product p " +
            "LEFT JOIN FETCH p.mediaList " +
            "WHERE p.id IN :productIds AND p.active = true")
    List<ProductAttribute> findByProductIds(@Param("productIds") List<UUID> productIds);
}
