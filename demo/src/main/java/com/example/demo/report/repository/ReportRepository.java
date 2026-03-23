package com.example.demo.report.repository;

import com.example.demo.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, Long> {

    // Kiểm tra user đã report target này chưa
    boolean existsByReporterIdAndTargetTypeAndTargetId(
            UUID reporterId, Report.ReportTargetType targetType, String targetId);

    // Đếm số report PENDING của một target
    long countByTargetTypeAndTargetIdAndStatus(
            Report.ReportTargetType targetType, String targetId, Report.ReportStatus status);

    // Lấy tất cả report PENDING — admin xem
    List<Report> findByStatusOrderByCreatedAtDesc(Report.ReportStatus status);

    // Lấy tất cả report của một target
    @Query("SELECT r FROM Report r WHERE r.targetType = :type AND r.targetId = :targetId")
    List<Report> findByTarget(
            @Param("type") Report.ReportTargetType type,
            @Param("targetId") String targetId);
}
