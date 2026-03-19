-- V6__reservation_and_schema_improvements.sql

-- 1. products: thêm reserved_stock (entity đã có, DB chưa có)
ALTER TABLE products
    ADD COLUMN reserved_stock INT NOT NULL DEFAULT 0;

-- 2. cart_items: thêm added_price để warning giá thay đổi
ALTER TABLE cart_items
    ADD COLUMN added_price DECIMAL(38,2) NULL;

-- 3. order_items: thêm product_id để hoàn stock khi cancel/refund
ALTER TABLE order_items
    ADD COLUMN product_id BINARY(16) NULL,
    ADD CONSTRAINT fk_order_item_product
        FOREIGN KEY (product_id) REFERENCES products(id);

-- 4. orders: thêm updated_at và cancel_reason
ALTER TABLE orders
    ADD COLUMN updated_at DATETIME NULL,
    ADD COLUMN cancel_reason VARCHAR(500) NULL;

-- 5. payments: thêm paid_at
ALTER TABLE payments
    ADD COLUMN paid_at DATETIME NULL;

-- 6. Tạo bảng reservations
CREATE TABLE reservations (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    user_id     BINARY(16) NOT NULL,
    product_id  BINARY(16) NOT NULL,
    order_id    BINARY(16) NULL,
    quantity    INT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at  DATETIME NOT NULL,
    created_at  DATETIME NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_reservation_user    (user_id),
    INDEX idx_reservation_product (product_id),
    INDEX idx_reservation_expires (expires_at),
    INDEX idx_reservation_order   (order_id),
    CONSTRAINT fk_reservation_user    FOREIGN KEY (user_id)    REFERENCES users(id),
    CONSTRAINT fk_reservation_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_reservation_order   FOREIGN KEY (order_id)   REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;