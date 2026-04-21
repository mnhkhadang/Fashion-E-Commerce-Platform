-- V12__oauth2.sql

-- Cho phép password NULL (OAuth2 user không có password)
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;

-- Thêm OAuth2 fields
ALTER TABLE users
    ADD COLUMN provider VARCHAR(20) NOT NULL DEFAULT 'local',
    ADD COLUMN provider_id VARCHAR(100) NULL,
    ADD COLUMN avatar VARCHAR(500) NULL;

-- Index tìm user theo provider
CREATE INDEX idx_users_provider ON users(provider, provider_id);