package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ingest")
public class IngestionController {

    @Autowired
    private OllamaEmbeddingModel embeddingModel;

    @Autowired
    private VectorService vectorService;

    @Autowired
    private TextChunker textChunker;

    @PostMapping("/text")
    public String ingestText(@RequestBody IngestRequest request) {
        List<String> chunks = textChunker.chunk(request.getContent());

        for (String chunk : chunks) {
            float[] embedding = embeddingModel.getEmbedding(chunk);
            vectorService.saveEmbedding(request.getUserId(), chunk, embedding, "{}");
        }

        return "Ingested " + chunks.size() + " chunks successfully";
    }
}
