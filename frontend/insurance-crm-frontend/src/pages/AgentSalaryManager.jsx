import React, { useState, useEffect } from 'react';
import api from "../services/api";
import { Save, UserCog, TrendingUp } from 'lucide-react';

const AgentSalaryManager = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [tempSalary, setTempSalary] = useState("");

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    const res = await api.get("admin/agents/");
    setAgents(res.data);
    setLoading(false);
  };

  const handleUpdateSalary = async (id) => {
    try {
      await api.patch(`admin/update-salary/${id}/`, { base_salary: tempSalary });
      setEditingId(null);
      fetchAgents(); // Refresh the list
    } catch (err) {
      alert("Error updating salary");
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Agent Salary & Payout Management</h3>
      <table style={styles.table}>
        <thead>
          <tr style={styles.thRow}>
            <th style={styles.th}>Agent Name</th>
            <th style={styles.th}>Username</th>
            <th style={styles.th}>Base Salary (Monthly)</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.map(agent => (
            <tr key={agent.id} style={styles.tr}>
              <td style={styles.td}>{agent.name}</td>
              <td style={styles.td}>{agent.username}</td>
              <td style={styles.td}>
                {editingId === agent.id ? (
                  <input 
                    type="number" 
                    value={tempSalary} 
                    onChange={(e) => setTempSalary(e.target.value)}
                    style={styles.inlineInput}
                  />
                ) : (
                  <span style={styles.salaryText}>₹{agent.base_salary?.toLocaleString() || "20,000"}</span>
                )}
              </td>
              <td style={styles.td}>
                {editingId === agent.id ? (
                  <button onClick={() => handleUpdateSalary(agent.id)} style={styles.saveBtn}>
                    <Save size={14} /> Save
                  </button>
                ) : (
                  <button onClick={() => { setEditingId(agent.id); setTempSalary(agent.base_salary); }} style={styles.editBtn}>
                    Edit Salary
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  card: { background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '20px' },
  title: { margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thRow: { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' },
  th: { padding: '12px', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '15px 12px', fontSize: '0.9rem', color: '#1e293b' },
  salaryText: { fontWeight: '700', color: '#10b981' },
  inlineInput: { padding: '5px 10px', width: '100px', borderRadius: '4px', border: '1px solid #3b82f6' },
  editBtn: { background: 'none', border: '1px solid #cbd5e1', padding: '5px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', color: '#64748b' },
  saveBtn: { background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }
};

export default AgentSalaryManager;