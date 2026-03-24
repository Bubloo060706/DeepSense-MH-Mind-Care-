import { useParams, useNavigate } from "react-router-dom";
import { useRiskScores }          from "../hooks/useRiskScores";
import { useAlerts }              from "../hooks/useAlerts";
import { submitPhq }              from "../api/apiClient";
import { useState }               from "react";
import RiskScoreTimeline          from "../components/RiskScoreTimeline";
import PHQ9Comparison             from "../components/PHQ9Comparison";
import DepressionAlertFeed        from "../components/DepressionAlertFeed";
import Navbar                     from "../components/Navbar";

export default function PatientDetail() {
  const { userId }  = useParams();
  const navigate    = useNavigate();
  const [phqScore,  setPhqScore]  = useState("");
  const [phqStatus, setPhqStatus] = useState(null);

  const {
    scores, latestScore, weeklyTrend,
    phqCorr, featureSummary,
    loading, error, refetch,
    severityColor,
  } = useRiskScores(userId);

  const {
    alerts, unreadCount,
    handleMarkRead, handleMarkAllRead,
    severityColor: alertColor,
  } = useAlerts(userId);

  const handlePhqSubmit = async () => {
    const score = parseInt(phqScore);
    if (isNaN(score) || score < 0 || score > 27) {
      setPhqStatus({ type: "error", msg: "PHQ-9 score must be 0–27" });
      return;
    }
    try {
      await submitPhq(userId, score);
      setPhqStatus({ type: "success", msg: `PHQ-9 score ${score} submitted successfully` });
      setPhqScore("");
      refetch();
    } catch {
      setPhqStatus({ type: "error", msg: "Failed to submit PHQ-9 score" });
    }
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={styles.muted}>Loading patient data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#e53e3e" }}>{error}</p>
        <button onClick={refetch} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  const scoreColor = severityColor(latestScore?.score);

  return (
    <div style={styles.page}>
      <Navbar unreadCount={unreadCount} />

      <div style={styles.content}>

        {/* Back + Header */}
        <div style={styles.pageHeader}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            ← Back
          </button>
          <div>
            <h1 style={styles.pageTitle}>Patient: {userId}</h1>
            <p style={styles.pageSub}>Detailed behavioral monitoring view</p>
          </div>
        </div>

        {/* Summary row */}
        <div style={styles.summaryRow}>
          <InfoCard label="Latest Risk"    value={latestScore ? `${(latestScore.score * 100).toFixed(0)}%` : "—"} color={scoreColor} />
          <InfoCard label="Severity"       value={latestScore?.severity || "—"}   color={scoreColor} />
          <InfoCard label="7-Day Trend"    value={featureSummary?.trend || "—"}   color="#4c51bf"    />
          <InfoCard label="Windows (7d)"   value={featureSummary?.num_windows ?? "—"} color="#718096" />
          <InfoCard label="Unread Alerts"  value={unreadCount}                    color={unreadCount > 0 ? "#e53e3e" : "#38a169"} />
        </div>

        {/* PHQ-9 submission */}
        <div style={styles.phqCard}>
          <h2 style={styles.sectionTitle}>Submit Weekly PHQ-9</h2>
          <div style={styles.phqRow}>
            <input
              type        = "number"
              min         = {0}
              max         = {27}
              placeholder = "Score (0–27)"
              value       = {phqScore}
              onChange    = {(e) => setPhqScore(e.target.value)}
              style       = {styles.phqInput}
            />
            <button onClick={handlePhqSubmit} style={styles.phqBtn}>
              Submit PHQ-9
            </button>
          </div>
          {phqStatus && (
            <p style={{
              ...styles.phqStatus,
              color: phqStatus.type === "success" ? "#38a169" : "#e53e3e"
            }}>
              {phqStatus.msg}
            </p>
          )}
          <p style={styles.phqHint}>
            PHQ-9 severity: 0–4 Minimal · 5–9 Mild · 10–14 Moderate · 15–19 Mod. Severe · 20–27 Severe
          </p>
        </div>

        {/* Charts */}
        <div style={styles.chartsRow}>
          <div style={styles.chartCard}>
            <h2 style={styles.sectionTitle}>Risk Score Timeline</h2>
            <RiskScoreTimeline scores={scores} weeklyTrend={weeklyTrend} />
          </div>
          <div style={styles.chartCard}>
            <h2 style={styles.sectionTitle}>PHQ-9 vs Risk Correlation</h2>
            <PHQ9Comparison data={phqCorr} />
          </div>
        </div>

        {/* Alerts */}
        <div style={styles.alertCard}>
          <h2 style={styles.sectionTitle}>Alert History</h2>
          <DepressionAlertFeed
            alerts        = {alerts}
            onMarkRead    = {handleMarkRead}
            onMarkAllRead = {handleMarkAllRead}
            severityColor = {alertColor}
          />
        </div>

      </div>
    </div>
  );
}

function InfoCard({ label, value, color }) {
  return (
    <div style={styles.infoCard}>
      <p style={styles.infoLabel}>{label}</p>
      <p style={{ ...styles.infoValue, color }}>{value}</p>
    </div>
  );
}

const styles = {
  page:    { minHeight: "100vh", backgroundColor: "#f7fafc" },
  content: { padding: "24px 32px 48px" },
  center: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    minHeight:      "100vh",
  },
  muted:    { fontSize: "15px", color: "#718096" },
  retryBtn: {
    marginTop: "12px", padding: "8px 20px",
    background: "#4c51bf", color: "#fff",
    border: "none", borderRadius: "8px", cursor: "pointer",
  },
  pageHeader: {
    display:    "flex",
    alignItems: "center",
    gap:        "16px",
    marginBottom: "24px",
  },
  backBtn: {
    background: "none", border: "none",
    fontSize: "14px", color: "#4c51bf",
    cursor: "pointer", fontWeight: "500",
  },
  pageTitle: { fontSize: "20px", fontWeight: "700", color: "#1a202c", margin: 0 },
  pageSub:   { fontSize: "13px", color: "#718096", margin: "2px 0 0" },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "12px", marginBottom: "20px",
  },
  infoCard: {
    background: "#fff", borderRadius: "10px",
    padding: "14px 16px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
  },
  infoLabel: { fontSize: "12px", color: "#a0aec0", margin: "0 0 4px" },
  infoValue: { fontSize: "22px", fontWeight: "700", margin: 0 },
  phqCard: {
    background: "#fff", borderRadius: "12px",
    padding: "20px 24px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "15px", fontWeight: "600",
    color: "#2d3748", margin: "0 0 14px",
  },
  phqRow: { display: "flex", gap: "10px", alignItems: "center" },
  phqInput: {
    padding: "9px 14px", borderRadius: "8px",
    border: "1px solid #e2e8f0", fontSize: "15px",
    width: "160px", outline: "none",
  },
  phqBtn: {
    padding: "9px 20px", borderRadius: "8px",
    backgroundColor: "#4c51bf", color: "#fff",
    border: "none", fontSize: "14px",
    fontWeight: "600", cursor: "pointer",
  },
  phqStatus: { fontSize: "13px", margin: "8px 0 0", fontWeight: "500" },
  phqHint:   { fontSize: "11px", color: "#a0aec0", margin: "8px 0 0" },
  chartsRow: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: "16px", marginBottom: "20px",
  },
  chartCard: {
    background: "#fff", borderRadius: "12px",
    padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  },
  alertCard: {
    background: "#fff", borderRadius: "12px",
    padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
  },
};