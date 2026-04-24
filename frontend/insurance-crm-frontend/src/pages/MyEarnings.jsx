import React from 'react';
import { 
  LayoutDashboard, Users, PhoneCall, CheckSquare, 
  Wallet, Settings, Bell, ChevronDown, Calendar, 
  ExternalLink, Check 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Week 1', value: 3500 },
  { name: 'Week 2', value: 4200 },
  { name: 'Week 3', value: 4500 },
  { name: 'Week 4', value: 5100 },
  { name: 'Week 5', value: 6200 },
];

const MyEarnings = () => {
  return (
    <div style={styles.page}>
      
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
            <div style={styles.logoIcon}>PH</div>
            <span>Agent CRM</span>
        </div>
        <nav style={styles.navMenu}>
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" />
          <NavItem icon={<Users size={18}/>} label="Leads" />
          <NavItem icon={<PhoneCall size={18}/>} label="Call History" />
          <NavItem icon={<CheckSquare size={18}/>} label="Tasks" />
          <NavItem icon={<Wallet size={18}/>} label="My Earnings" active />
          <NavItem icon={<Settings size={18}/>} label="Settings" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.mainContent}>
        
        {/* TOP HEADER */}
        <header style={styles.header}>
          <h2 style={styles.headerTitle}>My Earnings</h2>
          <div style={styles.headerIcons}>
            <Bell size={20} style={{cursor: 'pointer'}} />
            <div style={styles.profileCircle}></div>
          </div>
        </header>

        <div style={styles.wrapper}>
          
          {/* CONTROLS */}
          <div style={styles.controlsRow}>
            <div style={styles.pill}>
              <Calendar size={16} color="#3b82f6" />
              <span>Apr 1 2024 - Apr 30 2024</span>
            </div>
            <div style={{...styles.pill, cursor: 'pointer'}}>
              <LayoutDashboard size={16} color="#3b82f6" />
              <span>Monthly</span>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* GRID: CHART & INCENTIVES */}
          <div style={styles.grid}>
            
            {/* Chart Card */}
            <div style={{...styles.card, gridColumn: 'span 8'}}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.labelSmall}>TOTAL EARNINGS</div>
                  <div style={styles.earningsValue}>₹25,500</div>
                  <div style={styles.subStats}>
                    <div><span style={styles.labelExtraSmall}>SALARY</span><p style={styles.salaryText}>₹20,000</p></div>
                    <div><span style={styles.labelExtraSmall}>INCENTIVES</span><p style={styles.incentiveText}>₹5,500</p></div>
                  </div>
                </div>
                <div style={styles.toggleGroup}>
                  <button style={styles.toggleActive}>Weekly</button>
                  <button style={styles.toggleInactive}>Monthly</button>
                </div>
              </div>
              
              <div style={{height: '250px', width: '100%'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Incentives Card */}
            <div style={{...styles.card, gridColumn: 'span 4'}}>
              <h4 style={styles.cardTitle}>Current Incentives</h4>
              {[
                { label: 'Monthly Target', val: '₹3,000' },
                { label: 'Weekly Bonus', val: '₹500' },
                { label: 'Performance', val: '₹1,000' },
                { label: 'Login Bonus', val: '₹500' },
                { label: 'Quality Bonus', val: '₹500' },
              ].map((item, i) => (
                <div key={i} style={styles.incentiveRow}>
                  <div style={styles.checkContainer}>
                    <div style={styles.checkBox}><Check size={12} strokeWidth={4} /></div>
                    <span style={styles.incentiveLabel}>{item.label}</span>
                  </div>
                  <span style={styles.incentiveVal}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT TABLE */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>Recent Payout History</div>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeadRow}>
                  <th style={styles.th}>Week</th>
                  <th style={styles.th}>Incentive Type</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { w: 'Week 4', t: 'Monthly Target', a: '₹3,000' },
                  { w: 'Week 3', t: 'Weekly Bonus', a: '₹500' },
                  { w: 'Week 2', t: 'Weekly Bonus', a: '₹500' },
                ].map((row, i) => (
                  <tr key={i} style={styles.tableRow}>
                    <td style={styles.tdBold}>{row.w}</td>
                    <td style={styles.td}>{row.t}</td>
                    <td style={styles.tdBold}>{row.a}</td>
                    <td style={styles.td}>
                      <button style={styles.actionBtn}>
                        <ExternalLink size={12} /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENT FOR CLEANER NAV ---
const NavItem = ({ icon, label, active }) => (
  <div style={{
    ...styles.navItem, 
    backgroundColor: active ? '#334155' : 'transparent',
    color: active ? '#fff' : '#94a3b8',
    borderLeft: active ? '4px solid #3b82f6' : '4px solid transparent'
  }}>
    {icon}
    <span>{label}</span>
  </div>
);

// --- THE STYLES OBJECT ---
const styles = {
  page: { display: 'flex', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  
  // Sidebar
  sidebar: { width: '240px', backgroundColor: '#1e293b', color: 'white', position: 'fixed', height: '100vh', left: 0, top: 0, display: 'flex', flexDirection: 'column' },
  sidebarHeader: { padding: '25px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: '800', color: '#3b82f6' },
  logoIcon: { width: '30px', height: '30px', background: '#3b82f6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontStyle: 'italic' },
  navMenu: { padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '5px' },
  navItem: { padding: '12px 25px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '600', transition: '0.2s' },
  
  // Content
  mainContent: { flex: 1, marginLeft: '240px' },
  header: { height: '60px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', color: 'white' },
  headerTitle: { fontSize: '1.1rem', fontWeight: '600', margin: 0 },
  headerIcons: { display: 'flex', alignItems: 'center', gap: '20px' },
  profileCircle: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' },
  
  wrapper: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
  controlsRow: { display: 'flex', gap: '12px', marginBottom: '25px' },
  pill: { background: 'white', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#64748b' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', marginBottom: '20px' },
  card: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  cardTitle: { margin: '0 0 20px 0', fontSize: '0.9rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  
  labelSmall: { fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.5px' },
  earningsValue: { fontSize: '2rem', fontWeight: '900', color: '#1e3a8a', margin: '5px 0' },
  subStats: { display: 'flex', gap: '30px', marginTop: '15px' },
  labelExtraSmall: { fontSize: '0.6rem', color: '#cbd5e1', fontWeight: '800' },
  salaryText: { margin: 0, fontWeight: '700', color: '#f97316', fontSize: '1rem' },
  incentiveText: { margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '1rem' },
  
  toggleGroup: { background: '#f1f5f9', padding: '4px', borderRadius: '8px', height: 'fit-content' },
  toggleActive: { border: 'none', background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' },
  toggleInactive: { border: 'none', background: 'transparent', padding: '6px 12px', color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer' },

  incentiveRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8fafc' },
  checkContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  checkBox: { width: '18px', height: '18px', background: '#10b981', color: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  incentiveLabel: { fontSize: '0.85rem', fontWeight: '500', color: '#475569' },
  incentiveVal: { fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' },

  tableCard: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
  tableHeader: { padding: '20px', fontWeight: '800', fontSize: '0.9rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeadRow: { background: '#f8fafc' },
  th: { padding: '15px 20px', textAlign: 'left', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' },
  tableRow: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '15px 20px', fontSize: '0.85rem', color: '#64748b' },
  tdBold: { padding: '15px 20px', fontSize: '0.85rem', color: '#1e293b', fontWeight: '700' },
  actionBtn: { background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }
};

export default MyEarnings;