import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

function Rooms() {
  const [rooms, setRooms] = useState([])
  const [roomNumber, setRoomNumber] = useState("")
  const [roomType, setRoomType] = useState("")
  const [price, setPrice] = useState("")
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    const response = await fetch("http://localhost:8080/api/rooms", {
      headers: { "Authorization": "Bearer " + token }
    })
    const data = await response.json()
    setRooms(data)
  }

  const addRoom = async () => {
    await fetch("http://localhost:8080/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ roomNumber, roomType, price, isAvailable: true })
    })
    fetchRooms()
    setRoomNumber("")
    setRoomType("")
    setPrice("")
  }

  const deleteRoom = async (id) => {
    await fetch(`http://localhost:8080/api/rooms/${id}`, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    })
    fetchRooms()
  }

  return (
    <div style={{ background:"#1a1a2e", minHeight:"100vh", 
                  color:"white", padding:"20px" }}>
      <button onClick={() => navigate("/dashboard")}
        style={{ background:"#e94560", color:"white", border:"none",
                 padding:"10px 20px", borderRadius:"5px", 
                 cursor:"pointer", marginBottom:"20px" }}>
        ← Back
      </button>
      <h2 style={{ color:"#e94560", marginBottom:"20px" }}>🛏️ Rooms</h2>

      <div style={{ background:"#16213e", padding:"20px", 
                    borderRadius:"10px", marginBottom:"20px" }}>
        <h3 style={{ marginBottom:"15px" }}>Add New Room</h3>
        <input placeholder="Room Number" value={roomNumber}
          onChange={e => setRoomNumber(e.target.value)}
          style={{ padding:"10px", margin:"5px", borderRadius:"5px",
                   border:"none", background:"#0f3460", color:"white" }} />
        <input placeholder="Room Type" value={roomType}
          onChange={e => setRoomType(e.target.value)}
          style={{ padding:"10px", margin:"5px", borderRadius:"5px",
                   border:"none", background:"#0f3460", color:"white" }} />
        <input placeholder="Price" value={price}
          onChange={e => setPrice(e.target.value)}
          style={{ padding:"10px", margin:"5px", borderRadius:"5px",
                   border:"none", background:"#0f3460", color:"white" }} />
        <button onClick={addRoom}
          style={{ padding:"10px 20px", background:"#e94560",
                   color:"white", border:"none", borderRadius:"5px",
                   cursor:"pointer", margin:"5px" }}>
          Add Room
        </button>
      </div>

      <div style={{ background:"#16213e", borderRadius:"10px", 
                    overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#0f3460" }}>
              <th style={{ padding:"15px" }}>Room Number</th>
              <th style={{ padding:"15px" }}>Type</th>
              <th style={{ padding:"15px" }}>Price</th>
              <th style={{ padding:"15px" }}>Available</th>
              <th style={{ padding:"15px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id} style={{ borderBottom:"1px solid #0f3460" }}>
                <td style={{ padding:"15px", textAlign:"center" }}>{room.roomNumber}</td>
                <td style={{ padding:"15px", textAlign:"center" }}>{room.roomType}</td>
                <td style={{ padding:"15px", textAlign:"center" }}>₹{room.price}</td>
                <td style={{ padding:"15px", textAlign:"center" }}>
                  {room.available ? "✅" : "❌"}
                </td>
                <td style={{ padding:"15px", textAlign:"center" }}>
                  <button onClick={() => deleteRoom(room.id)}
                    style={{ background:"red", color:"white",
                             border:"none", padding:"5px 10px",
                             borderRadius:"5px", cursor:"pointer" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Rooms