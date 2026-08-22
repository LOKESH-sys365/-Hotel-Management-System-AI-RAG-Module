package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VectorService {
    @Autowired
    private VectorRespository vectorRespository;

    public void saveEmbedding(Long userId, String content, float[] embedding, String metadata) {
        vectorRespository.saveEmbedding(Long.valueOf(userId), content, embedding, metadata);

    }

    public List<String> searchSimilar(float[] queryEmbedding, Long userId, int limit) {
        return vectorRespository.searchSimilar(queryEmbedding, userId, limit);
    }

}


