package com.example.demo.order.repository;

import com.example.demo.order.entity.Order;
import com.example.demo.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.security.core.parameters.P;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    // Xem danh sách đơn hàng của mình
    @Query("SELECT o FROM Order o " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.shop " +
            "WHERE o.user.email = :email " +
            "ORDER BY o.createdAt DESC")
    List<Order> findByUserEmail(@Param("email") String email);

    // Xem chi tiết đơn hàng theo orderCode
    @Query("SELECT o FROM Order o " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.shop " +
            "WHERE o.orderCode = :orderCode")
    Optional<Order> findByOrderCode(@Param("orderCode") String orderCode);

    // Shop xem đơn hàng của shop mình
    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.shop s " +
            "WHERE s.owner.email = :email " +    // ← thêm khoảng trắng
            "ORDER BY o.createdAt DESC")          // ← sửa createAt
    List<Order> findByShopOwnerEmail(@Param("email") String email);

    // Lọc theo status (user)
    @Query("SELECT o FROM Order o " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.shop " +
            "WHERE o.user.email = :email AND o.status = :status " +
            "ORDER BY o.createdAt DESC")          // ← sửa createAt
    List<Order> findByUserEmailAndStatus(@Param("email") String email, @Param("status") OrderStatus status);

    // Shop lọc đơn hàng theo status
    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.shop s " +
            "WHERE s.owner.email = :email AND o.status = :status " +
            "ORDER BY o.createdAt DESC")          // ← sửa createAt
    List<Order> findByShopOwnerEmailAndStatus(@Param("email") String email, @Param("status") OrderStatus status);
}
