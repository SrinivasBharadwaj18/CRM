import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function AdminHome() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("admin/mega-dashboard/");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching mega dashboard data", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div style={styles.loading}>Initializing Admin Suite...</div>;

  // --- Calculations for Funnel Percentages ---
  const totalLeads = data.funnel.new || 1; 
  const discussionPer = Math.round((data.funnel.follow_up / totalLeads) * 100);
  const convertedPer = Math.round((data.funnel.converted / totalLeads) * 100);
  const lostPer = Math.round((data.funnel.lost / totalLeads) * 100);

  return (
    <div style={styles.page}>
      <Navbar />
      
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
         <div style={styles.sidebarHeader}>CRM PRO</div>
         {['Dashboard', 'Employee Management', 'Leads Analytics', 'Attendance', 'Revenue', 'Settings'].map(item => (
             <div key={item} style={{
                 ...styles.sidebarItem, 
                 backgroundColor: item === 'Dashboard' ? '#334155' : 'transparent',
                 borderLeft: item === 'Dashboard' ? '4px solid #3b82f6' : '4px solid transparent'
             }}>
                 {item}
             </div>
         ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <main style={styles.mainContent}>
        {/* TOP TILES */}
        <div style={styles.tileRow}>
          <Tile label="Active Agents" value={data.tiles.active_agents} icon="🎧" color="#3b82f6" />
          <Tile label="Total Leads" value={data.tiles.total_leads} icon="📈" color="#0ea5e9" />
          <Tile label="Conversion Rate" value={data.tiles.conversion_rate} icon="🎯" color="#10b981" />
          <Tile label="Total Employees" value={data.tiles.total_employees} icon="👥" color="#6366f1" />
        </div>

        <div style={styles.dashboardGrid}>
          
          {/* Column 1: Expiries & Leaderboard */}
          <div style={{ gridColumn: "span 3", display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Card title="🚨 Urgent Expiries">
                {data.expiries.length > 0 ? data.expiries.slice(0, 2).map((exp, i) => (
                    <div key={i} style={styles.expiryRow}>
                        <div>
                            <div style={styles.hireName}>{exp.customer}</div>
                            <div style={styles.hireRole}>Agent: {exp.agent}</div>
                        </div>
                        <div style={styles.expiryDateTag}>{exp.expiry}</div>
                    </div>
                )) : <div style={styles.emptyState}>No policies expiring soon.</div>}
            </Card>

            <Card title="🏆 Agent Leaderboard">
                {data.leaderboard.slice(0, 3).map((agent, i) => (
                    <div key={i} style={styles.dirRow}>
                        <div style={styles.avatarSmall}>{i + 1}</div>
                        <div style={{flex: 1}}>
                            <div style={{fontWeight: '700', fontSize: '0.75rem'}}>{agent.name}</div>
                            <div style={{fontSize: '0.65rem', color: '#64748b'}}>{agent.sales} Sales</div>
                        </div>
                        <span style={{fontWeight: '800', fontSize: '0.75rem', color: '#10b981'}}>
                            ₹{agent.revenue.toLocaleString()}
                        </span>
                    </div>
                ))}
            </Card>
          </div>

          {/* Column 2: Visual Conversion Funnel */}
          <div style={{ gridColumn: "span 6" }}>
            <Card title="📊 Conversion Funnel">
                <div style={styles.funnelFlex}>
                    {/* Visual Diagram: Conical Flask Style */}
                    <div style={styles.visualFunnel}>
                        <div style={{...styles.funnelStep, clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)', backgroundColor: '#2563eb'}}>
                            <span style={styles.funnelText}>New</span>
                        </div>
                        <div style={{...styles.funnelStep, clipPath: 'polygon(15% 0%, 85% 0%, 73% 100%, 27% 100%)', backgroundColor: '#3b82f6'}}>
                            <span style={styles.funnelText}>In Discussion</span>
                        </div>
                        <div style={{...styles.funnelStep, clipPath: 'polygon(27% 0%, 73% 0%, 63% 100%, 37% 100%)', backgroundColor: '#f59e0b'}}>
                            <span style={styles.funnelText}>Interested</span>
                        </div>
                        <div style={{...styles.funnelStep, clipPath: 'polygon(37% 0%, 63% 0%, 50% 100%, 50% 100%)', backgroundColor: '#10b981', height: '60px'}}>
                            <span style={{...styles.funnelText, transform: 'translateY(-10px)'}}>Policies Issued</span>
                        </div>
                    </div>

                    {/* Stats List */}
                    <div style={styles.funnelStats}>
                        <StatRow label="Leads Received" val={data.funnel.new} per="100%" color="#1e293b" />
                        <StatRow label="Contacted / Discussion" val={data.funnel.follow_up} per={`${discussionPer}%`} color="#3b82f6" />
                        <StatRow label="Policies Issued" val={data.funnel.converted} per={`${convertedPer}%`} color="#10b981" />
                        <div style={styles.dropoutBox}>
                            <span>Not Interested:</span>
                            <strong style={{color: '#ef4444'}}>{data.funnel.lost} ({lostPer}%)</strong>
                        </div>
                        <div style={styles.successRateBadge}>
                            <span>Success Rate</span>
                            <span style={{fontSize: '1.2rem'}}>{data.funnel.rate}</span>
                        </div>
                    </div>
                </div>
            </Card>

            <div style={styles.twoCol}>
                <Card title="Total Revenue">
                    <h2 style={{color: '#1e293b', margin: '2px 0', fontSize: '1.2rem'}}>₹{data.revenue.total.toLocaleString()}</h2>
                    <div style={{fontSize: '0.65rem', color: '#10b981', fontWeight: '700'}}>Growth: +12%</div>
                </Card>
                <Card title="Attendance Snapshot">
                    <div style={styles.chartRow}>
                        <Donut value={data.attendance.present} label="Present" color="#10b981" />
                        <Donut value={data.attendance.absent} label="Absent" color="#ef4444" />
                    </div>
                </Card>
            </div>
          </div>

          {/* Column 3: Revenue Pipeline */}
          <div style={{ gridColumn: "span 3", display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Card title="💰 Revenue Pipeline">
                <div style={{marginBottom: '10px'}}>
                    <div style={styles.progressLabel}><span>Progress</span> <span>{Math.round((data.revenue.paid / data.revenue.total) * 100) || 0}%</span></div>
                    <div style={styles.progressBarBg}>
                        <div style={{...styles.progressBarFill, width: `${(data.revenue.paid / data.revenue.total) * 100}%`}}></div>
                    </div>
                </div>
                <div style={styles.listLine}><span>Banked</span> <strong style={{color: '#10b981'}}>₹{data.revenue.paid.toLocaleString()}</strong></div>
                <div style={styles.listLine}><span>Uncollected</span> <strong style={{color: '#ef4444'}}>₹{data.revenue.pending.toLocaleString()}</strong></div>
            </Card>

            <Card title="Top Generator">
                <div style={{textAlign: 'center', padding: '5px 0'}}>
                    <div style={styles.avatarLarge}>{data.leaderboard[0]?.name[0]}</div>
                    <div style={{fontWeight: '800', marginTop: '5px', fontSize: '0.85rem'}}>{data.leaderboard[0]?.name}</div>
                    <div style={{fontSize: '0.75rem', color: '#3b82f6', fontWeight: '700'}}>
                        ₹{data.leaderboard[0]?.revenue.toLocaleString()}
                    </div>
                </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- HELPER COMPONENTS ---
const StatRow = ({ label, val, per, color }) => (
    <div style={{...styles.listLine, borderBottom: '1px solid #f1f5f9'}}>
        <span style={{fontSize: '0.75rem', color: '#64748b'}}>{label}</span>
        <span style={{fontWeight: '800', color: color, fontSize: '0.85rem'}}>{val} <small style={{color: '#94a3b8', fontWeight: '500'}}>({per})</small></span>
    </div>
);

const Tile = ({ label, value, icon, color }) => (
    <div style={styles.tile}>
        <div style={{...styles.tileIcon, backgroundColor: `${color}15`, color: color}}>{icon}</div>
        <div>
            <div style={styles.tileLabel}>{label}</div>
            <div style={styles.tileValue}>{value}</div>
        </div>
    </div>
);

const Card = ({ title, children }) => (
    <div style={styles.card}>
        <h4 style={styles.cardTitle}>{title}</h4>
        {children}
    </div>
);

const Donut = ({ value, label, color }) => (
    <div style={{textAlign: 'center'}}>
        <div style={{...styles.donut, borderColor: color}}>{value}</div>
        <div style={{fontSize: '0.6rem', marginTop: '4px', color: '#64748b', fontWeight: '700'}}>{label}</div>
    </div>
);

// --- STYLES ---
const styles = {
  page: { 
    display: 'flex', 
    backgroundColor: '#f1f5f9', 
    height: '100vh', 
    width: '100vw',
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden' // NO SCROLLING
  },
  sidebar: { 
    width: '240px', 
    backgroundColor: '#1e293b', 
    color: 'white', 
    paddingTop: '70px', 
    height: '100vh',
    position: 'fixed',
    left: 0, top: 0,
    zIndex: 10
  },
  sidebarHeader: { padding: '15px 25px', fontSize: '1rem', fontWeight: '900', color: '#3b82f6' },
  sidebarItem: { padding: '12px 25px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' },
  
  mainContent: { 
    flex: 1, 
    marginLeft: '240px', 
    padding: '80px 20px 20px', // Tightened spacing
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  
  loading: { textAlign: 'center', marginTop: '100px', fontSize: '1.2rem', color: '#64748b' },
  tileRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '15px' },
  tile: { backgroundColor: 'white', padding: '12px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0' },
  tileIcon: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' },
  tileLabel: { fontSize: '0.6rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' },
  tileValue: { fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' },

  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '15px', flex: 1 },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '15px', border: '1px solid #e2e8f0', height: 'fit-content' },
  cardTitle: { fontSize: '0.65rem', fontWeight: '800', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase' },

  // FUNNEL SPECIFIC
  funnelFlex: { display: 'flex', gap: '20px', alignItems: 'center', height: '100%' },
  visualFunnel: { display: 'flex', flexDirection: 'column', width: '200px', gap: '2px' },
  funnelStep: { 
    height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.2s'
  },
  funnelText: { color: 'white', fontSize: '0.65rem', fontWeight: '800', textAlign: 'center' },
  funnelStats: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  dropoutBox: { backgroundColor: '#fff1f2', padding: '8px', borderRadius: '8px', fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between', fontWeight: '600' },
  successRateBadge: { 
    marginTop: '5px', padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #10b981', 
    borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    color: '#15803d', fontWeight: '900'
  },

  listLine: { display: 'flex', justifyContent: 'space-between', padding: '5px 0' },
  dirRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #f8fafc' },
  avatarSmall: { width: '22px', height: '22px', borderRadius: '4px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.6rem', color: '#64748b' },
  avatarLarge: { width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', margin: '0 auto' },
  chartRow: { display: 'flex', justifyContent: 'space-around' },
  donut: { width: '35px', height: '35px', borderRadius: '50%', border: '4px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.65rem' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' },
  expiryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f8fafc' },
  expiryDateTag: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '2px 5px', borderRadius: '4px', fontSize: '0.55rem', fontWeight: '800' },
  hireName: { fontSize: '0.75rem', fontWeight: '700', color: '#1e293b' },
  hireRole: { fontSize: '0.6rem', color: '#94a3b8' },
  progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: '700', color: '#64748b' },
  progressBarBg: { height: '5px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981' },
  emptyState: { textAlign: 'center', padding: '10px', color: '#94a3b8', fontSize: '0.7rem' }
};

export default AdminHome;