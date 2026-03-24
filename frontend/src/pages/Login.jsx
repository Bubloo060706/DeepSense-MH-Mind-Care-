import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/apiClient";

export default function Login() {
  const navigate    = useNavigate();
  const [form,      setForm]      = useState({ email: "", password: "" });
  const [error,     setError]     = useState(null);
  const [loading,   setLoading]   = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await login(form.email, form.password);
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("user_id",      res.data.user_id);
      localStorage.setItem("user_role",    res.data.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.iconWrap}>🧠</div>
          <h1 style={styles.title}>Depression Detection</h1>
          <p style={styles.subtitle}>Clinician & Patient Portal</p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBanner}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              type        = "email"
              name        = "email"
              value       = {form.email}
              onChange    = {handleChange}
              placeholder = "you@example.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              type        = "password"
              name        = "password"
              value       = {form.password}
              onChange    = {handleChange}
              placeholder = "••••••••"
              required
              style={styles.input}
            />
          </div>

          <button
            type    = "submit"
            disabled = {loading}
            style   = {{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          IoT Mental Health Monitoring System · v1.0
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight:       "100vh",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: "#f7fafc",
  },
  card: {
    background:   "#ffffff",
    borderRadius: "16px",
    padding:      "40px 36px",
    width:        "100%",
    maxWidth:     "420px",
    boxShadow:    "0 4px 24px rgba(0,0,0,0.08)",
  },
  header: {
    textAlign:    "center",
    marginBottom: "28px",
  },
  iconWrap: {
    fontSize:     "40px",
    marginBottom: "8px",
  },
  title: {
    fontSize:   "22px",
    fontWeight: "600",
    color:      "#1a202c",
    margin:     "0 0 4px",
  },
  subtitle: {
    fontSize: "14px",
    color:    "#718096",
    margin:   0,
  },
  errorBanner: {
    background:   "#fff5f5",
    border:       "1px solid #fc8181",
    borderRadius: "8px",
    color:        "#c53030",
    padding:      "10px 14px",
    fontSize:     "14px",
    marginBottom: "20px",
  },
  form: {
    display:       "flex",
    flexDirection: "column",
    gap:           "18px",
  },
  fieldGroup: {
    display:       "flex",
    flexDirection: "column",
    gap:           "6px",
  },
  label: {
    fontSize:   "13px",
    fontWeight: "500",
    color:      "#4a5568",
  },
  input: {
    padding:      "10px 14px",
    borderRadius: "8px",
    border:       "1px solid #e2e8f0",
    fontSize:     "15px",
    outline:      "none",
    color:        "#2d3748",
  },
  button: {
    padding:         "12px",
    borderRadius:    "8px",
    backgroundColor: "#4c51bf",
    color:           "#ffffff",
    fontSize:        "15px",
    fontWeight:      "600",
    border:          "none",
    cursor:          "pointer",
    marginTop:       "4px",
  },
  footer: {
    textAlign:  "center",
    fontSize:   "12px",
    color:      "#a0aec0",
    marginTop:  "28px",
    marginBottom: 0,
  },
};