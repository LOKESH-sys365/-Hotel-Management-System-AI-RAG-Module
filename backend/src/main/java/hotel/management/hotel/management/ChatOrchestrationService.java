package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Decides how to answer a chat question:
 *
 *   1. FAST PATH  — simple keyword/regex matching for the most common
 *      live-data questions ("how many rooms are free tonight?",
 *      "is room 101 available?"). Instant, deterministic, no LLM call needed
 *      to decide, so it can never be "talked out of" calling the tool.
 *
 *   2. LLM ROUTER — for anything the fast path doesn't recognise, ask the
 *      LLM itself to pick a tool (this is the manual "function calling"
 *      step, done via a strict JSON-only prompt since the free HuggingFace
 *      Llama-3.1 endpoint doesn't reliably support native tool calling).
 *
 *   3. RAG FALLBACK — if no tool applies (general questions about policies,
 *      amenities, prices, etc.), fall back to the existing
 *      embed -> vector search -> generate pipeline.
 */
@Service
public class ChatOrchestrationService {

    @Autowired
    private HotelToolService hotelToolService;

    @Autowired
    private OllamaEmbeddingModel embeddingModel;

    @Autowired
    private VectorService vectorService;

    private static final Pattern AVAILABILITY_COUNT_PATTERN = Pattern.compile(
            "(how many|number of).{0,20}(room).{0,30}(free|available|vacant|left|empty)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ROOM_STATUS_PATTERN = Pattern.compile(
            "room\\s*#?\\s*(\\w+).{0,30}(free|available|vacant|booked|status)|"
                    + "(free|available|vacant|booked|status).{0,30}room\\s*#?\\s*(\\w+)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern ROOM_NUMBER_PATTERN = Pattern.compile("room\\s*#?\\s*(\\w+)", Pattern.CASE_INSENSITIVE);

    public String answer(String question, Long userId) {
        // ---------- 1. FAST PATH: deterministic keyword matching ----------
        if (AVAILABILITY_COUNT_PATTERN.matcher(question).find()) {
            return generateFromLiveData(question, hotelToolService.describeAvailabilityTonight());
        }

        Matcher roomStatusMatch = ROOM_STATUS_PATTERN.matcher(question);
        if (roomStatusMatch.find()) {
            String roomNumber = extractRoomNumber(question);
            if (roomNumber != null) {
                return generateFromLiveData(question, hotelToolService.describeRoomStatus(roomNumber));
            }
        }

        // ---------- 2. LLM ROUTER: let the model pick a tool ----------
        String toolDecision = decideToolWithLLM(question);

        if (toolDecision != null) {
            switch (toolDecision) {
                case "get_available_rooms_tonight":
                    return generateFromLiveData(question, hotelToolService.describeAvailabilityTonight());
                case "get_room_status":
                    String roomNumber = extractRoomNumber(question);
                    if (roomNumber != null) {
                        return generateFromLiveData(question, hotelToolService.describeRoomStatus(roomNumber));
                    }
                    break;
                default:
                    // "none" or anything unrecognised -> fall through to RAG
                    break;
            }
        }

        // ---------- 3. RAG FALLBACK: existing embed + vector search ----------
        return answerFromRag(question, userId);
    }

    private String extractRoomNumber(String question) {
        Matcher m = ROOM_NUMBER_PATTERN.matcher(question);
        return m.find() ? m.group(1) : null;
    }

    /**
     * Asks the LLM to pick a tool. Returns the tool name as a plain string
     * ("get_available_rooms_tonight", "get_room_status", "none"), or null
     * if the response couldn't be parsed (in which case we fall back to RAG).
     */
    private String decideToolWithLLM(String question) {
        String routerPrompt =
                "You are a router for a hotel assistant. Decide which tool (if any) is needed to answer the question.\n\n"
                        + "Available tools:\n"
                        + "- get_available_rooms_tonight: use for questions about how many rooms are free/available/vacant right now or tonight.\n"
                        + "- get_room_status: use for questions asking if one specific room number is free, available, or booked.\n"
                        + "- none: use for general questions about hotel policies, amenities, spa services, prices, check-in/out times, etc.\n\n"
                        + "Question: \"" + question + "\"\n\n"
                        + "Respond with ONLY one word: get_available_rooms_tonight, get_room_status, or none. No punctuation, no explanation.";

        try {
            String raw = embeddingModel.generateText(routerPrompt);
            if (raw == null) return null;
            String cleaned = raw.trim().toLowerCase().replaceAll("[^a-z_]", "");

            if (cleaned.contains("get_available_rooms_tonight")) return "get_available_rooms_tonight";
            if (cleaned.contains("get_room_status")) return "get_room_status";
            if (cleaned.contains("none")) return "none";
            return null;
        } catch (Exception e) {
            // Router call failed (e.g. API hiccup) — safe to fall back to RAG.
            return null;
        }
    }

    /** Generates a natural-language answer grounded in freshly-fetched live data. */
    private String generateFromLiveData(String question, String liveContext) {
        String prompt = "Answer the question using only the live data below. Be concise and direct.\n\n"
                + "Live data:\n" + liveContext
                + "\n\nQuestion: " + question
                + "\nAnswer:";
        return embeddingModel.generateText(prompt);
    }

    /** The original RAG pipeline: embed question, search vector store, generate grounded answer. */
    private String answerFromRag(String question, Long userId) {
        float[] queryEmbedding = embeddingModel.getEmbedding(question);
        List<String> relevantChunks = vectorService.searchSimilar(queryEmbedding, userId, 3);

        StringBuilder context = new StringBuilder();
        for (String chunk : relevantChunks) {
            context.append(chunk).append("\n");
        }

        String prompt = "Answer the question using only the context below.\n\nContext:\n"
                + context
                + "\nQuestion: " + question
                + "\nAnswer:";

        return embeddingModel.generateText(prompt);
    }
}
