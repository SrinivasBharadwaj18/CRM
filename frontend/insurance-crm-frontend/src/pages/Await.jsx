import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Snackbar from "../components/Snackbar";

function Await() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const [formData, setFormData] = useState({
    call_date: "",
    follow_up_date: "",
    notes: "",
    next_action: ""
  });

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
      await api.post(`agent/${id}/await/`, formData);
      setToast({ message: "Follow-up successfully scheduled.", type: "success" });
      setTimeout(() => navigate("/agent/leads"), 2000);
      navigate("/agent/leads");
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to save follow-up details", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.container}>
        <div style={styles.breadcrumb} onClick={() => navigate(-1)}>
          ← Back to Lead Details
        </div>

        <div style={styles.formCard}>
          <div style={styles.cardHeader}>
            <div style={styles.headerTitleGroup}>
              <span style={styles.iconCircle}>🕒</span>
              <div>
                <h2 style={styles.title}>Schedule Follow-Up</h2>
                <p style={styles.subtitle}>Set reminders and document the last interaction</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid}>
              {/* Timing Section */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Last Call Date & Time</label>
                <input 
                  type="datetime-local" 
                  name="call_date" 
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Next Follow-Up Date</label>
                <input 
                  type="datetime-local" 
                  name="follow_up_date" 
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              {/* Action Section */}
              <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Planned Next Action</label>
                <input 
                  name="next_action" 
                  placeholder="e.g., Send brochure via WhatsApp, call back after 5 PM" 
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              {/* Notes Section */}
              <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Detailed Call Notes</label>
                <textarea
                  name="notes"
                  placeholder="Summarize the conversation, objections, and customer interest..."
                  onChange={handleChange}
                  style={styles.textarea}
                  required
                />
              </div>
            </div>

            <div style={styles.footer}>
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                style={styles.cancelBtn}
              >
                Discard
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                style={{
                  ...styles.submitBtn,
                  backgroundColor: submitting ? "#94a3b8" : "#8b5cf6", // Professional Purple
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Saving..." : "Save Follow-Up"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Snackbar 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: "", type: "" })} 
      />
    </div>
  );
}

const styles = {
  pageWrapper: {
    backgroundColor: "#f1f5f9",
    minHeight: "100vh",
    paddingTop: "90px",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "0 20px",
  },
  breadcrumb: {
    color: "#64748b",
    fontSize: "0.9rem",
    marginBottom: "20px",
    cursor: "pointer",
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "30px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #f1f5f9",
  },
  headerTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  iconCircle: {
    fontSize: "1.5rem",
    backgroundColor: "#f5f3ff",
    width: "50px",
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#1e293b",
  },
  subtitle: {
    margin: "4px 0 0 0",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  form: {
    padding: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.95rem",
    outline: "none",
    transition: "all 0.2s",
    "&:focus": { borderColor: "#8b5cf6" }
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "0.95rem",
    minHeight: "120px",
    resize: "vertical",
    outline: "none",
    fontFamily: "inherit",
  },
  footer: {
    marginTop: "40px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "24px",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitBtn: {
    color: "white",
    border: "none",
    padding: "12px 32px",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "1rem",
    transition: "all 0.2s",
    boxShadow: "0 4px 6px -1px rgba(139, 92, 246, 0.3)",
  },
};

export default Await;