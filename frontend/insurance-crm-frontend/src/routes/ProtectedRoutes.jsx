import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const { access, user, loading } = useSelector((state) => state.auth);
  
  // Fallback to localStorage if Redux is wiped (on refresh)
  const token = access || localStorage.getItem("access");
  const userRole = user?.role || localStorage.getItem("role");

  // 1. If Redux is still processing the login, WAIT.
  // This prevents the "found null" error during the redirect.
  if (loading) {
    return <div style={styles.loading}>Verifying Session...</div>;
  }

  // 2. If no token at all, send to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 3. Check roles (Allow 'owner' or 'lead' for admin routes)
  const isAdmin = userRole === "owner" || userRole === "lead";
  const isAgent = userRole === "agent";

  if (role === "owner" && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (role === "agent" && !isAgent) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const styles = {
  loading: { 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    height: "100vh", 
    fontSize: "1.2rem", 
    color: "#64748b" 
  }
};

export default ProtectedRoute;