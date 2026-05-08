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
        api.get("agent/leads/"),
        api.get("agent/tasks/?limit=4"),
        api.get("agent/earnings-dashboard/")
      ]);
      setLeads(leadsRes.data);
      setTasksData(tasksRes.data);
      setEarningsData(earningsRes.data);
    } catch (err) {
      console.error("Sync error:", err);
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
      <header style={styles.header}>
        <h1 style={styles.welcomeText}>Welcome, {stats.agent_name || 'Sarah'}!</h1>
        <div style={styles.headerIcons}>
          <div style={styles.headerCircle}><Bell size={20} /></div>
          <div style={styles.headerCircle}><Settings size={20} /></div>
          <div style={styles.headerCircle}><UserCircle size={20} /></div>
        </div>
      </header>

      <div style={styles.contentBody}>
        <div style={styles.topStatsRow}>
          <span style={{ color: '#546e7a', fontWeight: '500' }}>Today's Stats:</span>
          <span style={styles.statItem}>Calls Made: <b style={styles.statVal}>{stats.header_stats?.calls || 25}</b></span>
          <span style={styles.pipe}>|</span>
          <span style={styles.statItem}>Sales Closed: <b style={styles.statVal}>{stats.header_stats?.sales || 4}</b></span>
          <span style={styles.pipe}>|</span>
          <span style={styles.statItem}>Follow-ups: <b style={styles.statVal}>{stats.header_stats?.followups_completed || 6}</b></span>
        </div>

        <div style={styles.kpiGrid}>
          <MetricCard title="New Leads" value={stats.cards?.new_leads || "12"} />
          <MetricCard title="Pending Follow-Ups" value={stats.cards?.pending_followups || "8"} />
          <MetricCard title="Today's Sales" value={`₹${stats.revenue?.total_premium || "35,000"}`} />
          <div style={styles.card}>
            <div style={styles.targetWidget}>
              <div>
                <p style={styles.cardLabel}>Monthly Target Progress</p>
                <div style={styles.progressBase}>
                  <div style={{ ...styles.progressFill, width: `${stats.cards?.target_progress || 60}%` }} />
                </div>
              </div>
              <div style={styles.progressRing}>
                <span style={styles.ringText}>{stats.cards?.target_progress || 60}%</span>
                <svg width="60" height="60" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#eef2f6" strokeWidth="6" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#4caf50" strokeWidth="6" 
                          strokeDasharray={`${stats.cards?.target_progress || 60}, 100`} transform="rotate(-90 20 20)" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.middleGrid}>
          <div style={{ ...styles.card, gridColumn: 'span 2', padding: 0 }}>
            <div style={styles.blueBanner}>Call Status</div>
            <div style={styles.performanceFlex}>
              {/* Semi-Circle Gauges based on image_19f1e1.jpg */}
              <SemiCircleGauge label="Connected Calls" value={stats.call_metrics?.connected || 18} color="#26a69a" />
              <SemiCircleGauge label="Missed Calls" value={stats.call_metrics?.no_answer || 5} color="#ef5350" />
              <div style={styles.durationBox}>
                <div style={styles.arcWidget}>{stats.call_metrics?.avg_duration || "3m 15s"}</div>
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
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" alt="caller" style={{width:'100%'}} />
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Rajesh Kumar</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>00:12</div>
                </div>
             </div>
             <div style={styles.btnRow}>
                <button style={styles.greenBtn}><Headphones size={14}/> Listen</button>
                <button style={styles.tealBtn}><Mic size={14}/> Whisper</button>
                <button style={styles.redBtn}><PhoneOff size={14}/> End Call</button>
             </div>
             {!isCheckedIn && <button onClick={handleCheckIn} style={styles.checkInMask}>{checkInLoading ? '...' : 'Check-in to Start'}</button>}
          </div>
        </div>

        <div style={styles.bottomGrid}>
          <div style={{ ...styles.card, padding: 0 }}>
            <div style={styles.widgetHeader}>
              <span>Lead List</span>
              <div style={styles.metaFlex}><Settings size={14}/><ChevronDown size={14}/></div>
            </div>
            <table style={styles.table}>
              <thead style={styles.thead}><tr><th>Name</th><th>Contact</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {leads.slice(0, 3).map((l) => (
                  <tr key={l.id} style={styles.rowBorder}>
                    <td style={styles.tdStrong}>{l.name}</td>
                    <td style={styles.tdDim}>{l.phone}</td>
                    <td style={styles.td}><span style={{ ...styles.pill, backgroundColor: l.priority === 'hot' ? '#ef5350' : '#ffa726' }}>{l.status}</span></td>
                    <td style={styles.td}><button style={styles.callBtn} onClick={() => navigate(`/leads/${l.id}`)}>Call</button></td>
                  </tr>
                ))}
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
                 {tasksData.results?.map(t => (
                   <TaskLine key={t.id} checked={t.is_completed} text={t.title} />
                 ))}
              </div>
            </div>
            <div style={styles.card}>
              <span style={styles.sectionTitle}>Script & Notes</span>
              <p style={styles.scriptNote}><b>Intro:</b> "Hello, this is {stats.agent_name} from XYZ Insurance..."</p>
              <p style={styles.scriptNote}><b>Notes:</b> {leads[0]?.last_note || "Interested in term plan, call back at 5 PM."}</p>
            </div>
          </div>

          <div style={styles.stack}>
            <div style={styles.card}>
              <span style={styles.sectionTitle}>Performance Overview</span>
              <div style={styles.timeLabel}>Today</div>
              <div style={styles.splitRow}><span>Sales: <b>₹{stats.revenue?.total_premium || 0}</b></span> <span>Calls: <b>{stats.header_stats?.calls || 0}</b></span></div>
              <div style={styles.underlinedRow}><span>Conversion: <b>{stats.cards?.conversion_rate || 0}%</b></span></div>
              <div style={{ ...styles.timeLabel, marginTop: '10px' }}>{earningsData?.summary.month_display}</div>
              <div style={styles.splitRow}><span>Sales: <b>₹{earningsData?.summary.total_earnings || 0}</b></span> <span>Conversion: <b>22%</b></span></div>
            </div>
            <div style={{ ...styles.card, padding: 0 }}>
              <div style={styles.earningsHeader}><CircleDollarSign size={14}/> My Earnings <ChevronDown size={12} style={{ marginLeft: 'auto' }}/></div>
              <div style={{ padding: '15px' }}>
                 <div style={styles.splitRow}><span>Commission:</span> <b>₹{earningsData?.summary.total_incentives || 0}</b></div>
                 <div style={styles.splitRow}><span>Bonuses:</span> <b>₹3,000</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components with Semi-Circle Logic ---

const SemiCircleGauge = ({ label, value, color }) => {
  const radius = 35;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Arc length is half the circumference for a semi-circle
  const arcLength = circumference / 2;
  
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '100px', height: '60px', overflow: 'hidden' }}>
        <svg height="100" width="100" style={{ transform: 'rotate(-180deg)' }}>
          {/* Background Arc */}
          <circle
            stroke="#eef2f6"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            r={normalizedRadius}
            cx="50"
            cy="50"
          />
          {/* Progress Arc */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${(arcLength * 0.75)} ${circumference}`} // Example percentage fill
            strokeLinecap="round"
            r={normalizedRadius}
            cx="50"
            cy="50"
          />
        </svg>
        <div style={{ position: 'absolute', bottom: '0', width: '100%', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#102a43' }}>
          {value}
        </div>
      </div>
      <p style={styles.tinyLabel}>{label}</p>
    </div>
  );
};

const MetricCard = ({ title, value }) => (
  <div style={styles.card}>
    <p style={styles.cardLabel}>{title}</p>
    <p style={styles.bigNum}>{value}</p>
  </div>
);

const TaskLine = ({ checked, text }) => (
  <div style={styles.taskLine}>
    <div style={{ ...styles.checkCircle, ...(checked ? styles.checkOn : {}) }}>
      {checked && <div style={styles.dot} />}
    </div>
    <span style={{ fontSize: '12px', color: checked ? '#263238' : '#90a4ae' }}>{text}</span>
  </div>
);

const styles = {
  dashboardWrapper: { display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', backgroundColor: '#e9eff6' },
  header: { backgroundColor: '#1e4eb8', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { margin: 0, fontSize: '22px', fontWeight: '700' },
  headerIcons: { display: 'flex', gap: '12px' },
  headerCircle: { padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' },
  contentBody: { padding: '20px 30px' },
  topStatsRow: { display: 'flex', gap: '20px', marginBottom: '20px', fontSize: '13px', alignItems: 'center' },
  statItem: { color: '#455a64' },
  statVal: { fontSize: '18px', color: '#102a43', marginLeft: '4px' },
  pipe: { color: '#b0bec5' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' },
  card: { backgroundColor: 'white', padding: '18px', borderRadius: '4px', border: '1px solid #d1d9e6', boxShadow: 'none' },
  cardLabel: { fontSize: '11px', fontWeight: 'bold', color: '#546e7a', textTransform: 'uppercase', marginBottom: '8px', marginTop: 0 },
  bigNum: { fontSize: '26px', fontWeight: 'bold', margin: 0, color: '#102a43' },
  targetWidget: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  progressBase: { width: '110px', height: '8px', backgroundColor: '#eceff1', borderRadius: '4px' },
  progressFill: { height: '100%', backgroundColor: '#26a69a', borderRadius: '4px' },
  progressRing: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', fontSize: '11px', fontWeight: 'bold' },
  middleGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' },
  blueBanner: { background: 'linear-gradient(to right, #1e4eb8, #3b82f6)', padding: '10px 18px', color: 'white', fontWeight: 'bold', fontSize: '14px', borderRadius: '4px 4px 0 0' },
  performanceFlex: { display: 'flex', justifyContent: 'space-around', padding: '25px 0' },
  durationBox: { textAlign: 'center' },
  arcWidget: { width: '90px', height: '45px', borderTop: '10px solid #3b82f6', borderLeft: '10px solid #3b82f6', borderRight: '10px solid #3b82f6', borderRadius: '100px 100px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', paddingBottom: '3px', color: '#102a43' },
  tinyLabel: { fontSize: '10px', fontWeight: 'bold', color: '#78909c', textTransform: 'uppercase', marginTop: '8px' },
  liveCallCard: { backgroundColor: '#1e4eb8', borderRadius: '4px', color: 'white', padding: '20px', position: 'relative' },
  liveTitleBar: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' },
  redDot: { width: '8px', height: '8px', backgroundColor: '#ff5252', borderRadius: '50%' },
  callerProfile: { display: 'flex', gap: '15px', alignItems: 'center', margin: '20px 0' },
  avatarWrap: { width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.4)' },
  btnRow: { display: 'flex', gap: '6px' },
  greenBtn: { flex: 1, padding: '8px', border: 'none', backgroundColor: '#4caf50', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' },
  tealBtn: { flex: 1, padding: '8px', border: 'none', backgroundColor: '#009688', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' },
  redBtn: { flex: 1, padding: '8px', border: 'none', backgroundColor: '#f44336', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' },
  checkInMask: { position: 'absolute', inset: 0, backgroundColor: 'rgba(30,78,184,0.98)', borderRadius: '4px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  bottomGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  widgetHeader: { display: 'flex', justifyContent: 'space-between', padding: '10px 15px', borderBottom: '1px solid #e9eff6', fontWeight: 'bold', color: '#1e4eb8', fontSize: '13px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  thead: { backgroundColor: '#f5f8fa', color: '#78909c', textAlign: 'left', textTransform: 'uppercase' },
  rowBorder: { borderBottom: '1px solid #e9eff6' },
  tdStrong: { padding: '12px', fontWeight: 'bold' },
  tdDim: { padding: '12px', color: '#546e7a' },
  td: { padding: '12px' },
  pill: { padding: '2px 8px', borderRadius: '2px', color: 'white', fontSize: '10px', fontWeight: 'bold' },
  callBtn: { backgroundColor: '#1e4eb8', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', fontSize: '10px' },
  stack: { display: 'flex', flexDirection: 'column', gap: '20px' },
  taskLine: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  checkCircle: { width: '15px', height: '15px', border: '1px solid #b0bec5', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: '#26a69a', borderColor: '#26a69a' },
  dot: { width: '4px', height: '4px', backgroundColor: 'white', borderRadius: '50%' },
  sectionTitle: { fontWeight: 'bold', color: '#1e4eb8', fontSize: '13px', display: 'block', marginBottom: '10px' },
  scriptNote: { fontSize: '11px', color: '#546e7a', margin: '6px 0' },
  timeLabel: { fontWeight: 'bold', fontSize: '12px', marginBottom: '5px', color: '#263238' },
  splitRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '5px 0' },
  underlinedRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid #e9eff6', paddingBottom: '12px' },
  earningsHeader: { backgroundColor: '#1e4eb8', padding: '10px 15px', color: 'white', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center' },
  metaFlex: { display: 'flex', gap: '8px', color: '#b0bec5' },
  loading: { textAlign: 'center', padding: '100px', color: '#546e7a' }
};

export default Dashboard;