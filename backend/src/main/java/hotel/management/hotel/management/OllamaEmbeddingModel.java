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
    private final String generateUrl = "https://router.huggingface.co/v1/chat/completions";

    public float[] getEmbedding(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
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
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.setBearerAuth(hfApiKey);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "meta-llama/Llama-3.1-8B-Instruct");
        requestBody.put("messages", List.of(message));
        requestBody.put("stream", false);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(
                generateUrl, HttpMethod.POST, request, JsonNode.class
        );

        JsonNode body = response.getBody();
        if (body != null && body.has("choices")) {
            return body.get("choices").get(0).get("message").get("content").asText();
        }
        throw new RuntimeException("Failed to get response from HuggingFace");
    }
}


