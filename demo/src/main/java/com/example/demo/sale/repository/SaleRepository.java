package com.example.demo.sale.repository;


import com.example.demo.sale.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Admin: lấy tất cả sale PLATFORM
    List<Sale> findByCreatedByOrderByCreatedAtDesc(Sale.SaleCreatedBy createdBy);

    // Shop: lấy sale của shop mình
    @Query(" SELECT s FROM Sale s " +
            "WHERE s.shop.id = :shopId " +
            "ORDER BY s.createdAt DESC")
    List<Sale> findByShopId(@Param("shopId")UUID shopId);

    // Lấy các sale PLATFORM đang ACTIVE (shop dùng để xem và opt-in)
    List<Sale> findByCreatedByAndStatus(Sale.SaleCreatedBy createdBy, Sale.SaleStatus status);

}
