import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BedDouble, Users, ClipboardList, Sparkles, Hotel, LogOut, MessageSquare } from "lucide-react"

function Dashboard() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/")
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

        <Button
          onClick={logout}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-rose-600 hover:text-white hover:border-rose-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>

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