package com.example.demo.chat.entity;

import com.example.demo.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "product_attributes")
@Getter
@Setter
public class ProductAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(length = 100)
    private String material;

    @Column(length = 100)
    private String style;

    @Column(length = 100)
    private String occasion;

    @Column(length = 50)
    private String season;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "pinecone_id", length = 100)
    private String pineconeId;

    @Column(name = "embedded_at")
    private LocalDateTime embeddedAt;
}