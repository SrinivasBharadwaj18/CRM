import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import api from "../services/api";
import { 
  LayoutGrid, 
  LayoutDashboard,
  Users, 
  Settings, 
  LogOut,
  PhoneCall, 
  CheckSquare, 
  Wallet, 
  Coffee, 
  Clock,
  UserPlus,
  UploadCloud,
  Landmark,
  Bell // Added Bell icon
} from "lucide-react";

function Navbar({ isOnBreak, setIsOnBreak }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth || {});
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Polling Logic for Notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/agent/notifications/check/');
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user]);

  // 2. Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      
      {/* --- NOTIFICATION CENTER SECTION --- */}
      <div style={styles.headerSection} ref={dropdownRef}>
        <div style={styles.headerLeft}>
           <div style={styles.logoCircle}>PH</div>
           <span style={styles.brandName}>{user?.role === 'owner' ? 'Admin' : 'Agent'}</span>
        </div>
        
        <div style={styles.bellWrapper} onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
          <Bell size={22} color={notifications.length > 0 ? "#e67e22" : "#35579b"} />
          {notifications.length > 0 && (
            <span style={styles.badge}>{notifications.length}</span>
          )}

          {showNotifDropdown && (
            <div style={styles.notifDropdown}>
              <div style={styles.notifHeader}>Pending Deadlines</div>
              <div style={styles.notifList}>
                {notifications.length === 0 ? (
                  <div style={styles.emptyNotif}>All caught up! 🎉</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={styles.notifItem}>
                      <div style={styles.notifTitle}>{n.title}</div>
                      <div style={styles.notifMsg}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
                border: 'none'
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

const SidebarItem = ({ to, icon, label, active }) => {
  return (
    <Link 
      to={to} 
      style={{
        ...styles.navItem,
        backgroundColor: active ? "#35579b" : "transparent",
        color: active ? "#ffffff" : "#2c3e50",
        borderBottom: "1px solid #d1d9e6",
      }}
    >
      <span style={{ 
        color: active ? "#ffffff" : "#35579b", 
        display: "flex", 
        alignItems: "center" 
      }}>
        {icon}
      </span>
      <span style={{ 
        fontWeight: "600", 
        fontSize: "0.9rem",
        marginLeft: "12px"
      }}>
        {label}
      </span>
    </Link>
  );
};

const styles = {
  sidebar: { 
    width: "260px", 
    backgroundColor: "#e8eff9", 
    height: "100vh", 
    position: "fixed", 
    left: 0, 
    top: 0, 
    display: "flex", 
    flexDirection: "column", 
    zIndex: 1000, 
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    borderRight: "1px solid #bfc9d8"
  },
  headerSection: {
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #bfc9d8",
    backgroundColor: "#d9e4f5"
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  logoCircle: { width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#35579b", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem" },
  brandName: { fontWeight: "800", color: "#35579b", fontSize: "1rem" },
  
  // BELL & DROPDOWN STYLES
  bellWrapper: { position: "relative", cursor: "pointer", padding: "5px" },
  badge: { 
    position: "absolute", top: "-2px", right: "-2px", backgroundColor: "#e74c3c", color: "white", 
    fontSize: "10px", fontWeight: "bold", borderRadius: "50%", padding: "2px 5px" 
  },
  notifDropdown: {
    position: "absolute", top: "40px", right: "0", width: "240px", backgroundColor: "white",
    borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 1100,
    border: "1px solid #bfc9d8", overflow: "hidden"
  },
  notifHeader: { padding: "12px", backgroundColor: "#35579b", color: "white", fontSize: "0.8rem", fontWeight: "bold" },
  notifList: { maxHeight: "300px", overflowY: "auto" },
  notifItem: { padding: "12px", borderBottom: "1px solid #f0f0f0", "&:lastChild": { borderBottom: "none" } },
  notifTitle: { fontSize: "0.8rem", fontWeight: "700", color: "#2c3e50" },
  notifMsg: { fontSize: "0.75rem", color: "#7f8c8d", marginTop: "2px" },
  emptyNotif: { padding: "20px", textAlign: "center", fontSize: "0.8rem", color: "#95a5a6" },

  navMenu: { flex: 1, display: "flex", flexDirection: "column" },
  navItem: { 
    display: "flex", 
    alignItems: "center", 
    padding: "16px 20px", 
    textDecoration: "none", 
    transition: "background 0.2s ease",
    cursor: "pointer"
  },
  breakBtn: {
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  bottomSection: { marginTop: 'auto', paddingBottom: '20px' },
  logoutBtn: { 
    width: "100%", 
    display: "flex", 
    alignItems: "center", 
    gap: "12px", 
    padding: "16px 20px", 
    backgroundColor: "transparent", 
    color: "#e74c3c", 
    border: "none", 
    cursor: "pointer", 
    fontSize: "0.9rem" 
  }
};

export default Navbar;