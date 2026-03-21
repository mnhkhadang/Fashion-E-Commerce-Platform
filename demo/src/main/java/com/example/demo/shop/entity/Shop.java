package com.example.demo.shop.entity;

import com.example.demo.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.UUID;

@Entity
@NoArgsConstructor
@Getter
@Setter
@Table (name = "shops")
public class Shop {

    @Id
    @GeneratedValue (strategy = GenerationType.UUID)
    private UUID id;

    @Nationalized
    @Column(
            nullable = false,
            unique = true
    )
    private String name;

    @Nationalized
    @Column
    private String description;

    @Column
    private String phone;

    @Column
    private String address;

    @Column
    private String avatar;

    @Column(nullable = false)
    private boolean active = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User owner;
}
