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
        console.error("Error fetching dashboard data", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div style={styles.loading}>Loading Dashboard...</div>;

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
            backgroundColor: item === 'Dashboard' ? '#334155' : 'transparent'
          }}>
            {item}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <main style={styles.mainContent}>

        {/* TOP TILES */}
        <div style={styles.tileRow}>
          <Tile label="Active Agents" value={data.tiles.active_agents} />
          <Tile label="Total Leads" value={data.tiles.total_leads} />
          <Tile label="Conversion Rate" value={data.tiles.conversion_rate} />
          <Tile label="Total Employees" value={data.tiles.total_employees} />
        </div>

        {/* GRID */}
        <div style={styles.grid}>

          {/* LEFT */}
          <div style={{ gridColumn: "span 3" }}>
            <Card title="Urgent Expiries">
              {data.expiries.length ? data.expiries.map((e, i) => (
                <div key={i} style={styles.row}>
                  <span>{e.customer}</span>
                  <span>{e.expiry}</span>
                </div>
              )) : <div>No expiries</div>}
            </Card>

            <Card title="Leaderboard">
              {data.leaderboard.slice(0, 5).map((a, i) => (
                <div key={i} style={styles.row}>
                  <span>{i + 1}. {a.name}</span>
                  <strong>₹{a.revenue}</strong>
                </div>
              ))}
            </Card>
          </div>

          {/* CENTER */}
          <div style={{ gridColumn: "span 6" }}>
            <Card title="Conversion Funnel">
              <div style={styles.funnelWrapper}>

                {[
                  { label: "Leads Received", value: data.funnel.new, percent: 100, width: 100, color: "#2563eb" },
                  { label: "Contacted", value: data.funnel.follow_up, percent: discussionPer, width: 85, color: "#3b82f6" },
                  { label: "Converted", value: data.funnel.converted, percent: convertedPer, width: 65, color: "#10b981" },
                  { label: "Lost", value: data.funnel.lost, percent: lostPer, width: 45, color: "#ef4444" }
                ].map((item, i) => (
                  <div key={i} style={styles.funnelRow}>
                    
                    <div style={{
                      ...styles.funnelShape,
                      width: `${item.width}%`,
                      backgroundColor: item.color
                    }}>
                      {item.label}
                    </div>

                    <div style={styles.funnelData}>
                      <div style={styles.value}>{item.value}</div>
                      <div style={styles.percent}>({item.percent}%)</div>
                    </div>

                  </div>
                ))}

              </div>
            </Card>

            <div style={styles.twoCol}>
              <Card title="Revenue">
                <h2>₹{data.revenue.total}</h2>
              </Card>

              <Card title="Payout">
                <div>Paid: ₹{data.revenue.paid}</div>
                <div>Pending: ₹{data.revenue.pending}</div>
              </Card>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ gridColumn: "span 3" }}>
            <Card title="Pipeline">
              <div style={styles.barBg}>
                <div style={{
                  ...styles.barFill,
                  width: `${(data.revenue.paid / data.revenue.total) * 100}%`
                }} />
              </div>
            </Card>

            <Card title="Attendance">
              <div style={styles.attendance}>
                <Donut value={data.attendance.present} label="Present" />
                <Donut value={data.attendance.absent} label="Absent" />
                <Donut value={data.attendance.late} label="Late" />
              </div>
            </Card>

            <Card title="Top Performer">
              <div style={{ textAlign: "center" }}>
                <div style={styles.avatar}>
                  {data.leaderboard[0]?.name?.[0]}
                </div>
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

const Tile = ({ label, value }) => (
  <div style={styles.tile}>
    <div>{label}</div>
    <strong>{value}</strong>
  </div>
);

const Card = ({ title, children }) => (
  <div style={styles.card}>
    <h4>{title}</h4>
    {children}
  </div>
);

const Donut = ({ value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={styles.donut}>{value}</div>
    <div>{label}</div>
  </div>
);

/* STYLES */

const styles = {

  page: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "#f1f5f9"
  },

  sidebar: {
    width: 240,
    background: "#1e293b",
    color: "white",
    paddingTop: 80
  },

  sidebarHeader: { padding: 20, fontWeight: "bold" },
  sidebarItem: { padding: 15 },

  mainContent: {
    flex: 1,
    marginLeft: 240,
    padding: "80px 20px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },

  tileRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 10
  },

  tile: {
    background: "white",
    padding: 15,
    borderRadius: 10
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12,1fr)",
    gap: 10,
    flex: 1
  },

  card: {
    background: "white",
    padding: 15,
    borderRadius: 10,
    height: "100%"
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8
  },

  /* FUNNEL */

  funnelWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },

  funnelRow: {
    display: "flex",
    alignItems: "center",
    gap: 10
  },

  funnelShape: {
    height: 40,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    margin: "0 auto",
    fontWeight: "bold"
  },

  funnelData: {
    width: 80
  },

  value: { fontWeight: "bold" },
  percent: { fontSize: 12, color: "#64748b" },

  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10
  },

  barBg: { height: 8, background: "#eee" },
  barFill: { height: "100%", background: "#10b981" },

  attendance: {
    display: "flex",
    justifyContent: "space-around"
  },

  donut: {
    width: 50,
    height: 50,
    border: "5px solid #10b981",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    background: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "auto"
  },

  loading: {
    textAlign: "center",
    marginTop: 100
  }
};

export default AdminHome;