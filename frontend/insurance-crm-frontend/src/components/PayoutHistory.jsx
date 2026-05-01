import React, { useState, useEffect } from 'react';
import api from "../services/api";
import { History, Search } from 'lucide-react';

const PayoutHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("admin/payout-history/");
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={20} color="#64748b" />
          <h3 style={styles.title}>Full Payout Log</h3>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Agent</th>
              <th style={styles.th}>Incentive Type</th>
              <th style={styles.th}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={row.id} style={styles.tr}>
                <td style={styles.td}>{row.date}</td>
                <td style={{ ...styles.td, fontWeight: '700' }}>{row.agent_name}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{row.type}</span>
                </td>
                <td style={styles.tdBold}>₹{row.amount.toLocaleString()}</td>
              </tr>
            ))}
            {history.length === 0 && !loading && (
              <tr><td colSpan="4" style={styles.empty}>No payout history recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px' },
  cardHeader: { marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { margin: 0, fontSize: '1rem', fontWeight: '800', color: '#1e293b' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { background: '#f8fafc', textAlign: 'left' },
  th: { padding: '12px 15px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '12px 15px', fontSize: '0.85rem', color: '#475569' },
  tdBold: { padding: '12px 15px', fontSize: '0.85rem', color: '#1e3a8a', fontWeight: '800' },
  badge: { backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', color: '#475569' },
  empty: { textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.9rem' }
};

export default PayoutHistory;