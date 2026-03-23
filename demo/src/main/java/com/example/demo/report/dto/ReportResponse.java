package com.example.demo.report.dto;

import com.example.demo.report.entity.Report;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReportResponse {

    private Long id;
    private String reporterEmail;
    private Report.ReportTargetType reportTargetType;
    private String targetId;
    private String reason;
    private Report.ReportStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
