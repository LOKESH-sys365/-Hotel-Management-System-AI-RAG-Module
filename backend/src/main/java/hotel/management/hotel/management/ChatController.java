package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatOrchestrationService chatOrchestrationService;

    @PostMapping("/ask")
    public ResponseEntity<String> ask(@RequestBody ChatRequest request) {
        try {
            String answer = chatOrchestrationService.answer(request.getQuestion(), request.getUserId());
            return ResponseEntity.ok(answer);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
