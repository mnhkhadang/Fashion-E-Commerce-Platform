package com.example.demo.role.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table (
        name = "role_permissions",
        uniqueConstraints = {
                @UniqueConstraint( columnNames = {"role_id", "permission_id"})
        }

)
public class RolePermission {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "role_id",unique = true)
    private  Role role;

    @ManyToOne
    @JoinColumn(name = "permission_id",unique = true)
    private  Permission permission;

}
