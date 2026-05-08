import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../features/dashboard/dashboardSlice";
import api from "../services/api";
import { 
  LayoutDashboard, Users, PhoneCall, CheckSquare, 
  CircleDollarSign, BarChart3, Bell, Settings, 
  UserCircle, Headphones, Mic, PhoneOff, ChevronDown, MoreHorizontal
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

  if (loading || !data) return <div style={{textAlign: "center", marginTop: "100px", color: "#64748b"}}>Syncing Dashboard...</div>;

  return (
    <div style={styles.page}>
      {/* Sidebar - Exact match to image_19f1e1.jpg */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <div style={styles.brandCircle}><PhoneCall size={18} /></div>
          <span style={{fontWeight: 'bold', fontSize: '18px'}}>Agent Dashboard</span>
          <ChevronDown size={16} style={{marginLeft: 'auto', opacity: 0.6}} />
        </div>
        <nav style={{marginTop: '10px'}}>
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <NavItem icon={<Users size={20}/>} label="Leads" />
          <NavItem icon={<PhoneCall size={20}/>} label="Call History" />
          <NavItem icon={<CheckSquare size={20}/>} label="Tasks" />
          <NavItem icon={<CircleDollarSign size={20}/>} label="My Earnings" />
          <NavItem icon={<BarChart3 size={20}/>} label="Reports" />
        </nav>
      </aside>

      <main style={styles.main}>
        {/* Header - Identical to image_19f1e1.jpg */}
        <header style={styles.header}>
          <h1 style={{margin: 0, fontSize: '24px', fontWeight: '700'}}>Welcome, {data.agent_name || 'Sarah'}!</h1>
          <div style={{display: 'flex', gap: '15px'}}>
            <div style={styles.headerIcon}><Bell size={20} /></div>
            <div style={styles.headerIcon}><Settings size={20} /></div>
            <div style={styles.headerIcon}><UserCircle size={20} /></div>
          </div>
        </header>

        <div style={{padding: '25px'}}>
          {/* Today's Stats Bar */}
          <div style={styles.todayStats}>
            <span style={{color: '#64748b'}}>Today's Stats:</span>
            <span style={styles.statItem}>Calls Made: <b style={styles.statVal}>{data.header_stats?.calls || 25}</b></span>
            <span style={styles.divider}>|</span>
            <span style={styles.statItem}>Sales Closed: <b style={styles.statVal}>{data.header_stats?.sales || 4}</b></span>
            <span style={styles.divider}>|</span>
            <span style={styles.statItem}>Follow-ups: <b style={styles.statVal}>{data.header_stats?.followups_completed || 6}</b></span>
          </div>

          {/* Row 1: KPI Cards */}
          <div style={styles.kpiGrid}>
            <MetricCard title="New Leads" value={data.cards?.new_leads || "12"} />
            <MetricCard title="Pending Follow-Ups" value={data.cards?.pending_followups || "8"} />
            <MetricCard title="Today's Sales" value={`₹${data.revenue?.total_premium || "35,000"}`} />
            <div style={styles.card}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <p style={styles.cardTitle}>Monthly Target Progress</p>
                  <div style={styles.progressBase}>
                    <div style={{...styles.progressFill, width: `${data.cards?.target_progress || 60}%`}}></div>
                  </div>
                </div>
                <div style={styles.gauge60}>
                  <span style={{fontSize: '12px', fontWeight: 'bold'}}>{data.cards?.target_progress || 60}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Call Status & Live Call */}
          <div style={styles.middleGrid}>
            <div style={{...styles.card, gridColumn: 'span 2', padding: 0, overflow: 'hidden'}}>
              <div style={styles.cardHeader}>Call Status</div>
              <div style={styles.callStatsBody}>
                <CircleGauge label="Connected Calls" value={data.call_metrics?.connected || 18} color="#2dd4bf" />
                <CircleGauge label="Missed Calls" value={data.call_metrics?.no_answer || 5} color="#fb923c" />
                <div style={styles.avgDurationBox}>
                  <div style={styles.semiCircle}>{data.call_metrics?.avg_duration || "3m 15s"}</div>
                  <p style={styles.gaugeLabel}>Avg Call Duration</p>
                </div>
              </div>
            </div>

            <div style={styles.liveCallCard}>
               <div style={styles.liveHeader}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}><div style={styles.liveDot} /> LIVE CALL</div>
                  <div style={{display: 'flex', gap: '10px'}}><Settings size={14} /><ChevronDown size={14} /></div>
               </div>
               <div style={styles.liveUser}>
                  <div style={styles.liveAvatar}><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh" alt="agent" style={{width: '100%'}} /></div>
                  <div>
                    <div style={{fontWeight: 'bold', fontSize: '15px'}}>Rajesh Kumar</div>
                    <div style={{fontSize: '12px', opacity: 0.8}}>00:12</div>
                  </div>
               </div>
               <div style={styles.liveActions}>
                  <button style={styles.btnListen}><Headphones size={14}/> Listen</button>
                  <button style={styles.btnWhisper}><Mic size={14}/> Whisper</button>
                  <button style={styles.btnEnd}><PhoneOff size={14}/> End Call</button>
               </div>
               {!isCheckedIn && <button onClick={handleCheckIn} style={styles.checkInOverlay}>{checkInLoading ? '...' : 'Check-in to Start'}</button>}
            </div>
          </div>

          {/* Row 3: Bottom Details */}
          <div style={styles.bottomGrid}>
            <div style={{...styles.card, padding: 0, overflow: 'hidden'}}>
              <div style={styles.listHeader}><span>Lead List</span><div style={{display: 'flex', gap: '10px'}}><Settings size={14}/><ChevronDown size={14}/></div></div>
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

            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div style={styles.card}>
                <div style={styles.listHeader}><span>Follow-Ups & Tasks</span><div style={{display: 'flex', gap: '10px'}}><Settings size={14}/><ChevronDown size={14}/></div></div>
                <div style={{marginTop: '10px'}}>
                   <TaskItem checked text="Follow Up with Pooja Tomorrow" />
                   <TaskItem checked text="Send Policy Info to Mr. Singh" />
                   <TaskItem text="Prepare Report for TL" />
                   <TaskItem text="Email Confirmation to Client" />
                </div>
              </div>
              <div style={styles.card}>
                <span style={{fontWeight: 'bold', color: '#1e4eb8', fontSize: '13px'}}>Script & Notes</span>
                <p style={styles.scriptText}><b>Intro:</b> "Hello, this is Sarah from XYZ Insurance. I wanted to talk..."</p>
                <p style={styles.scriptText}><b>Notes:</b> Interested in term plan, call back at 5 PM.</p>
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              <div style={styles.card}>
                <span style={{fontWeight: 'bold', color: '#1e4eb8', fontSize: '13px', display: 'block', marginBottom: '15px'}}>Performance Overview</span>
                <div style={styles.perfRow}><span>Today</span></div>
                <div style={styles.perfDetail}><span>Sales: <b>₹35,000</b></span> <span>Calls: <b>25</b></span></div>
                <div style={{...styles.perfDetail, borderBottom: '1px solid #f1f5f9', paddingBottom: '10px'}}><span>Conversion: <b>16%</b></span></div>
                <div style={{...styles.perfRow, marginTop: '10px'}}><span>This Month</span></div>
                <div style={styles.perfDetail}><span>Sales: <b>₹1,20,000</b></span> <span>Conversion: <b>22%</b></span></div>
              </div>
              <div style={{...styles.card, padding: 0, overflow: 'hidden'}}>
                <div style={styles.earningsHeader}><CircleDollarSign size={14}/> My Earnings <ChevronDown size={12} style={{marginLeft: 'auto'}}/></div>
                <div style={{padding: '15px'}}>
                   <div style={styles.perfDetail}><span>Commission :</span> <b>₹12,500</b></div>
                   <div style={styles.perfDetail}><span>Bonuses :</span> <b>₹3,000</b></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Sub-components
const NavItem = ({ icon, label, active }) => (
  <div style={{...styles.navItem, ...(active ? styles.navActive : {})}}>
    {icon} <span style={{fontWeight: 'bold'}}>{label}</span>
  </div>
);

const MetricCard = ({ title, value }) => (
  <div style={styles.card}>
    <p style={styles.cardTitle}>{title}</p>
    <p style={styles.cardVal}>{value}</p>
  </div>
);

const CircleGauge = ({ label, value, color }) => (
  <div style={{textAlign: 'center'}}>
    <div style={{...styles.circle, borderColor: color}}>{value}</div>
    <p style={styles.gaugeLabel}>{label}</p>
  </div>
);

const LeadRow = ({ name, phone, status, color }) => (
  <tr style={{borderBottom: '1px solid #f8fafc'}}>
    <td style={{padding: '12px', fontWeight: 'bold'}}>{name}</td>
    <td style={{padding: '12px', color: '#64748b'}}>{phone}</td>
    <td style={{padding: '12px'}}><span style={{...styles.badge, backgroundColor: color}}>{status}</span></td>
    <td style={{padding: '12px'}}><button style={styles.tableBtn}><PhoneCall size={10}/> Call</button></td>
  </tr>
);

const TaskItem = ({ checked, text }) => (
  <div style={styles.task}>
    <div style={{...styles.checkbox, ...(checked ? {backgroundColor: '#14b8a6', borderColor: '#14b8a6'} : {})}}>
      {checked && <div style={styles.checkInner}/>}
    </div>
    <span style={{color: checked ? '#1e293b' : '#94a3b8'}}>{text}</span>
  </div>
);

// Styles
const styles = {
  page: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'Inter, sans-serif' },
  sidebar: { width: '260px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0' },
  sidebarBrand: { padding: '15px', backgroundColor: '#1e4eb8', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' },
  brandCircle: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 25px', color: '#64748b', fontSize: '14px', cursor: 'pointer' },
  navActive: { backgroundColor: '#1e4eb8', color: 'white', borderLeft: '4px solid #93c5fd' },
  main: { flex: 1, overflowY: 'auto' },
  header: { backgroundColor: '#1e4eb8', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerIcon: { padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)' },
  todayStats: { display: 'flex', gap: '20px', marginBottom: '25px', fontSize: '13px', alignItems: 'center' },
  statVal: { fontSize: '18px', marginLeft: '5px', color: '#1e293b' },
  divider: { color: '#cbd5e1' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '25px' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', marginTop: 0 },
  cardVal: { fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1e293b' },
  progressBase: { width: '130px', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '10px' },
  progressFill: { height: '100%', backgroundColor: '#14b8a6', borderRadius: '10px' },
  gauge60: { width: '60px', height: '60px', borderRadius: '50%', border: '5px solid #22c55e', borderLeftColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  middleGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '25px' },
  cardHeader: { background: 'linear-gradient(to right, #1e4eb8, #3b82f6)', padding: '12px 20px', color: 'white', fontWeight: 'bold', fontSize: '14px' },
  callStatsBody: { display: 'flex', justifyContent: 'space-around', padding: '30px' },
  circle: { width: '80px', height: '80px', borderRadius: '50%', border: '6px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold' },
  gaugeLabel: { fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginTop: '10px' },
  semiCircle: { width: '100px', height: '50px', borderTop: '8px solid #3b82f6', borderLeft: '8px solid #3b82f6', borderRight: '8px solid #3b82f6', borderRadius: '100px 100px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', paddingBottom: '5px' },
  liveCallCard: { backgroundColor: '#1e4eb8', borderRadius: '12px', color: 'white', padding: '20px', position: 'relative' },
  liveHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 'bold' },
  liveDot: { width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' },
  liveUser: { display: 'flex', gap: '15px', alignItems: 'center', margin: '20px 0' },
  liveAvatar: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#ddd', overflow: 'hidden', border: '2px solid white' },
  liveActions: { display: 'flex', gap: '8px' },
  btnListen: { flex: 1, padding: '8px', border: 'none', backgroundColor: '#22c55e', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' },
  btnWhisper: { flex: 1, padding: '8px', border: 'none', backgroundColor: '#14b8a6', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' },
  btnEnd: { flex: 1, padding: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' },
  checkInOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(30,78,184,0.9)', borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  bottomGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  listHeader: { display: 'flex', justifyContent: 'space-between', padding: '12px 15px', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold', color: '#1e4eb8', fontSize: '13px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  thead: { backgroundColor: '#f8fafc', color: '#94a3b8', textAlign: 'left', textTransform: 'uppercase' },
  badge: { padding: '2px 8px', borderRadius: '4px', color: 'white', fontSize: '10px', fontWeight: 'bold' },
  tableBtn: { backgroundColor: '#1e4eb8', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' },
  task: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', marginBottom: '12px' },
  checkbox: { width: '16px', height: '16px', border: '1px solid #cbd5e1', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkInner: { width: '4px', height: '4px', backgroundColor: 'white', borderRadius: '50%' },
  scriptText: { fontSize: '12px', color: '#64748b', margin: '8px 0' },
  perfRow: { fontWeight: 'bold', fontSize: '12px', marginBottom: '8px' },
  perfDetail: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', margin: '5px 0' },
  earningsHeader: { backgroundColor: '#1e4eb8', padding: '8px 15px', color: 'white', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }
};

export default Dashboard;