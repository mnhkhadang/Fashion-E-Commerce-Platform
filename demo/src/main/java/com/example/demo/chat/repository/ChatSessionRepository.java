package com.example.demo.chat.repository;

import com.example.demo.chat.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {

    // Lấy tất cả session của 1 user, mới nhất lên đầu
    @Query("SELECT s FROM ChatSession s " +
            "WHERE s.user.id = :userId " +
            "ORDER BY s.updatedAt DESC")
    List<ChatSession> findByUserId(@Param("userId")UUID userId);

    // Kiểm tra session thuộc về user này không (tránh truy cập chéo)
    @Query("SELECT s FROM ChatSession s " +
            "WHERE s.id = :sessionId AND s.user.id = :userId")
    Optional<ChatSession> findByIdAndUserId(
            @Param("sessionId") String sessionId,
            @Param("userId") UUID userId
    );
}
