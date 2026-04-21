CREATE TABLE sales (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    name             NVARCHAR(255)   NOT NULL,
    discount_percent INT             NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
    start_at         DATETIME        NOT NULL,
    end_at           DATETIME        NOT NULL,
    created_by       VARCHAR(20)     NOT NULL,
    status           VARCHAR(20)     NOT NULL DEFAULT 'UPCOMING',
    shop_id          BINARY(16)      NULL,        -- ← đổi thành BINARY(16)
    created_at       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sale_shop FOREIGN KEY (shop_id) REFERENCES shops(id)
);

CREATE TABLE sale_products (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    sale_id     BIGINT      NOT NULL,
    product_id  BINARY(16)  NOT NULL,             -- ← đổi thành BINARY(16)
    opted_in_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sp_sale    FOREIGN KEY (sale_id)    REFERENCES sales(id),
    CONSTRAINT fk_sp_product FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT uk_sale_product UNIQUE (sale_id, product_id)
);

CREATE INDEX idx_sale_products_product ON sale_products(product_id);
CREATE INDEX idx_sales_status          ON sales(status);