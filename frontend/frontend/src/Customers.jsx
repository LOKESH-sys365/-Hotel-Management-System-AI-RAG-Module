import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "./config"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react"

const API = `${API_BASE_URL}/api/customer`

function Customers() {
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", adharNo: "" })
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
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
    setSaving(true)
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
    } finally {
      setSaving(false)
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

  const fields = [
    { name: "name", placeholder: "Full Name" },
    { name: "email", placeholder: "Email" },
    { name: "phone", placeholder: "Phone (10 digits)" },
    { name: "address", placeholder: "Address" },
    { name: "adharNo", placeholder: "Aadhaar No (12 digits)" },
  ]

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
        <Users className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-semibold text-white">Customers</h2>
      </div>

      {/* Form */}
      <Card className="bg-slate-900/60 border-slate-800 mb-6">
        <CardHeader>
          <h3 className="text-white font-medium">
            {editId ? "Edit Customer" : "Add New Customer"}
          </h3>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg py-2 px-3 mb-4">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {fields.map(f => (
              <Input
                key={f.name}
                name={f.name}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={handleChange}
                className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 w-48"
              />
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={saveCustomer}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editId ? (
                "Update Customer"
              ) : (
                "Add Customer"
              )}
            </Button>
            {editId && (
              <Button
                onClick={cancelEdit}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : customers.length === 0 ? (
            <p className="text-center text-slate-500 py-10">No customers yet. Add one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Phone</TableHead>
                  <TableHead className="text-slate-400">Address</TableHead>
                  <TableHead className="text-slate-400">Aadhaar</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map(c => (
                  <TableRow key={c.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="text-white">{c.name}</TableCell>
                    <TableCell className="text-slate-300">{c.email}</TableCell>
                    <TableCell className="text-slate-300">{c.phone}</TableCell>
                    <TableCell className="text-slate-300">{c.address}</TableCell>
                    <TableCell className="text-slate-300">{c.adharNo}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        onClick={() => startEdit(c)}
                        variant="outline"
                        size="sm"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteCustomer(c.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Customers