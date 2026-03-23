package com.example.demo.product.repository;

import com.example.demo.product.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;

import java.util.List;
import java.util.Optional;
import java.util.OptionalInt;
import java.util.UUID;


public interface ProductRepository extends JpaRepository<Product, UUID> {


    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.shop " +
            "JOIN FETCH p.category c " +
            "LEFT JOIN FETCH p.mediaList " +
            "WHERE (c.name = :categoryName OR c.parent.name = :categoryName) AND p.active = true")
    List<Product> findByCategoryName(@Param("categoryName") String categoryName);

    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.shop " +
            "JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.mediaList " +
            "WHERE p.shop.id = :shopId")
    List<Product> findByShop(@Param("shopId") UUID shopId);

    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.shop " +
            "JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.mediaList " +
            "WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.shop " +
            "JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.mediaList " +
            "WHERE p.name LIKE %:keyword% AND p.active = true")
    List<Product> searchByName(@Param("keyword") String keyword);

    @Query("SELECT p FROM Product p " +
            "JOIN FETCH p.shop " +
            "JOIN FETCH p.category " +
            "LEFT JOIN FETCH p.mediaList " +
            "WHERE p.slug = :slug AND p.active = true")
    Optional<Product> findBySlug(@Param("slug") String slug);

    @Query("SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.mediaList " +
            "LEFT JOIN FETCH p.shop " +
            "LEFT JOIN FETCH p.category " +
            "WHERE p.active = true")
    List<Product> findAllActive();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdWithLock(@Param("id") UUID id);


}
