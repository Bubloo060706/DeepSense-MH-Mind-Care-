import { format, parseISO } from "date-fns";

const FEATURE_LABELS = {
  step_count:             { label: "Steps",               unit: "steps", icon: "🚶" },
  sedentary_minutes:      { label: "Sedentary",           unit: "min",   icon: "🪑" },
  sleep_duration_hours:   { label: "Sleep Duration",      unit: "hrs",   icon: "😴" },
  sleep_midpoint_hour:    { label: "Sleep Midpoint",      unit: "h",     icon: "🌙" },
  sleep_disruptions:      { label: "Sleep Disruptions",   unit: "",      icon: "⚡" },
  radius_of_gyration:     { label: "Radius of Gyration",  unit: "km",    icon: "📍" },
  home_stay_pct:          { label: "Home Stay",           unit: "%",     icon: "🏠" },
  location_entropy:       { label: "Location Entropy",    unit: "",      icon: "🗺️" },
  circadian_rhythm_index: { label: "Circadian Index",     unit: "",      icon: "🕐" },
  screen_unlocks:         { label: "Screen Unlocks",      unit: "",      icon: "📱" },
  call_frequency:         { label: "Call Frequency",      unit: "/day",  icon: "📞" },
  ambient_light_mean:     { label: "Ambient Light",       unit: "lux",   icon: "💡" },
};

const s = {
  list: { display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" },
  item: {
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: 8,
    padding: "12px 14px",
  },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  time: { fontSize: 12, color: "var(--color-muted)" },
  score: (level) => ({
    fontSize: 12,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 12,
    background:
      level === "high"     ? "#3b1a1a" :
      level === "moderate" ? "#3b2e0a" : "#0f2a1a",
    color:
      level === "high"     ? "var(--color-danger)" :
      level === "moderate" ? "var(--color-warning)" : "var(--color-success)",
  }),
  features: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  feat: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 6,
    padding: "3px 8px",
    fontSize: 11,
    color: "var(--color-muted)",
  },
  empty: { color: "var(--color-muted)", textAlign: "center", padding: 32 },
};

function formatTime(iso) {
  try { return format(parseISO(iso), "MMM d, HH:mm"); }
  catch { return iso; }
}

function FeatureChips({ features }) {
  if (!features || !Object.keys(features).length) return null;
  return (
    <div style={s.features}>
      {Object.entries(features).map(([key, val]) => {
        const meta = FEATURE_LABELS[key];
        if (!meta) return null;
        return (
          <span key={key} style={s.feat} title={meta.label}>
            {meta.icon} {typeof val === "number" ? val.toFixed(1) : val}{meta.unit}
          </span>
        );
      })}
    </div>
  );
}

export default function SensorActivityLog({ scores = [] }) {
  if (!scores.length) {
    return <div style={s.empty}>No sensor readings recorded yet.</div>;
  }

  return (
    <div style={s.list}>
      {scores.map((s_item) => (
        <div key={s_item.id} style={s.item}>
          <div style={s.row}>
            <span style={s.time}>{formatTime(s_item.recorded_at)}</span>
            <span style={s.score(s_item.risk_level)}>
              {s_item.risk_level.charAt(0).toUpperCase() + s_item.risk_level.slice(1)}{" "}
              · {(s_item.score * 100).toFixed(1)}%
            </span>
          </div>
          <FeatureChips features={s_item.features} />
        </div>
      ))}
    </div>
  );
}