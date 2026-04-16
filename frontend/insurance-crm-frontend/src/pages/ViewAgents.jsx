import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../components/Navbar";
import Snackbar from "../components/Snackbar";

function ViewAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "" });

  // --- MASKED DATA FOR LOADING STATE ---
  const placeholders = Array(3).fill({
    name: "..........",
    email: "..........",
    role: "agent",
    metrics: { leads: "..", conversions: "..", rate: ".." }
  });

  const fetchAgents = async () => {
    try {
      // Points to your 'view_employees' view in Django
      const res = await axiosInstance.get("admin/view-employees/");
      setAgents(res.data);
    } catch (err) {
      setToast({ message: "Failed to fetch agent performance", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const displayData = loading ? placeholders : agents;

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.container}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.title}>Agent Performance</h2>
            <p style={styles.subtitle}>Track team productivity and conversion success</p>
          </div>
          <button onClick={fetchAgents} style={styles.refreshBtn}>
            🔄 Refresh Data
          </button>
        </header>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Agent Name</th>
                <th style={styles.th}>Contact Info</th>
                <th style={styles.th}>Daily Leads</th>
                <th style={styles.th}>Conversions</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((agent, index) => (
                <tr key={agent.emp_id || index} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.nameGroup}>
                      <div style={styles.avatar}>{agent.name?.charAt(0)}</div>
                      <span style={styles.agentName}>{agent.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.contactGroup}>
                      <span style={styles.email}>{agent.email}</span>
                      <span style={styles.phone}>{agent.phone}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{agent.total_leads || 0}</td>
                  <td style={styles.td}>
                    <span style={styles.conversionText}>
                      {agent.total_conversions || 0}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={agent.is_active ? styles.activeBadge : styles.inactiveBadge}>
                      {agent.is_active ? "Online" : "Offline"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  pageWrapper: { backgroundColor: "#f8fafc", minHeight: "100vh", paddingTop: "90px", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" },
  title: { fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: "5px" },
  refreshBtn: { backgroundColor: "white", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer", color: "#475569" },
  tableCard: { backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  theadRow: { backgroundColor: "#fbfcfd", borderBottom: "1px solid #f1f5f9" },
  th: { padding: "16px 24px", fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" },
  td: { padding: "16px 24px", color: "#1e293b", fontSize: "0.95rem" },
  nameGroup: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "32px", height: "32px", backgroundColor: "#eff6ff", color: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.8rem" },
  agentName: { fontWeight: "600" },
  contactGroup: { display: "flex", flexDirection: "column" },
  email: { fontSize: "0.85rem", color: "#1e293b" },
  phone: { fontSize: "0.75rem", color: "#94a3b8" },
  conversionText: { fontWeight: "700", color: "#10b981" },
  activeBadge: { backgroundColor: "#f0fdf4", color: "#166534", padding: "4px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700" },
  inactiveBadge: { backgroundColor: "#fef2f2", color: "#991b1b", padding: "4px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700" }
};

export default ViewAgents;