import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../features/dashboard/dashboardSlice";
import api from "../services/api";
import { 
  PhoneCall, 
  CircleDollarSign, 
  Bell, 
  Settings, 
  UserCircle, 
  Headphones, 
  Mic, 
  PhoneOff, 
  ChevronDown 
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data, loading } = useSelector((state) => state.dashboard);
  
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  useEffect(() => {
    if (data?.is_checked_in) {
      setIsCheckedIn(true);
    }
  }, [data?.is_checked_in]);

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      await api.post("agent/check-in/");
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
    <div style={styles.dashboardWrapper}>
      {/* Top Header - Exact match to image_19f1e1.jpg */}
      <header style={styles.header}>
        <h1 style={styles.welcomeText}>Welcome, {data.agent_name || 'Sarah'}!</h1>
        <div style={styles.headerIcons}>
          <div style={styles.headerCircle}><Bell size={20} /></div>
          <div style={styles.headerCircle}><Settings size={20} /></div>
          <div style={styles.headerCircle}><UserCircle size={20} /></div>
        </div>
      </header>

      <div style={styles.contentBody}>
        {/* Statistics Bar */}
        <div style={styles.topStatsRow}>
          <span style={{ color: '#64748b' }}>Today's Stats:</span>
          <span style={styles.statItem}>Calls Made: <b style={styles.statVal}>{data.header_stats?.calls || 25}</b></span>
          <span style={styles.pipe}>|</span>
          <span style={styles.statItem}>Sales Closed: <b style={styles.statVal}>{data.header_stats?.sales || 4}</b></span>
          <span style={styles.pipe}>|</span>
          <span style={styles.statItem}>Follow-ups: <b style={styles.statVal}>{data.header_stats?.followups_completed || 6}</b></span>
        </div>

        {/* Row 1: KPI Cards */}
        <div style={styles.kpiGrid}>
          <MetricCard title="New Leads" value={data.cards?.new_leads || "12"} />
          <MetricCard title="Pending Follow-Ups" value={data.cards?.pending_followups || "8"} />
          <MetricCard title="Today's Sales" value={`₹${data.revenue?.total_premium || "35,000"}`} />
          
          <div style={styles.card}>
            <div style={styles.targetWidget}>
              <div>
                <p style={styles.cardLabel}>Monthly Target Progress</p>
                <div style={styles.progressBase}>
                  <div style={{ ...styles.progressFill, width: `${data.cards?.target_progress || 60}%` }} />
                </div>
              </div>
              <div style={styles.progressRing}>
                <span style={styles.ringText}>{data.cards?.target_progress || 60}%</span>
                <svg width="56" height="56" viewBox="0 0 36 36">
                  <path fill="none" stroke="#f1f5f9" strokeWidth="3.5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path fill="none" stroke="#22c55e" strokeWidth="3.5" strokeDasharray={`${data.cards?.target_progress || 60}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Call Performance & Live Call Controls */}
        <div style={styles.middleGrid}>
          <div style={{ ...styles.card, gridColumn: 'span 2', padding: 0, overflow: 'hidden' }}>
            <div style={styles.blueBanner}>Call Status</div>
            <div style={styles.performanceFlex}>
              <RingDisplay label="Connected Calls" value={data.call_metrics?.connected || 18} color="#2dd4bf" />
              <RingDisplay label="Missed Calls" value={data.call_metrics?.no_answer || 5} color="#fb923c" />
              <div style={styles.durationBox}>
                <div style={styles.arcWidget}>{data.call_metrics?.avg_duration || "3m 15s"}</div>
                <p style={styles.tinyLabel}>Avg Call Duration</p>
              </div>
            </div>
          </div>

          <div style={styles.liveCallCard}>
             <div style={styles.liveTitleBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={styles.redDot} /> Live Call</div>
                <div style={styles.metaFlex}><Settings size={14} /><ChevronDown size={14} /></div>
             </div>
             <div style={styles.callerProfile}>
                <div style={styles.avatarWrap}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" alt="avatar" style={{ width: '100%' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Rajesh Kumar</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>00:12</div>
                </div>
             </div>
             <div style={styles.btnRow}>
                <button style={styles.greenBtn}><Headphones size={14}/> Listen</button>
                <button style={styles.tealBtn}><Mic size={14}/> Whisper</button>
                <button style={styles.redBtn}><PhoneOff size={14}/> End Call</button>
             </div>
             {!isCheckedIn && (
               <button onClick={handleCheckIn} style={styles.checkInMask}>
                 {checkInLoading ? 'Syncing...' : 'Check-in to Start Session'}
               </button>
             )}
          </div>
        </div>

        {/* Row 3: Bottom Grids */}
        <div style={styles.bottomGrid}>
          <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
            <div style={styles.widgetHeader}>
              <span>Lead List</span>
              <div style={styles.metaFlex}><Settings size={14}/><ChevronDown size={14}/></div>
            </div>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr><th>Name</th><th>Contact</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody style={styles.tbody}>
                <LeadRow name="Anil Verma" phone="9876543210" status="New" color="#22c55e" />
                <LeadRow name="Priya Shah" phone="9856231470" status="Follow-Up" color="#fb923c" />
                <LeadRow name="Shakh Tagiar" phone="9856231470" status="New" color="#22c55e" />
              </tbody>
            </table>
          </div>

          <div style={styles.stack}>
            <div style={styles.card}>
              <div style={styles.widgetHeader}>
                <span>Follow-Ups & Tasks</span>
                <div style={styles.metaFlex}><Settings size={14}/><ChevronDown size={14}/></div>
              </div>
              <div style={styles.listContainer}>
                 <TaskItem checked text="Follow Up with Pooja Tomorrow" />
                 <TaskItem checked text="Send Policy Info to Mr. Singh" />
                 <TaskItem text="Prepare Report for TL" />
                 <TaskItem text="Email Confirmation to Client" />
              </div>
            </div>
            <div style={styles.card}>
              <span style={styles.sectionTitle}>Script & Notes</span>
              <p style={styles.scriptNote}><b>Intro:</b> "Hello, this is Sarah from XYZ Insurance..."</p>
              <p style={styles.scriptNote}><b>Notes:</b> Interested in term plan, call back at 5 PM.</p>
            </div>
          </div>

          <div style={styles.stack}>
            <div style={styles.card}>
              <span style={styles.sectionTitle}>Performance Overview</span>
              <div style={styles.timeLabel}>Today</div>
              <div style={styles.splitRow}><span>Sales: <b>₹35,000</b></span> <span>Calls: <b>25</b></span></div>
              <div style={styles.underlinedRow}><span>Conversion: <b>16%</b></span></div>
              <div style={{ ...styles.timeLabel, marginTop: '10px' }}>This Month</div>
              <div style={styles.splitRow}><span>Sales: <b>₹1,20,000</b></span> <span>Conversion: <b>22%</b></span></div>
            </div>
            <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
              <div style={styles.earningsHeader}><CircleDollarSign size={14}/> My Earnings <ChevronDown size={12} style={{ marginLeft: 'auto' }}/></div>
              <div style={{ padding: '15px' }}>
                 <div style={styles.splitRow}><span>Commission :</span> <b>₹12,500</b></div>
                 <div style={styles.splitRow}><span>Bonuses :</span> <b>₹3,000</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Atomic Components
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

const LeadRow = ({ name, phone, status, color }) => (
  <tr style={styles.rowBorder}>
    <td style={styles.tdStrong}>{name}</td>
    <td style={styles.tdDim}>{phone}</td>
    <td style={styles.td}><span style={{ ...styles.pill, backgroundColor: color }}>{status}</span></td>
    <td style={styles.td}><button style={styles.callBtn}><PhoneCall size={10}/> Call</button></td>
  </tr>
);

const TaskItem = ({ checked, text }) => (
  <div style={styles.taskLine}>
    <div style={{ ...styles.checkCircle, ...(checked ? styles.checkOn : {}) }}>
      {checked && <div style={styles.dot} />}
    </div>
    <span style={{ color: checked ? '#1e293b' : '#94a3b8' }}>{text}</span>
  </div>
);

const styles = {
  dashboardWrapper: { display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh' },
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
  progressBase: { width: '120px', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '10px' },
  progressFill: { height: '100%', backgroundColor: '#14b8a6', borderRadius: '10px' },
  progressRing: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', fontSize: '12px', fontWeight: 'bold' },
  middleGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' },
  blueBanner: { background: 'linear-gradient(to right, #1e4eb8, #3b82f6)', padding: '12px 20px', color: 'white', fontWeight: 'bold', fontSize: '14px' },
  performanceFlex: { display: 'flex', justifyContent: 'space-around', padding: '25px 0' },
  ringBox: { width: '75px', height: '75px', borderRadius: '50%', border: '6px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' },
  durationBox: { textAlign: 'center' },
  arcWidget: { width: '90px', height: '45px', borderTop: '8px solid #3b82f6', borderLeft: '8px solid #3b82f6', borderRight: '8px solid #3b82f6', borderRadius: '100px 100px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', paddingBottom: '4px' },
  tinyLabel: { fontSize: '10px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginTop: '10px' },
  liveCallCard: { backgroundColor: '#1e4eb8', borderRadius: '12px', color: 'white', padding: '20px', position: 'relative', boxShadow: '0 8px 15px rgba(30,78,184,0.15)' },
  liveTitleBar: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' },
  redDot: { width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 5px #ef4444' },
  callerProfile: { display: 'flex', gap: '15px', alignItems: 'center', margin: '20px 0' },
  avatarWrap: { width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white' },
  btnRow: { display: 'flex', gap: '8px' },
  greenBtn: { flex: 1, padding: '8px', border: 'none', backgroundColor: '#22c55e', color: 'white', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' },
  tealBtn: { flex: 1, padding: '8px', border: 'none', backgroundColor: '#14b8a6', color: 'white', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' },
  redBtn: { flex: 1, padding: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' },
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
  callBtn: { backgroundColor: '#1e4eb8', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' },
  stack: { display: 'flex', flexDirection: 'column', gap: '20px' },
  taskLine: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', marginBottom: '12px' },
  checkCircle: { width: '16px', height: '16px', border: '1px solid #cbd5e1', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: '#14b8a6', borderColor: '#14b8a6' },
  dot: { width: '4px', height: '4px', backgroundColor: 'white', borderRadius: '50%' },
  sectionTitle: { fontWeight: 'bold', color: '#1e4eb8', fontSize: '13px', display: 'block', marginBottom: '10px' },
  scriptNote: { fontSize: '12px', color: '#64748b', margin: '5px 0' },
  timeLabel: { fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' },
  splitRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '4px 0' },
  underlinedRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' },
  earningsHeader: { backgroundColor: '#1e4eb8', padding: '10px 15px', color: 'white', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' },
  metaFlex: { display: 'flex', gap: '8px', color: '#94a3b8' },
  loading: { textAlign: 'center', padding: '100px', color: '#64748b' }
};

export default Dashboard;