import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getTrendSummary } from "../api/apiClient";
import { useAlerts } from "../hooks/useAlerts";
import DepressionAlertFeed from "../components/DepressionAlertFeed";

// Demo patient roster — replace with real API call in production
const DEMO_PATIENTS = [
  { id: "user-001", name: "Aravind Kumar",  age: 28, lastSeen: "Today" },
  { id: "user-002", name: "Priya Nair",     age: 34, lastSeen: "Yesterday" },
  { id: "user-003", name: "Rajan Mehta",    age: 22, lastSeen: "2 days ago" },
  { id: "user-004", name: "Sneha Pillai",   age: 45, lastSeen: "Today" },
];

const s = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  h1: { fontSize: 24, fontWeight: 700 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 },
  card: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius)",
    padding: "20px 24px",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  name: { fontWeight: 600, fontSize: 16, marginBottom: 4 },
  meta: { color: "var(--color-muted)", fontSize: 13, marginBottom: 14 },
  badge: (level) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background:
      level === "high"     ? "#3b1a1a" :
      level === "moderate" ? "#3b2e0a" : "#0f2a1a",
    color:
      level === "high"     ? "var(--color-danger)" :
      level === "moderate" ? "var(--color-warning)" : "var(--color-success)",
  }),
  section: { marginTop: 36 },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16 },
};

function PatientCard({ patient, onClick }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getTrendSummary(patient.id)
      .then((r) => setSummary(r.data))
      .catch(() => {});
  }, [patient.id]);

  const level = summary?.latest_score?.risk_level ?? "low";

  return (
    <div
      style={s.card}
      onClick={onClick}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
    >
      <div style={s.name}>{patient.name}</div>
      <div style={s.meta}>Age {patient.age} · Last active: {patient.lastSeen}</div>
      <span style={s.badge(level)}>
        {level.charAt(0).toUpperCase() + level.slice(1)} Risk
      </span>
      {summary && (
        <div style={{ marginTop: 12, fontSize: 13, color: "var(--color-muted)" }}>
          7-day avg score:{" "}
          <strong style={{ color: "var(--color-text)" }}>
            {(summary.week_avg_score * 100).toFixed(1)}%
          </strong>
          {" · "}
          Trend:{" "}
          <strong style={{ color: "var(--color-text)" }}>
            {summary.trend_direction?.replace("_", " ")}
          </strong>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const userName  = localStorage.getItem("user_name") || "Clinician";
  const { alerts, unreadCount, dismissAlert, dismissAll } = useAlerts("user-001");

  return (
    <div>
      <div style={s.header}>
        <div>
          <h1 style={s.h1}>Welcome, {userName} 👋</h1>
          <p style={{ color: "var(--color-muted)", marginTop: 4, fontSize: 14 }}>
            DeepSense-MH · Patient Overview
          </p>
        </div>
        {unreadCount > 0 && (
          <div style={{
            background: "var(--color-danger)",
            color: "#fff",
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 13,
            fontWeight: 600,
          }}>
            {unreadCount} unread alert{unreadCount > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Patient Cards */}
      <div style={s.grid}>
        {DEMO_PATIENTS.map((p) => (
          <PatientCard
            key={p.id}
            patient={p}
            onClick={() => navigate(`/patient/${p.id}`)}
          />
        ))}
      </div>

      {/* Alert Feed */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Recent Alerts</div>
        <DepressionAlertFeed
          alerts={alerts}
          onDismiss={dismissAlert}
          onDismissAll={dismissAll}
        />
      </div>
    </div>
  );
}