package hotel.management.hotel.management;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class OllamaEmbeddingModel {

    // EXPLICITLY CREATE RESTTEMPLATE HERE (NO CONSTRUCTOR!)
    private final RestTemplate restTemplate = new RestTemplate();
    private final String ollamaUrl = "http://localhost:11434/api/embed";
    private final String ollamaGenerateURl = "http://localhost:11434/api/generate";

    public float[] getEmbedding(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "nomic-embed-text");
        requestBody.put("input", text);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(
                ollamaUrl,
                HttpMethod.POST,
                request,
                JsonNode.class
        );

        JsonNode body = response.getBody();
        if (body != null && body.has("embeddings")) {
            JsonNode embeddingArray = body.get("embeddings").get(0);
            float[] result = new float[embeddingArray.size()];
            for (int i = 0; i < embeddingArray.size(); i++) {
                result[i] = (float) embeddingArray.get(i).asDouble();
            }
            return result;
        }
        throw new RuntimeException("Failed to get embedding from Ollama");
    }
    public String generateText(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "qwen2.5-coder:1.5b");
        requestBody.put("prompt", prompt);
        requestBody.put("stream", false);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<JsonNode> response = restTemplate.exchange(ollamaGenerateURl, HttpMethod.POST, request, JsonNode.class);
        JsonNode body = response.getBody();
        if (body != null && body.has("response")) {
            return body.get("response").asText();

        }
        throw new RuntimeException("Failed to get response");
    }

}


