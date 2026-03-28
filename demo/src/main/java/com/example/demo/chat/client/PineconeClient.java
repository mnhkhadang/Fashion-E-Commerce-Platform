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

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class PineconeClient {

    @Value("${ai.pinecone.api-key}")
    private String apiKey;

    @Value("${ai.pinecone.index-host}")
    private String indexHost;  // vd: https://xxx.svc.environment.pinecone.io

    private final RestTemplate restTemplate;
    private final HuggingFaceEmbeddingClient embeddingClient;

    // Query Pinecone, trả về top-K product IDs liên quan nhất
    public List<UUID> findSimilarProductIds(String query, int topK){
        try {
            // 1. Embed query thành vector
            List<Float> vector = embeddingClient.embed(query);

            // 2. Build request body
            Map<String, Object> requestBody = Map.of(
                    "vector", vector,
                    "topK", topK,
                    "includeMetadata", true
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Api-key", apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // 3. Gọi Pinecone query endpoint
            ResponseEntity<PineconeQueryResponse> response = restTemplate.exchange(
                    indexHost + "/query",
                    HttpMethod.POST,
                    entity,
                    PineconeQueryResponse.class
            );

            if(response.getBody() == null || response.getBody().getMatches() == null){
                return Collections.emptyList();
            }
            // 4. Extract product_id từ metadata
            return response.getBody().getMatches().stream()
                    .filter(m -> m.getMetadata() != null && m.getMetadata().get("product_id") != null)
                    .map(m -> UUID.fromString(m.getMetadata().get("product_id").toString()))
                    .toList();
        }catch (Exception e){
            log.error("Pinecone query failed: {}", e.getMessage() );
            return Collections.emptyList();
        }
    }

    // ===== Response DTOs =====

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PineconeQueryResponse{
        private List<Match> matches;
    }

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Match{
        private String id;
        private Float score;
        private Map<String, Object> metadata;
    }
}
