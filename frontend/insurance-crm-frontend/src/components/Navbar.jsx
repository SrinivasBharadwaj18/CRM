import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Accessing auth state safely
  const { user } = useSelector((state) => state.auth || {});

  // Roles based on your Django response
  const isManagement = user?.role === 'owner' || user?.role === 'lead';
  const isAgent = user?.role === 'agent';

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  // Logic to determine where the "Logo" or "Home" should go
  const getHomePath = () => {
    if (isManagement) return "/admin";
    if (isAgent) return "/agent/leads";
    return "/";
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* LOGO SECTION */}
        <div style={styles.logoGroup}>
          <Link to={getHomePath()} style={styles.logo}>
            CRM<span style={{ color: "#3b82f6" }}>PRO</span>
          </Link>
          {user?.role && (
            <span style={isManagement ? styles.adminBadge : styles.agentBadge}>
              {user.role.toUpperCase()}
            </span>
          )}
        </div>

        {/* NAVIGATION LINKS */}
        <div style={styles.links}>
          
          {/* ADMIN LINKS */}
          {isManagement && (
            <>
              <Link style={styles.link} to="/admin">Dashboard</Link>
              <Link style={styles.link} to="/admin/create-agent">Create User</Link>
              <Link style={styles.link} to="/admin/upload-leads">Upload Leads</Link>
              
              <a 
                style={styles.toolLink} 
                href="/admin/" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Django Admin ⚙️
              </a>
            </>
          )}
          
          {/* AGENT LINKS */}
          {isAgent && (
            <>
              <Link style={styles.link} to="/agent/leads">My Leads</Link>
              <Link style={styles.link} to="/agent/home">Dashbaord</Link>
              {/* If you have a specific AgentHome page, you can add it here */}
            </>
          )}

          {/* USER INFO & LOGOUT */}
          <div style={styles.userSection}>
            <div style={styles.userInfo}>
               <span style={styles.userName}>{user?.name || user?.username || "User"}</span>
               <span style={styles.userRole}>{user?.role}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { 
    backgroundColor: "#0f172a", 
    height: "70px", 
    position: "fixed", 
    top: 0, 
    width: "100%", 
    zIndex: 1000, 
    display: "flex", 
    alignItems: "center", 
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)" 
  },
  container: { 
    width: "100%", 
    maxWidth: "1400px", 
    margin: "0 auto", 
    padding: "0 24px", 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  logoGroup: { display: "flex", alignItems: "center", gap: "12px" },
  logo: { color: "white", fontSize: "1.4rem", fontWeight: "900", textDecoration: "none", letterSpacing: "-1px" },
  adminBadge: { backgroundColor: "#fef2f2", color: "#ef4444", padding: "2px 8px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "800" },
  agentBadge: { backgroundColor: "#eff6ff", color: "#3b82f6", padding: "2px 8px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "800" },
  links: { display: "flex", alignItems: "center", gap: "25px" },
  link: { color: "#cbd5e1", textDecoration: "none", fontSize: "0.9rem", fontWeight: "600", transition: "color 0.2s" },
  toolLink: { 
    color: "#fbbf24", 
    textDecoration: "none", 
    fontSize: "0.9rem", 
    fontWeight: "700",
    padding: "6px 12px",
    borderRadius: "6px",
    backgroundColor: "rgba(251, 191, 36, 0.1)",
  },
  userSection: { 
    display: "flex", 
    alignItems: "center", 
    gap: "15px", 
    borderLeft: "1px solid rgba(255,255,255,0.1)", 
    paddingLeft: "20px" 
  },
  userInfo: { display: "flex", flexDirection: "column", alignItems: "flex-end" },
  userName: { color: "white", fontSize: "0.85rem", fontWeight: "600" },
  userRole: { color: "#94a3b8", fontSize: "0.7rem", textTransform: "capitalize" },
  logoutBtn: { 
    backgroundColor: "#ef4444", 
    color: "white", 
    border: "none", 
    padding: "8px 16px", 
    borderRadius: "8px", 
    fontWeight: "700", 
    cursor: "pointer",
    transition: "opacity 0.2s"
  }
};

export default Navbar;