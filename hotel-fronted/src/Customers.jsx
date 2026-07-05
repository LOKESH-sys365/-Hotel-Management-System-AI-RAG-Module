import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const API = "http://localhost:8080/api/customer"

const inputStyle = {
  padding: "10px", margin: "5px", borderRadius: "5px",
  border: "none", background: "#0f3460", color: "white", width: "180px"
}
const btnStyle = (bg = "#e94560") => ({
  padding: "8px 14px", background: bg, color: "white",
  border: "none", borderRadius: "5px", cursor: "pointer", margin: "3px"
})

function Customers() {
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", adharNo: "" })
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => { fetchCustomers() }, [])

  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + token
  }

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const res = await fetch(API, { headers: { "Authorization": "Bearer " + token } })
      if (!res.ok) throw new Error("Failed to fetch")
      setCustomers(await res.json())
    } catch (e) {
      setError("Could not load customers. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    if (!form.name.trim()) return "Name is required"
    if (!form.email.trim() || !form.email.includes("@")) return "Valid email is required"
    if (!form.phone.trim() || form.phone.length < 10) return "Valid 10-digit phone is required"
    if (!form.adharNo.trim() || form.adharNo.length !== 12) return "Aadhaar must be 12 digits"
    return ""
  }

  const saveCustomer = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError("")
    try {
      const method = editId ? "PUT" : "POST"
      const body = editId ? { ...form, id: editId } : form
      const res = await fetch(API, { method, headers: authHeaders, body: JSON.stringify(body) })
      if (!res.ok) throw new Error()
      setForm({ name: "", email: "", phone: "", address: "", adharNo: "" })
      setEditId(null)
      fetchCustomers()
    } catch {
      setError("Failed to save customer.")
    }
  }

  const startEdit = (c) => {
    setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, adharNo: c.adharNo })
    setEditId(c.id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return
    try {
      await fetch(`${API}/${id}`, { method: "DELETE", headers: { "Authorization": "Bearer " + token } })
      fetchCustomers()
    } catch {
      setError("Failed to delete customer.")
    }
  }

  const cancelEdit = () => {
    setEditId(null)
    setForm({ name: "", email: "", phone: "", address: "", adharNo: "" })
    setError("")
  }

  return (
    <div style={{ background: "#1a1a2e", minHeight: "100vh", color: "white", padding: "20px" }}>
      <button onClick={() => navigate("/dashboard")} style={btnStyle()}>← Back</button>
      <h2 style={{ color: "#e94560", margin: "15px 0" }}>👥 Customers</h2>

      {/* Form */}
      <div style={{ background: "#16213e", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "15px" }}>{editId ? "✏️ Edit Customer" : "➕ Add New Customer"}</h3>
        {error && <p style={{ color: "#e94560", marginBottom: "10px" }}>⚠️ {error}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {[
            { name: "name", placeholder: "Full Name" },
            { name: "email", placeholder: "Email" },
            { name: "phone", placeholder: "Phone (10 digits)" },
            { name: "address", placeholder: "Address" },
            { name: "adharNo", placeholder: "Aadhaar No (12 digits)" },
          ].map(f => (
            <input key={f.name} name={f.name} placeholder={f.placeholder}
              value={form[f.name]} onChange={handleChange} style={inputStyle} />
          ))}
        </div>
        <div style={{ marginTop: "10px" }}>
          <button onClick={saveCustomer} style={btnStyle()}>
            {editId ? "Update Customer" : "Add Customer"}
          </button>
          {editId && <button onClick={cancelEdit} style={btnStyle("#555")}>Cancel</button>}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#16213e", borderRadius: "10px", overflowX: "auto" }}>
        {loading ? (
          <p style={{ padding: "20px", textAlign: "center" }}>Loading...</p>
        ) : customers.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center", color: "#888" }}>No customers yet. Add one above.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0f3460" }}>
                {["Name", "Email", "Phone", "Address", "Aadhaar", "Actions"].map(h => (
                  <th key={h} style={{ padding: "14px 12px", textAlign: "center" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #0f3460" }}>
                  <td style={{ padding: "13px", textAlign: "center" }}>{c.name}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>{c.email}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>{c.phone}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>{c.address}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>{c.adharNo}</td>
                  <td style={{ padding: "13px", textAlign: "center" }}>
                    <button onClick={() => startEdit(c)} style={btnStyle("#0f3460")}>✏️ Edit</button>
                    <button onClick={() => deleteCustomer(c.id)} style={btnStyle("red")}>🗑️ Delete</button>
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

export default Customers
