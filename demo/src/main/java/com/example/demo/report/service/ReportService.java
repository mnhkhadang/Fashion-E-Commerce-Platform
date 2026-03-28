package com.example.demo.report.service;

import com.example.demo.auth.service.EmailService;
import com.example.demo.common.exception.ConflictException;
import com.example.demo.common.exception.NotFoundException;
import com.example.demo.report.dto.ReportResponse;
import com.example.demo.report.entity.Report;
import com.example.demo.report.repository.ReportRepository;
import com.example.demo.review.entity.Review;
import com.example.demo.review.repository.ReviewRepository;
import com.example.demo.shop.entity.Shop;
import com.example.demo.shop.repository.ShopRepository;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportService {

    // Số report tối thiểu để tự động ẩn tạm
    private static final int AUTO_HIDE_THRESHOLD  = 5;

    private final ReportRepository reportRepository;
    private final ReviewRepository reviewRepository;
    private final ShopRepository shopRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;


    /**
     * User báo cáo review.
     *
     * Nếu đủ AUTO_HIDE_THRESHOLD report → tự động ẩn review tạm thời.
     */
    @Transactional
    public ReportResponse reportReview(String reporterEmail, Long reviewId, String reason) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("Review not found"));

        String targetId = reviewId.toString();

        // Kiểm tra đã report chưa
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(
                reporter.getId(), Report.ReportTargetType.REVIEW, targetId)) {
            throw new ConflictException("You have already reported this review");
        }

        Report report = createReport(reporter, Report.ReportTargetType.REVIEW, targetId, reason);

        // Kiểm tra có đủ report để auto-hide không
        long reportCount = reportRepository.countByTargetTypeAndTargetIdAndStatus(
                Report.ReportTargetType.REVIEW, targetId, Report.ReportStatus.PENDING);

        if (reportCount >= AUTO_HIDE_THRESHOLD && !review.isHidden()) {
            review.setHidden(true);
            reviewRepository.save(review);
            log.info("Review {} auto-hidden after {} reports", reviewId, reportCount);
        }

        log.info("Review {} reported by {}", reviewId, reporterEmail);
        return toResponse(reportRepository.save(report));
    }

    /**
     * User báo cáo shop.
     *
     * Nếu đủ AUTO_HIDE_THRESHOLD report → tự động ẩn shop tạm thời.
     */
    @Transactional
    public ReportResponse reportShop(String reporterEmail, UUID shopId, String reason) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new NotFoundException("Shop not found"));

        String targetId = shopId.toString();

        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(
                reporter.getId(), Report.ReportTargetType.SHOP, targetId)) {
            throw new ConflictException("You have already reported this shop");
        }

        Report report = createReport(reporter, Report.ReportTargetType.SHOP, targetId, reason);

        long reportCount = reportRepository.countByTargetTypeAndTargetIdAndStatus(
                Report.ReportTargetType.SHOP, targetId, Report.ReportStatus.PENDING);

        if (reportCount >= AUTO_HIDE_THRESHOLD && shop.isActive()) {
            shop.setActive(false);
            shopRepository.save(shop);
            log.info("Shop {} auto-hidden after {} reports", shopId, reportCount);
        }

        log.info("Shop {} reported by {}", shopId, reporterEmail);
        return toResponse(reportRepository.save(report));
    }

    // ─── Admin ───────────────────────────────────────────────────────────────

    // Admin xem danh sách report PENDING
    @Transactional
    public List<ReportResponse> getPendingReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc(Report.ReportStatus.PENDING)
                .stream().map(this::toResponse).toList();
    }

    /**
     * Admin duyệt report → xác nhận vi phạm.
     *
     * Review: ẩn vĩnh viễn + thông báo cho user bị report
     * Shop:   tăng warningCount + cảnh cáo + thông báo shop owner
     */
    @Transactional
    public ReportResponse resolveReport(Long reportId, String adminEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new NotFoundException("Report not found"));

        if (report.getStatus() != Report.ReportStatus.PENDING) {
            throw new NotFoundException("Report already processed");
        }

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new NotFoundException("Admin not found"));

        report.setStatus(Report.ReportStatus.RESOLVED);
        report.setResolvedAt(LocalDateTime.now());
        report.setResolvedBy(admin.getId());

        if (report.getTargetType() == Report.ReportTargetType.REVIEW) {
            resolveReviewReport(report);
        } else {
            resolveShopReport(report);
        }

        log.info("Report {} resolved by admin {}", reportId, adminEmail);
        return toResponse(reportRepository.save(report));
    }

    /**
     * Admin bỏ qua report → không vi phạm.
     *
     * Khôi phục lại review/shop nếu đang bị ẩn tạm do auto-hide.
     */
    @Transactional
    public ReportResponse dismissReport(Long reportId, String adminEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new NotFoundException("Report not found"));

        if (report.getStatus() != Report.ReportStatus.PENDING) {
            throw new NotFoundException("Report already processed");
        }

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new NotFoundException("Admin not found"));

        report.setStatus(Report.ReportStatus.DISMISSED);
        report.setResolvedAt(LocalDateTime.now());
        report.setResolvedBy(admin.getId());

        // Kiểm tra có còn report PENDING nào khác không
        // Nếu không → khôi phục lại target
        long remainingReports = reportRepository.countByTargetTypeAndTargetIdAndStatus(
                report.getTargetType(), report.getTargetId(), Report.ReportStatus.PENDING);

        if (remainingReports <= 1) { // 1 vì report này chưa save dismissed
            restoreTarget(report);
        }

        log.info("Report {} dismissed by admin {}", reportId, adminEmail);
        return toResponse(reportRepository.save(report));
    }


    // ─── Private helpers ─────────────────────────────────────────────────────
    private Report createReport(User reporter, Report.ReportTargetType type,
                                String targetId, String reason){

        Report report = new Report();
        report.setReporter(reporter);
        report.setTargetType(type);
        report.setTargetId(targetId);
        report.setReason(reason);
        return report;
    }

    private void resolveReviewReport(Report report) {
        reviewRepository.findById(Long.parseLong(report.getTargetId()))
                .ifPresent(review -> {
                    review.setHidden(true);
                    reviewRepository.save(review);

                    // Thông báo cho user bị report
                    emailService.sendReportResolvedEmail(
                            review.getUser().getEmail(),
                            "review",
                            report.getReason()
                    );
                });
    }

    private void resolveShopReport(Report report){
        shopRepository.findById(UUID.fromString(report.getTargetId()))
                .ifPresent(shop -> {
                    shop.setWarningCount(shop.getWarningCount() + 1);
                    shopRepository.save(shop);

                    // Thông báo cảnh cáo cho shop owner
                    emailService.sendShopWarningEmail(
                            shop.getOwner().getEmail(),
                            shop.getName(),
                            report.getReason(),
                            shop.getWarningCount()
                    );
                });
    }

    private void restoreTarget(Report report) {
        if (report.getTargetType() == Report.ReportTargetType.REVIEW) {
            reviewRepository.findById(Long.parseLong(report.getTargetId()))
                    .ifPresent(review -> {
                        review.setHidden(false);
                        reviewRepository.save(review);
                    });
        } else {
            shopRepository.findById(UUID.fromString(report.getTargetId()))
                    .ifPresent(shop -> {
                        shop.setActive(true);
                        shopRepository.save(shop);
                    });
        }
    }

    private ReportResponse toResponse(Report report) {
        return new ReportResponse(
                report.getId(),
                report.getReporter().getEmail(),
                report.getTargetType(),
                report.getTargetId(),
                report.getReason(),
                report.getStatus(),
                report.getCreatedAt(),
                report.getResolvedAt()
        );
    }

}
