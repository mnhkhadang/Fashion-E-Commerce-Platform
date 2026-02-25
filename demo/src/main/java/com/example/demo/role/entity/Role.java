package com.example.demo.role.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor // constructor ko tham số
@AllArgsConstructor // constructor tất cả là tham số
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // tự sinh khóa chính , tu dong tăng
    private Long id;
    @Column(
            name = "role",
            nullable = false, // không null
            unique = true   // duy nhất
    )

    private  String role;

}
