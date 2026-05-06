import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import api from "../services/api";
import { 
  LayoutGrid, Users, Briefcase, CalendarDays, 
  CreditCard, BarChart3, Settings, LogOut 
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth || {});

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside style={styles.sidebar}>
      <nav style={styles.navMenu}>
        {(user?.role === 'owner' || user?.role === 'lead') && (
          <>
            <SidebarItem to="/admin" icon={<LayoutGrid size={22} />} label="Dashboard" active={isActive("/admin")} />
            <SidebarItem to="/admin/agents" icon={<Users size={22} />} label="Employee Management" active={isActive("/admin/agents")} />
            <SidebarItem to="/admin/recruitment" icon={<Briefcase size={22} />} label="Recruitment" active={isActive("/admin/recruitment")} />
            <SidebarItem to="/admin/attendance" icon={<CalendarDays size={22} />} label="Attendance" active={isActive("/admin/attendance")} />
            <SidebarItem to="/admin/finance" icon={<CreditCard size={22} />} label="Payroll" active={isActive("/admin/finance")} />
            <SidebarItem to="/admin/performance" icon={<BarChart3 size={22} />} label="Performance" active={isActive("/admin/performance")} />
            <SidebarItem to="/settings" icon={<Settings size={22} />} label="Settings" active={isActive("/settings")} />
          </>
        )}

        <div style={styles.bottomSection}>
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
    width: "260px",        // The master width
    backgroundColor: "#e8eff9", 
    height: "100vh", 
    position: "fixed",     // Stays locked to the left
    left: 0, 
    top: 0, 
    margin: 0,             // Ensure no outside spacing
    display: "flex", 
    flexDirection: "column", 
    zIndex: 1000, 
    borderRight: "1px solid #bfc9d8",
    boxSizing: 'border-box'
  },
  navMenu: { flex: 1, display: "flex", flexDirection: "column" },
  navItem: { 
    display: "flex", 
    alignItems: "center", 
    padding: "16px 20px", 
    textDecoration: "none", 
    transition: "background 0.2s ease",
    borderLeft: "none"
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