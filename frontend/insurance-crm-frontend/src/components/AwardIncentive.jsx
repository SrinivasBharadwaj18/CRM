import React, { useState, useEffect } from 'react';
import api from "../services/api";
import { Send, UserPlus, IndianRupee } from 'lucide-react';

const AwardIncentive = () => {
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({ agent_id: '', amount: '', type: 'performance' });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Fetch list of agents to populate the dropdown
  useEffect(() => {
    api.get("admin/agents/").then(res => setAgents(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("admin/award-incentive/", formData);
      setStatusMsg({ type: 'success', text: "Incentive Awarded!" });
      setFormData({ agent_id: '', amount: '', type: 'performance' }); // Reset
    } catch (err) {
      setStatusMsg({ type: 'error', text: "Failed to award incentive." });
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  return (
    <div style={styles.awardCard}>
      <h3 style={styles.title}>Manual Incentive Award</h3>
      <form onSubmit={handleSubmit} style={styles.form}>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Select Agent</label>
          <select 
            required
            value={formData.agent_id}
            onChange={(e) => setFormData({...formData, agent_id: e.target.value})}
            style={styles.select}
          >
            <option value="">-- Choose Agent --</option>
            {agents.map(a => (
            <option key={a.emp_id} value={a.emp_id}> {/* Changed from a.id */}
                {a.username} ({a.name})
            </option>
            ))}
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Amount (₹)</label>
          <input 
            type="number" 
            required
            placeholder="500"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Type</label>
          <select 
            value={formData.type}
            onChange={(e) => setFormData({...formData, type: e.target.value})}
            style={styles.select}
          >
            <option value="performance">Performance Bonus</option>
            <option value="monthly_target">Target Achievement</option>
            <option value="weekly_bonus">Weekly Bonus</option>
            <option value="attendance">Login/Attendance</option>
          </select>
        </div>

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? "Processing..." : <><Send size={16}/> Award Now</>}
        </button>

        {statusMsg && (
          <div style={{...styles.alert, backgroundColor: statusMsg.type === 'success' ? '#dcfce7' : '#fee2e2'}}>
            {statusMsg.text}
          </div>
        )}
      </form>
    </div>
  );
};

const styles = {
  awardCard: { background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '400px' },
  title: { margin: '0 0 20px 0', fontSize: '1rem', fontWeight: '800', color: '#1e293b' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.75rem', fontWeight: '700', color: '#64748b' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' },
  select: { padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: 'white' },
  btn: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  alert: { marginTop: '10px', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center', fontWeight: '600' }
};

export default AwardIncentive;