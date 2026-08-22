package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/ai-test")

public class VectorTestController {

    private final VectorService vectorService;
    private final OllamaEmbeddingModel ollamaEmbeddingModel;
    @Autowired
    public VectorTestController(VectorService vectorService,OllamaEmbeddingModel ollamaEmbeddingModel) {
        this.vectorService = vectorService;
        this.ollamaEmbeddingModel= ollamaEmbeddingModel;
    }


    @GetMapping("/save")
    public String saveTestEmbedding(){
        //float[] dummyEmbedding = new float[1536];
        //Arrays.fill(dummyEmbedding,0.1f);
        String text = "HELLO WORLD";
        float[] embedding = ollamaEmbeddingModel.getEmbedding(text);

        vectorService.saveEmbedding(11l,text,embedding,"{\"source\":\"test.pdf\"}");
        return "success";
    }

    @GetMapping("/search")
    public String searchTestEmbedding(){
        //float[] dummyEmbedding = new float[1536];
        //Arrays.fill(dummyEmbedding,0.1f);
        String query = "HELLO WORLD";
        float[] embedding = ollamaEmbeddingModel.getEmbedding(query);

        List<String> result = vectorService.searchSimilar(embedding,11l,3);
        return "success" + result.toString();
    }

    @GetMapping("/chat")
    public String chatTestEmbedding(@RequestParam  String question){
        float[] queryembedding = ollamaEmbeddingModel.getEmbedding(question);
        List<String> result = vectorService.searchSimilar(queryembedding,11l,3);
        String context =String.join("\n",result);
        String prompt = "Context:\n"+context+"\n\nQuestion:\n"+question+"\n\nAnswer:\n"+result;
        return ollamaEmbeddingModel.generateText(prompt);

    }



}

