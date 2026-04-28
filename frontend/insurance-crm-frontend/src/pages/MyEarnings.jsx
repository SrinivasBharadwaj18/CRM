import React, { useEffect, useState } from 'react';
import api from "../services/api"; 
import { 
  LayoutDashboard, Calendar, ChevronDown, 
  ExternalLink, Check, Bell 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MyEarnings = () => {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Controls State
  const [viewType, setViewType] = useState('weekly'); 
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    const fetchEarnings = async () => {
      setLoading(true);
      try {
        const res = await api.get("agent/earnings-dashboard/", {
          params: {
            view: viewType,
            month: selectedDate.month,
            year: selectedDate.year
          }
        });
        setEarningsData(res.data);
      } catch (err) {
        console.error("Error fetching earnings data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [viewType, selectedDate]);

  const handleMonthChange = (e) => {
    const [m, y] = e.target.value.split('-').map(Number);
    setSelectedDate({ month: m, year: y });
  };

  if (loading && !earningsData) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loaderSpinner}></div>
        <h3 style={{marginTop: '20px', color: '#64748b'}}>Calculating Your Earnings...</h3>
      </div>
    );
  }

  if (!earningsData) return <div style={{padding: '40px'}}>Error loading data. Please refresh.</div>;

  return (
    <div style={styles.container}>
      
      {/* 1. TOP HEADER (Page Specific) */}
      <header style={styles.header}>
        <h2 style={styles.headerTitle}>My Earnings</h2>
        <div style={styles.headerIcons}>
          <Bell size={20} style={{cursor: 'pointer'}} />
          <div style={styles.profileCircle}></div>
        </div>
      </header>

      <div style={styles.wrapper}>
        
        {/* 2. CONTROLS ROW */}
        <div style={styles.controlsRow}>
          <div style={{...styles.pill, position: 'relative'}}>
            <Calendar size={16} color="#3b82f6" />
            <span>{earningsData.summary.month_display}</span>
            <select 
              value={`${selectedDate.month}-${selectedDate.year}`}
              onChange={handleMonthChange}
              style={styles.hiddenSelect}
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const m = d.getMonth() + 1;
                const y = d.getFullYear();
                return (
                  <option key={i} value={`${m}-${y}`}>
                    {d.toLocaleString('default', { month: 'long' })} {y}
                  </option>
                );
              })}
            </select>
          </div>

          <div 
            style={{...styles.pill, cursor: 'pointer'}}
            onClick={() => setViewType(viewType === 'weekly' ? 'monthly' : 'weekly')}
          >
            <LayoutDashboard size={16} color="#3b82f6" />
            <span style={{textTransform: 'capitalize'}}>{viewType}</span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* 3. GRID: CHART & INCENTIVES */}
        <div style={styles.grid}>
          <div style={{...styles.card, gridColumn: 'span 8'}}>
            <div style={styles.cardHeader}>
              <div>
                <div style={styles.labelSmall}>TOTAL EARNINGS</div>
                <div style={styles.earningsValue}>₹{earningsData.summary.total_earnings.toLocaleString()}</div>
                <div style={styles.subStats}>
                  <div>
                    <span style={styles.labelExtraSmall}>SALARY</span>
                    <p style={styles.salaryText}>₹{earningsData.summary.base_salary.toLocaleString()}</p>
                  </div>
                  <div>
                    <span style={styles.labelExtraSmall}>INCENTIVES</span>
                    <p style={styles.incentiveText}>₹{earningsData.summary.total_incentives.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div style={styles.toggleGroup}>
                <button 
                  onClick={() => setViewType('weekly')}
                  style={viewType === 'weekly' ? styles.toggleActive : styles.toggleInactive}
                >Weekly</button>
                <button 
                  onClick={() => setViewType('monthly')}
                  style={viewType === 'monthly' ? styles.toggleActive : styles.toggleInactive}
                >Monthly</button>
              </div>
            </div>
            
            <div style={{height: '250px', width: '100%', opacity: loading ? 0.5 : 1}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earningsData.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{...styles.card, gridColumn: 'span 4'}}>
            <h4 style={styles.cardTitle}>Current Incentives</h4>
            {earningsData.checklist.map((item, i) => (
              <div key={i} style={styles.incentiveRow}>
                <div style={styles.checkContainer}>
                  <div style={{...styles.checkBox, backgroundColor: item.checked ? '#10b981' : '#e2e8f0'}}>
                    {item.checked && <Check size={12} strokeWidth={4} />}
                  </div>
                  <span style={{...styles.incentiveLabel, opacity: item.checked ? 1 : 0.5}}>{item.label}</span>
                </div>
                <span style={styles.incentiveVal}>{item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. RECENT TABLE */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>Recent Payout History</div>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeadRow}>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Incentive Type</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {earningsData.recent_history.map((row, i) => (
                <tr key={i} style={styles.tableRow}>
                  <td style={styles.tdBold}>{row.date_earned}</td>
                  <td style={styles.td}>{row.type_display}</td>
                  <td style={styles.tdBold}>₹{row.amount.toLocaleString()}</td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn}><ExternalLink size={12} /> Details</button>
                  </td>
                </tr>
              ))}
              {earningsData.recent_history.length === 0 && (
                <tr><td colSpan="4" style={styles.emptyTable}>No payout records for this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  container: { flex: 1 },
  header: { height: '60px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', color: 'white' },
  headerTitle: { fontSize: '1.1rem', fontWeight: '600', margin: 0 },
  headerIcons: { display: 'flex', alignItems: 'center', gap: '20px' },
  profileCircle: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' },
  
  wrapper: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
  controlsRow: { display: 'flex', gap: '12px', marginBottom: '25px' },
  pill: { background: 'white', border: '1px solid #e2e8f0', padding: '8px 15px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#64748b' },
  hiddenSelect: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', marginBottom: '20px' },
  card: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  cardTitle: { margin: '0 0 20px 0', fontSize: '0.9rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase' },
  
  labelSmall: { fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' },
  earningsValue: { fontSize: '2rem', fontWeight: '900', color: '#1e3a8a', margin: '5px 0' },
  subStats: { display: 'flex', gap: '30px', marginTop: '15px' },
  labelExtraSmall: { fontSize: '0.6rem', color: '#cbd5e1', fontWeight: '800' },
  salaryText: { margin: 0, fontWeight: '700', color: '#f97316', fontSize: '1rem' },
  incentiveText: { margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '1rem' },
  
  toggleGroup: { background: '#f1f5f9', padding: '4px', borderRadius: '8px', height: 'fit-content' },
  toggleActive: { border: 'none', background: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  toggleInactive: { border: 'none', background: 'transparent', padding: '6px 12px', color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer' },
  
  incentiveRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8fafc' },
  checkContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  checkBox: { width: '18px', height: '18px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  incentiveLabel: { fontSize: '0.85rem', fontWeight: '500', color: '#475569' },
  incentiveVal: { fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' },
  
  tableCard: { background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' },
  tableHeader: { padding: '20px', fontWeight: '800', fontSize: '0.9rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeadRow: { background: '#f8fafc' },
  th: { padding: '15px 20px', textAlign: 'left', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' },
  tableRow: { borderBottom: '1px solid #f8fafc' },
  tdBold: { padding: '15px 20px', fontSize: '0.85rem', color: '#1e293b', fontWeight: '700' },
  td: { padding: '15px 20px', fontSize: '0.85rem', color: '#64748b' },
  actionBtn: { background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' },
  emptyTable: { textAlign: 'center', padding: '40px', color: '#94a3b8' },
  
  loadingContainer: { display: 'flex', flexDirection: 'column', height: '80vh', justifyContent: 'center', alignItems: 'center' },
  loaderSpinner: { width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};

export default MyEarnings;