import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "./config"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, BedDouble, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react"

function Rooms() {
  const [rooms, setRooms] = useState([])
  const [roomNumber, setRoomNumber] = useState("")
  const [roomType, setRoomType] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms`, {
        headers: { "Authorization": "Bearer " + token }
      })
      const data = await response.json()
      setRooms(data)
    } catch (err) {
      console.error("Failed to fetch rooms:", err)
    } finally {
      setLoading(false)
    }
  }

  const addRoom = async () => {
    if (!roomNumber || !roomType || !price) return
    setAdding(true)
    try {
      await fetch(`${API_BASE_URL}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ roomNumber, roomType, price, isAvailable: true })
      })
      await fetchRooms()
      setRoomNumber("")
      setRoomType("")
      setPrice("")
    } catch (err) {
      console.error("Failed to add room:", err)
    } finally {
      setAdding(false)
    }
  }

  const deleteRoom = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
      })
      fetchRooms()
    } catch (err) {
      console.error("Failed to delete room:", err)
    }
  }

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
        <BedDouble className="h-6 w-6 text-rose-500" />
        <h2 className="text-2xl font-semibold text-white">Rooms</h2>
      </div>

      {/* Add Room Form */}
      <Card className="bg-slate-900/60 border-slate-800 mb-6">
        <CardHeader>
          <h3 className="text-white font-medium">Add New Room</h3>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 items-end">
          <Input
            placeholder="Room Number"
            value={roomNumber}
            onChange={e => setRoomNumber(e.target.value)}
            className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 w-40"
          />
          <Input
            placeholder="Room Type"
            value={roomType}
            onChange={e => setRoomType(e.target.value)}
            className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 w-40"
          />
          <Input
            placeholder="Price"
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 w-32"
          />
          <Button
            onClick={addRoom}
            disabled={adding}
            className="bg-rose-600 hover:bg-rose-500 text-white"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Room"}
          </Button>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Room Number</TableHead>
                  <TableHead className="text-slate-400">Type</TableHead>
                  <TableHead className="text-slate-400">Price</TableHead>
                  <TableHead className="text-slate-400 text-center">Available</TableHead>
                  <TableHead className="text-slate-400 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.length === 0 ? (
                  <TableRow className="border-slate-800">
                    <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                      No rooms found
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map(room => (
                    <TableRow key={room.id} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell className="text-white">{room.roomNumber}</TableCell>
                      <TableCell className="text-slate-300">{room.roomType}</TableCell>
                      <TableCell className="text-slate-300">₹{room.price}</TableCell>
                      <TableCell className="text-center">
                        {room.available ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 inline" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => deleteRoom(room.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Rooms