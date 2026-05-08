import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDashboardStats } from "../features/dashboard/dashboardSlice";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading } = useSelector((state) => state.dashboard);
  
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Sync check-in state when data arrives
  useEffect(() => {
    if (data?.is_checked_in) {
      setIsCheckedIn(true);
    }
  }, [data?.is_checked_in]);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const res = await api.post("agent/check-in/");
      alert(res.data.message);
      setIsCheckedIn(true);
      dispatch(fetchDashboardStats()); 
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading || !data) return <div style={styles.loading}>Syncing Dashboard...</div>;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        
        {/* CHECK-IN BANNER */}
        {!isCheckedIn && (
          <div style={styles.checkInBanner}>
            <div style={styles.bannerText}>
              <span style={{ marginRight: '10px' }}>🕒</span>
              You haven't checked in for your shift yet.
            </div>
            <button 
              onClick={handleCheckIn} 
              style={styles.checkInBtn} 
              disabled={checkInLoading}
            >
              {checkInLoading ? "Processing..." : "Check-in Now"}
            </button>
          </div>
        )}

        {/* TOP WELCOME BAR */}
        <header style={styles.header}>
          <h1 style={styles.welcome}>Welcome, {data.agent_name || 'Agent'}!</h1>
          <div style={styles.headerStats}>
            <span style={{fontWeight: "bold", color: "#3b82f6"}}>Today's Effort:</span>
            <strong>📞 Calls: {data.header_stats?.calls || 0}</strong> | 
            <strong>💰 Sales: {data.header_stats?.sales || 0}</strong> | 
            <strong>✅ Done Follow-ups: {data.header_stats?.followups_completed || 0}</strong>
          </div>
        </header>

        {/* ROW 1: KPI CARDS */}
        <div style={styles.cardGrid}>
          <MetricCard 
            title="New Leads" 
            value={data.cards?.new_leads || 0} 
            onClick={() => navigate(`/agent/leads`, { state: { tab: 'New' } })} 
            color="#3b82f6" 
          />
          <MetricCard 
            title="Follow-Ups Due" 
            value={data.cards?.pending_followups || 0} 
            onClick={() => navigate(`/agent/leads`, { state: { tab: 'Follow-Up' } })} 
            color="#f59e0b" 
          />
          <MetricCard title="Personal Score" value={data.cards?.personal_score || 0} color="#10b981" />
          <MetricCard title="Target Progress" value={`${data.cards?.target_progress || 0}%`} color="#8b5cf6" />
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <div style={styles.mainGrid}>
          
          {/* CALL STATUS GAUGE */}
          <section style={{...styles.card, gridColumn: "span 2"}}>
            <h3 style={styles.cardTitle}>Daily Call Performance</h3>
            <div style={styles.gaugeContainer}>
              <Gauge label="Connected" value={data.call_metrics?.connected || 0} color="#10b981" />
              <Gauge label="No Answer" value={data.call_metrics?.no_answer || 0} color="#ef4444" />
              <Gauge label="Avg Duration" value={data.call_metrics?.avg_duration || "0m"} color="#3b82f6" />
            </div>
          </section>

          {/* LIVE STATUS CARD */}
          <section style={styles.liveCallCard}>
            <div style={styles.liveHeader}>📡 CURRENT STATUS</div>
            <div style={styles.liveBody}>
              <div style={styles.avatarLarge}>{data.agent_name?.charAt(0) || 'A'}</div>
              <div>
                <strong>{isCheckedIn ? "Online & Active" : "Offline"}</strong>
                <div style={{fontSize: "0.8rem", opacity: 0.8}}>
                    {isCheckedIn ? "Ready for new leads" : "Please check in"}
                </div>
              </div>
            </div>
            <div style={styles.liveActions}>
              <button style={styles.btnListen} onClick={() => navigate('/agent/leads')}>View All Leads</button>
            </div>
          </section>

          {/* RECENT ACTIVITY */}
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Recent Conversions</h3>
            {(data.recent_conversions || []).map((l, i) => (
              <div key={i} style={styles.listRow}>
                <span>{l.name}</span>
                <span style={getStatusBadge('converted')}>PAID</span>
              </div>
            ))}
          </section>

          {/* 🔥 PRIORITY SAVES */}
          <section style={styles.atRiskCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.atRiskTitle}>🔥 Priority Saves</h3>
              <p style={styles.atRiskSubtitle}>Scheduled calls due very soon</p>
            </div>

            <div style={styles.atRiskList}>
              {data.at_risk_leads && data.at_risk_leads.length > 0 ? (
                data.at_risk_leads.map((lead) => (
                  <div key={lead.id} style={styles.atRiskRow}>
                    <div style={styles.leadMain}>
                      <div style={styles.atRiskName}>{lead.name}</div>
                      <div style={styles.atRiskPhone}>{lead.phone}</div>
                    </div>
                    
                    <div style={styles.timerContainer}>
                      <span style={{
                          ...styles.timerText, 
                          color: lead.is_overdue ? '#ef4444' : '#f59e0b'
                      }}>
                        {lead.is_overdue ? "OVERDUE" : `Due in ${lead.minutes_left}m`}
                      </span>
                    </div>

                    <button 
                      style={styles.saveBtn}
                      onClick={() => navigate(`/lead/${lead.id}`)}
                    >
                      Open
                    </button>
                  </div>
                ))
              ) : (
                <div style={styles.emptyState}>
                  ✅ All scheduled calls are up to date!
                </div>
              )}
            </div>
          </section>

          {/* REVENUE OVERVIEW */}
          <section style={styles.card}>
            <h3 style={styles.cardTitle}>Earnings Summary</h3>
            <div style={styles.earningItem}>Total Premium: <strong>₹ {data.revenue?.total_premium || 0}</strong></div>
            <div style={styles.earningItem}>Pending Collection: <strong style={{color: '#f59e0b'}}>₹ {data.revenue?.pending_amount || 0}</strong></div>
          </section>

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
const MetricCard = ({ title, value, color, onClick }) => (
  <div 
    style={{
        ...styles.metricCard, 
        cursor: onClick ? 'pointer' : 'default',
    }} 
    onClick={onClick}
  >
    <div style={{...styles.indicator, backgroundColor: color}} />
    <div style={{color: "#64748b", fontSize: "0.8rem", fontWeight: "600"}}>{title}</div>
    <div style={{fontSize: "1.6rem", fontWeight: "800", marginTop: "5px"}}>{value}</div>
  </div>
);

const Gauge = ({ label, value, color }) => (
  <div style={{textAlign: "center"}}>
    <div style={{...styles.gauge, borderColor: color}}>{value}</div>
    <div style={{fontSize: "0.7rem", color: "#64748b", marginTop: "8px"}}>{label}</div>
  </div>
);

const getStatusBadge = (status) => ({
    fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold',
    backgroundColor: status === 'converted' ? '#dcfce7' : '#f1f5f9',
    color: status === 'converted' ? '#166534' : '#475569'
});

const styles = {
  page: { backgroundColor: "#f1f5f9", minHeight: "100vh", paddingTop: "80px", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "1300px", margin: "0 auto", padding: "20px" },
  checkInBanner: { backgroundColor: "#fffbeb", border: "1px solid #fef3c7", padding: "15px 25px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  bannerText: { color: "#92400e", fontWeight: "600", fontSize: "0.95rem" },
  checkInBtn: { backgroundColor: "#d97706", color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  header: { marginBottom: "20px" },
  welcome: { fontSize: "1.6rem", fontWeight: "800", color: "#0f172a" },
  headerStats: { display: "flex", gap: "15px", fontSize: "0.8rem", color: "#475569", marginTop: "10px", backgroundColor: "white", padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "25px" },
  metricCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", position: "absolute", border: "1px solid #e2e8f0", transition: "transform 0.2s", ":hover": { transform: "translateY(-2px)" } },
  metricCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", position: "relative", overflow: "hidden", border: "1px solid #e2e8f0" },
  indicator: { position: "absolute", top: 0, left: 0, width: "100%", height: "4px" },
  mainGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  card: { backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" },
  cardTitle: { fontSize: "0.9rem", fontWeight: "700", marginBottom: "15px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" },
  atRiskCard: { backgroundColor: "white", padding: "20px", borderRadius: "12px", border: "1px solid #fee2e2", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
  atRiskTitle: { margin: 0, fontSize: "0.9rem", fontWeight: "800", color: "#b91c1c" },
  atRiskSubtitle: { margin: "2px 0 15px 0", fontSize: "0.75rem", color: "#94a3b8" },
  atRiskRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f8fafc" },
  atRiskName: { fontSize: "0.85rem", fontWeight: "700", color: "#1e293b" },
  atRiskPhone: { fontSize: "0.7rem", color: "#64748b" },
  timerText: { fontSize: "0.8rem", fontWeight: "800" },
  saveBtn: { backgroundColor: "#1e293b", color: "white", border: "none", padding: "5px 12px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "600", cursor: "pointer" },
  emptyState: { padding: "30px", textAlign: "center", color: "#10b981", fontSize: "0.8rem", fontWeight: "600" },
  gaugeContainer: { display: "flex", justifyContent: "space-around" },
  gauge: { width: "65px", height: "65px", borderRadius: "50%", border: "5px solid", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.95rem" },
  liveCallCard: { backgroundColor: "#1e3a8a", color: "white", padding: "20px", borderRadius: "12px" },
  liveHeader: { fontSize: "0.75rem", fontWeight: "bold", marginBottom: "20px", opacity: 0.8 },
  liveBody: { display: "flex", gap: "15px", alignItems: "center", marginBottom: "25px" },
  avatarLarge: { width: "45px", height: "45px", borderRadius: "50%", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem" },
  liveActions: { display: "flex", gap: "10px" },
  btnListen: { flex: 1, padding: "10px", border: "none", borderRadius: "6px", backgroundColor: "#10b981", color: "white", fontWeight: "bold", cursor: "pointer" },
  listRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f8fafc", fontSize: "0.85rem" },
  earningItem: { padding: "8px 0", fontSize: "0.9rem" },
  loading: { textAlign: "center", marginTop: "100px", color: "#64748b" }
};

export default Dashboard;