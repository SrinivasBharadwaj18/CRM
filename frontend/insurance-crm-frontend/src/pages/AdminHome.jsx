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
  const totalLeads = data.funnel.new || 1; // Base number for percentage calculation
  const discussionPer = totalLeads > 0 ? Math.round((data.funnel.follow_up / totalLeads) * 100) : 0;
  const convertedPer = totalLeads > 0 ? Math.round((data.funnel.converted / totalLeads) * 100) : 0;
  const lostPer = totalLeads > 0 ? Math.round((data.funnel.lost / totalLeads) * 100) : 0;

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

            {/* This was moved from column 2 to balance column 1 better now that the Funnel takes more height */}
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

          {/* Column 2: Visual Conversion Funnel & Revenue Snippets */}
          <div style={{ gridColumn: "span 5" }}>
            
            {/* --- UPDATED: Diagrammatic Funnel --- */}
            <Card title="📊 Conversion Funnel">
                <div style={styles.funnelContainer}>
                    {/* Visual Diagram Left */}
                    <div style={styles.funnelDiagram}>
                        <div style={styles.stage1Shape}>New Leads</div>
                        <div style={styles.stage2Slope} />
                        <div style={styles.stage2Shape}>In Discussion</div>
                        <div style={styles.stage3Slope} />
                        <div style={styles.stage3Shape}>Converted</div>
                    </div>

                    {/* Detailed Data Callouts Right */}
                    <div style={styles.funnelDetails}>
                        <div style={styles.funnelDetailRow}>
                            <span style={styles.detailLabel}>Total New Leads</span>
                            <div style={styles.detailValueContainer}>
                                <span style={styles.detailValueMain}>{data.funnel.new}</span>
                                <span style={styles.detailPercentage}> (100%)</span>
                            </div>
                        </div>

                        <div style={styles.funnelDetailRow}>
                            <span style={styles.detailLabel}>In Discussion</span>
                            <div style={styles.detailValueContainer}>
                                <span style={{...styles.detailValueMain, color: '#f59e0b'}}>{data.funnel.follow_up}</span>
                                <span style={styles.detailPercentage}> ({discussionPer}%)</span>
                            </div>
                        </div>

                        <div style={styles.funnelDetailRow}>
                            <span style={styles.detailLabel}>Policies Issued / Converted</span>
                            <div style={styles.detailValueContainer}>
                                <span style={{...styles.detailValueMain, color: '#10b981'}}>{data.funnel.converted}</span>
                                <span style={styles.detailPercentage}> ({convertedPer}%)</span>
                            </div>
                        </div>

                        {/* Separate Dropout Indicator */}
                        <div style={styles.dropoutRow}>
                            <span style={{color: '#94a3b8', fontSize: '1.2rem'}}>🚷</span>
                            <span>Leads Not Interested: <strong style={{color: '#ef4444', marginLeft: '5px'}}>{data.funnel.lost} ({lostPer}%)</strong></span>
                        </div>

                        {/* Distinct Success Rate */}
                        <div style={styles.successRow}>
                            <span>🏆 Overall Success Rate</span>
                            <span style={{fontSize: '1.2rem', fontWeight: '900', color: '#1e293b'}}>{data.funnel.rate}</span>
                        </div>
                    </div>
                </div>
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

          {/* Column 3: Revenue Pipeline & Top Gen */}
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

            <Card title="Attendance Overview">
                <div style={styles.chartRow}>
                    <Donut value={data.attendance.present} label="Present" color="#10b981" />
                    <Donut value={data.attendance.absent} label="Absent" color="#ef4444" />
                    <Donut value={data.attendance.late} label="Late" color="#f59e0b" />
                </div>
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


// --- UPDATED STYLES ---
const styles = {
  page: { 
    display: 'flex', 
    backgroundColor: '#f1f5f9', 
    minHeight: '100vh', 
    fontFamily: "'Inter', sans-serif",
    width: '100%',
    overflowX: 'hidden'
  },
  sidebar: { 
    width: '240px', 
    backgroundColor: '#1e293b', 
    color: 'white', 
    paddingTop: '90px', 
    position: 'fixed', 
    height: '100vh', 
    zIndex: 10,
    top: 0,
    left: 0
  },
  sidebarHeader: { padding: '20px 25px', fontSize: '1.2rem', fontWeight: '900', color: '#3b82f6', letterSpacing: '1px' },
  sidebarItem: { padding: '15px 25px', fontSize: '0.85rem', cursor: 'pointer', color: '#94a3b8', fontWeight: '600' },
  
  mainContent: { 
    flex: 1, 
    marginLeft: '240px', 
    padding: '120px 30px 40px',
    width: 'calc(100% - 240px)', 
    boxSizing: 'border-box'
  },
  
  loading: { textAlign: 'center', marginTop: '100px', fontSize: '1.2rem', color: '#64748b' },
  tileRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '25px' },
  tile: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #e2e8f0' },
  tileIcon: { width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
  tileLabel: { fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' },
  tileValue: { fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' },
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  listLine: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '0.8rem', borderBottom: '1px solid #f8fafc' },
  dirRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f8fafc' },
  avatarSmall: { width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem', color: '#64748b' },
  avatarLarge: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem', margin: '0 auto' },
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
  emptyState: { textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.8rem' },

  // --- FUNNEL STYLES ---
  funnelContainer: { display: 'flex', gap: '30px', alignItems: 'center', padding: '10px 0' },
  
  // Left: Diagrammatic Figure
  funnelDiagram: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '130px', color: 'white', fontSize: '0.65rem', fontWeight: '700' },
  stage1Shape: { width: '130px', height: '45px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: '6px', borderTopRightRadius: '6px' },
  
  // These slopes create the funnel effect using border trick
  stage2Slope: { width: '0', height: '0', borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '20px solid #3b82f6' },
  stage2Shape: { width: '100px', height: '45px', backgroundColor: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
  stage3Slope: { width: '0', height: '0', borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '20px solid #f59e0b' },
  stage3Shape: { width: '70px', height: '45px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px', textAlign: 'center' },

  // Right: Callouts
  funnelDetails: { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' },
  funnelDetailRow: { borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' },
  detailLabel: { fontSize: '0.7rem', color: '#64748b', fontWeight: '600', marginBottom: '3px' },
  detailValueContainer: { display: 'flex', alignItems: 'baseline', gap: '5px' },
  detailValueMain: { fontSize: '1.2rem', fontWeight: '800', color: '#3b82f6' },
  detailPercentage: { fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' },
  
  // Dropout/Dropout row
  dropoutRow: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#475569', backgroundColor: '#fff1f2', padding: '10px', borderRadius: '8px', marginTop: '5px', fontWeight: '500' },
  
  // Distinct Success Rate callout at bottom right
  successRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '12px', border: '2px solid #10b981', borderRadius: '10px', backgroundColor: '#ecfdf5', fontSize: '0.85rem', fontWeight: '700', color: '#15803d' }
};

export default AdminHome;