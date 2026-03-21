package com.example.demo.reservation.entity;

import com.example.demo.product.entity.Product;
import com.example.demo.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // link sang order sau khi thanh toán thành công
    @Column(name = "order_id")
    private UUID orderId;

    @Column(nullable = false)
    private int quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.ACTIVE;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ReservationStatus {
        ACTIVE,     // đang giữ chỗ
        RELEASED,   // đã release (hết TTL hoặc user hủy)
        COMPLETED   // đã thanh toán thành công
    }
}