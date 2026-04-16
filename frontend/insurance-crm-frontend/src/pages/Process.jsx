import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Snackbar from "../components/Snackbar";

function Process() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const [formData, setFormData] = useState({
    insurance_name: "",
    insurance_provider: "",
    coverage_amount: "",
    premium: "", // Matches backend
    tenure: "1",
    policy_start_date: "",
    policy_end_date: "",
    payment_status: "pending"
  });

  // Auto-calculate Commission when Premium or Rate changes
  // useEffect(() => {
  //   const premium = parseFloat(formData.premium) || 0;
  //   const rate = parseFloat(formData.commission_rate) || 0;
  //   const earned = (premium * rate) / 100;
  //   setFormData(prev => ({ ...prev, commission_earned: earned.toFixed(2) }));
  // }, [formData.premium, formData.commission_rate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

// Inside your handleSubmit
const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Sends custom deal info to the backend
      await api.post(`agent/${id}/process/`, formData);
      setToast({ message: "Success! Your score has been updated.", type: "success" });
      
      // Return to leads list
      setTimeout(() => navigate("/agent/leads"), 1500);
    } catch (err) {
      setToast({ message: "Failed to process conversion.", type: "error" });
    } finally {
      setSubmitting(false);
    }
};

  return (
    <div style={styles.pageWrapper}>
      <Navbar />
      <main style={styles.container}>
        <div style={styles.breadcrumb} onClick={() => navigate(-1)}>← Cancel</div>
        <div style={styles.formCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Process Custom Deal</h2>
            <p style={styles.subtitle}>Enter policy details for Lead #{id}</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Plan Name</label>
                <input name="insurance_name" placeholder="e.g. Executive Health" onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Provider</label>
                <input name="insurance_provider" placeholder="e.g. TATA AIG" onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Coverage Amount</label>
                <input name="coverage_amount" type="number" onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Tenure (Years)</label>
                <input name="tenure" type="number" value={formData.tenure} onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Policy Start</label>
                <input name="policy_start_date" type="date" onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Policy End</label>
                <input name="policy_end_date" type="date" onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Premium ($)</label>
                <input name="premium" type="number" step="0.01" onChange={handleChange} style={styles.input} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Status</label>
                <select name="payment_status" onChange={handleChange} style={styles.select}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div style={styles.footer}>
              <button type="submit" disabled={submitting} style={{...styles.submitBtn, backgroundColor: submitting ? "#94a3b8" : "#10b981"}}>
                {submitting ? "Processing..." : "Confirm Conversion"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Snackbar message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "" })} />
    </div>
  );
}

const styles = {
  pageWrapper: { backgroundColor: "#f1f5f9", minHeight: "100vh", paddingTop: "90px", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "850px", margin: "0 auto", padding: "0 20px" },
  breadcrumb: { color: "#64748b", fontSize: "0.9rem", marginBottom: "15px", cursor: "pointer" },
  formCard: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" },
  cardHeader: { padding: "25px 30px", borderBottom: "1px solid #f1f5f9" },
  title: { margin: 0, fontSize: "1.4rem", fontWeight: "800", color: "#0f172a" },
  subtitle: { margin: "5px 0 0 0", color: "#64748b", fontSize: "0.9rem" },
  form: { padding: "30px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "0.7rem", fontWeight: "700", color: "#475569", textTransform: "uppercase" },
  input: { padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.9rem" },
  select: { padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", backgroundColor: "white" },
  footer: { marginTop: "30px", display: "flex", justifyContent: "flex-end" },
  submitBtn: { color: "white", border: "none", padding: "12px 30px", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }
};

export default Process;