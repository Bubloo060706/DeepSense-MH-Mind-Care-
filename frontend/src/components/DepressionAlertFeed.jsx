import { format, parseISO } from "date-fns";

const ALERT_META = {
  high_risk:      { icon: "🚨", label: "High Risk Detected" },
  sustained_risk: { icon: "⚠️", label: "Sustained Risk" },
  phq_spike:      { icon: "📋", label: "PHQ-9 Spike" },
};

const s = {
  wrapper: { display: "flex", flexDirection: "column", gap: 0 },
  toolbar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  clearBtn: {
    background: "none",
    color: "var(--color-muted)",
    fontSize: 12,
    padding: "4px 10px",
    border: "1px solid var(--color-border)",
    borderRadius: 6,
  },
  item: (severity, isRead) => ({
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "14px 16px",
    borderBottom: "1px solid var(--color-border)",
    background: isRead ? "transparent" : (
      severity === "critical" ? "rgba(239,68,68,0.05)" : "rgba(245,158,11,0.05)"
    ),
    transition: "background 0.2s",
  }),
  icon: { fontSize: 20, lineHeight: 1, marginTop: 2 },
  body: { flex: 1 },
  title: (severity, isRead) => ({
    fontWeight: isRead ? 400 : 600,
    fontSize: 14,
    color: isRead ? "var(--color-muted)" : (
      severity === "critical" ? "var(--color-danger)" : "var(--color-warning)"
    ),
    marginBottom: 3,
  }),
  message: { fontSize: 12, color: "var(--color-muted)", lineHeight: 1.5 },
  time: { fontSize: 11, color: "var(--color-muted)", marginTop: 5 },
  dismissBtn: {
    background: "none",
    color: "var(--color-muted)",
    fontSize: 18,
    lineHeight: 1,
    padding: "0 4px",
    alignSelf: "center",
  },
  empty: { color: "var(--color-muted)", textAlign: "center", padding: 32, fontSize: 14 },
};

function formatTime(iso) {
  try { return format(parseISO(iso), "MMM d, HH:mm"); }
  catch { return iso; }
}

export default function DepressionAlertFeed({ alerts = [], onDismiss, onDismissAll }) {
  const unread = alerts.filter((a) => !a.is_read).length;

  if (!alerts.length) {
    return <div style={s.empty}>✅ No alerts — all clear.</div>;
  }

  return (
    <div style={s.wrapper}>
      {unread > 0 && onDismissAll && (
        <div style={s.toolbar}>
          <button style={s.clearBtn} onClick={onDismissAll}>
            Mark all read
          </button>
        </div>
      )}

      {alerts.map((alert) => {
        const meta    = ALERT_META[alert.alert_type] ?? { icon: "ℹ️", label: alert.alert_type };
        const isRead  = !!alert.is_read;

        return (
          <div key={alert.id} style={s.item(alert.severity, isRead)}>
            <div style={s.icon}>{meta.icon}</div>
            <div style={s.body}>
              <div style={s.title(alert.severity, isRead)}>{meta.label}</div>
              <div style={s.message}>{alert.message}</div>
              <div style={s.time}>{formatTime(alert.created_at)}</div>
            </div>
            {!isRead && onDismiss && (
              <button
                style={s.dismissBtn}
                onClick={() => onDismiss(alert.id)}
                title="Mark as read"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}