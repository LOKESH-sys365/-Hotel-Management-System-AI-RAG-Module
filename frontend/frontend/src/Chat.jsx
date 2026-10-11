import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "./config"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MessageSquare, Loader2, Send } from "lucide-react"

function Chat() {
    const [question, setQuestion] = useState("")
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    const askQuestion = async () => {
        if (!question.trim()) return

        const userMessage = { role: "user", text: question }
        setMessages(prev => [...prev, userMessage])
        setQuestion("")
        setLoading(true)

        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/ask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({ userId: 1, question: userMessage.text })
            })
            const answer = await response.text()
            setMessages(prev => [...prev, { role: "assistant", text: answer }])
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", text: "Error: could not get a response." }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") askQuestion()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 mb-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="h-6 w-6 text-rose-500" />
                <h2 className="text-2xl font-semibold text-white">Ask the Hotel Assistant</h2>
            </div>

            <Card className="bg-slate-900/60 border-slate-800 max-w-2xl mx-auto">
                <CardHeader>
                    <p className="text-slate-400 text-sm">Ask about check-in, policies, amenities, etc.</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                        {messages.length === 0 && (
                            <p className="text-slate-500 text-sm text-center py-8">No messages yet — ask something.</p>
                        )}
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`p-3 rounded-lg text-sm ${
                                    msg.role === "user"
                                        ? "bg-rose-600/20 border border-rose-600/30 text-white ml-8"
                                        : "bg-slate-800/60 border border-slate-700 text-slate-200 mr-8"
                                }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-2 text-slate-400 text-sm mr-8">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Thinking...
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="Ask a question..."
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500"
                        />
                        <Button onClick={askQuestion} disabled={loading} className="bg-rose-600 hover:bg-rose-500">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default Chat