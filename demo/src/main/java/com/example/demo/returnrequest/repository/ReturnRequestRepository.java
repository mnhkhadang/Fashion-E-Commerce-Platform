package com.example.demo.returnrequest.repository;

import com.example.demo.returnrequest.entity.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    // Tìm return request theo orderCode + user — dùng khi user xem request của mình
    @Query("""
        SELECT r FROM ReturnRequest r
        WHERE r.order.orderCode = :orderCode
        AND r.user.email = :email
        """)
    Optional<ReturnRequest> findByOrderCodeAndUserEmail(
            @Param("orderCode") String orderCode,
            @Param("email") String email
    );
    // Tìm return request theo orderCode — dùng khi shop review
    @Query("SELECT r FROM ReturnRequest r WHERE r.order.orderCode = :orderCode")
    Optional<ReturnRequest> findByOrderCode(@Param("orderCode") String orderCode);

    // Tìm tất cả return request của user
    @Query("SELECT r FROM ReturnRequest r WHERE r.user.email = :email ORDER BY r.createdAt DESC")
    List<ReturnRequest> findByUserEmail(@Param("email") String email);

    // Tìm tất cả return request thuộc shop
    @Query("""
        SELECT r FROM ReturnRequest r
        JOIN r.order o
        JOIN o.items i
        WHERE i.shop.owner.email = :shopEmail
        ORDER BY r.createdAt DESC
        """)
    List<ReturnRequest> findByShopOwnerEmail(@Param("shopEmail") String shopEmail);

    // Kiểm tra order đã có return request chưa
    boolean existsByOrderId(UUID orderId);
}
