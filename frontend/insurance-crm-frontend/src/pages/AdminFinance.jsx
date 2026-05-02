import React, { useState, useEffect } from 'react';
import api from "../services/api";
import AgentSalaryManager from '../components/AgentSalaryManager';
import AwardIncentive from '../components/AwardIncentive';
import PayoutHistory from '../components/PayoutHistory';
import { Wallet, Landmark, TrendingUp, DollarSign } from 'lucide-react';

const AdminFinance = () => {
  const [summary, setSummary] = useState({ grand_total: 0, total_base_salaries: 0, total_incentives: 0 });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get("api/admin/finance-summary/");
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching finance summary", err);
    }
  };

  return (
    <div style={styles.page}>
      {/* PAGE HEADER */}
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <Landmark size={24} color="#2563eb" />
          <h2 style={{ margin: 0 }}>Payroll & Incentives</h2>
        </div>
        <p style={styles.subtitle}>Financial oversight for {summary.month_name || "this month"}</p>
      </header>

      {/* SUMMARY STATS ROW */}
      <div style={styles.statsRow}>
        <StatCard 
          label="Total Monthly Payout" 
          value={`₹${summary.grand_total.toLocaleString()}`} 
          icon={<DollarSign color="#1e3a8a" />} 
          bgColor="#dbeafe" 
        />
        <StatCard 
          label="Base Salaries" 
          value={`₹${summary.total_base_salaries.toLocaleString()}`} 
          icon={<Landmark size={20} color="#64748b" />} 
          bgColor="#f1f5f9" 
        />
        <StatCard 
          label="Incentives Awarded" 
          value={`₹${summary.total_incentives.toLocaleString()}`} 
          icon={<TrendingUp size={20} color="#10b981" />} 
          bgColor="#dcfce7" 
        />
      </div>

      <div style={styles.contentGrid}>
        <div style={{ gridColumn: 'span 8' }}>
          <AgentSalaryManager onUpdate={fetchSummary} />
        </div>
        <div style={{ gridColumn: 'span 4' }}>
          <AwardIncentive onUpdate={fetchSummary} />
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <PayoutHistory />
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: STAT CARD ---
const StatCard = ({ label, value, icon, bgColor }) => (
  <div style={{ ...styles.statCard, borderLeft: `5px solid ${bgColor === '#dcfce7' ? '#10b981' : '#3b82f6'}` }}>
    <div style={{ ...styles.statIcon, backgroundColor: bgColor }}>{icon}</div>
    <div>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
    </div>
  </div>
);

const styles = {
  page: { padding: '30px' },
  header: { marginBottom: '30px' },
  headerTitle: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  subtitle: { color: '#64748b', fontSize: '0.9rem', margin: 0 },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '30px' },
  statCard: { flex: 1, background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  statIcon: { padding: '12px', borderRadius: '10px' },
  statLabel: { margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  statValue: { margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' },
  contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', alignItems: 'start' }
};

export default AdminFinance;