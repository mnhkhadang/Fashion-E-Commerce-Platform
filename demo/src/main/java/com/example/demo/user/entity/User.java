package com.example.demo.user.entity;

import com.example.demo.shop.entity.Shop;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table (name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(
            nullable = false
    )
    private String username;
    @Column(
            nullable = false,
            unique = true
    )
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private  boolean enable=true;

    @OneToMany(
            mappedBy = "user",
            // chỉ ra rằng quan hệ này được sở hữu bỡi field "user"
            // bên entity UserRole (UserRole.user)
            // bảng user_roles sẽ có cột user_id
            cascade = CascadeType.ALL,
            // mọi thao tác bên User sẽ lan xuống UserRole
            // - save(user) -> save user_roles
            // - update(user) -> update user_roles
            // -delete(user) -> delete user_role
            // không lan sang Role
            fetch = FetchType.LAZY,
            // không load danh sách roles khi load User
            // chỉ khi gọi user.getRoles() mới query DB
            // -> tránh tốn tài nguyên , trách join dư thừa
            orphanRemoval = true
    )
    private List<UserRole> roles;

    @OneToOne(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Shop shop;
}
