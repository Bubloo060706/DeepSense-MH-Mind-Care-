import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/MindCare_Logo.png'

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--color-bg)",
  },
  card: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius)",
    padding: "40px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "var(--shadow)",
  },
  logo: {
    textAlign: "center",
    marginBottom: 32,
  },
  title: { fontSize: 26, fontWeight: 700, color: "var(--color-text)" },
  subtitle: { fontSize: 14, color: "var(--color-muted)", marginTop: 4 },
  label: { fontSize: 13, color: "var(--color-muted)", marginBottom: 6, display: "block" },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    color: "var(--color-text)",
    fontSize: 14,
    outline: "none",
    marginBottom: 18,
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "var(--color-primary)",
    color: "#fff",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    marginTop: 4,
  },
  error: {
    background: "#3b1a1a",
    border: "1px solid var(--color-danger)",
    color: "var(--color-danger)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 16,
  },
  hint: { fontSize: 12, color: "var(--color-muted)", textAlign: "center", marginTop: 20 },
};

// Demo credentials — replace with real auth in production
const DEMO_USERS = [
  { email: "clinician@mindcare.ai", password: "demo1234", token: "demo-token-clinician", name: "Dr. Meena" },
];

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600)); // simulate network

    const match = DEMO_USERS.find(
      (u) => u.email === email.trim() && u.password === password
    );

    if (match) {
      localStorage.setItem("auth_token", match.token);
      localStorage.setItem("user_name", match.name);
      navigate("/");
    } else {
      setError("Invalid email or password. Try clinician@mindcare.ai / demo1234");
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={{ fontSize: 36, marginBottom: 8 }}><img style={{width:100}} src={logo} alt="logo"/></div>
          <div style={s.title}>MindCare</div>
          <div style={s.subtitle}>DeepSense-MH Clinician Dashboard</div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <label style={s.label}>Email</label>
          <input
            style={s.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="clinician@mindcare.ai"
            required
            autoFocus
          />

          <label style={s.label}>Password</label>
          <input
            style={s.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={s.hint}>DeepSense-MH · ICAN 2026 Demo Build</p>
      </div>
    </div>
  );
}