import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../features/dashboard/dashboardSlice";
import api from "../services/api";
import { 
  PhoneCall, CircleDollarSign, Bell, Settings, 
  UserCircle, Headphones, Mic, PhoneOff, ChevronDown 
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: stats, loading: statsLoading } = useSelector((state) => state.dashboard);
  
  // State for data from the specific views you shared
  const [leads, setLeads] = useState([]);
  const [tasksData, setTasksData] = useState({ results: [] });
  const [earningsData, setEarningsData] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    loadIntegratedData();
  }, [dispatch]);

  const loadIntegratedData = async () => {
    try {
      const [leadsRes, tasksRes, earningsRes] = await Promise.all([
        api.get("agent/leads/"),           // From agent_leads view
        api.get("agent/tasks/?limit=4"),   // From agent_tasks_list (paginated)
        api.get("agent/earnings-dashboard/") // From AgentEarningsDashboardView
      ]);
      setLeads(leadsRes.data);
      setTasksData(tasksRes.data);
      setEarningsData(earningsRes.data);
    } catch (err) {
      console.error("Failed to sync dashboard data:", err);
    }
  };

  useEffect(() => {
    if (stats?.is_checked_in) setIsCheckedIn(true);
  }, [stats?.is_checked_in]);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      await api.post("agent/check-in/");
      setIsCheckedIn(true);
      dispatch(fetchDashboardStats()); 
    } catch (err) {
      alert("Check-in failed");
    } finally {
      setCheckInLoading(false);
    }
  };

  if (statsLoading || !stats) return <div style={styles.loading}>Syncing Dashboard...</div>;

  return (
    <div style={styles.dashboardWrapper}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.welcomeText}>Welcome, {stats.agent_name || 'Agent'}!</h1>
        <div style={styles.headerIcons}>
          <div style={styles.headerCircle}><Bell size={20} /></div>
          <div style={styles.headerCircle}><Settings size={20} /></div>
          <div style={styles.headerCircle}><UserCircle size={20} /></div>
        </div>
      </header>

      <div style={styles.contentBody}>
        {/* Top Stats Bar */}
        <div style={styles.topStatsRow}>
          <span style={{ color: '#64748b' }}>Today's Stats:</span>
          <span style={styles.statItem}>Calls: <b style={styles.statVal}>{stats.header_stats?.calls || 0}</b></span>
          <span style={styles.pipe}>|</span>
          <span style={styles.statItem}>Sales: <b style={styles.statVal}>{stats.header_stats?.sales || 0}</b></span>
          <span style={styles.pipe}>|</span>
          <span style={styles.statItem}>Follow-ups: <b style={styles.statVal}>{stats.header_stats?.followups_completed || 0}</b></span>
        </div>

        {/* Row 1: KPI Cards */}
        <div style={styles.kpiGrid}>
          <MetricCard title="New Leads" value={stats.cards?.new_leads || 0} />
          <MetricCard title="Pending Follow-Ups" value={stats.cards?.pending_followups || 0} />
          <MetricCard title="Today's Sales" value={`₹${stats.revenue?.total_premium || 0}`} />
          <div style={styles.card}>
            <div style={styles.targetWidget}>
              <div>
                <p style={styles.cardLabel}>Target Progress</p>
                <div style={styles.progressBase}>
                  <div style={{ ...styles.progressFill, width: `${stats.cards?.target_progress || 0}%` }} />
                </div>
              </div>
              <div style={styles.progressRing}>
                <span style={styles.ringText}>{stats.cards?.target_progress || 0}%</span>
                <svg width="56" height="56" viewBox="0 0 36 36">
                  <path fill="none" stroke="#f1f5f9" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${stats.cards?.target_progress || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Call Performance & Live Call Interaction */}
        <div style={styles.middleGrid}>
          <div style={{ ...styles.card, gridColumn: 'span 2', padding: 0, overflow: 'hidden' }}>
            <div style={styles.blueBanner}>Call Status</div>
            <div style={styles.performanceFlex}>
              <RingDisplay label="Connected" value={stats.call_metrics?.connected || 0} color="#2dd4bf" />
              <RingDisplay label="Missed" value={stats.call_metrics?.no_answer || 0} color="#fb923c" />
              <div style={styles.durationBox}>
                <div style={styles.arcWidget}>{stats.call_metrics?.avg_duration || "0m"}</div>
                <p style={styles.tinyLabel}>Avg Call Duration</p>
              </div>
            </div>
          </div>

          <div style={styles.liveCallCard}>
             <div style={styles.liveTitleBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={styles.redDot} /> Live Call</div>
                <ChevronDown size={14} />
             </div>
             <div style={styles.callerProfile}>
                <div style={styles.avatarWrap}>{stats.agent_name?.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{stats.agent_name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>{isCheckedIn ? "Ready" : "Offline"}</div>
                </div>
             </div>
             <div style={styles.btnRow}>
                <button style={styles.greenBtn}><Headphones size={14}/> Listen</button>
                <button style={styles.redBtn}><PhoneOff size={14}/> End</button>
             </div>
             {!isCheckedIn && (
               <button onClick={handleCheckIn} style={styles.checkInMask}>
                 {checkInLoading ? '...' : 'Check-in to Start'}
               </button>
             )}
          </div>
        </div>

        {/* Row 3: Live Lists from the Backend Views */}
        <div style={styles.bottomGrid}>
          {/* Table populated from agent_leads view */}
          <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
            <div style={styles.widgetHeader}><span>Lead List</span><Settings size={14}/></div>
            <table style={styles.table}>
              <thead style={styles.thead}><tr><th>Name</th><th>Phone</th><th>Status</th></tr></thead>
              <tbody>
                {leads.slice(0, 3).map((l) => (
                  <tr key={l.id} style={styles.rowBorder}>
                    <td style={styles.tdStrong}>{l.name}</td>
                    <td style={styles.tdDim}>{l.phone}</td>
                    <td style={styles.td}><span style={{ ...styles.pill, backgroundColor: l.priority === 'hot' ? '#ef4444' : '#fb923c' }}>{l.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tasks from agent_tasks_list view */}
          <div style={styles.stack}>
            <div style={styles.card}>
              <div style={styles.widgetHeader}><span>Follow-Ups & Tasks</span><Settings size={14}/></div>
              <div style={styles.listContainer}>
                 {tasksData.results?.map(t => (
                   <TaskItem key={t.id} checked={t.is_completed} text={t.title} />
                 ))}
              </div>
            </div>
            <div style={styles.card}>
              <span style={styles.sectionTitle}>Script & Notes</span>
              <p style={styles.scriptNote}><b>Current Focus:</b> Follow up on pending health insurance renewals.</p>
              <p style={styles.scriptNote}><b>Lead Note:</b> {leads[0]?.last_note || "No notes for active leads."}</p>
            </div>
          </div>

          {/* Earnings from AgentEarningsDashboardView */}
          <div style={styles.stack}>
            <div style={styles.card}>
              <span style={styles.sectionTitle}>Performance Overview</span>
              <div style={styles.splitRow}><span>Target Month:</span> <b>{earningsData?.summary.month_display}</b></div>
              <div style={styles.splitRow}><span>Today Sales:</span> <b>₹{stats.revenue?.total_premium || 0}</b></div>
              <div style={styles.underlinedRow}><span>Conv Rate:</span> <b>{stats.cards?.target_progress || 0}%</b></div>
            </div>
            <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
              <div style={styles.earningsHeader}><CircleDollarSign size={14}/> {earningsData?.summary.month_display} Earnings</div>
              <div style={{ padding: '15px' }}>
                 <div style={styles.splitRow}><span>Base Salary :</span> <b>₹{earningsData?.summary.base_salary || 0}</b></div>
                 <div style={styles.splitRow}><span>Total Incentives :</span> <b>₹{earningsData?.summary.total_incentives || 0}</b></div>
                 <div style={{ ...styles.splitRow, borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '8px' }}>
                   <span><b>Total Payable :</b></span> <b>₹{earningsData?.summary.total_earnings || 0}</b>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Components
const MetricCard = ({ title, value }) => (
  <div style={styles.card}>
    <p style={styles.cardLabel}>{title}</p>
    <p style={styles.bigNum}>{value}</p>
  </div>
);

const RingDisplay = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ ...styles.ringBox, borderColor: color }}>{value}</div>
    <p style={styles.tinyLabel}>{label}</p>
  </div>
);

const TaskItem = ({ checked, text }) => (
  <div style={styles.taskLine}>
    <div style={{ ...styles.checkCircle, ...(checked ? styles.checkOn : {}) }}>{checked && <div style={styles.dot} />}</div>
    <span style={{ fontSize: '12px', color: checked ? '#1e293b' : '#94a3b8' }}>{text}</span>
  </div>
);

// CSS Object to mimic image_19f1e1.jpg
const styles = {
  dashboardWrapper: { display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', backgroundColor: '#f0f4f8' },
  header: { backgroundColor: '#1e4eb8', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { margin: 0, fontSize: '22px', fontWeight: '700' },
  headerIcons: { display: 'flex', gap: '12px' },
  headerCircle: { padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' },
  contentBody: { padding: '25px 30px' },
  topStatsRow: { display: 'flex', gap: '20px', marginBottom: '25px', fontSize: '13px', alignItems: 'center' },
  statItem: { fontWeight: '500', color: '#475569' },
  statVal: { fontSize: '18px', color: '#1e293b', marginLeft: '4px' },
  pipe: { color: '#cbd5e1' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '25px' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  cardLabel: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', marginTop: 0 },
  bigNum: { fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1e293b' },
  targetWidget: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  progressBase: { width: '100px', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '10px' },
  progressFill: { height: '100%', backgroundColor: '#14b8a6', borderRadius: '10px' },
  progressRing: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', fontSize: '10px', fontWeight: 'bold' },
  middleGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' },
  blueBanner: { background: 'linear-gradient(to right, #1e4eb8, #3b82f6)', padding: '12px 20px', color: 'white', fontWeight: 'bold', fontSize: '14px' },
  performanceFlex: { display: 'flex', justifyContent: 'space-around', padding: '25px 0' },
  ringBox: { width: '75px', height: '75px', borderRadius: '50%', border: '6px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' },
  durationBox: { textAlign: 'center' },
  arcWidget: { width: '90px', height: '45px', borderTop: '8px solid #3b82f6', borderLeft: '8px solid #3b82f6', borderRight: '8px solid #3b82f6', borderRadius: '100px 100px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', paddingBottom: '4px' },
  tinyLabel: { fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginTop: '10px' },
  liveCallCard: { backgroundColor: '#1e4eb8', borderRadius: '12px', color: 'white', padding: '20px', position: 'relative' },
  liveTitleBar: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' },
  redDot: { width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' },
  callerProfile: { display: 'flex', gap: '15px', alignItems: 'center', margin: '20px 0' },
  avatarWrap: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  btnRow: { display: 'flex', gap: '8px' },
  greenBtn: { flex: 1, padding: '8px', border: 'none', backgroundColor: '#22c55e', color: 'white', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' },
  redBtn: { flex: 1, padding: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' },
  checkInMask: { position: 'absolute', inset: 0, backgroundColor: 'rgba(30,78,184,0.96)', borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  bottomGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  widgetHeader: { display: 'flex', justifyContent: 'space-between', padding: '12px 15px', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold', color: '#1e4eb8', fontSize: '13px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  thead: { backgroundColor: '#f8fafc', color: '#94a3b8', textAlign: 'left', textTransform: 'uppercase' },
  rowBorder: { borderBottom: '1px solid #f8fafc' },
  tdStrong: { padding: '12px', fontWeight: 'bold' },
  tdDim: { padding: '12px', color: '#64748b' },
  td: { padding: '12px' },
  pill: { padding: '2px 8px', borderRadius: '4px', color: 'white', fontSize: '10px', fontWeight: 'bold' },
  stack: { display: 'flex', flexDirection: 'column', gap: '20px' },
  taskLine: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  checkCircle: { width: '14px', height: '14px', border: '1px solid #cbd5e1', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: '#14b8a6', borderColor: '#14b8a6' },
  dot: { width: '4px', height: '4px', backgroundColor: 'white', borderRadius: '50%' },
  sectionTitle: { fontWeight: 'bold', color: '#1e4eb8', fontSize: '13px', display: 'block', marginBottom: '10px' },
  scriptNote: { fontSize: '11px', color: '#64748b', margin: '5px 0' },
  splitRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '4px 0' },
  underlinedRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' },
  earningsHeader: { backgroundColor: '#1e4eb8', padding: '10px 15px', color: 'white', fontSize: '11px', fontWeight: 'bold' },
  loading: { textAlign: 'center', padding: '100px', color: '#64748b' }
};

export default Dashboard;