import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const API = "http://localhost:8080/api/spa"

const inputStyle = {
  padding: "10px", margin: "5px", borderRadius: "5px",
  border: "none", background: "#0f3460", color: "white", width: "180px"
}
const btnStyle = (bg = "#e94560") => ({
  padding: "8px 14px", background: bg, color: "white",
  border: "none", borderRadius: "5px", cursor: "pointer", margin: "3px"
})

const emptyForm = { serviceName: "", price: "", Duration: "", isAvailable: true }

function Spa() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  }

  useEffect(() => { fetchServices() }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await fetch(API, { headers: { "Authorization": "Bearer " + token } })
      if (!res.ok) throw new Error()
      setServices(await res.json())
    } catch {
      setError("Could not load spa services. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => {
    const val = e.target.name === "isAvailable" ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  const validate = () => {
    if (!form.serviceName.trim()) return "Service name is required"
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) return "Valid price is required"
    if (!form.Duration || isNaN(form.Duration) || Number(form.Duration) <= 0) return "Valid duration (minutes) is required"
    return ""
  }

  const saveService = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError("")
    try {
      const method = editId ? "PUT" : "POST"
      const body = editId
        ? { id: editId, ...form, price: Number(form.price), Duration: Number(form.Duration) }
        : { ...form, price: Number(form.price), Duration: Number(form.Duration) }
      const res = await fetch(API, { method, headers: authHeaders, body: JSON.stringify(body) })
      if (!res.ok) throw new Error()
      setForm(emptyForm)
      setEditId(null)
      fetchServices()
    } catch {
      setError("Failed to save service.")
    }
  }

  const startEdit = (s) => {
    setForm({ serviceName: s.serviceName, price: s.price, Duration: s.duration, isAvailable: s.available })
    setEditId(s.id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const deleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return
    try {
      await fetch(`${API}/${id}`, { method: "DELETE", headers: { "Authorization": "Bearer " + token } })
      fetchServices()
    } catch {
      setError("Failed to delete service.")
    }
  }

  return (
    <div style={{ background: "#1a1a2e", minHeight: "100vh", color: "white", padding: "20px" }}>
      <button onClick={() => navigate("/dashboard")} style={btnStyle()}>← Back</button>
      <h2 style={{ color: "#e94560", margin: "15px 0" }}>💆 Spa & Amenities</h2>

      {/* Form */}
      <div style={{ background: "#16213e", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "15px" }}>{editId ? "✏️ Edit Service" : "➕ Add New Service"}</h3>
        {error && <p style={{ color: "#e94560", marginBottom: "10px" }}>⚠️ {error}</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", alignItems: "center" }}>
          <input name="serviceName" placeholder="Service Name" value={form.serviceName}
            onChange={handleChange} style={inputStyle} />
          <input name="price" type="number" placeholder="Price (₹)" value={form.price}
            onChange={handleChange} style={inputStyle} />
          <input name="Duration" type="number" placeholder="Duration (mins)" value={form.Duration}
            onChange={handleChange} style={inputStyle} />
          <label style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
            <input type="checkbox" name="isAvailable" checked={form.isAvailable}
              onChange={handleChange} style={{ width: "16px", height: "16px" }} />
            Available
          </label>
        </div>

        <div style={{ marginTop: "12px" }}>
          <button onClick={saveService} style={btnStyle()}>
            {editId ? "Update Service" : "Add Service"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm(emptyForm); setError("") }}
              style={btnStyle("#555")}>Cancel</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#16213e", borderRadius: "10px", overflowX: "auto" }}>
        {loading ? (
          <p style={{ padding: "20px", textAlign: "center" }}>Loading...</p>
        ) : services.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center", color: "#888" }}>No services yet. Add one above.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0f3460" }}>
                {["Service Name", "Price", "Duration", "Available", "Actions"].map(h => (
                  <th key={h} style={{ padding: "14px 12px", textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #0f3460" }}>
                  <td style={{ padding: "13px", textAlign: "center" }}>{s.serviceName}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>₹{s.price}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>{s.duration} mins</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>{s.available ? "✅" : "❌"}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>
                    <button onClick={() => startEdit(s)} style={btnStyle("#0f3460")}>✏️ Edit</button>
                    <button onClick={() => deleteService(s.id)} style={btnStyle("red")}>🗑️ Delete</button>
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

export default Spa
