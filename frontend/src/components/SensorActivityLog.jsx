import { useMemo } from "react";

const SENSOR_ICONS = {
  gps:         "📍",
  accelerometer: "📱",
  screen:      "🖥️",
  bluetooth:   "🔵",
  call:        "📞",
  sleep:       "🌙",
};

export default function SensorActivityLog({ scores = [] }) {

  // Derive pseudo sensor activity from risk score windows
  const logs = useMemo(() => {
    return scores.slice(0, 15).map((s) => {
      const date     = new Date(s.window_end);
      const severity = s.severity;

      // Simulate which sensors were most active based on score
      const activeSensors = ["gps", "accelerometer", "screen"];
      if (s.score > 0.4) activeSensors.push("call");
      if (s.score > 0.6) activeSensors.push("bluetooth");
      if (date.getHours() < 6 || date.getHours() > 22) activeSensors.push("sleep");

      return {
        id:            s.id,
        time:          date.toLocaleDateString("en-IN", {
                         day: "numeric", month: "short",
                         hour: "2-digit", minute: "2-digit"
                       }),
        score:         s.score,
        severity,
        activeSensors,
      };
    });
  }, [scores]);

  const severityStyle = (severity) => {
    switch (severity) {
      case "high":     return { color: "#e53e3e", bg: "#fff5f5" };
      case "moderate": return { color: "#dd6b20", bg: "#fffaf0" };
      default:         return { color: "#38a169", bg: "#f0fff4" };
    }
  };

  if (!logs.length) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>No sensor activity recorded</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.list}>
        {logs.map((log) => {
          const sStyle = severityStyle(log.severity);
          return (
            <div key={log.id} style={styles.logRow}>

              {/* Time + score */}
              <div style={styles.leftCol}>
                <p style={styles.logTime}>{log.time}</p>
                <span
                  style={{
                    ...styles.scorePill,
                    backgroundColor: sStyle.bg,
                    color:           sStyle.color,
                  }}
                >
                  {(log.score * 100).toFixed(0)}%
                </span>
              </div>

              {/* Active sensors */}
              <div style={styles.sensorIcons}>
                {log.activeSensors.map((sensor) => (
                  <span
                    key   = {sensor}
                    title = {sensor.charAt(0).toUpperCase() + sensor.slice(1)}
                    style = {styles.sensorIcon}
                  >
                    {SENSOR_ICONS[sensor]}
                  </span>
                ))}
              </div>

              {/* Severity label */}
              <span style={{ ...styles.severityTag, color: sStyle.color }}>
                {log.severity}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sensor key */}
      <div style={styles.sensorKey}>
        {Object.entries(SENSOR_ICONS).map(([name, icon]) => (
          <span key={name} style={styles.keyItem}>
            {icon} {name}
          </span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: { overflow: "hidden" },
  list: {
    display:       "flex",
    flexDirection: "column",
    gap:           "6px",
    maxHeight:     "300px",
    overflowY:     "auto",
  },
  logRow: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "space-between",
    padding:        "8px 10px",
    borderRadius:   "8px",
    backgroundColor: "#f7fafc",
    gap:            "10px",
  },
  leftCol: {
    display:    "flex",
    alignItems: "center",
    gap:        "8px",
    minWidth:   "140px",
  },
  logTime: {
    fontSize: "11px",
    color:    "#718096",
    margin:   0,
  },
  scorePill: {
    padding:      "2px 7px",
    borderRadius: "10px",
    fontSize:     "11px",
    fontWeight:   "600",
  },
  sensorIcons: {
    display:  "flex",
    gap:      "4px",
    flex:     1,
    flexWrap: "wrap",
  },
  sensorIcon: {
    fontSize: "14px",
    cursor:   "default",
  },
  severityTag: {
    fontSize:      "11px",
    fontWeight:    "600",
    textTransform: "capitalize",
    minWidth:      "60px",
    textAlign:     "right",
  },
  sensorKey: {
    display:   "flex",
    flexWrap:  "wrap",
    gap:       "10px",
    marginTop: "12px",
    padding:   "8px 0 0",
    borderTop: "1px solid #f0f0f0",
  },
  keyItem: {
    fontSize: "11px",
    color:    "#a0aec0",
  },
  empty: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    height:         "120px",
  },
  emptyText: { fontSize: "14px", color: "#a0aec0" },
};