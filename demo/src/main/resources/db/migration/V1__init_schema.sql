-- =========================
-- 1. Users
-- =========================
CREATE TABLE users (
    id BINARY(16) NOT NULL,
    email VARCHAR(255) NOT NULL,
    enable BIT(1) NOT NULL DEFAULT 1,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email),
    UNIQUE KEY uk_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 2. Roles
-- =========================
CREATE TABLE roles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    role VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_roles_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 3. User Roles
-- =========================
CREATE TABLE user_roles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    user_id BINARY(16) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 4. Permissions
-- =========================
CREATE TABLE permissions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_permissions_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 5. Role Permissions
-- =========================
CREATE TABLE role_permissions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_role_permissions (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id),
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 6. Refresh Tokens
-- =========================
CREATE TABLE refresh_tokens (
    id BINARY(16) NOT NULL,
    expiry_date DATETIME(6) NOT NULL,
    token VARCHAR(255),
    user_id BINARY(16) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_refresh_tokens_token (token),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 7. Shops
-- =========================
CREATE TABLE shops (
    id BINARY(16) NOT NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    address VARCHAR(255),
    avatar VARCHAR(255),
    description TEXT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),

    user_id BINARY(16) NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uk_shops_name (name),
    UNIQUE KEY uk_shops_user (user_id),

    CONSTRAINT fk_shops_user
        FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- =========================
-- 8. Categories
-- =========================
CREATE TABLE categories (
    id BIGINT NOT NULL AUTO_INCREMENT,
    active BIT(1) NOT NULL DEFAULT 1,
    description VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 9. Products
-- =========================
CREATE TABLE products (
    id BINARY(16) NOT NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    description TEXT,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(19,2) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    sold INT NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    category_id BIGINT NOT NULL,
    shop_id BINARY(16) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_products_slug (slug),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_products_shop FOREIGN KEY (shop_id) REFERENCES shops(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 10. Product Media
-- =========================
CREATE TABLE product_media (
    id BIGINT NOT NULL AUTO_INCREMENT,
    sort_order INT NOT NULL DEFAULT 0,
    type VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    product_id BINARY(16) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_product_media_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 11. Carts
-- =========================
CREATE TABLE carts (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_carts_user (user_id),
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 12. Cart Items
-- =========================
CREATE TABLE cart_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    quantity INT NOT NULL,
    cart_id BINARY(16) NOT NULL,
    product_id BINARY(16) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id),
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 13. Provinces
-- =========================
CREATE TABLE provinces (
    code INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 14. Districts
-- =========================
CREATE TABLE districts (
    code INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    province_code INT NOT NULL,
    PRIMARY KEY (code),
    CONSTRAINT fk_districts_province FOREIGN KEY (province_code) REFERENCES provinces(code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 15. Shipping Addresses
-- =========================
CREATE TABLE shipping_addresses (
    id BIGINT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    is_default BIT(1) NOT NULL DEFAULT 0,
    phone VARCHAR(255) NOT NULL,
    street_address TEXT NOT NULL,
    district_code INT NOT NULL,
    province_code INT NOT NULL,
    user_id BINARY(16) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_shipping_district FOREIGN KEY (district_code) REFERENCES districts(code),
    CONSTRAINT fk_shipping_province FOREIGN KEY (province_code) REFERENCES provinces(code),
    CONSTRAINT fk_shipping_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 16. Payments
-- =========================
CREATE TABLE payments (
    id BINARY(16) NOT NULL,
    payment_code VARCHAR(100) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(19,2) NOT NULL,
    created_at DATETIME NOT NULL,
    user_id BINARY(16) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_payment_code (payment_code),
    CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 17. Orders
-- =========================
CREATE TABLE orders (
    id BINARY(16) NOT NULL,
    order_code VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_price DECIMAL(19,2) NOT NULL,
    note VARCHAR(255),
    created_at DATETIME NOT NULL,
    shipping_full_name VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(255) NOT NULL,
    shipping_street_address TEXT NOT NULL,
    shipping_district VARCHAR(255) NOT NULL,
    shipping_province VARCHAR(255) NOT NULL,
    user_id BINARY(16) NOT NULL,
    payment_id BINARY(16),
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_code (order_code),
    CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_order_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 18. Order Items
-- =========================
CREATE TABLE order_items (
    id BIGINT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    product_slug VARCHAR(255) NOT NULL,
    price DECIMAL(19,2) NOT NULL,
    quantity INT NOT NULL,
    sub_total DECIMAL(19,2) NOT NULL,
    order_id BINARY(16) NOT NULL,
    shop_id BINARY(16) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES orders(id),
    CONSTRAINT fk_order_item_shop FOREIGN KEY (shop_id) REFERENCES shops(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;