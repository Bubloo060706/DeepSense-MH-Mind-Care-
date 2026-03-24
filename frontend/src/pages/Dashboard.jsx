import { useEffect, useState } from "react";
import { useNavigate }         from "react-router-dom";
import { useRiskScores }       from "../hooks/useRiskScores";
import { useAlerts }           from "../hooks/useAlerts";
import RiskScoreTimeline       from "../components/RiskScoreTimeline";
import BehavioralHeatmap       from "../components/BehavioralHeatmap";
import DepressionAlertFeed     from "../components/DepressionAlertFeed";
import PHQ9Comparison          from "../components/PHQ9Comparison";
import SensorActivityLog       from "../components/SensorActivityLog";
import Navbar                  from "../components/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const userId   = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) navigate("/login");
  }, [userId, navigate]);

  const {
    scores, latestScore, weeklyTrend,
    phqCorr, featureSummary,
    loading: scoresLoading,
    error:   scoresError,
    refetch: refetchScores,
    severityColor,
  } = useRiskScores(userId);

  const {
    alerts, unreadCount,
    loading: alertsLoading,
    handleMarkRead,
    handleMarkAllRead,
    severityColor: alertColor,
  } = useAlerts(userId);

  if (scoresLoading) {
    return (
      <div style={styles.center}>
        <p style={styles.loadingText}>Loading dashboard...</p>
      </div>
    );
  }

  if (scoresError) {
    return (
      <div style={styles.center}>
        <p style={styles.errorText}>{scoresError}</p>
        <button onClick={refetchScores} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar unreadCount={unreadCount} />

      {/* Summary Cards */}
      <div style={styles.summaryRow}>
        <SummaryCard
          label  = "Latest Risk Score"
          value  = {latestScore ? `${(latestScore.score * 100).toFixed(0)}%` : "—"}
          sub    = {latestScore?.severity?.toUpperCase() || "NO DATA"}
          color  = {severityColor(latestScore?.score)}
        />
        <SummaryCard
          label = "7-Day Trend"
          value = {featureSummary?.trend || "—"}
          sub   = {`${featureSummary?.num_windows || 0} windows`}
          color = "#4c51bf"
        />
        <SummaryCard
          label = "Unread Alerts"
          value = {unreadCount}
          sub   = "active notifications"
          color = {unreadCount > 0 ? "#e53e3e" : "#38a169"}
        />
        <SummaryCard
          label = "Avg Risk (7d)"
          value = {
            featureSummary?.avg_risk_score != null
              ? `${(featureSummary.avg_risk_score * 100).toFixed(0)}%`
              : "—"
          }
          sub   = "rolling average"
          color = {severityColor(featureSummary?.avg_risk_score)}
        />
      </div>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h2 style={styles.cardTitle}>Risk Score Timeline</h2>
          <RiskScoreTimeline scores={scores} weeklyTrend={weeklyTrend} />
        </div>
        <div style={styles.chartCard}>
          <h2 style={styles.cardTitle}>PHQ-9 vs Risk Score</h2>
          <PHQ9Comparison data={phqCorr} />
        </div>
      </div>

      {/* Bottom Row */}
      <div style={styles.bottomRow}>
        <div style={{ ...styles.chartCard, flex: 1 }}>
          <h2 style={styles.cardTitle}>Behavioral Heatmap</h2>
          <BehavioralHeatmap scores={scores} />
        </div>
        <div style={{ ...styles.chartCard, flex: 1 }}>
          <h2 style={styles.cardTitle}>
            Alert Feed
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
          </h2>
          <DepressionAlertFeed
            alerts            = {alerts}
            loading           = {alertsLoading}
            onMarkRead        = {handleMarkRead}
            onMarkAllRead     = {handleMarkAllRead}
            severityColor     = {alertColor}
          />
        </div>
        <div style={{ ...styles.chartCard, flex: 1 }}>
          <h2 style={styles.cardTitle}>Sensor Activity Log</h2>
          <SensorActivityLog scores={scores} />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div style={styles.summaryCard}>
      <p style={styles.summaryLabel}>{label}</p>
      <p style={{ ...styles.summaryValue, color }}>{value}</p>
      <p style={styles.summarySub}>{sub}</p>
    </div>
  );
}

const styles = {
  page: {
    minHeight:       "100vh",
    backgroundColor: "#f7fafc",
    padding:         "0 0 40px",
  },
  center: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    minHeight:      "100vh",
  },
  loadingText: { fontSize: "16px", color: "#718096" },
  errorText:   { fontSize: "16px", color: "#e53e3e" },
  retryBtn: {
    marginTop:    "12px",
    padding:      "8px 20px",
    background:   "#4c51bf",
    color:        "#fff",
    border:       "none",
    borderRadius: "8px",
    cursor:       "pointer",
  },
  summaryRow: {
    display:       "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap:           "16px",
    padding:       "24px 32px 0",
  },
  summaryCard: {
    background:   "#ffffff",
    borderRadius: "12px",
    padding:      "20px",
    boxShadow:    "0 1px 8px rgba(0,0,0,0.06)",
  },
  summaryLabel: { fontSize: "13px", color: "#718096", margin: "0 0 6px" },
  summaryValue: { fontSize: "28px", fontWeight: "700", margin: "0 0 4px" },
  summarySub:   { fontSize: "12px", color: "#a0aec0", margin: 0 },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:     "16px",
    padding: "16px 32px 0",
  },
  bottomRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap:     "16px",
    padding: "16px 32px 0",
  },
  chartCard: {
    background:   "#ffffff",
    borderRadius: "12px",
    padding:      "20px",
    boxShadow:    "0 1px 8px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize:     "15px",
    fontWeight:   "600",
    color:        "#2d3748",
    margin:       "0 0 16px",
    display:      "flex",
    alignItems:   "center",
    gap:          "8px",
  },
  badge: {
    backgroundColor: "#e53e3e",
    color:           "#fff",
    borderRadius:    "12px",
    padding:         "2px 8px",
    fontSize:        "12px",
    fontWeight:      "600",
  },
};