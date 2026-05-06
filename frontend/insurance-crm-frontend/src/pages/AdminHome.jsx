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

  const totalLeads = data.funnel.new || 1;

  const discussionPer = Math.round((data.funnel.follow_up / totalLeads) * 100);
  const convertedPer = Math.round((data.funnel.converted / totalLeads) * 100);

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

      {/* MAIN */}
      <main style={styles.mainContent}>

        {/* TILES */}
        <div style={styles.tileRow}>
          <Tile label="Active Agents" value={data.tiles.active_agents} icon="🎧" color="#3b82f6" />
          <Tile label="Total Leads" value={data.tiles.total_leads} icon="📈" color="#0ea5e9" />
          <Tile label="Conversion Rate" value={data.tiles.conversion_rate} icon="🎯" color="#10b981" />
          <Tile label="Total Employees" value={data.tiles.total_employees} icon="👥" color="#6366f1" />
        </div>

        {/* GRID */}
        <div style={styles.dashboardGrid}>

          {/* LEFT */}
          <div style={{ gridColumn: "span 4" }}>
            <Card title="🚨 Urgent Expiries">
              {data.expiries.length > 0 ? data.expiries.map((exp, i) => (
                <div key={i} style={styles.expiryRow}>
                  <div>
                    <div style={styles.hireName}>{exp.customer}</div>
                    <div style={styles.hireRole}>Agent: {exp.agent}</div>
                  </div>
                  <div style={styles.expiryDateTag}>{exp.expiry}</div>
                </div>
              )) : <div style={styles.emptyState}>No expiries</div>}
            </Card>

            <Card title="🏆 Leaderboard">
              {data.leaderboard.slice(0, 5).map((agent, i) => (
                <div key={i} style={styles.dirRow}>
                  <div style={styles.avatarSmall}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700' }}>{agent.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{agent.sales} sales</div>
                  </div>
                  <strong>₹{agent.revenue.toLocaleString()}</strong>
                </div>
              ))}
            </Card>
          </div>

          {/* CENTER */}
          <div style={{ gridColumn: "span 5" }}>
            <Card title="📊 Conversion Funnel">
              <div style={styles.funnelContainer}>
                {[
                  { label: "Leads Received", value: data.funnel.new, percent: 100, color: "#2563eb" },
                  { label: "Contacted", value: data.funnel.follow_up, percent: discussionPer, color: "#3b82f6" },
                  { label: "Converted", value: data.funnel.converted, percent: convertedPer, color: "#10b981" }
                ].map((item, i) => (
                  <div key={i} style={styles.funnelRow}>
                    <div
                      style={{
                        ...styles.funnelBar,
                        width: `${item.percent}%`,
                        backgroundColor: item.color
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={styles.funnelValue}>
                      {item.value} ({item.percent}%)
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div style={styles.twoCol}>
              <Card title="Revenue">
                <h2>₹{data.revenue.total.toLocaleString()}</h2>
              </Card>

              <Card title="Payout">
                <div>Paid: ₹{data.revenue.paid.toLocaleString()}</div>
                <div>Pending: ₹{data.revenue.pending.toLocaleString()}</div>
              </Card>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ gridColumn: "span 3" }}>
            <Card title="💰 Pipeline">
              <div style={styles.progressBarBg}>
                <div style={{
                  ...styles.progressBarFill,
                  width: `${(data.revenue.paid / data.revenue.total) * 100}%`
                }} />
              </div>
            </Card>

            <Card title="Attendance">
              <div style={styles.chartRow}>
                <Donut value={data.attendance.present} label="Present" color="#10b981" />
                <Donut value={data.attendance.absent} label="Absent" color="#ef4444" />
                <Donut value={data.attendance.late} label="Late" color="#f59e0b" />
              </div>
            </Card>

            <Card title="Top Performer">
              <div style={{ textAlign: 'center' }}>
                <div style={styles.avatarLarge}>{data.leaderboard[0]?.name[0]}</div>
                <div>{data.leaderboard[0]?.name}</div>
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

/* COMPONENTS */
const Tile = ({ label, value, icon, color }) => (
  <div style={styles.tile}>
    <div style={{ ...styles.tileIcon, backgroundColor: `${color}20`, color }}>{icon}</div>
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
  <div style={{ textAlign: 'center' }}>
    <div style={{ ...styles.donut, borderColor: color }}>{value}</div>
    <div>{label}</div>
  </div>
);

/* STYLES */
const styles = {
  page: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9'
  },

  sidebar: {
    width: '240px',
    height: '100vh',
    backgroundColor: '#1e293b',
    color: 'white',
    paddingTop: '90px'
  },

  sidebarHeader: { padding: 20, fontWeight: 'bold' },
  sidebarItem: { padding: 15, cursor: 'pointer' },

  mainContent: {
    flex: 1,
    marginLeft: '240px',
    padding: '90px 20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },

  tileRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 10
  },

  tile: {
    background: 'white',
    padding: 15,
    borderRadius: 10,
    display: 'flex',
    gap: 10
  },

  tileIcon: { width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontSize: 12 },
  tileValue: { fontSize: 18, fontWeight: 'bold' },

  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12,1fr)',
    gap: 10,
    flex: 1,
    overflow: 'hidden'
  },

  card: {
    background: 'white',
    padding: 15,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column'
  },

  cardTitle: { fontSize: 14, marginBottom: 10 },

  funnelContainer: { display: 'flex', flexDirection: 'column', gap: 10 },
  funnelRow: { display: 'flex', alignItems: 'center', gap: 10 },

  funnelBar: {
    height: 30,
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    borderRadius: 5
  },

  funnelValue: { fontSize: 12, fontWeight: 'bold' },

  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },

  progressBarBg: { height: 8, background: '#eee' },
  progressBarFill: { height: '100%', background: '#10b981' },

  chartRow: { display: 'flex', justifyContent: 'space-around' },
  donut: { width: 50, height: 50, border: '5px solid', borderRadius: '50%' },

  avatarSmall: { width: 25, height: 25, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatarLarge: { width: 50, height: 50, background: '#3b82f6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  expiryRow: { display: 'flex', justifyContent: 'space-between' },
  expiryDateTag: { background: '#fee2e2', padding: 5 },

  emptyState: { textAlign: 'center' }
};

export default AdminHome;