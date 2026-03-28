-- V11__chat_ai.sql

-- 1. Chat Sessions
CREATE TABLE chat_sessions (
    id          VARCHAR(36)  NOT NULL,
    user_id     BINARY(16)   NOT NULL,
    title       VARCHAR(255) NULL,          -- tóm tắt từ câu hỏi đầu tiên
    created_at  DATETIME     NOT NULL,
    updated_at  DATETIME     NOT NULL,

    PRIMARY KEY (id),
    INDEX idx_chat_session_user (user_id),

    CONSTRAINT fk_chat_session_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Chat Messages
CREATE TABLE chat_messages (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    session_id  VARCHAR(36)  NOT NULL,
    role        VARCHAR(20)  NOT NULL,      -- 'user' | 'assistant'
    content     TEXT         NOT NULL,
    created_at  DATETIME     NOT NULL,

    PRIMARY KEY (id),
    INDEX idx_chat_message_session (session_id),  -- index quan trọng nhất

    CONSTRAINT fk_chat_message_session
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Product Attributes (cho Python pipeline embed vào)
CREATE TABLE product_attributes (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    product_id      BINARY(16)   NOT NULL,
    material        VARCHAR(100) NULL,
    style           VARCHAR(100) NULL,
    occasion        VARCHAR(100) NULL,
    season          VARCHAR(50)  NULL,
    ai_summary      TEXT         NULL,      -- mô tả tóm tắt cho chatbot
    pinecone_id     VARCHAR(100) NULL,      -- id vector trên Pinecone
    embedded_at     DATETIME     NULL,      -- lần cuối embed

    PRIMARY KEY (id),
    UNIQUE KEY uk_product_attributes_product (product_id),
    INDEX idx_product_attributes_pinecone (pinecone_id),

    CONSTRAINT fk_product_attributes_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;