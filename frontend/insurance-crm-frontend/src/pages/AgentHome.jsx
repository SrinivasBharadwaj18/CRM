import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchDashboardStats } from "../features/dashboard/dashboardSlice";
import api from "../services/api";
import { 
  LayoutDashboard, Users, PhoneCall, CheckSquare, 
  CircleDollarSign, BarChart3, Bell, Settings, 
  UserCircle, Headphones, Mic, PhoneOff, ChevronDown
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
      const res = await api.post("agent/check-in/");
      setIsCheckedIn(true);
      dispatch(fetchDashboardStats()); 
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading || !data) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontFamily: 'sans-serif' }}>Syncing Dashboard...</div>;
  }

  return (
    <div style={ui.page}>
      {/* Sidebar */}
      <aside style={ui.sidebar}>
        <div style={ui.sidebarHeader}>
          <div style={ui.iconCircle}><PhoneCall size={18} /></div>
          <span style={{ fontWeight: '700', fontSize: '18px' }}>Agent Dashboard</span>
          <ChevronDown size={16} style={{ marginLeft: 'auto', opacity: 0.7 }} />
        </div>
        
        <nav style={{ marginTop: '16px' }}>
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <NavItem icon={<Users size={20}/>} label="Leads" onClick={() => navigate('/agent/leads')} />
          <NavItem icon={<PhoneCall size={20}/>} label="Call History" />
          <NavItem icon={<CheckSquare size={20}/>} label="Tasks" />
          <NavItem icon={<CircleDollarSign size={20}/>} label="My Earnings" />
          <NavItem icon={<BarChart3 size={20}/>} label="Reports" />
        </nav>
      </aside>

      {/* Main Content */}
      <main style={ui.main}>
        <header style={ui.header}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>Welcome, {data.agent_name || 'Agent'}!</h1>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={ui.headerIcon}><Bell size={20} /></div>
            <div style={ui.headerIcon}><Settings size={20} /></div>
            <div style={ui.headerIcon}><UserCircle size={20} /></div>
          </div>
        </header>

        <div style={{ padding: '24px' }}>
          <div style={ui.statsBar}>
            <span style={{ opacity: 0.8 }}>Today's Stats:</span>
            <span>Calls Made: <strong style={{ fontSize: '18px' }}>{data.header_stats?.calls || 0}</strong></span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span>Sales Closed: <strong style={{ fontSize: '18px' }}>{data.header_stats?.sales || 0}</strong></span>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <span>Follow-ups: <strong style={{ fontSize: '18px' }}>{data.header_stats?.followups_completed || 0}</strong></span>
          </div>

          <div style={ui.kpiRow}>
            <MetricCard title="New Leads" value={data.cards?.new_leads || 0} onClick={() => navigate(`/agent/leads`)} />
            <MetricCard title="Pending Follow-Ups" value={data.cards?.pending_followups || 0} />
            <MetricCard title="Today's Sales" value={`₹${data.revenue?.total_premium || 0}`} />
            
            <div style={ui.card}>
              <p style={ui.cardLabel}>Monthly Target Progress</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={ui.progressBarBase}>
                  <div style={{ ...ui.progressBarFill, width: `${data.cards?.target_progress || 0}%` }}></div>
                </div>
                <div style={ui.miniGauge}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{data.cards?.target_progress || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          <div style={ui.middleRow}>
            <div style={{ ...ui.card, gridColumn: 'span 2', padding: 0, overflow: 'hidden' }}>
              <div style={ui.cardHeaderBlue}>Call Status</div>
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '30px' }}>
                <CircularDisplay label="Connected" value={data.call_metrics?.connected || 0} color="#2dd4bf" />
                <CircularDisplay label="Missed" value={data.call_metrics?.no_answer || 0} color="#fb923c" />
                <div style={{ textAlign: 'center' }}>
                   <div style={ui.halfGauge}>{data.call_metrics?.avg_duration || "0m"}</div>
                   <p style={ui.gaugeLabel}>Avg Duration</p>
                </div>
              </div>
            </div>

            <div style={{ ...ui.card, backgroundColor: isCheckedIn ? '#1e4eb8' : '#334155', color: 'white' }}>
               <div style={ui.liveStatusHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isCheckedIn ? '#4ade80' : '#f87171' }}></div>
                    {isCheckedIn ? 'Live Call' : 'Offline'}
                  </div>
                  <ChevronDown size={14} />
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '20px 0' }}>
                  <div style={ui.avatar}>{data.agent_name?.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{data.agent_name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{isCheckedIn ? '00:12' : 'Check-in required'}</div>
                  </div>
               </div>
               {!isCheckedIn ? (
                 <button onClick={handleCheckIn} style={ui.checkInBtn}>{checkInLoading ? '...' : 'START SHIFT'}</button>
               ) : (
                 <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={ui.actionBtn}><Headphones size={14}/> Listen</button>
                    <button style={ui.actionBtn}><Mic size={14}/> Whisper</button>
                    <button style={{ ...ui.actionBtn, backgroundColor: '#ef4444' }}><PhoneOff size={14}/> End</button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- Helper Components ---
const NavItem = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', cursor: 'pointer',
    backgroundColor: active ? '#1e4eb8' : 'transparent', color: active ? 'white' : '#64748b',
    borderLeft: active ? '4px solid #93c5fd' : '4px solid transparent', fontWeight: '600', fontSize: '14px'
  }}>
    {icon} <span>{label}</span>
  </div>
);

const MetricCard = ({ title, value, onClick }) => (
  <div onClick={onClick} style={{ ...ui.card, cursor: onClick ? 'pointer' : 'default' }}>
    <p style={ui.cardLabel}>{title}</p>
    <p style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#1e293b' }}>{value}</p>
  </div>
);

const CircularDisplay = ({ label, value, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ 
      width: '70px', height: '70px', borderRadius: '50%', border: `5px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800'
    }}>{value}</div>
    <p style={ui.gaugeLabel}>{label}</p>
  </div>
);

// --- Stylesheet Object ---
const ui = {
  page: { display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4f8', fontFamily: 'Inter, system-ui, sans-serif' },
  sidebar: { width: '260px', backgroundColor: 'white', borderRight: '1px solid #e2e8f0' },
  sidebarHeader: { padding: '16px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1e4eb8', color: 'white' },
  iconCircle: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, overflowY: 'auto' },
  header: { backgroundColor: '#1e4eb8', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerIcon: { padding: '8px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', cursor: 'pointer' },
  statsBar: { display: 'flex', gap: '24px', marginBottom: '24px', fontSize: '13px', color: '#475569', alignItems: 'center' },
  kpiRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  cardLabel: { fontSize: '10px', fontWeight: '700', color: '#1e4eb8', textTransform: 'uppercase', marginBottom: '8px', margin: 0 },
  progressBarBase: { width: '100px', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '10px' },
  progressBarFill: { height: '100%', backgroundColor: '#14b8a6', borderRadius: '10px' },
  miniGauge: { width: '45px', height: '45px', borderRadius: '50%', border: '4px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  middleRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' },
  cardHeaderBlue: { background: 'linear-gradient(to right, #1d4ed8, #3b82f6)', padding: '12px', color: 'white', fontWeight: 'bold', fontSize: '14px' },
  gaugeLabel: { fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginTop: '8px' },
  halfGauge: { width: '90px', height: '45px', borderTop: '8px solid #3b82f6', borderLeft: '8px solid #3b82f6', borderRight: '8px solid #3b82f6', borderRadius: '100px 100px 0 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', paddingBottom: '5px' },
  liveStatusHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' },
  avatar: { width: '48px', height: '48px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', border: '2px solid rgba(255,255,255,0.3)' },
  checkInBtn: { width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#f97316', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  actionBtn: { flex: 1, padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#10b981', color: 'white', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }
};

export default Dashboard;