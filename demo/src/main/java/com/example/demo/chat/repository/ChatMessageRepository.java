package com.example.demo.chat.repository;

import com.example.demo.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Lấy toàn bộ messages của session, đúng thứ tự thời gian
    // Index idx_chat_message_session đảm bảo query này < 5ms
    @Query("SELECT m FROM ChatMessage m " +
            "WHERE m.session.id = :sessionId " +
            "ORDER BY m.createdAt ASC")
    List<ChatMessage> findBySessionId(@Param("sessionId") String sessionId);

    // Lấy N messages cuối để build context cho Claude (tránh quá dài)
    @Query(value = "SELECT * FROM chat_messages " +
            "WHERE session_id = :sessionId " +
            "ORDER BY created_at DESC " +
            "LIMIT :limit",
            nativeQuery = true)
    List<ChatMessage> findLastNBySessionId(
            @Param("sessionId") String sessionId,
            @Param("limit") int limit
    );
}
