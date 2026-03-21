-- V8__return_refund.sql

--  orders: đã có delivered_at để tính window 7 ngày return ở V7


-- 2. Tạo bảng return_requests
CREATE TABLE return_requests (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    order_id        BINARY(16) NOT NULL,
    user_id         BINARY(16) NOT NULL,
    reason          VARCHAR(1000) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    reject_reason   VARCHAR(500) NULL,
    created_at      DATETIME NOT NULL,
    updated_at      DATETIME NULL,
    reviewed_at     DATETIME NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_return_order (order_id),
    INDEX idx_return_user   (user_id),
    INDEX idx_return_status (status),

    CONSTRAINT fk_return_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_return_user  FOREIGN KEY (user_id)  REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;