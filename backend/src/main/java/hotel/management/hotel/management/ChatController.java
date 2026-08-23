package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private OllamaEmbeddingModel embeddingModel;

    @Autowired
    private VectorService vectorService;

    @PostMapping("/ask")
    public ResponseEntity<String> ask(@RequestBody ChatRequest request) {
        try {
            float[] queryEmbedding = embeddingModel.getEmbedding(request.getQuestion());

            List<String> relevantChunks = vectorService.searchSimilar(queryEmbedding, request.getUserId(), 3);

            StringBuilder context = new StringBuilder();
            for (String chunk : relevantChunks) {
                context.append(chunk).append("\n");
            }

            String prompt = "Answer the question using only the context below.\n\nContext:\n"
                    + context.toString()
                    + "\nQuestion: " + request.getQuestion()
                    + "\nAnswer:";

            String answer = embeddingModel.generateText(prompt);

            return ResponseEntity.ok(answer);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
