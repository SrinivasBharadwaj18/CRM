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

  return (
    <div style={styles.page}>
      {/* New Professional Sidebar */}
      <Navbar />
      
      <main style={styles.mainContent}>
        {/* TOP TILES */}
        <div style={styles.tileRow}>
          <Tile label="Active Agents" value={data.tiles.active_agents} icon="🎧" color="#3b82f6" />
          <Tile label="Total Leads" value={data.tiles.total_leads} icon="📈" color="#0ea5e9" />
          <Tile label="Conversion Rate" value={data.tiles.conversion_rate} icon="🎯" color="#10b981" />
          <Tile label="Total Employees" value={data.tiles.total_employees} icon="👥" color="#6366f1" />
        </div>

        <div style={styles.dashboardGrid}>
          
          {/* Column 1: Expiries & Funnel */}
          <div style={{ gridColumn: "span 4" }}>
            <Card title="🚨 Urgent Expiries (7 Days)">
                {data.expiries.length > 0 ? data.expiries.map((exp, i) => (
                    <div key={i} style={styles.expiryRow}>
                        <div>
                            <div style={styles.hireName}>{exp.customer}</div>
                            <div style={styles.hireRole}>Agent: {exp.agent}</div>
                        </div>
                        <div style={styles.expiryDateTag}>{exp.expiry}</div>
                    </div>
                )) : <div style={styles.emptyState}>No policies expiring soon.</div>}
            </Card>

            <Card title="📊 Conversion Funnel">
                <div style={styles.listLine}><span>New Leads</span> <strong style={{color: '#3b82f6'}}>{data.funnel.new}</strong></div>
                <div style={styles.listLine}><span>In Discussion</span> <strong style={{color: '#f59e0b'}}>{data.funnel.follow_up}</strong></div>
                <div style={styles.listLine}><span>Converted</span> <strong style={{color: '#10b981'}}>{data.funnel.converted}</strong></div>
                <div style={styles.listLine}><span>Not Interested</span> <strong style={{color: '#ef4444'}}>{data.funnel.lost}</strong></div>
                <div style={{...styles.listLine, border: 'none', marginTop: '10px'}}>
                    <span>Success Rate</span> <strong>{data.funnel.rate}</strong>
                </div>
            </Card>

            <Card title="🏆 Agent Leaderboard">
                {data.leaderboard.map((agent, i) => (
                    <div key={i} style={styles.dirRow}>
                        <div style={styles.avatarSmall}>{i + 1}</div>
                        <div style={{flex: 1}}>
                            <div style={{fontWeight: '700', fontSize: '0.85rem'}}>{agent.name}</div>
                            <div style={{fontSize: '0.7rem', color: '#64748b'}}>{agent.sales} Sales</div>
                        </div>
                        <span style={{fontWeight: '800', fontSize: '0.8rem', color: '#10b981'}}>
                            ₹{agent.revenue.toLocaleString()}
                        </span>
                    </div>
                ))}
            </Card>
          </div>

          {/* Column 2: Attendance Snapshot */}
          <div style={{ gridColumn: "span 5" }}>
            <Card title="Attendance Overview (Today)">
               <div style={styles.chartRow}>
                  <Donut value={data.attendance.present} label="Present" color="#10b981" />
                  <Donut value={data.attendance.absent} label="Absent" color="#ef4444" />
                  <Donut value={data.attendance.late} label="Late" color="#f59e0b" />
               </div>
            </Card>

            <Card title="Attendance Trend (Last 7 Days)">
                <AttendanceTrend trend={data.trend} activeAgents={data.tiles.active_agents} />
            </Card>

            <div style={styles.twoCol}>
                <Card title="Total Revenue">
                    <div style={{fontSize: '0.7rem', color: '#64748b'}}>Pipeline Total</div>
                    <h2 style={{color: '#1e293b', margin: '5px 0'}}>₹{data.revenue.total.toLocaleString()}</h2>
                    <div style={{fontSize: '0.65rem', color: '#10b981', fontWeight: '700'}}>Growth: +12%</div>
                </Card>
                <Card title="Payout Status">
                    <div style={styles.leaveItem}><span>Collected</span> <span style={{color: '#10b981'}}>₹{data.revenue.paid.toLocaleString()}</span></div>
                    <div style={styles.leaveItem}><span>Pending</span> <span style={{color: '#f59e0b'}}>₹{data.revenue.pending.toLocaleString()}</span></div>
                </Card>
            </div>
          </div>

          {/* Column 3: Revenue Pipeline */}
          <div style={{ gridColumn: "span 3" }}>
             <Card title="💰 Revenue Pipeline">
                <div style={{marginBottom: '20px'}}>
                    <div style={styles.progressLabel}><span>Collection Progress</span> <span>{Math.round((data.revenue.paid / data.revenue.total) * 100) || 0}%</span></div>
                    <div style={styles.progressBarBg}>
                        <div style={{...styles.progressBarFill, width: `${(data.revenue.paid / data.revenue.total) * 100}%`}}></div>
                    </div>
                </div>
                <div style={styles.listLine}><span>Actual Banked</span> <strong style={{color: '#10b981'}}>₹{data.revenue.paid.toLocaleString()}</strong></div>
                <div style={styles.listLine}><span>Uncollected</span> <strong style={{color: '#ef4444'}}>₹{data.revenue.pending.toLocaleString()}</strong></div>
             </Card>

             <Card title="Top Revenue Generator">
                <div style={{textAlign: 'center', padding: '10px 0'}}>
                    <div style={styles.avatarLarge}>{data.leaderboard[0]?.name[0]}</div>
                    <div style={{fontWeight: '800', marginTop: '10px', color: '#1e293b'}}>{data.leaderboard[0]?.name}</div>
                    <div style={{fontSize: '0.8rem', color: '#3b82f6', fontWeight: '700'}}>
                        Top Sales: ₹{data.leaderboard[0]?.revenue.toLocaleString()}
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
        <div style={{fontSize: '0.7rem', marginTop: '8px', color: '#64748b', fontWeight: '600'}}>{label}</div>
    </div>
);

const AttendanceTrend = ({ trend, activeAgents }) => {
    const maxVal = activeAgents > 0 ? activeAgents : 1;
    return (
        <div style={styles.trendContainer}>
            {trend.map((day, i) => (
                <div key={i} style={styles.trendColumn}>
                    <div style={styles.barStack}>
                        <div style={{...styles.barSegment, height: '100%', backgroundColor: '#f1f5f9'}} />
                        <div style={{
                            ...styles.barSegment, 
                            height: `${(day.present / maxVal) * 100}%`, 
                            backgroundColor: '#10b981', bottom: 0
                        }} />
                        <div style={{
                            ...styles.barSegment, 
                            height: `${(day.late / maxVal) * 100}%`, 
                            backgroundColor: '#f59e0b', bottom: 0, width: '40%', left: '30%'
                        }} />
                    </div>
                    <span style={styles.trendLabel}>{day.day}</span>
                </div>
            ))}
        </div>
    );
};

// --- STYLES ---
// Replace the styles object in your AdminHome.js with this:

const styles = {
  page: { 
    display: 'flex', 
    backgroundColor: '#f8fafc', 
    minHeight: '100vh', 
    fontFamily: "'Inter', sans-serif",
    width: '100%',
    margin: 0,
    padding: 0,
  },
  mainContent: { 
    flex: 1, 
    /* This MUST match your Navbar width exactly (260px). 
       If it still looks too far, you can try 250px or 240px 
       depending on your exact browser rendering.
    */
    marginLeft: '260px',        
    padding: '30px',            // Standardized padding for all sides
    width: 'calc(100% - 260px)', 
    boxSizing: 'border-box',
    display: 'block'
  },
  loading: { textAlign: 'center', marginTop: '100px', fontSize: '1.2rem', color: '#64748b' },
  tileRow: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(4, 1fr)', 
    gap: '20px', 
    marginBottom: '25px' 
  },
  tile: { 
    backgroundColor: 'white', 
    padding: '20px', 
    borderRadius: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    border: '1px solid #e2e8f0', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
  },
  tileIcon: { width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
  tileLabel: { fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' },
  tileValue: { fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' },
  dashboardGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(12, 1fr)', 
    gap: '20px' 
  },
  card: { 
    backgroundColor: 'white', 
    borderRadius: '12px', 
    padding: '20px', 
    marginBottom: '20px', 
    border: '1px solid #e2e8f0', 
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)' 
  },
  cardTitle: { fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  listLine: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '0.8rem', borderBottom: '1px solid #f8fafc' },
  dirRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f8fafc' },
  avatarSmall: { width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem', color: '#64748b' },
  avatarLarge: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#35579b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', margin: '0 auto' },
  chartRow: { display: 'flex', justifyContent: 'space-around', padding: '10px 0' },
  donut: { width: '55px', height: '55px', borderRadius: '50%', border: '5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  leaveItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.75rem', fontWeight: '700' },
  expiryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f8fafc' },
  expiryDateTag: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' },
  hireName: { fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' },
  hireRole: { fontSize: '0.7rem', color: '#94a3b8' },
  progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', marginBottom: '5px' },
  progressBarBg: { height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981', borderRadius: '4px' },
  trendContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '140px' },
  trendColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  barStack: { position: 'relative', width: '20px', height: '100px', borderRadius: '4px', overflow: 'hidden' },
  barSegment: { position: 'absolute', width: '100%' },
  trendLabel: { marginTop: '8px', fontSize: '0.6rem', color: '#94a3b8', fontWeight: '700' },
  emptyState: { textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.8rem' }
};

export default AdminHome;