import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchLeads } from "../features/leads/leadSlice";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { Search, Filter, Phone, Eye, ArrowRightCircle, ChevronLeft, ChevronRight } from "lucide-react"; 

function Leads() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const allLeads = useSelector((state) => state.leads?.items) || [];
  const isLoading = useSelector((state) => state.leads?.loading);

  const [activeTab, setActiveTab] = useState("All Leads");
  const [priorityTab, setPriorityTab] = useState("Hot");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  // Reset to page 1 when tabs or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, priorityTab, searchQuery]);

  const handleCall = async (lead) => {
    window.open(`tel:${lead.phone}`, '_self');
    try { await api.post(`agent/${lead.id}/log-call/`); } catch (err) { console.error(err); }
  };

  // Filter Logic
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusStyle = (status) => {
    const base = { padding: "4px 12px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700", textTransform: 'uppercase' };
    if (status === "new") return { ...base, backgroundColor: "#dcfce7", color: "#166534" };
    if (status === "follow_up") return { ...base, backgroundColor: "#fef3c7", color: "#92400e" };
    if (status === "converted") return { ...base, backgroundColor: "#dcfce7", color: "#15803d", border: '1px solid #166534' };
    return { ...base, backgroundColor: "#f1f5f9", color: "#475569" };
  };

  return (
    <div style={styles.page}>
      <div style={styles.topHeader}>
        <h2 style={styles.breadcrumb}>Agent Dashboard <span style={{color: '#94a3b8', fontWeight: '400', margin: '0 8px'}}>›</span> Leads</h2>
        <div style={styles.headerIcons}>
          <div style={styles.iconCircle}>🔔</div>
          <div style={styles.iconCircle}>⚙️</div>
          <div style={styles.userAvatar}>A</div>
        </div>
      </div>

      <main style={styles.container}>
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

          {activeTab !== "Converted" && activeTab !== "Not Interested" && (
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
          )}

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={{paddingLeft: '25px'}}>NAME</th>
                  <th>CONTACT</th>
                  <th>SOURCE</th>
                  <th>STATUS</th>
                  <th style={{textAlign: 'center'}}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentLeads.map((lead) => (
                  <tr key={lead.id} style={styles.tr}>
                    <td style={{paddingLeft: '25px'}}>
                      <div style={{fontWeight: '700', color: '#1e293b'}}>{lead.name}</div>
                      <div style={{fontSize: '0.7rem', color: '#64748b'}}>{lead.insurance_type || "MOTOR"}</div>
                    </td>
                    <td style={styles.tdText}>{lead.phone}</td>
                    <td style={styles.tdText}>{lead.source || "Web Form"}</td>
                    <td><span style={getStatusStyle(lead.status)}>{lead.status}</span></td>
                    <td>
                      <div style={styles.actionGroup}>
                        <button style={styles.callBtn} onClick={() => handleCall(lead)}><Phone size={14}/></button>
                        <button style={styles.processBtn} onClick={() => navigate(`/lead/${lead.id}/process/`)}><ArrowRightCircle size={14}/></button>
                        <button style={styles.viewBtn} onClick={() => navigate(`/lead/${lead.id}`)}><Eye size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Subtle Pagination Footer */}
          <div style={styles.pagination}>
            <span style={{fontSize: '0.85rem', color: '#64748b'}}>
              Showing <b>{indexOfFirstItem + 1}</b> to <b>{Math.min(indexOfLastItem, filteredLeads.length)}</b> of {filteredLeads.length} leads
            </span>
            <div style={styles.paginationControls}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.4 : 1}}
              >
                <ChevronLeft size={18} />
              </button>
              <span style={styles.pageNumber}>Page {currentPage} of {totalPages || 1}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{...styles.pageBtn, opacity: (currentPage === totalPages || totalPages === 0) ? 0.4 : 1}}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  // ... previous styles remain same ...
  page: { backgroundColor: "#f1f5f9", minHeight: "100vh" },
  topHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 30px', backgroundColor: '#2563eb', color: 'white' },
  breadcrumb: { fontSize: '0.9rem', fontWeight: '700', margin: 0 },
  headerIcons: { display: 'flex', gap: '18px', alignItems: 'center' },
  iconCircle: { cursor: 'pointer', fontSize: '1.1rem' },
  userAvatar: { width: '30px', height: '30px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  container: { padding: "25px" },
  actionRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  searchContainer: { position: 'relative', width: '350px' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  searchInput: { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' },
  headerRight: { display: 'flex', gap: '10px' },
  filterBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600' },
  newLeadBtn: { backgroundColor: "#fbbf24", border: "none", padding: "8px 20px", borderRadius: "6px", fontWeight: "700", cursor: "pointer" },
  card: { backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  tabRow: { display: "flex", borderBottom: "1px solid #e2e8f0", padding: "0 15px" },
  tab: { padding: "18px 20px", border: "none", background: "none", cursor: "pointer", color: "#64748b", fontWeight: "600" },
  activeTab: { padding: "18px 20px", border: "none", background: "none", color: "#2563eb", fontWeight: "700", borderBottom: "3px solid #2563eb" },
  subTabRow: { display: "flex", gap: "25px", padding: "12px 30px", borderBottom: "1px solid #f8fafc" },
  subTab: { border: "none", background: "none", color: "#94a3b8", fontWeight: "600", cursor: "pointer", fontSize: '0.8rem' },
  activeSubTab: { border: "none", background: "none", color: "#2563eb", fontWeight: "700", borderBottom: '2px solid #2563eb', fontSize: '0.8rem' },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { textAlign: "left", backgroundColor: "#f8fafc", color: "#64748b", fontSize: "0.7rem", letterSpacing: '0.05em' },
  tr: { borderBottom: "1px solid #f1f5f9" },
  tdText: { color: "#475569", fontSize: "0.85rem", padding: '16px 0' },
  actionGroup: { display: "flex", gap: "6px", justifyContent: 'center' },
  callBtn: { backgroundColor: "#2563eb", color: "white", border: "none", padding: "6px", borderRadius: "4px", cursor: 'pointer' },
  processBtn: { backgroundColor: "#10b981", color: "white", border: "none", padding: "6px", borderRadius: "4px", cursor: 'pointer' },
  viewBtn: { backgroundColor: "#f59e0b", color: "white", border: "none", padding: "6px", borderRadius: "4px", cursor: 'pointer' },
  
  // New Pagination Styles
  pagination: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '15px 25px', 
    borderTop: '1px solid #f1f5f9',
    backgroundColor: '#fff',
    borderBottomLeftRadius: '10px',
    borderBottomRightRadius: '10px'
  },
  paginationControls: { display: 'flex', alignItems: 'center', gap: '15px' },
  pageBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '32px', 
    height: '32px', 
    borderRadius: '6px', 
    border: '1px solid #e2e8f0', 
    backgroundColor: '#fff', 
    cursor: 'pointer',
    color: '#64748b',
    transition: 'all 0.2s'
  },
  pageNumber: { fontSize: '0.85rem', color: '#475569', fontWeight: '600' }
};

export default Leads;