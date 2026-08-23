package hotel.management.hotel.management;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OllamaEmbeddingModel {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${huggingface.api.key}")
    private String hfApiKey;

    private final String embedUrl = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";
    private final String generateUrl = "https://router.huggingface.co/hf-inference/models/Qwen/Qwen2.5-Coder-1.5B-Instruct";

    public float[] getEmbedding(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(hfApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("inputs", text);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<float[]> response = restTemplate.exchange(
                embedUrl, HttpMethod.POST, request, float[].class
        );

        float[] result = response.getBody();
        if (result != null) return result;
        throw new RuntimeException("Failed to get embedding from HuggingFace");
    }

    public String generateText(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(hfApiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("inputs", prompt);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(
                generateUrl, HttpMethod.POST, request, JsonNode.class
        );

        JsonNode body = response.getBody();
        if (body != null && body.isArray() && body.get(0).has("generated_text")) {
            return body.get(0).get("generated_text").asText();
        }
        throw new RuntimeException("Failed to get response from HuggingFace");
    }
}


