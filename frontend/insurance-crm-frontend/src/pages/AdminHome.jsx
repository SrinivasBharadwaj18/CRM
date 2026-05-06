import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function AdminHome() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("admin/mega-dashboard/");
      setData(res.data);
    };
    fetchData();
  }, []);

  if (!data) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.dashboard}>

        {/* TOP METRICS */}
        <div style={styles.topRow}>
          <Metric title="Total Leads" value={data.tiles.total_leads} />
          <Metric title="Active Agents" value={data.tiles.active_agents} />
          <Metric title="Revenue" value={`₹${data.revenue.total}`} />
          <Metric title="Conversion" value={data.tiles.conversion_rate} />
        </div>

        {/* MAIN GRID */}
        <div style={styles.grid}>

          {/* LEFT - SALES CHART */}
          <Card title="Sales Overview" style={{ gridColumn: "span 6" }}>
            <div style={styles.fakeChart}></div>
          </Card>

          {/* CENTER - FUNNEL */}
          <Card title="Conversion Funnel" style={{ gridColumn: "span 4" }}>
            <Funnel data={data.funnel} />
          </Card>

          {/* RIGHT - QUICK STATS */}
          <Card title="Activity" style={{ gridColumn: "span 2" }}>
            <div>Calls: 1482</div>
            <div>Sales: 285</div>
            <div>Chats: 620</div>
          </Card>

          {/* BOTTOM LEFT */}
          <Card title="Agent Performance" style={{ gridColumn: "span 6" }}>
            {data.leaderboard.map((a, i) => (
              <div key={i} style={styles.row}>
                <span>{a.name}</span>
                <span>₹{a.revenue}</span>
              </div>
            ))}
          </Card>

          {/* BOTTOM CENTER */}
          <Card title="Revenue Breakdown" style={{ gridColumn: "span 4" }}>
            <div style={styles.donut}></div>
          </Card>

          {/* BOTTOM RIGHT */}
          <Card title="Targets" style={{ gridColumn: "span 2" }}>
            <Progress label="Revenue" value={80} />
            <Progress label="Sales" value={60} />
          </Card>

        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

const Metric = ({ title, value }) => (
  <div style={styles.metric}>
    <div style={styles.metricTitle}>{title}</div>
    <div style={styles.metricValue}>{value}</div>
  </div>
);

const Card = ({ title, children, style }) => (
  <div style={{ ...styles.card, ...style }}>
    <div style={styles.cardTitle}>{title}</div>
    {children}
  </div>
);

const Progress = ({ label, value }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={styles.progressLabel}>
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div style={styles.progressBg}>
      <div style={{ ...styles.progressFill, width: `${value}%` }} />
    </div>
  </div>
);

/* FUNNEL */

const Funnel = ({ data }) => {
  const total = data.new || 1;

  const stages = [
    { label: "Leads", value: data.new, width: 100, color: "#22c55e" },
    { label: "Contacted", value: data.follow_up, width: 80, color: "#3b82f6" },
    { label: "Converted", value: data.converted, width: 60, color: "#f97316" }
  ];

  return (
    <div style={styles.funnel}>
      {stages.map((s, i) => (
        <div key={i} style={styles.funnelRow}>
          <div
            style={{
              ...styles.funnelBar,
              width: `${s.width}%`,
              background: s.color
            }}
          >
            {s.label}
          </div>
          <span>{s.value}</span>
        </div>
      ))}
    </div>
  );
};

/* STYLES */

const styles = {

  page: {
    height: "100vh",
    background: "#0f172a",
    color: "white",
    overflow: "hidden"
  },

  dashboard: {
    height: "calc(100vh - 70px)",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 20
  },

  topRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 15
  },

  metric: {
    background: "#1e293b",
    padding: 15,
    borderRadius: 10
  },

  metricTitle: {
    fontSize: 12,
    color: "#94a3b8"
  },

  metricValue: {
    fontSize: 20,
    fontWeight: "bold"
  },

  grid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(12,1fr)",
    gap: 15
  },

  card: {
    background: "#1e293b",
    borderRadius: 12,
    padding: 15,
    display: "flex",
    flexDirection: "column"
  },

  cardTitle: {
    marginBottom: 10,
    fontWeight: "bold"
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8
  },

  fakeChart: {
    flex: 1,
    background: "linear-gradient(180deg,#1e40af,#0f172a)",
    borderRadius: 10
  },

  donut: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "conic-gradient(#3b82f6 40%, #22c55e 30%, #f97316 30%)",
    margin: "auto"
  },

  progressLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12
  },

  progressBg: {
    height: 6,
    background: "#334155",
    borderRadius: 5
  },

  progressFill: {
    height: "100%",
    background: "#22c55e"
  },

  funnel: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },

  funnelRow: {
    display: "flex",
    alignItems: "center",
    gap: 10
  },

  funnelBar: {
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    fontSize: 12
  },

  loading: {
    color: "white",
    textAlign: "center",
    marginTop: 100
  }
};

export default AdminHome;