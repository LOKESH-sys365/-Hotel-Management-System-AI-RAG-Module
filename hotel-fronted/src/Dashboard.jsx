import { useNavigate } from "react-router-dom"

const cards = [
  { icon: "🛏️", label: "Rooms",     desc: "Manage hotel rooms",     path: "/rooms" },
  { icon: "👥", label: "Customers", desc: "Manage customers",        path: "/customers" },
  { icon: "📋", label: "Bookings",  desc: "Manage bookings",         path: "/bookings" },
  { icon: "💆", label: "Spa",       desc: "Manage spa & amenities",  path: "/spa" },
]

function Dashboard() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <div style={{ background: "#1a1a2e", minHeight: "100vh", color: "white" }}>
      {/* Navbar */}
      <div style={{
        background: "#16213e", padding: "20px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <h2 style={{ color: "#e94560" }}>🏨 Hotel Management</h2>
        <button onClick={logout} style={{
          background: "#e94560", color: "white", border: "none",
          padding: "10px 20px", borderRadius: "5px", cursor: "pointer"
        }}>
          Logout
        </button>
      </div>

      {/* Cards */}
      <div style={{
        padding: "30px", display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px"
      }}>
        {cards.map(card => (
          <div key={card.path} onClick={() => navigate(card.path)} style={{
            background: "#16213e", padding: "30px", borderRadius: "10px",
            textAlign: "center", cursor: "pointer", border: "2px solid #e94560",
            transition: "transform 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <h2 style={{ fontSize: "2rem" }}>{card.icon}</h2>
            <h3 style={{ margin: "10px 0 5px" }}>{card.label}</h3>
            <p style={{ color: "#aaa", fontSize: "14px" }}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
