import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const BASE = "http://localhost:8080"

const inputStyle = {
  padding: "10px", margin: "5px", borderRadius: "5px",
  border: "none", background: "#0f3460", color: "white", minWidth: "180px"
}
const btnStyle = (bg = "#e94560") => ({
  padding: "8px 14px", background: bg, color: "white",
  border: "none", borderRadius: "5px", cursor: "pointer", margin: "3px"
})

const emptyForm = {
  customerId: "", roomId: "",
  checkinDate: "", checkoutDate: "",
  checkinTime: "", checkoutTime: "",
  totalprice: ""
}

function Bookings() {
  const [bookings, setBookings] = useState([])
  const [customers, setCustomers] = useState([])
  const [rooms, setRooms] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [b, c, r] = await Promise.all([
        fetch(`${BASE}/api/booking`, { headers: { "Authorization": "Bearer " + token } }).then(r => r.json()),
        fetch(`${BASE}/api/customer`, { headers: { "Authorization": "Bearer " + token } }).then(r => r.json()),
        fetch(`${BASE}/api/rooms`, { headers: { "Authorization": "Bearer " + token } }).then(r => r.json()),
      ])
      setBookings(b)
      setCustomers(c)
      setRooms(r)
    } catch {
      setError("Failed to load data. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    if (!form.customerId) return "Please select a customer"
    if (!form.roomId) return "Please select a room"
    if (!form.checkinDate) return "Check-in date is required"
    if (!form.checkoutDate) return "Check-out date is required"
    if (form.checkoutDate < form.checkinDate) return "Check-out must be after check-in"
    if (!form.totalprice || isNaN(form.totalprice) || Number(form.totalprice) <= 0)
      return "Enter a valid total price"
    return ""
  }

  const createBooking = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError("")
    try {
      const payload = {
        checkinDate: form.checkinDate,
        checkoutDate: form.checkoutDate,
        checkinTime: form.checkinTime || "12:00:00",
        checkoutTime: form.checkoutTime || "11:00:00",
        totalprice: Number(form.totalprice),
        customer: { id: Number(form.customerId) },
        room: { id: Number(form.roomId) }
      }
      const res = await fetch(`${BASE}/api/booking`, {
        method: "POST", headers: authHeaders, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
      setForm(emptyForm)
      fetchAll()
    } catch {
      setError("Failed to create booking.")
    }
  }

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return
    try {
      await fetch(`${BASE}/api/booking/${id}`, {
        method: "DELETE", headers: { "Authorization": "Bearer " + token }
      })
      fetchAll()
    } catch {
      setError("Failed to delete booking.")
    }
  }

  const getCustomerName = (b) => b.customer?.name || "—"
  const getRoomNumber = (b) => b.room?.roomNumber || "—"

  return (
    <div style={{ background: "#1a1a2e", minHeight: "100vh", color: "white", padding: "20px" }}>
      <button onClick={() => navigate("/dashboard")} style={btnStyle()}>← Back</button>
      <h2 style={{ color: "#e94560", margin: "15px 0" }}>📋 Bookings</h2>

      {/* Form */}
      <div style={{ background: "#16213e", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "15px" }}>➕ New Booking</h3>
        {error && <p style={{ color: "#e94560", marginBottom: "10px" }}>⚠️ {error}</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          <select name="customerId" value={form.customerId} onChange={handleChange} style={inputStyle}>
            <option value="">Select Customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
          </select>

          <select name="roomId" value={form.roomId} onChange={handleChange} style={inputStyle}>
            <option value="">Select Room</option>
            {rooms.filter(r => r.available).map(r => (
              <option key={r.id} value={r.id}>Room {r.roomNumber} — {r.roomType} — ₹{r.price}</option>
            ))}
          </select>

          <input type="date" name="checkinDate" value={form.checkinDate}
            onChange={handleChange} style={inputStyle} />
          <input type="date" name="checkoutDate" value={form.checkoutDate}
            onChange={handleChange} style={inputStyle} />
          <input type="time" name="checkinTime" placeholder="Check-in Time"
            value={form.checkinTime} onChange={handleChange} style={inputStyle} />
          <input type="time" name="checkoutTime" placeholder="Check-out Time"
            value={form.checkoutTime} onChange={handleChange} style={inputStyle} />
          <input type="number" name="totalprice" placeholder="Total Price (₹)"
            value={form.totalprice} onChange={handleChange} style={inputStyle} />
        </div>

        <button onClick={createBooking} style={{ ...btnStyle(), marginTop: "10px" }}>
          Create Booking
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#16213e", borderRadius: "10px", overflowX: "auto" }}>
        {loading ? (
          <p style={{ padding: "20px", textAlign: "center" }}>Loading...</p>
        ) : bookings.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center", color: "#888" }}>No bookings yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0f3460" }}>
                {["Customer", "Room", "Check-in", "Check-out", "Total Price", "Action"].map(h => (
                  <th key={h} style={{ padding: "14px 12px", textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} style={{ borderBottom: "1px solid #0f3460" }}>
                  <td style={{ padding: "13px", textAlign: "center" }}>{getCustomerName(b)}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>{getRoomNumber(b)}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>{b.checkinDate}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>{b.checkoutDate}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>₹{b.totalprice}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>
                    <button onClick={() => deleteBooking(b.id)} style={btnStyle("red")}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Bookings
