-- =========================
-- V3: Shop Registrations
-- =========================
CREATE TABLE shop_registrations (
    id BINARY(16) NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    phone VARCHAR(255),
    avatar VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    reject_reason VARCHAR(500),
    created_at DATETIME NOT NULL,
    reviewed_at DATETIME,
    user_id BINARY(16) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_shop_reg_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;