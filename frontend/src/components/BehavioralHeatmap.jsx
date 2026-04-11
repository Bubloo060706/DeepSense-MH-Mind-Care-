import { useMemo } from "react";
import { format, parseISO, startOfWeek, addDays, differenceInCalendarDays } from "date-fns";

const DAYS  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function riskToColor(score) {
  if (score === null) return "#1a1d27";
  if (score >= 0.7)   return "#7f1d1d";
  if (score >= 0.5)   return "#78350f";
  if (score >= 0.3)   return "#14532d";
  return "#0f2a1a";
}

function riskToBorder(score) {
  if (score === null) return "transparent";
  if (score >= 0.7)   return "#ef4444";
  if (score >= 0.5)   return "#f59e0b";
  if (score >= 0.3)   return "#22c55e";
  return "#16a34a";
}

const s = {
  wrapper: { overflowX: "auto" },
  table: { borderCollapse: "collapse", width: "100%", minWidth: 520 },
  thDay: {
    color: "var(--color-muted)",
    fontSize: 11,
    fontWeight: 600,
    textAlign: "left",
    paddingBottom: 8,
    width: 36,
  },
  thHour: {
    color: "var(--color-muted)",
    fontSize: 10,
    textAlign: "center",
    paddingBottom: 8,
    minWidth: 18,
  },
  cell: (score) => ({
    width: 18,
    height: 18,
    background: riskToColor(score),
    border: `1px solid ${riskToBorder(score)}`,
    borderRadius: 3,
    cursor: score !== null ? "pointer" : "default",
    position: "relative",
  }),
  legend: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    fontSize: 11,
    color: "var(--color-muted)",
  },
  legendDot: (color) => ({
    width: 12, height: 12, borderRadius: 2,
    background: color, display: "inline-block",
  }),
};

export default function BehavioralHeatmap({ scores = [] }) {
  // Build a map: "dayOfWeek-hour" → avg score
  const heatmap = useMemo(() => {
    const buckets = {};
    scores.forEach(({ score, recorded_at }) => {
      try {
        const dt  = parseISO(recorded_at);
        const dow = dt.getDay();
        const hr  = dt.getHours();
        const key = `${dow}-${hr}`;
        if (!buckets[key]) buckets[key] = { sum: 0, count: 0 };
        buckets[key].sum   += score;
        buckets[key].count += 1;
      } catch { /* skip malformed */ }
    });
    const result = {};
    Object.entries(buckets).forEach(([k, v]) => {
      result[k] = v.sum / v.count;
    });
    return result;
  }, [scores]);

  if (!scores.length) {
    return (
      <div style={{ color: "var(--color-muted)", textAlign: "center", padding: 32 }}>
        No behavioural data available.
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.thDay} />
            {HOURS.map((h) => (
              <th key={h} style={s.thHour}>
                {h % 6 === 0 ? `${h}h` : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day, dow) => (
            <tr key={day}>
              <td style={{ ...s.thDay, paddingBottom: 0, paddingTop: 2 }}>{day}</td>
              {HOURS.map((hr) => {
                const score = heatmap[`${dow}-${hr}`] ?? null;
                return (
                  <td key={hr}>
                    <div
                      style={s.cell(score)}
                      title={score !== null ? `${day} ${hr}:00 — Risk: ${(score * 100).toFixed(1)}%` : "No data"}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={s.legend}>
        <span><span style={s.legendDot("#0f2a1a")} /> Low</span>
        <span><span style={s.legendDot("#14532d")} /> Moderate-low</span>
        <span><span style={s.legendDot("#78350f")} /> Moderate-high</span>
        <span><span style={s.legendDot("#7f1d1d")} /> High</span>
        <span><span style={s.legendDot("#1a1d27")} /> No data</span>
      </div>
    </div>
  );
}