import { useEffect, useState, useMemo } from "react";
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

  // --- Calculations for Funnel Percentages ---
  const funnelStats = useMemo(() => {
    if (!data) return null;
    const total = data.funnel.new || 1;
    return {
      discussionPer: Math.round((data.funnel.follow_up / total) * 100),
      convertedPer: Math.round((data.funnel.converted / total) * 100),
      lostPer: Math.round((data.funnel.lost / total) * 100),
    };
  }, [data]);

  if (!data) return <div style={styles.loading}>Initializing Admin Suite...</div>;

  return (
    <div style={styles.page}>
      <Navbar />
      
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
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
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={styles.mainContent}>
        {/* TOP TILES - Compacted */}
        <div style={styles.tileRow}>
          <Tile label="Active Agents" value={data.tiles.active_agents} icon="🎧" color="#3b82f6" />
          <Tile label="Total Leads" value={data.tiles.total_leads} icon="📈" color="#0ea5e9" />
          <Tile label="Conversion Rate" value={data.tiles.conversion_rate} icon="🎯" color="#10b981" />
          <Tile label="Total Employees" value={data.tiles.total_employees} icon="👥" color="#6366f1" />
        </div>

        <div style={styles.dashboardGrid}>
          
          {/* Column 1: Expiries & Leaderboard */}
          <div style={{ gridColumn: "span 3", display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Card title="🚨 Urgent Expiries (7 Days)">
                {data.expiries.length > 0 ? data.expiries.slice(0, 3).map((exp, i) => (
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
                {data.leaderboard.slice(0, 4).map((agent, i) => (
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

          {/* Column 2: CONICAL FUNNEL */}
          <div style={{ gridColumn: "span 6" }}>
            <Card title="🎯 Conversion Funnel Analytics">
                <div style={styles.funnelWrapper}>
                    {/* Visual Conical Diagram */}
                    <div style={styles.conicalFunnel}>
                        <div style={styles.funnelSegment1}>New Leads</div>
                        <div style={styles.funnelSegment2}>Discussion</div>
                        <div style={styles.funnelSegment3}>Converted</div>
                    </div>

                    {/* Funnel Legend / Data */}
                    <div style={styles.funnelLegend}>
                        <div style={styles.legendItem}>
                            <span style={styles.legendLabel}>Leads Received</span>
                            <span style={styles.legendValue}>{data.funnel.new} <small>(100%)</small></span>
                        </div>
                        <div style={styles.legendItem}>
                            <span style={styles.legendLabel}>Contacted / In Discussion</span>
                            <span style={{...styles.legendValue, color: '#3b82f6'}}>{data.funnel.follow_up} <small>({funnelStats.discussionPer}%)</small></span>
                        </div>
                        <div style={styles.legendItem}>
                            <span style={styles.legendLabel}>Policies Issued</span>
                            <span style={{...styles.legendValue, color: '#10b981'}}>{data.funnel.converted} <small>({funnelStats.convertedPer}%)</small></span>
                        </div>
                        <div style={styles.legendItem}>
                            <span style={styles.legendLabel}>Not Interested</span>
                            <span style={{...styles.legendValue, color: '#ef4444'}}>{data.funnel.lost} <small>({funnelStats.lostPer}%)</small></span>
                        </div>
                        
                        <div style={styles.successHighlight}>
                             <span>Success Rate:</span>
                             <span style={{fontSize: '1.2rem'}}>{data.funnel.rate}</span>
                        </div>
                    </div>
                </div>
            </Card>

            <div style={styles.twoCol}>
                <Card title="Total Revenue">
                    <h2 style={{color: '#1e293b', margin: '2px 0', fontSize: '1.2rem'}}>₹{data.revenue.total.toLocaleString()}</h2>
                    <div style={{fontSize: '0.65rem', color: '#10b981', fontWeight: '700'}}>+12.5% Growth</div>
                </Card>
                <Card title="Attendance Snapshot">
                    <div style={styles.chartRow}>
                        <Donut value={data.attendance.present} label="Present" color="#10b981" />
                        <Donut value={data.attendance.absent} label="Absent" color="#ef4444" />
                    </div>
                </Card>
            </div>
          </div>

          {/* Column 3: Pipeline & Top Gen */}
          <div style={{ gridColumn: "span 3", display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Card title="💰 Revenue Pipeline">
                <div style={{marginBottom: '15px'}}>
                    <div style={styles.progressLabel}><span>Progress</span> <span>{Math.round((data.revenue.paid / data.revenue.total) * 100) || 0}%</span></div>
                    <div style={styles.progressBarBg}>
                        <div style={{...styles.progressBarFill, width: `${(data.revenue.paid / data.revenue.total) * 100}%`}}></div>
                    </div>
                </div>
                <div style={styles.listLine}><span>Banked</span> <strong>₹{data.revenue.paid.toLocaleString()}</strong></div>
                <div style={styles.listLine}><span>Pending</span> <strong style={{color: '#ef4444'}}>₹{data.revenue.pending.toLocaleString()}</strong></div>
            </Card>

            <Card title="Top Revenue Generator">
                <div style={{textAlign: 'center', padding: '5px 0'}}>
                    <div style={styles.avatarLarge}>{data.leaderboard[0]?.name[0]}</div>
                    <div style={{fontWeight: '800', marginTop: '8px', fontSize: '0.85rem', color: '#1e293b'}}>{data.leaderboard[0]?.name}</div>
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

// --- SUB-COMPONENTS ---
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

// --- CSS STYLES ---
const styles = {
  page: { 
    display: 'flex', 
    backgroundColor: '#f8fafc', 
    height: '100vh', 
    fontFamily: "'Inter', sans-serif",
    width: '100vw',
    overflow: 'hidden' // No scrolling
  },
  sidebar: { 
    width: '240px', 
    backgroundColor: '#1e293b', 
    color: 'white', 
    paddingTop: '80px', 
    height: '100vh',
    flexShrink: 0 
  },
  sidebarHeader: { padding: '15px 25px', fontSize: '1rem', fontWeight: '900', color: '#3b82f6' },
  sidebarItem: { padding: '12px 25px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600' },
  
  mainContent: { 
    flex: 1, 
    padding: '100px 25px 25px', // Reduced padding
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  
  tileRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' },
  tile: { backgroundColor: 'white', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0' },
  tileIcon: { width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' },
  tileLabel: { fontSize: '0.65rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' },
  tileValue: { fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' },

  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '15px', flex: 1 },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '15px', border: '1px solid #e2e8f0', height: 'fit-content' },
  cardTitle: { fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' },
  
  // FUNNEL SPECIFIC
  funnelWrapper: { display: 'flex', gap: '20px', alignItems: 'center', padding: '10px 0' },
  conicalFunnel: { display: 'flex', flexDirection: 'column', width: '180px', gap: '2px' },
  funnelSegment1: {
    height: '50px', backgroundColor: '#2563eb', color: 'white', fontSize: '0.7rem', fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)'
  },
  funnelSegment2: {
    height: '50px', backgroundColor: '#3b82f6', color: 'white', fontSize: '0.7rem', fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    clipPath: 'polygon(15% 0%, 85% 0%, 70% 100%, 30% 100%)'
  },
  funnelSegment3: {
    height: '50px', backgroundColor: '#10b981', color: 'white', fontSize: '0.7rem', fontWeight: 'bold',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    clipPath: 'polygon(30% 0%, 70% 0%, 55% 100%, 45% 100%)'
  },
  funnelLegend: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  legendItem: { display: 'flex', justifyContent: 'space-between', paddingBottom: '5px', borderBottom: '1px solid #f1f5f9' },
  legendLabel: { fontSize: '0.75rem', color: '#64748b', fontWeight: '500' },
  legendValue: { fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' },
  successHighlight: { 
    marginTop: '10px', backgroundColor: '#f0fdf4', border: '1px dashed #10b981', 
    padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', color: '#15803d', fontWeight: '800', fontSize: '0.85rem' 
  },

  listLine: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.75rem', borderBottom: '1px solid #f8fafc' },
  dirRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f8fafc' },
  avatarSmall: { width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.6rem', color: '#64748b' },
  avatarLarge: { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', margin: '0 auto' },
  chartRow: { display: 'flex', justifyContent: 'space-around' },
  donut: { width: '40px', height: '40px', borderRadius: '50%', border: '4px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.7rem' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  expiryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f8fafc' },
  expiryDateTag: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '3px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '800' },
  hireName: { fontSize: '0.75rem', fontWeight: '700', color: '#1e293b' },
  hireRole: { fontSize: '0.65rem', color: '#94a3b8' },
  progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: '700', color: '#64748b', marginBottom: '4px' },
  progressBarBg: { height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981' },
  loading: { textAlign: 'center', marginTop: '100px', fontSize: '1rem', color: '#64748b' }
};

export default AdminHome;