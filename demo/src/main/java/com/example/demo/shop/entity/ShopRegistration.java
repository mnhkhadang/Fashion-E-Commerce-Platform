package com.example.demo.shop.entity;

import com.example.demo.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "shop_registrations")
public class ShopRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Nationalized
    @Column(nullable = false)
    private String shopName;

    @Nationalized
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String address;

    @Column
    private String phone;

    @Column
    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @Column(length = 500)
    private  String rejectReason;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User user;

    public  enum RegistrationStatus {
        PENDING, APPROVED, REJECTED
    }

}
