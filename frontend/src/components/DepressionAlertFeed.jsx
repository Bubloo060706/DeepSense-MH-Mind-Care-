export default function DepressionAlertFeed({
  alerts        = [],
  loading       = false,
  onMarkRead,
  onMarkAllRead,
  severityColor,
}) {

  if (loading) {
    return (
      <div style={styles.center}>
        <p style={styles.muted}>Loading alerts...</p>
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div style={styles.center}>
        <p style={styles.muted}>No alerts at this time ✓</p>
      </div>
    );
  }

  const unread = alerts.filter((a) => !a.is_read).length;

  return (
    <div>
      {/* Mark all read */}
      {unread > 0 && (
        <div style={styles.topBar}>
          <span style={styles.unreadCount}>{unread} unread</span>
          <button onClick={onMarkAllRead} style={styles.markAllBtn}>
            Mark all read
          </button>
        </div>
      )}

      {/* Alert list */}
      <div style={styles.list}>
        {alerts.map((alert) => {
          const colors = severityColor(alert.severity);
          return (
            <div
              key   = {alert.id}
              style = {{
                ...styles.alertCard,
                backgroundColor: alert.is_read ? "#f7fafc" : colors.bg,
                borderLeft:      `3px solid ${alert.is_read ? "#e2e8f0" : colors.border}`,
                opacity:         alert.is_read ? 0.7 : 1,
              }}
            >
              {/* Header */}
              <div style={styles.alertHeader}>
                <span
                  style={{
                    ...styles.severityBadge,
                    backgroundColor: colors.bg,
                    color:           colors.text,
                    border:          `1px solid ${colors.border}`,
                  }}
                >
                  {alert.severity.toUpperCase()}
                </span>
                <span style={styles.alertTime}>
                  {new Date(alert.created_at).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                  })}
                </span>
              </div>

              {/* Message */}
              <p style={styles.alertMsg}>{alert.message}</p>

              {/* Actions */}
              {!alert.is_read && (
                <button
                  onClick = {() => onMarkRead(alert.id)}
                  style   = {styles.markReadBtn}
                >
                  Mark as read
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  center: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    minHeight:      "120px",
  },
  muted: { fontSize: "14px", color: "#a0aec0" },
  topBar: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    marginBottom:   "10px",
  },
  unreadCount: {
    fontSize:   "12px",
    color:      "#e53e3e",
    fontWeight: "600",
  },
  markAllBtn: {
    background:  "none",
    border:      "none",
    fontSize:    "12px",
    color:       "#4c51bf",
    cursor:      "pointer",
    fontWeight:  "500",
  },
  list: {
    display:       "flex",
    flexDirection: "column",
    gap:           "8px",
    maxHeight:     "320px",
    overflowY:     "auto",
  },
  alertCard: {
    borderRadius: "8px",
    padding:      "10px 12px",
    transition:   "opacity 0.2s",
  },
  alertHeader: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    marginBottom:   "6px",
  },
  severityBadge: {
    padding:      "2px 8px",
    borderRadius: "10px",
    fontSize:     "10px",
    fontWeight:   "700",
    letterSpacing: "0.05em",
  },
  alertTime: {
    fontSize: "11px",
    color:    "#a0aec0",
  },
  alertMsg: {
    fontSize:   "13px",
    color:      "#2d3748",
    margin:     "0 0 8px",
    lineHeight: "1.5",
  },
  markReadBtn: {
    background:  "none",
    border:      "none",
    fontSize:    "11px",
    color:       "#718096",
    cursor:      "pointer",
    padding:     0,
    textDecoration: "underline",
  },
};