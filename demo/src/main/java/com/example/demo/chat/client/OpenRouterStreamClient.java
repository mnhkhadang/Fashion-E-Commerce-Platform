package com.example.demo.chat.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpenRouterStreamClient {

    @Value("${ai.openrouter.api-key}")
    private String apiKey;

    @Value("${ai.openrouter.model:openrouter/auto}")
    private String model;

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    private static final String SYSTEM_PROMPT = """
            Bạn là tư vấn viên thời trang của shop. Hãy giúp khách hàng tìm sản phẩm phù hợp.
            
            QUY TẮC BẮT BUỘC:
            - Trả lời bằng tiếng Việt, thân thiện và tự nhiên
            - CHỈ tư vấn sản phẩm có trong danh sách "Sản phẩm liên quan" được cung cấp
            - TUYỆT ĐỐI KHÔNG bịa ra sản phẩm không có trong danh sách
            - Nếu danh sách sản phẩm rỗng hoặc không phù hợp → trả lời:
              "Xin lỗi, hiện shop chưa có sản phẩm phù hợp. Bạn có thể mô tả thêm không?"
            - Luôn đề cập giá và trạng thái còn hàng khi gợi ý sản phẩm
            - Khi gợi ý sản phẩm: in đậm tên, ghi rõ giá, kèm link /products/{slug}
            - KHÔNG thêm thông tin giá, tên, slug không có trong danh sách
            """;

    private final ObjectMapper objectMapper;

    public void streamChat(
            List<Map<String, String>> messages,
            String productContext,
            Consumer<String> onToken,
            Consumer<String> onComplete
    ) {
        StringBuilder fullResponse = new StringBuilder();
        HttpURLConnection conn = null;

        try {
            List<Map<String, Object>> allMessages = new ArrayList<>();
            allMessages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

            boolean contextInjected = false;
            for (Map<String, String> msg : messages) {
                if (!contextInjected
                        && "user".equals(msg.get("role"))
                        && productContext != null
                        && !productContext.isBlank()) {

                    String enriched = "Sản phẩm liên quan trong shop:\n"
                            + productContext
                            + "\n---\nKhách hàng hỏi: "
                            + msg.get("content");

                    allMessages.add(Map.of("role", "user", "content", enriched));
                    contextInjected = true;
                } else {
                    allMessages.add(Map.of(
                            "role", msg.get("role"),
                            "content", msg.get("content")
                    ));
                }
            }

            // Nếu không có context → inject thông báo vào system
            if (!contextInjected || productContext == null || productContext.isBlank()) {
                allMessages.set(0, Map.of("role", "system",
                        "content", SYSTEM_PROMPT +
                                "\nLƯU Ý: Không có sản phẩm nào được tìm thấy cho yêu cầu này. " +
                                "Hãy thông báo cho khách hàng và hỏi thêm nhu cầu."));
            }

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", allMessages,
                    "stream", true,
                    "max_tokens", 1024,
                    "temperature", 0.7
            );

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            log.info("OpenRouter request: model={} messages={}", model, allMessages.size());

            URL url = new URL(OPENROUTER_URL);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setRequestProperty("HTTP-Referer", "http://localhost:9090");
            conn.setRequestProperty("X-Title", "Fashion Shop Chatbot");
            conn.setDoOutput(true);
            conn.setConnectTimeout(15_000);
            conn.setReadTimeout(60_000);

            try (OutputStream os = conn.getOutputStream()) {
                os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
            }

            int statusCode = conn.getResponseCode();
            log.info("OpenRouter response status: {}", statusCode);

            if (statusCode != 200) {
                InputStream errorStream = conn.getErrorStream();
                String errorBody = errorStream != null
                        ? new String(errorStream.readAllBytes(), StandardCharsets.UTF_8)
                        : "No error body";
                log.error("OpenRouter HTTP {}: {}", statusCode, errorBody);
                throw new RuntimeException("OpenRouter returned HTTP " + statusCode + ": " + errorBody);
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {

                String line;
                while ((line = reader.readLine()) != null) {
                    if (!line.startsWith("data: ")) continue;

                    String data = line.substring(6).trim();
                    if ("[DONE]".equals(data)) break;

                    try {
                        JsonNode node = objectMapper.readTree(data);
                        String text = node
                                .path("choices")
                                .path(0)
                                .path("delta")
                                .path("content")
                                .asText("");

                        if (!text.isEmpty()) {
                            fullResponse.append(text);
                            onToken.accept(text);
                        }
                    } catch (Exception e) {
                        // bỏ qua dòng không parse được
                    }
                }
            }

            onComplete.accept(fullResponse.toString());

        } catch (Exception e) {
            log.error("OpenRouter streaming failed: {}", e.getMessage());
            String fallback = "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.";
            onToken.accept(fallback);
            onComplete.accept(fallback);
        } finally {
            if (conn != null) conn.disconnect();
        }
    }
}