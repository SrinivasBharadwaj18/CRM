import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import api from "../services/api";
import { 
  LayoutDashboard, Users, PhoneCall, CheckSquare, 
  Wallet, Settings, LogOut, Coffee, Clock 
} from "lucide-react";

function Navbar({ isOnBreak, setIsOnBreak }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth || {});

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const handleBreakToggle = async () => {
    try {
      const res = await api.post("/agent/toggle-break/");
      setIsOnBreak(res.data.status === "on_break");
    } catch (err) {
      console.error("Break toggle failed", err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside style={styles.sidebar}>
      {/* --- LOGO SECTION --- */}
      <div style={styles.logoSection}>
        <div style={styles.logoCircle}>PH</div>
        <h1 style={styles.logoText}>Agent CRM</h1>
      </div>

      {/* --- MAIN NAVIGATION --- */}
      <nav style={styles.navMenu}>
        <SidebarItem to="/agent/home" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive("/agent/home")} />
        <SidebarItem to="/agent/leads" icon={<Users size={20} />} label="Leads" active={isActive("/agent/leads")} />
        <SidebarItem to="/agent/calls" icon={<PhoneCall size={20} />} label="Call History" active={isActive("/agent/calls")} />
        <SidebarItem to="/agent/tasks" icon={<CheckSquare size={20} />} label="Tasks" active={isActive("/agent/tasks")} />
        <SidebarItem to="/agent/earnings" icon={<Wallet size={20} />} label="My Earnings" active={isActive("/agent/earnings")} />

        {/* --- DYNAMIC BREAK BUTTON --- */}
        <button 
          onClick={handleBreakToggle} 
          style={{
            ...styles.navItem, 
            ...styles.breakBtn, 
            color: isOnBreak ? "#fbbf24" : "#10b981",
            marginTop: '20px'
          }}
        >
          {isOnBreak ? <Clock size={20} /> : <Coffee size={20} />}
          <span style={{ fontWeight: "700" }}>{isOnBreak ? "End Break" : "Take a Break"}</span>
        </button>

        {/* --- BOTTOM SECTION --- */}
        <div style={styles.bottomSection}>
          <SidebarItem to="/settings" icon={<Settings size={20} />} label="Settings" active={isActive("/settings")} />
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={20} />
            <span style={{ fontWeight: "700" }}>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}

// --- SUB-COMPONENT: SIDEBAR ITEM ---
const SidebarItem = ({ to, icon, label, active }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      to={to} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.navItem,
        backgroundColor: active ? "#2d3748" : (isHovered ? "#242f42" : "transparent"),
        color: (active || isHovered) ? "#fff" : "#94a3b8",
        borderLeft: active ? "4px solid #3b82f6" : "4px solid transparent",
      }}
    >
      <span style={{ color: active ? "#3b82f6" : "inherit" }}>{icon}</span>
      <span style={{ fontWeight: active ? "700" : "500" }}>{label}</span>
    </Link>
  );
};

// --- STYLES (MATCHING IMAGE_8A1670.PNG EXACTLY) ---
const styles = {
  sidebar: { 
    width: "260px", 
    backgroundColor: "#1e293b", 
    height: "100vh", 
    position: "fixed", 
    left: 0, 
    top: 0, 
    display: "flex", 
    flexDirection: "column", 
    zIndex: 1000,
    fontFamily: "'Inter', sans-serif" 
  },
  logoSection: { 
    padding: "40px 24px", 
    display: "flex", 
    alignItems: "center", 
    gap: "12px" 
  },
  logoCircle: { 
    width: "38px", 
    height: "38px", 
    borderRadius: "50%", 
    backgroundColor: "#3b82f6", 
    color: "white", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    fontWeight: "800", 
    fontSize: "14px" 
  },
  logoText: { 
    color: "#fff", 
    fontSize: "1.2rem", 
    fontWeight: "800", 
    margin: 0,
    letterSpacing: "-0.5px"
  },
  navMenu: { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    padding: "0" 
  },
  navItem: { 
    display: "flex", 
    alignItems: "center", 
    gap: "16px", 
    padding: "14px 24px", 
    textDecoration: "none", 
    fontSize: "0.95rem", 
    transition: "all 0.2s ease",
    border: "none",
    cursor: "pointer",
    textAlign: "left"
  },
  breakBtn: {
    background: "rgba(255,255,255,0.03)",
    margin: "0 10px",
    borderRadius: "12px",
    width: "calc(100% - 20px)"
  },
  bottomSection: { 
    marginTop: 'auto', 
    paddingBottom: '30px' 
  },
  logoutBtn: { 
    width: "100%", 
    display: "flex", 
    alignItems: "center", 
    gap: "16px", 
    padding: "14px 24px", 
    backgroundColor: "transparent", 
    color: "#f87171", // Exact red from image
    border: "none", 
    cursor: "pointer", 
    fontSize: "0.95rem",
    transition: "opacity 0.2s"
  }
};

export default Navbar;