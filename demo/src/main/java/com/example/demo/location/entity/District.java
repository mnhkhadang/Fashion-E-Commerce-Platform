package com.example.demo.location.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Nationalized;

@Entity
@Getter
@Setter
@Table(name = "districts")
public class District {

    @Id
    @Column(name = "code")
    private Integer code;

    @Nationalized
    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_code", nullable = false)
    private Province province;
}
