package hotel.management.hotel.management;

public class ChatRequest {
    private Long userId;
    private String question;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
}