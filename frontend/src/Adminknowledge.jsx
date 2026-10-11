import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "./config"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  BrainCircuit,
  Loader2,
  UploadCloud,
  CheckCircle2,
  XCircle,
} from "lucide-react"

function AdminKnowledge() {
  const [content, setContent] = useState("")
  const [ingesting, setIngesting] = useState(false)
  const [status, setStatus] = useState(null) // { type: "success" | "error", message: string }
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const ingestText = async () => {
    if (!content.trim()) return
    setIngesting(true)
    setStatus(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/ingest/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ userId: 1, content }),
      })

      const text = await response.text()

      if (!response.ok) {
        throw new Error(text || `Request failed (status ${response.status})`)
      }

      setStatus({ type: "success", message: text })
      setContent("")
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Could not reach the server. Please try again.",
      })
    } finally {
      setIngesting(false)
    }
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
        <BrainCircuit className="h-6 w-6 text-cyan-500" />
        <h2 className="text-2xl font-semibold text-white">Admin: Add Knowledge</h2>
      </div>

      <Card className="bg-slate-900/60 border-slate-800 max-w-2xl mx-auto">
        <CardHeader>
          <p className="text-slate-300 font-medium">Teach the chat assistant something new</p>
          <p className="text-slate-500 text-sm">
            Type in anything guests might ask about — check-in/out times, policies,
            amenities, offers — and the assistant will be able to answer questions
            about it.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder={`e.g. "Check-in time is 2 PM. Check-out time is 11 AM. Pets are allowed with prior notice."`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500"
          />
          <Button
            onClick={ingestText}
            disabled={ingesting || !content.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 w-full"
          >
            {ingesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-2 h-4 w-4" />
            )}
            {ingesting ? "Saving..." : "Add to Knowledge Base"}
          </Button>

          {status && (
            <div
              className={`flex items-start gap-2 p-3 rounded-lg text-sm border ${
                status.type === "success"
                  ? "bg-emerald-600/10 border-emerald-600/30 text-emerald-300"
                  : "bg-rose-600/10 border-rose-600/30 text-rose-300"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminKnowledge
