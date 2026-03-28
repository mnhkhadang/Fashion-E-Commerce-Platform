package com.example.demo.chat.client;

import lombok.RequiredArgsConstructor;
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
public class HuggingFaceEmbeddingClient {

    @Value("${ai.huggingface.api-key:}")
    private String apiKey;

    private static final String HF_MODEL =
            "sentence-transformers/paraphrase-multilingual-mpnet-base-v2";
    private static final String EMBED_URL =
            "https://router.huggingface.co/hf-inference/models/"
                    + HF_MODEL + "/pipeline/feature-extraction";

    private final RestTemplate restTemplate;

    public List<Float> embed(String text) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (apiKey != null && !apiKey.isBlank()) {
                headers.setBearerAuth(apiKey);
            }

            Map<String, Object> requestBody = Map.of("inputs", text);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Object> response = restTemplate.exchange(
                    EMBED_URL,
                    HttpMethod.POST,
                    entity,
                    Object.class
            );

            return parseEmbedding(response.getBody());

        } catch (Exception e) {
            log.error("HuggingFace embedding failed: {}", e.getMessage());
            throw new RuntimeException("Failed to generate embedding", e);
        }
    }

    @SuppressWarnings("unchecked")
    private List<Float> parseEmbedding(Object body) {
        if (body instanceof List<?> list) {
            if (!list.isEmpty() && list.get(0) instanceof List<?> nested) {
                // [[embedding...]] hoặc [[[tokens...]]]
                if (!nested.isEmpty() && nested.get(0) instanceof List<?> deepNested) {
                    // Shape [[[tokens, dims]]] → mean pool
                    return meanPool((List<List<Double>>) nested);
                }
                // [[embedding...]] → lấy list đầu tiên
                return toFloatList((List<Double>) nested);
            }
            // [embedding...] → trả về trực tiếp
            return toFloatList((List<Double>) list);
        }
        throw new RuntimeException("Unexpected HuggingFace response format: " + body);
    }

    private List<Float> toFloatList(List<Double> doubles) {
        return doubles.stream()
                .map(Double::floatValue)
                .toList();
    }

    private List<Float> meanPool(List<List<Double>> tokenVectors) {
        int dims = tokenVectors.get(0).size();
        float[] sum = new float[dims];
        for (List<Double> token : tokenVectors) {
            for (int i = 0; i < dims; i++) {
                sum[i] += token.get(i).floatValue();
            }
        }
        int n = tokenVectors.size();
        List<Float> result = new java.util.ArrayList<>(dims);
        for (float v : sum) result.add(v / n);
        return result;
    }
}