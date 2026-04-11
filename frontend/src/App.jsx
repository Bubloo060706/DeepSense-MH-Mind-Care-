import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import PatientDetail from "./pages/PatientDetail";
import Login from "./pages/Login";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("auth_token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Navbar />
              <main style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
                <Dashboard />
              </main>
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/:userId"
          element={
            <PrivateRoute>
              <Navbar />
              <main style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
                <PatientDetail />
              </main>
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}