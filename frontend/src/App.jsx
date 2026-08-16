import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./Login"
import Dashboard from "./Dashboard"
import Rooms from "./Rooms"
import Customers from "./Customers"
import Bookings from "./Bookings"
import Spa from "./Spa"

// Protects routes — redirects to login if no token found
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/" replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/rooms" element={
          <PrivateRoute><Rooms /></PrivateRoute>
        } />
        <Route path="/customers" element={
          <PrivateRoute><Customers /></PrivateRoute>
        } />
        <Route path="/bookings" element={
          <PrivateRoute><Bookings /></PrivateRoute>
        } />
        <Route path="/spa" element={
          <PrivateRoute><Spa /></PrivateRoute>
        } />

        {/* Catch-all — redirect unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
