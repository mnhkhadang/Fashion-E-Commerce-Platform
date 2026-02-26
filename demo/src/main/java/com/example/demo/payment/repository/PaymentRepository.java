package com.example.demo.payment.repository;

import com.example.demo.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    @Query("SELECT p FROM Payment p " +
            "LEFT JOIN FETCH p.orders o " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.shop " +
            "LEFT JOIN FETCH p.user " +   // ← thêm dòng này
            "WHERE p.user.email = :email " +
            "ORDER BY p.createdAt DESC")
    List<Payment> findByUserEmail(@Param("email") String email);

    @Query("SELECT p FROM Payment p " +
            "LEFT JOIN FETCH p.orders o " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.shop " +
            "WHERE p.paymentCode = :paymentCode")
    Optional<Payment> findByPaymentCode(@Param("paymentCode") String paymentCode);

    @Query("SELECT p FROM Payment p " +
            "LEFT JOIN FETCH p.user u " +
            "LEFT JOIN FETCH p.orders o " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.shop " +
            "WHERE p.paymentCode = :paymentCode " +
            "AND u.email = :email")  // ← check email trong query luôn
    Optional<Payment> findByPaymentCodeAndUserEmail(
            @Param("paymentCode") String paymentCode,
            @Param("email") String email);
}
