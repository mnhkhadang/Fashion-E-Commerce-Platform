package com.example.demo.chat.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
@Component
@RequiredArgsConstructor
@Slf4j
public class VoyageEmbeddingClient {

    @Value("${ai.voyage.api-key}")
    private String apiKey;

    private static final String VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

    private final RestTemplate restTemplate;

    public List<Float> embed(String text) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = Map.of(
                    "model", "voyage-3",   // 1024 dims — khớp Pinecone index
                    "input", List.of(text)
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<VoyageResponse> response = restTemplate.exchange(
                    VOYAGE_URL,
                    HttpMethod.POST,
                    entity,
                    VoyageResponse.class
            );

            if (response.getBody() == null || response.getBody().getData() == null
                    || response.getBody().getData().isEmpty()) {
                throw new RuntimeException("Empty Voyage response");
            }

            return response.getBody().getData().get(0).getEmbedding();

        } catch (Exception e) {
            log.error("Voyage embedding failed: {}", e.getMessage());
            throw new RuntimeException("Failed to generate embedding", e);
        }
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VoyageResponse {
        private List<EmbeddingData> data;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class EmbeddingData {
        private List<Float> embedding;
    }
}