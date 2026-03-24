import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from "recharts";

export default function RiskScoreTimeline({ scores = [], weeklyTrend = [] }) {

  // Format daily scores for chart
  const dailyData = scores
    .slice()
    .reverse()
    .map((s) => ({
      date:  s.window_end.slice(0, 10),
      score: parseFloat((s.score * 100).toFixed(1)),
      severity: s.severity,
    }));

  // Format weekly trend
  const weeklyData = weeklyTrend
    .filter((w) => w.avg_score != null)
    .map((w) => ({
      date:  w.week_start,
      score: parseFloat((w.avg_score * 100).toFixed(1)),
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    const color =
      val >= 65 ? "#e53e3e" :
      val >= 30 ? "#dd6b20" : "#38a169";

    return (
      <div style={tooltipStyle}>
        <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#718096" }}>{label}</p>
        <p style={{ margin: 0, fontWeight: "600", color }}>
          Risk: {val}%
        </p>
      </div>
    );
  };

  if (!dailyData.length) {
    return <EmptyState message="No risk score data available" />;
  }

  return (
    <div>
      {/* Daily scores */}
      <p style={styles.chartLabel}>Daily Risk Scores</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={dailyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey  = "date"
            tick     = {{ fontSize: 11, fill: "#a0aec0" }}
            tickLine = {false}
            interval = "preserveStartEnd"
          />
          <YAxis
            domain   = {[0, 100]}
            tick     = {{ fontSize: 11, fill: "#a0aec0" }}
            tickLine = {false}
            unit     = "%"
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={65} stroke="#e53e3e" strokeDasharray="4 2" label={{ value: "High", fontSize: 10, fill: "#e53e3e" }} />
          <ReferenceLine y={30} stroke="#dd6b20" strokeDasharray="4 2" label={{ value: "Mod",  fontSize: 10, fill: "#dd6b20" }} />
          <Line
            type            = "monotone"
            dataKey         = "score"
            stroke          = "#4c51bf"
            strokeWidth     = {2}
            dot             = {{ r: 3, fill: "#4c51bf" }}
            activeDot       = {{ r: 5 }}
            name            = "Risk Score"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Weekly trend */}
      {weeklyData.length > 0 && (
        <>
          <p style={{ ...styles.chartLabel, marginTop: "20px" }}>Weekly Average Trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey  = "date"
                tick     = {{ fontSize: 11, fill: "#a0aec0" }}
                tickLine = {false}
                interval = "preserveStartEnd"
              />
              <YAxis
                domain   = {[0, 100]}
                tick     = {{ fontSize: 11, fill: "#a0aec0" }}
                tickLine = {false}
                unit     = "%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type        = "monotone"
                dataKey     = "score"
                stroke      = "#805ad5"
                strokeWidth = {2.5}
                dot         = {{ r: 4, fill: "#805ad5" }}
                name        = "Weekly Avg"
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={styles.empty}>
      <p style={styles.emptyText}>{message}</p>
    </div>
  );
}

const tooltipStyle = {
  background:   "#fff",
  border:       "1px solid #e2e8f0",
  borderRadius: "8px",
  padding:      "8px 12px",
  fontSize:     "13px",
};

const styles = {
  chartLabel: {
    fontSize:     "12px",
    fontWeight:   "600",
    color:        "#718096",
    margin:       "0 0 8px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  empty: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    height:         "160px",
  },
  emptyText: {
    fontSize: "14px",
    color:    "#a0aec0",
  },
};