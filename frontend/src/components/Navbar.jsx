import { useNavigate, useLocation } from "react-router-dom";
import logo from '../assets/MindCare_Logo.png'

const s = {
  nav: {
    background: "var(--color-surface)",
    borderBottom: "1px solid var(--color-border)",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
    fontSize: 17,
    color: "var(--color-text)",
    cursor: "pointer",
  },
  right: { display: "flex", alignItems: "center", gap: 20 },
  userName: { fontSize: 13, color: "var(--color-muted)" },
  logoutBtn: {
    background: "none",
    color: "var(--color-danger)",
    fontSize: 13,
    padding: "6px 12px",
    border: "1px solid var(--color-danger)",
    borderRadius: 6,
  },
  crumb: { fontSize: 13, color: "var(--color-muted)" },
};

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const userName  = localStorage.getItem("user_name") || "Clinician";
  const isDetail  = location.pathname.startsWith("/patient/");

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    navigate("/login");
  };

  return (
    <nav style={s.nav}>
      <div style={s.brand} onClick={() => navigate("/")}><img style={{width:50}} src={logo} alt="logo"/>
        <span>MindCare</span>
        {isDetail && (
          <span style={s.crumb}> / Patient Detail</span>
        )}
      </div>

      <div style={s.right}>
        <span style={s.userName}>{userName}</span>
        <button style={s.logoutBtn} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
}