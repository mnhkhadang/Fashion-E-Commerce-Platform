package com.example.demo.user.entity;

import com.example.demo.shop.entity.Shop;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    // OAuth2 user không có password → nullable
    @Column(nullable = true)
    private String password;

    @Column(nullable = false)
    private boolean enable = true;

    // 'local' | 'google' | 'facebook'
    @Column(nullable = false)
    private String provider = "local";

    // ID từ Google/Facebook
    @Column(name = "provider_id")
    private String providerId;

    // Avatar từ Google/Facebook profile
    @Column(length = 500)
    private String avatar;

    @OneToMany(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            orphanRemoval = true
    )
    private List<UserRole> roles;

    @OneToOne(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Shop shop;
}