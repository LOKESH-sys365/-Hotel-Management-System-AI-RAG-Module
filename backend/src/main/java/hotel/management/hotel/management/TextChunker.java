package hotel.management.hotel.management;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class TextChunker {

    private static final int CHUNK_SIZE = 500;
    private static final int OVERLAP = 100;

    public List<String> chunk(String text) {
        List<String> sentences = splitIntoSentences(text);
        List<String> chunks = new ArrayList<>();
        StringBuilder currentChunk = new StringBuilder();

        for (String sentence : sentences) {
            if (currentChunk.length() + sentence.length() > CHUNK_SIZE) {
                chunks.add(currentChunk.toString().trim());
                String overlapText = getLastNChars(currentChunk.toString(), OVERLAP);
                currentChunk = new StringBuilder(overlapText);
            }
            currentChunk.append(sentence).append(" ");
        }

        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString().trim());
        }

        return chunks;
    }

    private List<String> splitIntoSentences(String text) {
        List<String> sentences = new ArrayList<>();
        String[] rawSplits = text.split("(?<=[.!?])\\s+");
        for (String s : rawSplits) {
            if (!s.isBlank()) sentences.add(s.trim());
        }
        return sentences;
    }

    private String getLastNChars(String text, int n) {
        if (text.length() <= n) return text;
        return text.substring(text.length() - n);
    }
}
