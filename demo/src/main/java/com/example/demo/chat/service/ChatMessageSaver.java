package com.example.demo.chat.service;

import com.example.demo.chat.entity.ChatMessage;
import com.example.demo.chat.entity.ChatSession;
import com.example.demo.chat.repository.ChatMessageRepository;
import com.example.demo.chat.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatMessageSaver {

    private final ChatMessageRepository messageRepository;
    private final ChatSessionRepository sessionRepository;

    // Gọi qua Spring proxy từ thread khác — @Transactional hoạt động đúng
    @Transactional
    public void saveAssistantMessage(String sessionId, String content) {
        ChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        ChatMessage assistantMsg = new ChatMessage();
        assistantMsg.setSession(session);
        assistantMsg.setRole(ChatMessage.Role.assistant);
        assistantMsg.setContent(content);
        messageRepository.save(assistantMsg);

        // Cập nhật updatedAt của session (trigger @PreUpdate)
        sessionRepository.save(session);
    }
}