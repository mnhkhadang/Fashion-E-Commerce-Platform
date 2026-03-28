package com.example.demo.chat.service;

import com.example.demo.chat.client.OpenRouterStreamClient;
import com.example.demo.chat.client.PineconeClient;
import com.example.demo.chat.dto.ChatMessageResponse;
import com.example.demo.chat.dto.SessionResponse;
import com.example.demo.chat.entity.ChatMessage;
import com.example.demo.chat.entity.ChatSession;
import com.example.demo.chat.entity.ProductAttribute;
import com.example.demo.chat.repository.ChatMessageRepository;
import com.example.demo.chat.repository.ChatSessionRepository;
import com.example.demo.chat.repository.ProductAttributeRepository;
import com.example.demo.product.entity.Product;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final ProductAttributeRepository productAttributeRepository;
    private final UserRepository userRepository;
    private final PineconeClient pineconeClient;
    private final OpenRouterStreamClient openRouterStreamClient;
    private final ChatMessageSaver chatMessageSaver; // Fix #3

    // Fix #4: bounded pool — tối đa 20 stream đồng thời
    private final ExecutorService streamExecutor = Executors.newFixedThreadPool(20);

    // ===== SESSION OPERATIONS =====

    @Transactional
    public SessionResponse createSession(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatSession session = new ChatSession();
        session.setUser(user);
        session.setTitle("Cuộc trò chuyện mới");

        return toSessionResponse(sessionRepository.save(session));
    }

    // Fix #7: readOnly = true cho read operations
    @Transactional(readOnly = true)
    public List<SessionResponse> getMySessions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return sessionRepository.findByUserId(user.getId())
                .stream()
                .map(this::toSessionResponse)
                .toList();
    }

    // Fix #7: readOnly = true
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(String email, String sessionId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        return messageRepository.findBySessionId(sessionId)
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public void deleteSession(String email, String sessionId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        sessionRepository.delete(session);
    }

    // ===== STREAMING CHAT =====

    // Fix #1: BỎ @Transactional — transaction không work across threads
    public SseEmitter streamChat(String email, String sessionId, String userMessage) {

        // Validate + save userMessage trong HTTP thread (transaction còn sống)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatSession session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        saveUserMessage(session, userMessage);

        // Fix #5: SseEmitter timeout 90s > OpenRouter timeout 60s — tránh race condition
        SseEmitter emitter = new SseEmitter(90_000L);

        // Build history trong HTTP thread (DB còn accessible)
        List<Map<String, String>> history = buildHistory(sessionId, userMessage);

        // Stream trong thread riêng
        streamExecutor.submit(() -> {
            try {
                // Fix #6: Pinecone call trong stream thread — không block HTTP thread
                String productContext = buildProductContext(userMessage);

                openRouterStreamClient.streamChat(
                        history,
                        productContext,
                        token -> {
                            try {
                                emitter.send(SseEmitter.event().name("token").data(token));
                            } catch (IOException e) {
                                emitter.completeWithError(e);
                            }
                        },
                        fullResponse -> {
                            try {
                                // Fix #3: gọi qua injected Spring bean — proxy hoạt động đúng
                                chatMessageSaver.saveAssistantMessage(sessionId, fullResponse);
                                emitter.send(SseEmitter.event().name("done").data("[DONE]"));
                                emitter.complete();
                            } catch (IOException e) {
                                emitter.completeWithError(e);
                            }
                        }
                );
            } catch (Exception e) {
                log.error("Stream error for session {}: {}", sessionId, e.getMessage());
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    // ===== PRIVATE HELPERS =====

    @Transactional
    protected void saveUserMessage(ChatSession session, String userMessage) {
        ChatMessage userMsg = new ChatMessage();
        userMsg.setSession(session);
        userMsg.setRole(ChatMessage.Role.user);
        userMsg.setContent(userMessage);
        messageRepository.save(userMsg);

        if ("Cuộc trò chuyện mới".equals(session.getTitle())) {
            String title = userMessage.length() > 50
                    ? userMessage.substring(0, 50) + "..."
                    : userMessage;
            session.setTitle(title);
            sessionRepository.save(session);
        }
    }

    // Fix #2: lấy 11, bỏ index 0 (userMsg vừa save), reverse → ASC
    private List<Map<String, String>> buildHistory(String sessionId, String userMessage) {
        List<ChatMessage> recentMessages = new ArrayList<>(
                messageRepository.findLastNBySessionId(sessionId, 11)
        );

        // DESC → index 0 là mới nhất = userMsg vừa save → bỏ đi
        if (!recentMessages.isEmpty()) {
            recentMessages.remove(0);
        }

        // Đảo lại thành ASC (cũ → mới)
        Collections.reverse(recentMessages);

        List<Map<String, String>> history = new ArrayList<>();
        for (ChatMessage msg : recentMessages) {
            history.add(Map.of(
                    "role", msg.getRole().name(),
                    "content", msg.getContent()
            ));
        }

        // Luôn add userMessage mới vào cuối — không cần check duplicate
        history.add(Map.of("role", "user", "content", userMessage));

        return history;
    }

    private String buildProductContext(String query) {
        try {
            List<UUID> productIds = pineconeClient.findSimilarProductIds(query, 5);
            if (productIds.isEmpty()) return "";

            List<ProductAttribute> attrs = productAttributeRepository.findByProductIds(productIds);
            if (attrs.isEmpty()) return "";

            StringBuilder ctx = new StringBuilder();
            for (ProductAttribute attr : attrs) {
                Product p = attr.getProduct();
                int available = p.getAvailableStock();

                ctx.append(String.format(
                        "- **%s** | Giá: %,.0fđ | %s | Chất liệu: %s | Dịp: %s | Link: /products/%s\n",
                        p.getName(),
                        p.getPrice().doubleValue(),
                        available > 0 ? "Còn " + available + " cái" : "Hết hàng",
                        attr.getMaterial() != null ? attr.getMaterial() : "N/A",
                        attr.getOccasion() != null ? attr.getOccasion() : "N/A",
                        p.getSlug()
                ));
            }
            return ctx.toString();

        } catch (Exception e) {
            log.warn("RAG pipeline failed, continuing without context: {}", e.getMessage());
            return "";
        }
    }

    private SessionResponse toSessionResponse(ChatSession session) {
        return new SessionResponse(
                session.getId(),
                session.getTitle(),
                session.getCreatedAt(),
                session.getUpdatedAt()
        );
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getRole().name(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}