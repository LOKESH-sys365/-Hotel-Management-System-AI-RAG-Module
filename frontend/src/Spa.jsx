import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "./config"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Sparkles, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"

const API = `${API_BASE_URL}/api/spa`

const emptyForm = { serviceName: "", price: "", Duration: "", isAvailable: true }

function Spa() {
  const [services, setServices] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
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

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

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
    setSaving(true)
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
    } finally {
      setSaving(false)
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

  const cancelEdit = () => {
    setEditId(null)
    setForm(emptyForm)
    setError("")
  }

  const inputClass = "bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 w-44"

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
        <Sparkles className="h-6 w-6 text-purple-500" />
        <h2 className="text-2xl font-semibold text-white">Spa &amp; Amenities</h2>
      </div>

      {/* Form */}
      <Card className="bg-slate-900/60 border-slate-800 mb-6">
        <CardHeader>
          <h3 className="text-white font-medium">
            {editId ? "Edit Service" : "Add New Service"}
          </h3>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg py-2 px-3 mb-4">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Input name="serviceName" placeholder="Service Name" value={form.serviceName}
              onChange={handleChange} className={inputClass} />
            <Input name="price" type="number" placeholder="Price (₹)" value={form.price}
              onChange={handleChange} className={inputClass} />
            <Input name="Duration" type="number" placeholder="Duration (mins)" value={form.Duration}
              onChange={handleChange} className={inputClass} />
            <label className="flex items-center gap-2 text-slate-300 text-sm">
              <Checkbox
                checked={form.isAvailable}
                onCheckedChange={checked => setForm({ ...form, isAvailable: checked })}
              />
              Available
            </label>
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              onClick={saveService}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editId ? (
                "Update Service"
              ) : (
                "Add Service"
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
          ) : services.length === 0 ? (
            <p className="text-center text-slate-500 py-10">No services yet. Add one above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Service Name</TableHead>
                  <TableHead className="text-slate-400">Price</TableHead>
                  <TableHead className="text-slate-400">Duration</TableHead>
                  <TableHead className="text-slate-400 text-center">Available</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map(s => (
                  <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="text-white">{s.serviceName}</TableCell>
                    <TableCell className="text-slate-300">₹{s.price}</TableCell>
                    <TableCell className="text-slate-300">{s.duration} mins</TableCell>
                    <TableCell className="text-center">
                      {s.available ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 inline" />
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        onClick={() => startEdit(s)}
                        variant="outline"
                        size="sm"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => deleteService(s.id)} variant="destructive" size="sm">
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

export default Spa