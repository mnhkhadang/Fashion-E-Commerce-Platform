package com.example.demo.sale.repository;

import com.example.demo.sale.entity.SaleProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SaleProductRepository extends JpaRepository<SaleProduct, Long> {

    // Query sale ACTIVE của 1 product tại thời điểm now
    // Ưu tiên PLATFORM trước SHOP nếu cùng lúc có cả 2
    @Query("""
        SELECT sp FROM SaleProduct sp
        JOIN FETCH sp.sale s
        WHERE sp.product.id = :productId
            AND s.status = 'ACTIVE'
            AND s.startAt <= :now
            AND s.endAt >= :now
        ORDER BY
            CASE s.createdBy WHEN 'PLATFORM' THEN 0 ELSE 1 END ASC
        LIMIT 1        
    """)
    Optional<SaleProduct> findActiveByProductId(
            @Param("productId") UUID productId,
            @Param("now") LocalDateTime now
    );

    // Lấy tất cả product đang tham gia 1 sale cụ thể
    @Query("""
        SELECT sp FROM SaleProduct sp
        JOIN FETCH sp.product p
        JOIN FETCH p.shop
        WHERE sp.sale.id = :saleId
    """)
    List<SaleProduct> findBySaleId(@Param("saleId") Long saleId);

    // Kiểm tra product đã tham gia sale này chưa
    boolean existsBySaleIdAndProductId(Long saleId, UUID productId);

    // Xóa product khỏi sale
    void deleteBySaleIdAndProductId(Long saleId, UUID productId);

    // Lấy tất cả sale product theo shop (để shop quản lý)
    @Query("""
        SELECT sp FROM SaleProduct sp
        JOIN FETCH sp.sale s
        JOIN FETCH sp.product p
        WHERE p.shop.id = :shopId
          AND s.status = 'ACTIVE'
    """)
    List<SaleProduct> findActiveByShopId(@Param("shopId") UUID shopId);
}
