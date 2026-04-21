package com.example.demo.sale.entity;

import com.example.demo.shop.entity.Shop;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Nationalized
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int discountPercent; // 1 - 100

    @Column(nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false)
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleCreatedBy createdBy; // PLATFORM | SHOP

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus status = SaleStatus.UPCOMING;

    // null nếu createdBy = PLATFORM
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id")
    private Shop shop;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum SaleCreatedBy {
        PLATFORM, // admin tạo
        SHOP      // shop tự tạo
    }

    public enum SaleStatus {
        UPCOMING, // chưa bắt đầu
        ACTIVE,   // đang chạy
        ENDED     // đã kết thúc
    }
}
