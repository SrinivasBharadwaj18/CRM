import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchLeads } from "../features/leads/leadSlice";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import api from "../services/api"; 
import Navbar from "../components/Navbar";

function Leads() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Initialize location hook

  const allLeads = useSelector((state) => state.leads?.items) || [];
  const isLoading = useSelector((state) => state.leads?.loading);

  const [activeTab, setActiveTab] = useState("All Leads");
  const [priorityTab, setPriorityTab] = useState("Hot");

  // 1. Initial Data Fetch
  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  // 2. Dashboard Integration: Listen for tab-switching instructions from navigation
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  // 3. Sub-Tab Sync: Set defaults when switching main categories
  useEffect(() => {
    if (activeTab === "Converted") {
      setPriorityTab("Pending");
    } else {
      setPriorityTab("Hot");
    }
  }, [activeTab]);

  const isDueToday = (followups) => {
    if (!followups || !Array.isArray(followups)) return false;
    const today = new Date().toDateString();
    return followups.some(f => 
      f.follow_up_status === 'pending' && 
      new Date(f.follow_up_date).toDateString() === today
    );
  };

  const handleCall = async (lead) => {
    window.open(`tel:${lead.phone}`, '_self');
    try {
      await api.post(`agent/${lead.id}/log-call/`);
    } catch (err) {
      console.error("Failed to log call metric:", err);
    }
  };

  // --- FILTERING LOGIC ---

  const filteredByStatus = allLeads.filter((lead) => {
    const s = lead.status ? lead.status.toLowerCase() : "";
    if (activeTab === "Converted") return s === "converted";
    if (activeTab === "Not Interested") return s === "not_interested";
    
    // For active tabs, exclude closed/converted leads
    if (s === "converted" || s === "not_interested") return false;

    if (activeTab === "New") return s === "new";
    if (activeTab === "Follow-Up") return s === "follow_up";
    return true; // All Leads (Active)
  });

  const finalLeads = filteredByStatus.filter((lead) => {
    if (activeTab === "Converted") {
      const ps = lead.payment_status ? lead.payment_status.toLowerCase() : "pending";
      return ps === priorityTab.toLowerCase();
    }
    if (activeTab === "Not Interested") return true;
    
    const p = lead.priority ? lead.priority.toLowerCase() : "hot";
    return p === priorityTab.toLowerCase();
  });

  const getStatusStyle = (status) => {
    const base = { padding: "4px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "bold", textTransform: "capitalize" };
    if (status === "new") return { ...base, backgroundColor: "#dcfce7", color: "#166534" };
    if (status === "follow_up") return { ...base, backgroundColor: "#fef9c3", color: "#854d0e" };
    if (status === "not_interested") return { ...base, backgroundColor: "#fee2e2", color: "#991b1b" };
    if (status === "converted") return { ...base, backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #166534" };
    return { ...base, backgroundColor: "#f1f5f9", color: "#475569" };
  };

  const showSubTabs = activeTab !== "Not Interested";
  const subTabOptions = activeTab === "Converted" ? ["Pending", "Paid"] : ["Hot", "Warm", "Cold"];

  if (isLoading && allLeads.length === 0) {
    return <div style={styles.loading}>Syncing Leads...</div>;
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Leads Management</h1>
          <button style={styles.newLeadBtn}>+ New Lead</button>
        </div>

        <div style={styles.card}>
          {/* Main Status Tabs */}
          <div style={styles.tabRow}>
            {["All Leads", "New", "Follow-Up", "Not Interested", "Converted"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                style={activeTab === tab ? styles.activeTab : styles.tab}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sub-Tabs (Priority or Payment Status) */}
          {showSubTabs && (
            <div style={styles.subTabRow}>
              {subTabOptions.map((sub) => (
                <button 
                  key={sub} 
                  onClick={() => setPriorityTab(sub)} 
                  style={priorityTab === sub ? styles.activeSubTab : styles.subTab}
                >
                  {sub} {priorityTab === sub && <span style={styles.badge}>{finalLeads.length}</span>}
                </button>
              ))}
            </div>
          )}

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={{padding: '12px 20px'}}>NAME</th>
                  <th>CONTACT</th>
                  <th>VEHICLE / TYPE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {finalLeads.length > 0 ? (
                  finalLeads.map((lead) => (
                    <tr key={lead.id} style={styles.tr}>
                      <td style={styles.tdName}>
                        <div style={styles.nameContainer}>
                          <div style={styles.avatar}>{lead.name.charAt(0)}</div>
                          <div>
                             <div style={{fontWeight: '700', color: '#1e293b'}}>{lead.name}</div>
                             {isDueToday(lead.followups) && lead.status !== 'converted' && (
                               <div style={styles.dueBadge}>ATTEND TODAY</div>
                             )}
                          </div>
                        </div>
                      </td>
                      <td style={styles.tdText}>{lead.phone}</td>
                      <td style={styles.tdText}>
                        <div style={{fontWeight: '600', color: '#334155'}}>
                            {lead.motor_details?.make} {lead.motor_details?.model}
                        </div>
                        <div style={{fontSize: '0.7rem', color: '#94a3b8'}}>
                            {lead.insurance_type?.toUpperCase()}
                        </div>
                      </td>
                      <td>
                        <span style={getStatusStyle(lead.status)}>{lead.status}</span>
                      </td>
                      <td>
                        <div style={styles.actionGroup}>
                          {lead.status !== 'converted' && lead.status !== 'not_interested' && (
                            <>
                              <button style={styles.callBtn}>Call</button>
                              <button style={styles.processBtn} onClick={() => navigate(`/lead/${lead.id}/process/`)}>Process</button>
                            </>
                          )}
                          <button style={styles.viewBtn} onClick={() => navigate(`/lead/${lead.id}`)}>View</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={styles.noData}>No leads in this section.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f1f5f9", minHeight: "100vh", paddingTop: "80px", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" },
  title: { fontSize: "1.6rem", fontWeight: "800", color: "#0f172a" },
  newLeadBtn: { backgroundColor: "#fbbf24", color: "#000", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  card: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" },
  tabRow: { display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 10px" },
  tab: { padding: "18px 20px", border: "none", background: "none", cursor: "pointer", color: "#64748b", fontWeight: "600", fontSize: "0.9rem" },
  activeTab: { padding: "18px 20px", border: "none", background: "none", color: "#2563eb", fontWeight: "700", fontSize: "0.9rem", borderBottom: "3px solid #2563eb", cursor: "pointer" },
  subTabRow: { display: "flex", gap: "25px", padding: "15px 30px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  subTab: { border: "none", background: "none", cursor: "pointer", color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600" },
  activeSubTab: { border: "none", background: "none", color: "#2563eb", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer" },
  badge: { backgroundColor: "#2563eb", color: "white", padding: "2px 8px", borderRadius: "10px", fontSize: "0.7rem", marginLeft: "5px" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { textAlign: "left", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "0.75rem" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  tdName: { padding: "16px 20px", color: "#1e293b" },
  nameContainer: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "32px", height: "32px", backgroundColor: "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", color: "#64748b" },
  tdText: { padding: "16px 20px", color: "#64748b", fontSize: "0.9rem" },
  dueBadge: { fontSize: "0.6rem", backgroundColor: "#ef4444", color: "white", padding: "2px 6px", borderRadius: "4px", fontWeight: "900", marginTop: "4px", display: "inline-block" },
  actionGroup: { display: "flex", gap: "8px" },
  callBtn: { backgroundColor: "#10b981", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "600", fontSize: "0.75rem", cursor: "pointer" },
  processBtn: { backgroundColor: "#f59e0b", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "600", fontSize: "0.75rem", cursor: "pointer" },
  viewBtn: { backgroundColor: "#3b82f6", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "600", fontSize: "0.75rem", cursor: "pointer" },
  noData: { padding: "40px", textAlign: "center", color: "#94a3b8", fontStyle: "italic" },
  loading: { textAlign: "center", marginTop: "100px", color: "#64748b" }
};

export default Leads;
