import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { 
  LayoutDashboard, Users, PhoneCall, CheckSquare, 
  Wallet, Settings, LogOut 
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth || {});

  const isManagement = user?.role === 'owner' || user?.role === 'lead';
  const isAgent = user?.role === 'agent';

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  // --- RENDER 1: AGENT SIDEBAR ---
  if (isAgent) {
    return (
      <aside style={styles.sidebar}>
        <div style={styles.logoSection}>
          <div style={styles.logoCircle}>PH</div>
          <h1 style={styles.logoText}>Agent CRM</h1>
        </div>

        <nav style={styles.navMenu}>
          <SidebarItem to="/agent/home" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive("/agent/home")} />
          <SidebarItem to="/agent/leads" icon={<Users size={20} />} label="Leads" active={isActive("/agent/leads")} />
          <SidebarItem to="/agent/calls" icon={<PhoneCall size={20} />} label="Call History" active={isActive("/agent/calls")} />
          <SidebarItem to="/agent/tasks" icon={<CheckSquare size={20} />} label="Tasks" active={isActive("/agent/tasks")} />
          <SidebarItem to="/agent/earnings" icon={<Wallet size={20} />} label="My Earnings" active={isActive("/agent/earnings")} />
          
          <div style={{ marginTop: 'auto' }}>
            <SidebarItem to="/settings" icon={<Settings size={20} />} label="Settings" active={isActive("/settings")} />
            <button onClick={handleLogout} style={styles.logoutBtnSidebar}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    );
  }

  // --- RENDER 2: ADMIN HORIZONTAL NAVBAR ---
  return (
    <nav style={styles.topNav}>
      <div style={styles.topContainer}>
        <div style={styles.logoGroup}>
          <Link to="/admin" style={styles.logo}>CRM<span style={{ color: "#3b82f6" }}>PRO</span></Link>
          <span style={styles.adminBadge}>ADMIN</span>
        </div>

        <div style={styles.topLinks}>
          <Link style={styles.topLink} to="/admin">Dashboard</Link>
          <Link style={styles.topLink} to="/admin/create-agent">Employee Mgmt</Link>
          <Link style={styles.topLink} to="/admin/upload-leads">Upload Leads</Link>
          
          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name || "Admin"}</span>
              <button onClick={handleLogout} style={styles.logoutBtnTop}>Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// --- SIDEBAR ITEM (Agent Only) ---
const SidebarItem = ({ to, icon, label, active }) => {
  const [hover, setHover] = useState(false);

  return (
    <Link 
      to={to} 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.navItem,
        color: (active || hover) ? "#fff" : "#94a3b8", // Only text/icon changes color
        borderLeft: active ? "4px solid #3b82f6" : "4px solid transparent",
      }}
    >
      {icon}
      <span style={{ fontWeight: active ? "700" : "500" }}>{label}</span>
    </Link>
  );
};

// --- STYLES ---
const styles = {
  // AGENT SIDEBAR STYLES
  sidebar: { width: "260px", backgroundColor: "#1e293b", height: "100vh", position: "fixed", left: 0, top: 0, display: "flex", flexDirection: "column", zIndex: 1000 },
  logoSection: { padding: "30px 24px", display: "flex", alignItems: "center", gap: "12px" },
  logoCircle: { width: "35px", height: "35px", borderRadius: "50%", backgroundColor: "#3b82f6", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px" },
  logoText: { color: "#fff", fontSize: "1.1rem", fontWeight: "800", margin: 0 },
  navMenu: { flex: 1, display: "flex", flexDirection: "column", padding: "10px 0" },
  navItem: { display: "flex", alignItems: "center", gap: "15px", padding: "12px 24px", textDecoration: "none", fontSize: "0.95rem", transition: "color 0.2s ease" },
  logoutBtnSidebar: { width: "100%", display: "flex", alignItems: "center", gap: "15px", padding: "15px 24px", backgroundColor: "transparent", color: "#f87171", border: "none", cursor: "pointer", fontSize: "0.95rem", fontWeight: "600" },

  // ADMIN TOP NAV STYLES
  topNav: { backgroundColor: "#0f172a", height: "70px", position: "fixed", top: 0, width: "100%", zIndex: 1000, display: "flex", alignItems: "center" },
  topContainer: { width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logoGroup: { display: "flex", alignItems: "center", gap: "12px" },
  logo: { color: "white", fontSize: "1.4rem", fontWeight: "900", textDecoration: "none" },
  adminBadge: { backgroundColor: "#fef2f2", color: "#ef4444", padding: "2px 8px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "800" },
  topLinks: { display: "flex", alignItems: "center", gap: "25px" },
  topLink: { color: "#cbd5e1", textDecoration: "none", fontSize: "0.9rem", fontWeight: "600" },
  userSection: { borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "20px" },
  userInfo: { display: "flex", alignItems: "center", gap: "15px" },
  userName: { color: "white", fontSize: "0.85rem", fontWeight: "600" },
  logoutBtnTop: { backgroundColor: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }
};

export default Navbar;