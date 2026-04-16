import { useState } from "react";
import { createAgentAPI } from "../features/auth/authAPI";
import Navbar from "../components/Navbar";
import Snackbar from "../components/Snackbar"; // Import the Snackbar

function CreateAgent() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    role: "agent"
  });

  const [isHovered, setIsHovered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Ensure role is explicitly set for safety
      await createAgentAPI({ ...formData, role: "agent" });
      
      setToast({ message: "Agent Account Created Successfully!", type: "success" });
      
      // Clear form after success
      setFormData({
        username: "", password: "", name: "", 
        phone: "", email: "", address: "", role: "agent"
      });
      
    } catch (err) {
      console.error(err);
      setToast({ message: "Error creating agent. Username or Email might exist.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Navbar />
      
      <div style={styles.contentArea}>
        <div style={styles.formCard}>
          <div style={styles.header}>
            <h2 style={styles.title}>Create New Agent</h2>
            <p style={styles.subtitle}>Register a new team member to start assigning leads</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid}>
              {/* Left Column: Identification */}
              <div style={styles.column}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input style={styles.input} name="name" value={formData.name} placeholder="John Doe" onChange={handleChange} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Username</label>
                  <input style={styles.input} name="username" value={formData.username} placeholder="johndoe123" onChange={handleChange} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <input style={styles.input} name="password" value={formData.password} type="password" placeholder="••••••••" onChange={handleChange} required />
                </div>
              </div>

              {/* Right Column: Contact Details */}
              <div style={styles.column}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input style={styles.input} name="email" value={formData.email} type="email" placeholder="john@company.com" onChange={handleChange} required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input style={styles.input} name="phone" value={formData.phone} placeholder="10-digit mobile number" onChange={handleChange} maxLength="10" required />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Office Address</label>
                  <input style={styles.input} name="address" value={formData.address} placeholder="Main Branch, Suite 100" onChange={handleChange} />
                </div>
              </div>
            </div>

            <div style={styles.buttonWrapper}>
              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  ...styles.button,
                  backgroundColor: submitting ? "#94a3b8" : (isHovered ? "#2563eb" : "#3b82f6"),
                  cursor: submitting ? "not-allowed" : "pointer"
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {submitting ? "Creating Account..." : "Create Agent Account"}
              </button>
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

// ... styles remain the same as your previous code ...
const styles = {
  pageWrapper: { backgroundColor: "#f1f5f9", minHeight: "100vh", width: "100%", paddingTop: "90px", fontFamily: "'Inter', sans-serif" },
  contentArea: { display: "flex", justifyContent: "center", padding: "40px 20px" },
  formCard: { backgroundColor: "#ffffff", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "800px" },
  header: { marginBottom: "32px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" },
  title: { fontSize: "1.5rem", fontWeight: "700", color: "#0f172a", margin: "0 0 4px 0" },
  subtitle: { color: "#64748b", fontSize: "0.9rem", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: "24px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  column: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.85rem", fontWeight: "600", color: "#334155" },
  input: { padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.95rem", outline: "none", backgroundColor: "#f8fafc" },
  buttonWrapper: { marginTop: "10px", display: "flex", justifyContent: "flex-end" },
  button: { color: "white", padding: "12px 24px", borderRadius: "6px", border: "none", fontSize: "0.95rem", fontWeight: "600", transition: "all 0.2s ease" },
};

export default CreateAgent;