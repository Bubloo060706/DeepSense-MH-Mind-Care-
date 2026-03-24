import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function PHQ9Comparison({ data = [] }) {

  const chartData = data.map((d) => ({
    date:      d.date,
    phq:       d.phq_score,
    risk:      d.avg_risk_score != null
                 ? parseFloat((d.avg_risk_score * 100).toFixed(1))
                 : null,
    severity:  d.phq_severity,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={tooltipStyle}>
        <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#718096" }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ margin: "2px 0", fontSize: "13px", color: p.color, fontWeight: "500" }}>
            {p.name}: {p.value}{p.name === "Risk %" ? "%" : ""}
          </p>
        ))}
      </div>
    );
  };

  if (!chartData.length) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>No PHQ-9 correlation data yet</p>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey  = "date"
            tick     = {{ fontSize: 11, fill: "#a0aec0" }}
            tickLine = {false}
            interval = "preserveStartEnd"
          />
          {/* Left axis — PHQ-9 score 0–27 */}
          <YAxis
            yAxisId  = "phq"
            domain   = {[0, 27]}
            tick     = {{ fontSize: 11, fill: "#a0aec0" }}
            tickLine = {false}
            label    = {{
              value:    "PHQ-9",
              angle:    -90,
              position: "insideLeft",
              fontSize: 10,
              fill:     "#a0aec0",
              dx:       12,
            }}
          />
          {/* Right axis — Risk % 0–100 */}
          <YAxis
            yAxisId     = "risk"
            orientation = "right"
            domain      = {[0, 100]}
            tick        = {{ fontSize: 11, fill: "#a0aec0" }}
            tickLine    = {false}
            unit        = "%"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
          />
          <Bar
            yAxisId   = "phq"
            dataKey   = "phq"
            name      = "PHQ-9"
            fill      = "#bee3f8"
            stroke    = "#3182ce"
            strokeWidth = {1}
            radius    = {[4, 4, 0, 0]}
            maxBarSize = {32}
          />
          <Line
            yAxisId     = "risk"
            type        = "monotone"
            dataKey     = "risk"
            name        = "Risk %"
            stroke      = "#e53e3e"
            strokeWidth = {2.5}
            dot         = {{ r: 4, fill: "#e53e3e" }}
            activeDot   = {{ r: 6 }}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Severity legend */}
      <div style={styles.severityRow}>
        {[
          { label: "Minimal",   color: "#c6f6d5" },
          { label: "Mild",      color: "#fefcbf" },
          { label: "Moderate",  color: "#fbd38d" },
          { label: "Severe",    color: "#fed7d7" },
        ].map((s) => (
          <span key={s.label} style={{ ...styles.severityPill, backgroundColor: s.color }}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const tooltipStyle = {
  background:   "#fff",
  border:       "1px solid #e2e8f0",
  borderRadius: "8px",
  padding:      "8px 12px",
};

const styles = {
  empty: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    height:         "200px",
  },
  emptyText: { fontSize: "14px", color: "#a0aec0" },
  severityRow: {
    display:    "flex",
    gap:        "8px",
    marginTop:  "12px",
    flexWrap:   "wrap",
  },
  severityPill: {
    padding:      "3px 10px",
    borderRadius: "12px",
    fontSize:     "11px",
    fontWeight:   "500",
    color:        "#2d3748",
  },
};