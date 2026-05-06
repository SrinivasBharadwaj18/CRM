import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchLeads } from "../features/leads/leadSlice";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { Search, Filter, Phone, Eye, PhoneForwarded } from "lucide-react"; // Recommended icons

function Leads() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const allLeads = useSelector((state) => state.leads?.items) || [];
  const isLoading = useSelector((state) => state.leads?.loading);

  const [activeTab, setActiveTab] = useState("All Leads");
  const [priorityTab, setPriorityTab] = useState("Hot");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab);
  }, [location.state]);

  const handleCall = async (lead) => {
    window.open(`tel:${lead.phone}`, '_self');
    try { await api.post(`agent/${lead.id}/log-call/`); } catch (err) { console.error(err); }
  };

  // Filtering Logic
  const filteredLeads = allLeads.filter((lead) => {
    const s = lead.status ? lead.status.toLowerCase() : "";
    const nameMatch = lead.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!nameMatch) return false;
    if (activeTab === "Converted") return s === "converted";
    if (activeTab === "Not Interested") return s === "not_interested";
    if (s === "converted" || s === "not_interested") return false;
    if (activeTab === "New") return s === "new";
    if (activeTab === "Follow-Up") return s === "follow_up";
    return true;
  }).filter((lead) => {
    if (activeTab === "Converted" || activeTab === "Not Interested") return true;
    const p = lead.priority ? lead.priority.toLowerCase() : "hot";
    return p === priorityTab.toLowerCase();
  });

  const getStatusStyle = (status) => {
    const base = { padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600" };
    if (status === "new") return { ...base, backgroundColor: "#dcfce7", color: "#15803d" };
    if (status === "follow_up") return { ...base, backgroundColor: "#fef3c7", color: "#b45309" };
    return { ...base, backgroundColor: "#f1f5f9", color: "#475569" };
  };

  return (
    <div style={styles.page}>
      <div style={styles.topHeader}>
        <h2 style={styles.breadcrumb}>Agent Dashboard <span style={{color: '#94a3b8', fontWeight: '400'}}>›</span> Leads</h2>
        <div style={styles.headerIcons}>
          <div style={styles.iconCircle}>🔔</div>
          <div style={styles.iconCircle}>⚙️</div>
          <div style={styles.userAvatar}>JD</div>
        </div>
      </div>

      <main style={styles.container}>
        {/* Search and Action Row */}
        <div style={styles.actionRow}>
          <div style={styles.searchContainer}>
            <Search size={18} style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={styles.headerRight}>
            <button style={styles.filterBtn}><Filter size={16} /> Filters</button>
            <button style={styles.newLeadBtn}>+ New Lead</button>
          </div>
        </div>

        <div style={styles.card}>
          {/* Status Tabs */}
          <div style={styles.tabRow}>
            {["All Leads", "New", "Follow-Up", "Not Interested", "Hot"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                style={activeTab === tab ? styles.activeTab : styles.tab}
              >
                {tab} {tab === "All Leads" && <span style={styles.countBadge}>{allLeads.length}</span>}
              </button>
            ))}
          </div>

          {/* Sub Tabs */}
          <div style={styles.subTabRow}>
            {["Hot", "Warm", "Cold"].map((sub) => (
              <button 
                key={sub} 
                onClick={() => setPriorityTab(sub)} 
                style={priorityTab === sub ? styles.activeSubTab : styles.subTab}
              >
                {sub}
              </button>
            ))}
          </div>

          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={{paddingLeft: '25px'}}>NAME</th>
                <th>CONTACT</th>
                <th>SOURCE</th>
                <th>STATUS</th>
                <th>LAST CONTACT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} style={styles.tr}>
                  <td style={{paddingLeft: '25px', fontWeight: '600', color: '#1e293b'}}>{lead.name}</td>
                  <td style={styles.tdText}>{lead.phone}</td>
                  <td style={styles.tdText}>{lead.source || "Web Form"}</td>
                  <td><span style={getStatusStyle(lead.status)}>{lead.status}</span></td>
                  <td style={styles.tdText}>2 hrs ago</td>
                  <td>
                    <div style={styles.actionGroup}>
                      <button style={styles.callBtn} onClick={() => handleCall(lead)}><Phone size={14}/> Call</button>
                      <button style={styles.processBtn} onClick={() => navigate(`/lead/${lead.id}/process/`)}><PhoneForwarded size={14}/> Call</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={styles.pagination}>
            <span style={{fontSize: '0.8rem', color: '#64748b'}}>Showing 1 to 10 of {filteredLeads.length} leads</span>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { backgroundColor: "#f8fafc", minHeight: "100vh" },
  topHeader: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    padding: '15px 30px', backgroundColor: '#3b82f6', color: 'white' 
  },
  breadcrumb: { fontSize: '1rem', fontWeight: '700', margin: 0 },
  headerIcons: { display: 'flex', gap: '15px', alignItems: 'center' },
  iconCircle: { cursor: 'pointer', fontSize: '1.2rem' },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  container: { padding: "30px" },
  actionRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  searchContainer: { position: 'relative', width: '400px' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  searchInput: { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' },
  headerRight: { display: 'flex', gap: '12px' },
  filterBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600' },
  newLeadBtn: { backgroundColor: "#fbbf24", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
  card: { backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: 'hidden' },
  tabRow: { display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 10px" },
  tab: { padding: "15px 20px", border: "none", background: "none", cursor: "pointer", color: "#64748b", fontWeight: "600" },
  activeTab: { padding: "15px 20px", border: "none", background: "none", color: "#1e40af", fontWeight: "700", borderBottom: "3px solid #1e40af" },
  countBadge: { color: '#94a3b8', fontWeight: '400', marginLeft: '4px' },
  subTabRow: { display: "flex", gap: "20px", padding: "12px 25px", borderBottom: "1px solid #f1f5f9" },
  subTab: { border: "none", background: "none", color: "#94a3b8", fontWeight: "600", cursor: "pointer", fontSize: '0.85rem' },
  activeSubTab: { border: "none", background: "none", color: "#3b82f6", fontWeight: "700", borderBottom: '2px solid #3b82f6', fontSize: '0.85rem' },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { textAlign: "left", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "0.75rem", height: '45px' },
  tr: { borderBottom: "1px solid #f1f5f9", height: '60px' },
  tdText: { color: "#475569", fontSize: "0.85rem" },
  actionGroup: { display: "flex", gap: "8px" },
  callBtn: { backgroundColor: "#3b82f6", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' },
  processBtn: { backgroundColor: "#10b981", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' },
  pagination: { padding: '15px 25px', borderTop: '1px solid #f1f5f9' }
};

export default Leads;