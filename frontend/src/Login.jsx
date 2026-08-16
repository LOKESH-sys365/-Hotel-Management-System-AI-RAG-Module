import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "./config"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Hotel } from "lucide-react"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const login = async () => {
    setError("")
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const token = await response.text()
        localStorage.setItem("token", token)
        navigate("/dashboard")
      } else {
        setError("Invalid credentials!")
      }
    } catch (err) {
      setError("Could not connect to server. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") login()
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <Card className="w-full max-w-sm bg-slate-900/70 backdrop-blur-xl border-slate-800 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/10 border border-rose-600/30">
            <Hotel className="h-6 w-6 text-rose-500" />
          </div>
          <h2 className="text-2xl font-semibold text-white">Hotel Management</h2>
          <p className="text-slate-400 text-sm">Sign in to your account</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-rose-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-rose-500"
            />
          </div>

          <Button
            onClick={login}
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-950/40 border border-red-900 rounded-lg py-2 px-3">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Login