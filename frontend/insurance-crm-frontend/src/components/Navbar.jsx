import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import api from "../services/api";
import { 
  LayoutGrid, Users, Briefcase, CalendarDays, 
  CreditCard, BarChart3, Settings, LogOut,
  PhoneCall, CheckSquare, Wallet, Coffee, Clock 
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
      <nav style={styles.navMenu}>
        
        {/* --- ADMIN / OWNER LINKS --- */}
        {(user?.role === 'owner' || user?.role === 'lead') && (
          <>
            <SidebarItem to="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive("/admin")} />
            <SidebarItem to="/admin/create-agent" icon={<UserPlus size={20} />} label="Create Agent" active={isActive("/admin/create-agent")} />
            <SidebarItem to="/admin/upload-leads" icon={<UploadCloud size={20} />} label="Upload Leads" active={isActive("/admin/upload-leads")} />
            <SidebarItem to="/admin/finance" icon={<Landmark size={20} />} label="Finance" active={isActive("/admin/finance")} />
          </>
        )}

        {/* --- AGENT LINKS --- */}
        {user?.role === 'agent' && (
          <>
            <SidebarItem to="/agent/home" icon={<LayoutGrid size={22} />} label="Dashboard" active={isActive("/agent/home")} />
            <SidebarItem to="/agent/leads" icon={<Users size={22} />} label="Leads" active={isActive("/agent/leads")} />
            <SidebarItem to="/agent/calls" icon={<PhoneCall size={22} />} label="Call History" active={isActive("/agent/calls")} />
            <SidebarItem to="/agent/tasks" icon={<CheckSquare size={22} />} label="Tasks" active={isActive("/agent/tasks")} />
            <SidebarItem to="/agent/earnings" icon={<Wallet size={22} />} label="My Earnings" active={isActive("/agent/earnings")} />

            <button 
              onClick={handleBreakToggle} 
              style={{
                ...styles.navItem, 
                ...styles.breakBtn, 
                backgroundColor: isOnBreak ? "#fbbf24" : "#10b981", 
                color: "white",
                marginTop: '20px',
                justifyContent: 'center',
                margin: '20px 15px 0 15px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isOnBreak ? <Clock size={20} /> : <Coffee size={20} />}
              <span style={{ fontWeight: "700", marginLeft: '10px' }}>
                {isOnBreak ? "End Break" : "Take a Break"}
              </span>
            </button>
          </>
        )}

        <div style={styles.bottomSection}>
          <SidebarItem to="/settings" icon={<Settings size={22} />} label="Settings" active={isActive("/settings")} />
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={20} />
            <span style={{ fontWeight: "600" }}>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}

const SidebarItem = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    style={{
      ...styles.navItem,
      backgroundColor: active ? "#35579b" : "transparent",
      color: active ? "#ffffff" : "#2c3e50",
      borderBottom: "1px solid #d1d9e6",
    }}
  >
    <span style={{ color: active ? "#ffffff" : "#35579b", display: "flex", alignItems: "center" }}>
      {icon}
    </span>
    <span style={{ fontWeight: "600", fontSize: "0.9rem", marginLeft: "12px" }}>
      {label}
    </span>
  </Link>
);

const styles = {
  sidebar: { width: "260px", backgroundColor: "#e8eff9", height: "100vh", position: "fixed", left: 0, top: 0, display: "flex", flexDirection: "column", zIndex: 1000, fontFamily: "'Segoe UI', sans-serif", borderRight: "1px solid #bfc9d8" },
  navMenu: { flex: 1, display: "flex", flexDirection: "column" },
  navItem: { display: "flex", alignItems: "center", padding: "16px 20px", textDecoration: "none", transition: "background 0.2s ease" },
  breakBtn: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  bottomSection: { marginTop: 'auto', paddingBottom: '20px' },
  logoutBtn: { width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", backgroundColor: "transparent", color: "#e74c3c", border: "none", cursor: "pointer", fontSize: "0.9rem" }
};

export default Navbar;