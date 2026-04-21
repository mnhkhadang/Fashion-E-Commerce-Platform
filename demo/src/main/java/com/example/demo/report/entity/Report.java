package com.example.demo.report.entity;

import com.example.demo.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    // REVIEW hoặc SHOP
    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private ReportTargetType targetType;

    // reviewId hoặc shopId (dạng String để chứa cả Long lẫn UUID)
    @Column(name = "target_id", nullable = false)
    private String targetId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status = ReportStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    // UUID của admin đã xử lý
    @Column(name = "resolved_by")
    private UUID resolvedBy;

    public enum ReportTargetType {
        REVIEW, SHOP
    }

    public enum ReportStatus {
        PENDING,    // chờ admin xử lý
        RESOLVED,   // admin đã duyệt → ẩn/cảnh cáo
        DISMISSED   // admin bỏ qua → không vi phạm
    }
}
