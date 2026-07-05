import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const login = async () => {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })

    if (response.ok) {
      const token = await response.text()
      localStorage.setItem("token", token)
      navigate("/dashboard")
    } else {
      setError("Invalid credentials!")
    }
  }

  return (
    <div style={{ display:"flex", justifyContent:"center", 
                  alignItems:"center", height:"100vh", 
                  background:"#1a1a2e", color:"white" }}>
      <div style={{ background:"#16213e", padding:"40px", 
                    borderRadius:"10px", width:"350px" }}>
        <h2 style={{ textAlign:"center", marginBottom:"20px", 
                     color:"#e94560" }}>🏨 Hotel Management</h2>
        <input placeholder="Username" value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width:"100%", padding:"12px", margin:"10px 0", 
                   borderRadius:"5px", border:"none", 
                   background:"#0f3460", color:"white" }} />
        <input placeholder="Password" type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width:"100%", padding:"12px", margin:"10px 0", 
                   borderRadius:"5px", border:"none", 
                   background:"#0f3460", color:"white" }} />
        <button onClick={login}
          style={{ width:"100%", padding:"12px", background:"#e94560", 
                   color:"white", border:"none", borderRadius:"5px", 
                   cursor:"pointer", fontSize:"16px" }}>
          Login
        </button>
        <p style={{ color:"red", textAlign:"center" }}>{error}</p>
      </div>
    </div>
  )
}

export default Login