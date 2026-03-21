package com.example.demo.location.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "provinces")
public class Province {

    @Id
    @Column(name = "code")
    private Integer code;

    @Nationalized
    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "province", fetch = FetchType.LAZY)
    private List<District> districts;

}
