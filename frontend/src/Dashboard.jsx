import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "./config"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BedDouble,
  Users,
  ClipboardList,
  Sparkles,
  Hotel,
  LogOut,
  MessageSquare,
  BrainCircuit,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react"

function Dashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null) // { type: "success" | "error", message: string }

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  // Pulls current Rooms & Spa data and refreshes the AI assistant's
  // knowledge base via /api/sync/hotel-data.
  const syncHotelData = async () => {
    setSyncing(true)
    setSyncStatus(null)
    try {
      const response = await fetch(`${API_BASE_URL}/api/sync/hotel-data`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      })

      const text = await response.text()

      if (!response.ok) {
        throw new Error(text || `Sync failed (status ${response.status})`)
      }

      setSyncStatus({ type: "success", message: text })
    } catch (err) {
      setSyncStatus({
        type: "error",
        message: err.message || "Could not reach the server. Please try again.",
      })
    } finally {
      setSyncing(false)
    }
  }

  const menuItems = [
    {
      title: "Rooms",
      description: "Manage hotel rooms",
      icon: BedDouble,
      path: "/rooms",
      color: "text-rose-500",
      border: "hover:border-rose-600/60",
    },
    {
      title: "Customers",
      description: "Manage customers",
      icon: Users,
      path: "/customers",
      color: "text-blue-500",
      border: "hover:border-blue-600/60",
    },
    {
      title: "Bookings",
      description: "Manage bookings",
      icon: ClipboardList,
      path: "/bookings",
      color: "text-emerald-500",
      border: "hover:border-emerald-600/60",
    },
    {
      title: "Spa",
      description: "Manage spa services",
      icon: Sparkles,
      path: "/spa",
      color: "text-purple-500",
      border: "hover:border-purple-600/60",
    },
    {
      title: "Chat",
      description: "Ask the hotel assistant",
      icon: MessageSquare,
      path: "/chat",
      color: "text-amber-500",
      border: "hover:border-amber-600/60",
    },
    {
      title: "Admin: Add Knowledge",
      description: "Teach the AI assistant new info",
      icon: BrainCircuit,
      path: "/admin/knowledge",
      color: "text-cyan-500",
      border: "hover:border-cyan-600/60",
    },
  ]

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-slate-900/70 backdrop-blur-xl border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600/10 border border-rose-600/30">
              <Hotel className="h-5 w-5 text-rose-500" />
            </div>
            <h1 className="text-lg font-semibold text-white">Hotel Management</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
                onClick={syncHotelData}
                disabled={syncing}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              {syncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {syncing ? "Syncing..." : "Sync Hotel Data"}
            </Button>

            <Button
                onClick={logout}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-rose-600 hover:text-white hover:border-rose-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Sync status banner */}
        {syncStatus && (
            <div className="px-8 pt-6">
              <div
                  className={`flex items-start gap-2 p-3 rounded-lg text-sm border max-w-xl ${
                      syncStatus.type === "success"
                          ? "bg-emerald-600/10 border-emerald-600/30 text-emerald-300"
                          : "bg-rose-600/10 border-rose-600/30 text-rose-300"
                  }`}
              >
                {syncStatus.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                ) : (
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                <span>{syncStatus.message}</span>
              </div>
            </div>
        )}

        {/* Grid */}
        <main className="p-8">
          <p className="text-slate-400 mb-6">Select a section to manage</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                  <Card
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`bg-slate-900/60 border-slate-800 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${item.border}`}
                  >
                    <CardContent className="flex flex-col items-center text-center py-10">
                      <Icon className={`h-10 w-10 mb-4 ${item.color}`} />
                      <h3 className="text-white font-medium text-lg">{item.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                    </CardContent>
                  </Card>
              )
            })}
          </div>
        </main>
      </div>
  )
}

export default Dashboard