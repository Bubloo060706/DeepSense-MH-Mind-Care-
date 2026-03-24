import { useNavigate } from "react-router-dom";

export default function Navbar({ unreadCount = 0 }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      {/* Brand */}
      <div style={styles.brand}>
        <span style={styles.brandIcon}>🧠</span>
        <div>
          <p style={styles.brandTitle}>Depression Detection</p>
          <p style={styles.brandSub}>IoT Monitoring System</p>
        </div>
      </div>

      {/* Center links */}
      <div style={styles.links}>
        <NavLink label="Dashboard"  onClick={() => navigate("/dashboard")} />
        <NavLink label="Patients"   onClick={() => navigate("/patients")}  />
        <NavLink label="Reports"    onClick={() => navigate("/reports")}   />
      </div>

      {/* Right side */}
      <div style={styles.right}>
        {/* Alert bell */}
        <button
          style   = {styles.bellBtn}
          onClick = {() => navigate("/alerts")}
        >
          🔔
          {unreadCount > 0 && (
            <span style={styles.bellBadge}>{unreadCount}</span>
          )}
        </button>

        {/* User info */}
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {(localStorage.getItem("user_id") || "U")[0].toUpperCase()}
          </div>
          <span style={styles.role}>
            {localStorage.getItem("user_role") || "clinician"}
          </span>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}

function NavLink({ label, onClick }) {
  return (
    <button onClick={onClick} style={styles.navLink}>
      {label}
    </button>
  );
}

const styles = {
  nav: {
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "space-between",
    backgroundColor: "#ffffff",
    padding:         "0 32px",
    height:          "64px",
    boxShadow:       "0 1px 6px rgba(0,0,0,0.07)",
    position:        "sticky",
    top:             0,
    zIndex:          100,
  },
  brand: {
    display:    "flex",
    alignItems: "center",
    gap:        "10px",
  },
  brandIcon:  { fontSize: "24px" },
  brandTitle: {
    fontSize:   "15px",
    fontWeight: "600",
    color:      "#1a202c",
    margin:     0,
  },
  brandSub: {
    fontSize: "11px",
    color:    "#a0aec0",
    margin:   0,
  },
  links: {
    display: "flex",
    gap:     "4px",
  },
  navLink: {
    background:   "none",
    border:       "none",
    padding:      "8px 14px",
    borderRadius: "8px",
    fontSize:     "14px",
    fontWeight:   "500",
    color:        "#4a5568",
    cursor:       "pointer",
  },
  right: {
    display:    "flex",
    alignItems: "center",
    gap:        "16px",
  },
  bellBtn: {
    position:   "relative",
    background: "none",
    border:     "none",
    fontSize:   "20px",
    cursor:     "pointer",
    padding:    "4px",
  },
  bellBadge: {
    position:        "absolute",
    top:             "-4px",
    right:           "-4px",
    backgroundColor: "#e53e3e",
    color:           "#fff",
    borderRadius:    "10px",
    padding:         "1px 5px",
    fontSize:        "10px",
    fontWeight:      "700",
  },
  userInfo: {
    display:    "flex",
    alignItems: "center",
    gap:        "8px",
  },
  avatar: {
    width:           "32px",
    height:          "32px",
    borderRadius:    "50%",
    backgroundColor: "#4c51bf",
    color:           "#fff",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    fontSize:        "14px",
    fontWeight:      "600",
  },
  role: {
    fontSize:    "13px",
    color:       "#718096",
    fontWeight:  "500",
    textTransform: "capitalize",
  },
  logoutBtn: {
    padding:         "7px 14px",
    borderRadius:    "8px",
    backgroundColor: "#fff",
    border:          "1px solid #e2e8f0",
    fontSize:        "13px",
    fontWeight:      "500",
    color:           "#4a5568",
    cursor:          "pointer",
  },
};