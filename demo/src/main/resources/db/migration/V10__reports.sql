-- V10__reports.sql

-- 1. reviews: thêm hidden flag
ALTER TABLE reviews
    ADD COLUMN hidden BIT(1) NOT NULL DEFAULT b'0';

-- 2. shops: thêm warning_count
ALTER TABLE shops
    ADD COLUMN warning_count INT NOT NULL DEFAULT 0;

-- 3. Tạo bảng reports
CREATE TABLE reports (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    reporter_id     BINARY(16) NOT NULL,
    target_type     VARCHAR(20) NOT NULL,   -- 'REVIEW' hoặc 'SHOP'
    target_id       VARCHAR(50) NOT NULL,   -- reviewId hoặc shopId
    reason          VARCHAR(500) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at      DATETIME NOT NULL,
    resolved_at     DATETIME NULL,
    resolved_by     BINARY(16) NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_report (reporter_id, target_type, target_id),
    INDEX idx_report_target (target_type, target_id),
    INDEX idx_report_status (status),

    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;