package com.example.demo.report.controller;

import com.example.demo.report.dto.ReportResponse;
import com.example.demo.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    // ─── User ────────────────────────────────────────────────────────────────

    // Báo cáo review
    @PostMapping("/review/{reviewId}")
    public ResponseEntity<ReportResponse> reportReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reviewId,
            @RequestParam String reason
            ){
        return ResponseEntity.ok(reportService.reportReview(userDetails.getUsername(), reviewId, reason));
    }

    //Báo cáo shop
    @PostMapping("/shop/{shopId}")
    public ResponseEntity<ReportResponse> reportShop(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID shopId,
            @RequestParam String reason
    ) {
        return ResponseEntity.ok(
                reportService.reportShop(
                        userDetails.getUsername(), shopId, reason));
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    // Admin xem danh sách report PENDING
    @GetMapping
    public ResponseEntity<List<ReportResponse>> getPendingReports() {
        return ResponseEntity.ok(reportService.getPendingReports());
    }

    // Admin duyệt report → vi phạm
    @PutMapping("/{reportId}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reportId
    ) {
        return ResponseEntity.ok(
                reportService.resolveReport(
                        reportId, userDetails.getUsername()));
    }

    // Admin bỏ qua report → không vi phạm
    @PutMapping("/{reportId}/dismiss")
    public ResponseEntity<ReportResponse> dismissReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reportId
    ) {
        return ResponseEntity.ok(
                reportService.dismissReport(
                        reportId, userDetails.getUsername()));
    }
}
