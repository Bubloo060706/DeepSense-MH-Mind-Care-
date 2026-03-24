import { useMemo } from "react";

const HOURS  = Array.from({ length: 24 }, (_, i) => `${i}:00`);
const DAYS   = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function BehavioralHeatmap({ scores = [] }) {

  // Build a 7×24 grid of average risk scores
  const grid = useMemo(() => {
    const matrix = Array.from({ length: 7 }, () => Array(24).fill(null));
    const counts = Array.from({ length: 7 }, () => Array(24).fill(0));

    scores.forEach((s) => {
      const d    = new Date(s.window_end);
      const day  = (d.getDay() + 6) % 7;  // Mon=0 … Sun=6
      const hour = d.getHours();

      if (matrix[day][hour] === null) matrix[day][hour] = 0;
      matrix[day][hour] += s.score;
      counts[day][hour] += 1;
    });

    return matrix.map((row, di) =>
      row.map((val, hi) =>
        counts[di][hi] > 0 ? val / counts[di][hi] : null
      )
    );
  }, [scores]);

  const cellColor = (val) => {
    if (val === null) return "#f7fafc";
    if (val >= 0.65)  return "#fc8181";  // high
    if (val >= 0.30)  return "#f6ad55";  // moderate
    return "#68d391";                     // low
  };

  const cellOpacity = (val) => {
    if (val === null) return 0.2;
    return 0.4 + val * 0.6;
  };

  if (!scores.length) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>No data for heatmap</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* Hour labels */}
      <div style={styles.headerRow}>
        <div style={styles.dayLabelSpacer} />
        {HOURS.filter((_, i) => i % 4 === 0).map((h) => (
          <div key={h} style={styles.hourLabel}>{h}</div>
        ))}
      </div>

      {/* Grid rows */}
      {DAYS.map((day, di) => (
        <div key={day} style={styles.row}>
          <div style={styles.dayLabel}>{day}</div>
          <div style={styles.cellRow}>
            {grid[di].map((val, hi) => (
              <div
                key     = {hi}
                title   = {val != null ? `${day} ${HOURS[hi]} — Risk: ${(val * 100).toFixed(0)}%` : "No data"}
                style   = {{
                  ...styles.cell,
                  backgroundColor: cellColor(val),
                  opacity:         cellOpacity(val),
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div style={styles.legend}>
        {[
          { color: "#68d391", label: "Low (<30%)"  },
          { color: "#f6ad55", label: "Mod (30–65%)" },
          { color: "#fc8181", label: "High (>65%)"  },
          { color: "#f7fafc", label: "No data"      },
        ].map((l) => (
          <div key={l.label} style={styles.legendItem}>
            <div style={{ ...styles.legendDot, backgroundColor: l.color }} />
            <span style={styles.legendText}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper:  { overflowX: "auto" },
  headerRow: {
    display:    "flex",
    alignItems: "center",
    marginBottom: "2px",
  },
  dayLabelSpacer: { width: "36px", flexShrink: 0 },
  hourLabel: {
    flex:      1,
    fontSize:  "10px",
    color:     "#a0aec0",
    textAlign: "center",
  },
  row: {
    display:    "flex",
    alignItems: "center",
    marginBottom: "2px",
  },
  dayLabel: {
    width:      "36px",
    flexShrink: 0,
    fontSize:   "11px",
    color:      "#718096",
    fontWeight: "500",
  },
  cellRow: {
    display: "flex",
    flex:    1,
    gap:     "1px",
  },
  cell: {
    flex:         1,
    height:       "20px",
    borderRadius: "2px",
    cursor:       "default",
    transition:   "opacity 0.15s",
    minWidth:     "8px",
  },
  legend: {
    display:   "flex",
    gap:       "16px",
    marginTop: "12px",
    flexWrap:  "wrap",
  },
  legendItem: {
    display:    "flex",
    alignItems: "center",
    gap:        "5px",
  },
  legendDot: {
    width:        "10px",
    height:       "10px",
    borderRadius: "2px",
  },
  legendText: {
    fontSize: "11px",
    color:    "#718096",
  },
  empty: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    height:         "120px",
  },
  emptyText: { fontSize: "14px", color: "#a0aec0" },
};