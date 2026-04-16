import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../features/auth/authSlice";
import Navbar from "../components/Navbar";
import Snackbar from "../components/Snackbar";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access auth state from Redux
  const { access, user, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [isHovered, setIsHovered] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

// Inside Login.jsx - Update the useEffect
useEffect(() => {
  if (access && user) {
    setToast({ message: "Login Successful!", type: "success" });
    
    setTimeout(() => {
      // BRAINS: Standardize the roles. 
      // Ensure these match EXACTLY what your Django API sends ('owner' or 'agent')
      console.log(user.role)
      if (user.role === "owner" || user.role === "lead") {
        console.log("we are here")
        navigate("/admin", { replace: true });
      } else if (user.role === "agent") {
        navigate("/agent/home", { replace: true });
      } else {
        console.error("Unknown Role:", user.role);
        navigate("/", { replace: true });
      }
    }, 500);
  }
}, [access, user, navigate]);

  // ERROR HANDLING
  useEffect(() => {
    if (error) {
      setToast({ message: error.detail || "Invalid Credentials", type: "error" });
    }
  }, [error]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div style={styles.pageWrapper}>
      <Navbar />
      
      <div style={styles.contentArea}>
        <div style={styles.loginCard}>
          <div style={styles.header}>
            <h2 style={styles.title}>Welcome Back</h2>
            <p style={styles.subtitle}>Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* USERNAME FIELD */}
            <div style={styles.inputGroup}>
              <label htmlFor="username-field" style={styles.label}>Username</label>
              <input
                id="username-field"
                style={styles.input}
                type="text"
                name="username"
                value={formData.username}
                placeholder="Enter your username"
                onChange={handleChange}
                autoComplete="username" // Fixes Autofill issue
                required
              />
            </div>

            {/* PASSWORD FIELD */}
            <div style={styles.inputGroup}>
              <label htmlFor="password-field" style={styles.label}>Password</label>
              <input
                id="password-field"
                style={styles.input}
                type="password"
                name="password"
                value={formData.password}
                placeholder="••••••••"
                onChange={handleChange}
                autoComplete="current-password" // Fixes Autofill issue
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                ...styles.button,
                backgroundColor: loading ? "#94a3b8" : (isHovered ? "#2563eb" : "#3b82f6"),
                cursor: loading ? "not-allowed" : "pointer"
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>

            <div style={styles.footer}>
              <p style={styles.footerText}>
                Forgot password? <span style={styles.link}>Contact Admin</span>
              </p>
            </div>
          </form>
        </div>
      </div>

      <Snackbar 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: "", type: "" })} 
      />
    </div>
  );
}

const styles = {
  pageWrapper: { backgroundColor: "#f1f5f9", minHeight: "100vh", width: "100%", fontFamily: "'Inter', sans-serif" },
  contentArea: { display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 64px)", padding: "20px" },
  loginCard: { backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "400px" },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "1.5rem", fontWeight: "700", color: "#0f172a", margin: "0 0 8px 0" },
  subtitle: { color: "#64748b", fontSize: "0.9rem", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: "18px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.85rem", fontWeight: "600", color: "#334155" },
  input: { padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", backgroundColor: "#f8fafc", transition: "border-color 0.2s" },
  button: { color: "white", padding: "12px", borderRadius: "6px", border: "none", fontSize: "1rem", fontWeight: "600", marginTop: "10px", transition: "all 0.2s ease" },
  footer: { marginTop: "15px", textAlign: "center" },
  footerText: { fontSize: "0.85rem", color: "#64748b" },
  link: { color: "#3b82f6", textDecoration: "none", fontWeight: "500", cursor: "pointer" }
};

export default Login;