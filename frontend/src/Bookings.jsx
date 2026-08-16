import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "./config"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ClipboardList, Trash2, Loader2, AlertTriangle } from "lucide-react"

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
  const [saving, setSaving] = useState(false)
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
        fetch(`${API_BASE_URL}/api/booking`, { headers: { "Authorization": "Bearer " + token } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/customer`, { headers: { "Authorization": "Bearer " + token } }).then(r => r.json()),
        fetch(`${API_BASE_URL}/api/rooms`, { headers: { "Authorization": "Bearer " + token } }).then(r => r.json()),
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
  const handleSelectChange = (name, value) => setForm({ ...form, [name]: value })

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
    setSaving(true)
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
      const res = await fetch(`${API_BASE_URL}/api/booking`, {
        method: "POST", headers: authHeaders, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
      setForm(emptyForm)
      fetchAll()
    } catch {
      setError("Failed to create booking.")
    } finally {
      setSaving(false)
    }
  }

  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return
    try {
      await fetch(`${API_BASE_URL}/api/booking/${id}`, {
        method: "DELETE", headers: { "Authorization": "Bearer " + token }
      })
      fetchAll()
    } catch {
      setError("Failed to delete booking.")
    }
  }

  const getCustomerName = (b) => b.customer?.name || "—"
  const getRoomNumber = (b) => b.room?.roomNumber || "—"

  const inputClass = "bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500"

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
        <ClipboardList className="h-6 w-6 text-emerald-500" />
        <h2 className="text-2xl font-semibold text-white">Bookings</h2>
      </div>

      {/* Form */}
      <Card className="bg-slate-900/60 border-slate-800 mb-6">
        <CardHeader>
          <h3 className="text-white font-medium">New Booking</h3>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg py-2 px-3 mb-4">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Select value={form.customerId} onValueChange={v => handleSelectChange("customerId", v)}>
              <SelectTrigger className={`${inputClass} w-56`}>
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                {customers.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name} — {c.phone}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={form.roomId} onValueChange={v => handleSelectChange("roomId", v)}>
              <SelectTrigger className={`${inputClass} w-56`}>
                <SelectValue placeholder="Select Room" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                {rooms.filter(r => r.available).map(r => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    Room {r.roomNumber} — {r.roomType} — ₹{r.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" name="checkinDate" value={form.checkinDate}
              onChange={handleChange} className={`${inputClass} w-44`} />
            <Input type="date" name="checkoutDate" value={form.checkoutDate}
              onChange={handleChange} className={`${inputClass} w-44`} />
            <Input type="time" name="checkinTime" value={form.checkinTime}
              onChange={handleChange} className={`${inputClass} w-36`} />
            <Input type="time" name="checkoutTime" value={form.checkoutTime}
              onChange={handleChange} className={`${inputClass} w-36`} />
            <Input type="number" name="totalprice" placeholder="Total Price (₹)"
              value={form.totalprice} onChange={handleChange} className={`${inputClass} w-40`} />
          </div>

          <Button
            onClick={createBooking}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white mt-4"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Booking"}
          </Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-center text-slate-500 py-10">No bookings yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Customer</TableHead>
                  <TableHead className="text-slate-400">Room</TableHead>
                  <TableHead className="text-slate-400">Check-in</TableHead>
                  <TableHead className="text-slate-400">Check-out</TableHead>
                  <TableHead className="text-slate-400">Total Price</TableHead>
                  <TableHead className="text-slate-400 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(b => (
                  <TableRow key={b.id} className="border-slate-800 hover:bg-slate-800/40">
                    <TableCell className="text-white">{getCustomerName(b)}</TableCell>
                    <TableCell className="text-slate-300">{getRoomNumber(b)}</TableCell>
                    <TableCell className="text-slate-300">{b.checkinDate}</TableCell>
                    <TableCell className="text-slate-300">{b.checkoutDate}</TableCell>
                    <TableCell className="text-slate-300">₹{b.totalprice}</TableCell>
                    <TableCell className="text-right">
                      <Button onClick={() => deleteBooking(b.id)} variant="destructive" size="sm">
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

export default Bookings