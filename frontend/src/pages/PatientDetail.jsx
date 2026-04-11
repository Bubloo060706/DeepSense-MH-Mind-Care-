import { useParams, useNavigate } from "react-router-dom";
import { useRiskScores } from "../hooks/useRiskScores";
import { useAlerts } from "../hooks/useAlerts";
import RiskScoreTimeline from "../components/RiskScoreTimeline";
import BehavioralHeatmap from "../components/BehavioralHeatmap";
import SensorActivityLog from "../components/SensorActivityLog";
import PHQ9Comparison from "../components/PHQ9Comparison";
import DepressionAlertFeed from "../components/DepressionAlertFeed";

const s = {
  backBtn: {
    background: "none",
    color: "var(--color-muted)",
    fontSize: 14,
    marginBottom: 20,
    padding: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  header: { marginBottom: 28 },
  h1: { fontSize: 22, fontWeight: 700 },
  meta: { color: "var(--color-muted)", fontSize: 14, marginTop: 4 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  card: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius)",
    padding: 20,
  },
  cardTitle: { fontWeight: 600, marginBottom: 16, fontSize: 15 },
  statRow: { display: "flex", gap: 16, marginBottom: 20 },
  statCard: (color) => ({
    flex: 1,
    background: "var(--color-surface)",
    border: `1px solid ${color}33`,
    borderRadius: "var(--radius)",
    padding: "16px 20px",
  }),
  statLabel: { fontSize: 12, color: "var(--color-muted)", marginBottom: 4 },
  statValue: (color) => ({ fontSize: 26, fontWeight: 700, color }),
  loading: { color: "var(--color-muted)", padding: 40, textAlign: "center" },
  error:   { color: "var(--color-danger)", padding: 40, textAlign: "center" },
};

const PATIENT_NAMES = {
  "user-001": "Aravind Kumar",
  "user-002": "Priya Nair",
  "user-003": "Rajan Mehta",
  "user-004": "Sneha Pillai",
};

function StatCard({ label, value, color }) {
  return (
    <div style={s.statCard(color)}>
      <div style={s.statLabel}>{label}</div>
      <div style={s.statValue(color)}>{value}</div>
    </div>
  );
}

export default function PatientDetail() {
  const { userId } = useParams();
  const navigate   = useNavigate();
  const name       = PATIENT_NAMES[userId] || "Patient";

  const { scores, latestScore, trends, loading, error } = useRiskScores(userId, {
    limit: 30,
    days: 30,
    autoRefresh: true,
  });

  const { alerts, dismissAlert, dismissAll } = useAlerts(userId);

  if (loading) return <div style={s.loading}>Loading patient data…</div>;
  if (error)   return <div style={s.error}>{error}</div>;

  const riskLevel = latestScore?.risk_level ?? "—";
  const scoreVal  = latestScore ? `${(latestScore.score * 100).toFixed(1)}%` : "—";
  const trendDir  = trends?.trend_direction?.replace(/_/g, " ") ?? "—";
  const avgScore  = trends ? `${(trends.overall_avg_score * 100).toFixed(1)}%` : "—";

  return (
    <div>
      <button style={s.backBtn} onClick={() => navigate("/")}>
        ← Back to Dashboard
      </button>

      <div style={s.header}>
        <h1 style={s.h1}>{name}</h1>
        <p style={s.meta}>Patient ID: {userId} · 30-day analysis</p>
      </div>

      {/* Stat row */}
      <div style={s.statRow}>
        <StatCard label="Latest Risk Score" value={scoreVal}  color="var(--color-primary)" />
        <StatCard label="Risk Level"         value={riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
          color={riskLevel === "high" ? "var(--color-danger)" : riskLevel === "moderate" ? "var(--color-warning)" : "var(--color-success)"}
        />
        <StatCard label="30-day Avg Score"  value={avgScore}  color="var(--color-warning)" />
        <StatCard label="Trend"             value={trendDir.charAt(0).toUpperCase() + trendDir.slice(1)}  color="var(--color-muted)" />
      </div>

      {/* Timeline full width */}
      <div style={{ ...s.card, marginBottom: 20 }}>
        <div style={s.cardTitle}>Risk Score Timeline</div>
        <RiskScoreTimeline scores={scores} />
      </div>

      {/* Heatmap + PHQ side by side */}
      <div style={s.grid2}>
        <div style={s.card}>
          <div style={s.cardTitle}>Behavioural Heatmap</div>
          <BehavioralHeatmap scores={scores} />
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>PHQ-9 vs Risk Score</div>
          <PHQ9Comparison userId={userId} riskScores={scores} />
        </div>
      </div>

      {/* Activity log + Alerts side by side */}
      <div style={s.grid2}>
        <div style={s.card}>
          <div style={s.cardTitle}>Sensor Activity Log</div>
          <SensorActivityLog scores={scores} />
        </div>
        <div style={s.card}>
          <div style={s.cardTitle}>Alerts</div>
          <DepressionAlertFeed
            alerts={alerts}
            onDismiss={dismissAlert}
            onDismissAll={dismissAll}
          />
        </div>
      </div>
    </div>
  );
}