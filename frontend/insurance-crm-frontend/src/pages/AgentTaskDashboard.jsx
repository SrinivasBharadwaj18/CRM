import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Bell, Settings, UserCircle, Search, ChevronDown, Plus, 
  ChevronLeft, ChevronRight, Edit2, CheckCircle, Filter
} from 'lucide-react';

const AgentTaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, completed: 0, overdue: 0, high: 0, medium: 0, low: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchCounts();
  }, [page, searchTerm, statusTab, priorityFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("agent/tasks/", {
        params: { page, q: searchTerm, status: statusTab !== 'all' ? statusTab : undefined, priority: priorityFilter || undefined, limit: 8 }
      });
      setTasks(res.data.results || []); 
      setTotalPages(res.data.count ? Math.ceil(res.data.count / 8) : 1);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await api.get("agent/tasks/counts/");
      setCounts(res.data);
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await api.put(`agent/tasks/${id}/complete/`);
      fetchTasks();
      fetchCounts();
    } catch (err) {
      alert("Could not update task status.");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          Agent Dashboard <ChevronDown size={16} />
        </div>
        <h1 style={styles.headerTitle}>Tasks</h1>
        <div style={styles.headerRight}>
          <button style={styles.iconBtn}><Bell size={20}/></button>
          <button style={styles.iconBtn}><Settings size={20}/></button>
          <div style={styles.avatar}><UserCircle size={40} /></div>
        </div>
      </header>

      <div style={styles.contentPadding}>
        <div style={styles.controlsRow}>
          <div style={styles.searchAndFilter}>
            <div style={styles.searchWrapper}>
              <Search style={styles.searchIcon} size={18} />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                style={styles.searchInput}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button style={styles.secondaryBtn}>
              <Filter size={18} /> Filters <ChevronDown size={16} />
            </button>
          </div>
          <button style={styles.primaryBtn}>
            <Plus size={20} /> New Task
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.tabBar}>
            {[
              { id: 'all', label: 'All Tasks', count: counts.all, color: '#1e293b' },
              { id: 'pending', label: 'Pending', count: counts.pending, color: '#f97316' },
              { id: 'completed', label: 'Completed', count: counts.completed, color: '#1e293b' },
              { id: 'overdue', label: 'Overdue', count: counts.overdue, color: '#ef4444' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setStatusTab(tab.id); setPage(1); }}
                style={statusTab === tab.id ? styles.tabActive : styles.tab}
              >
                {tab.label} <span style={{...styles.tabCount, color: statusTab === tab.id ? '#2563eb' : tab.color}}>({tab.count})</span>
                {statusTab === tab.id && <div style={styles.tabIndicator} />}
              </button>
            ))}
          </div>

          <div style={styles.priorityRow}>
            {[
              { id: 'high', label: 'High', count: counts.high, badge: styles.badge_high },
              { id: 'medium', label: 'Medium', count: counts.medium, badge: styles.badge_medium },
              { id: 'low', label: 'Low', count: counts.low, badge: styles.badge_low },
            ].map(p => (
              <button 
                key={p.id}
                onClick={() => { setPriorityFilter(priorityFilter === p.id ? null : p.id); setPage(1); }}
                style={{
                    ...styles.priorityBtn, 
                    ...p.badge, 
                    border: priorityFilter === p.id ? '2px solid #2563eb' : '1px solid transparent'
                }}
              >
                {p.label} <span>({p.count})</span>
              </button>
            ))}
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}><input type="checkbox" /></th>
                  <th style={styles.th}>Task</th>
                  <th style={styles.th}>Due Date</th>
                  <th style={styles.th}>Lead Name</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={styles.emptyState}>Updating tasks...</td></tr>
                ) : tasks.length === 0 ? (
                  <tr><td colSpan={6} style={styles.emptyState}>No tasks found.</td></tr>
                ) : tasks.map((task, idx) => (
                  <tr key={task.id} style={idx % 2 === 1 ? styles.trAlt : styles.tr}>
                    <td style={styles.td}><input type="checkbox" /></td>
                    <td style={styles.tdTask}>{task.title}</td>
                    <td style={styles.td}>{task.due_date}</td>
                    <td style={styles.tdLead}>{task.lead_name || "—"}</td>
                    <td style={styles.td}>
                      <span style={{...styles.badge, ...styles[`badge_${task.priority}`]}}>{task.priority}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionContainer}>
                        <button style={styles.editBtn}><Edit2 size={12} /> EDIT</button>
                        {!task.is_completed && (
                          <button onClick={() => handleCompleteTask(task.id)} style={styles.doneBtn}><CheckCircle size={18} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.footer}>
            <div>Showing {tasks.length} of {counts.all} tasks</div>
            <div style={styles.pagination}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={styles.pageBtn}><ChevronLeft size={16} /></button>
              <button style={styles.pageBtnActive}>{page}</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={styles.pageBtn}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  // CRITICAL FIX: Removed marginLeft and width calc
  pageContainer: { flex: 1, minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Inter, sans-serif' },
  
  header: { backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: '700', fontSize: '14px' },
  headerTitle: { fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  iconBtn: { padding: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', cursor: 'pointer' },
  avatar: { width: '40px', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '50%', border: '2px solid white' },

  contentPadding: { padding: '40px' },
  controlsRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '32px', gap: '16px' },
  searchAndFilter: { display: 'flex', gap: '16px', flex: 1, maxWidth: '600px' },
  searchWrapper: { position: 'relative', flex: 1 },
  searchIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  searchInput: { width: '100%', padding: '12px 16px 12px 48px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '14px', outline: 'none' },
  secondaryBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', fontWeight: '700', color: '#475569', cursor: 'pointer' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#fbbf24', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer' },

  card: { backgroundColor: 'white', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  tabBar: { display: 'flex', gap: '32px', borderBottom: '1px solid #f1f5f9', marginBottom: '32px', position: 'relative' },
  tab: { paddingBottom: '16px', fontSize: '14px', fontWeight: '700', color: '#94a3b8', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' },
  tabActive: { paddingBottom: '16px', fontSize: '14px', fontWeight: '700', color: '#2563eb', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', position: 'relative' },
  tabCount: { fontWeight: '900', marginLeft: '4px' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', backgroundColor: '#2563eb', borderRadius: '10px' },

  priorityRow: { display: 'flex', gap: '16px', marginBottom: '32px' },
  priorityBtn: { padding: '10px 20px', borderRadius: '16px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', gap: '8px' },
  
  tableWrapper: { border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thead: { backgroundColor: '#f8fafc' },
  th: { padding: '16px', fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #f8fafc' },
  trAlt: { backgroundColor: '#fdfdff' },
  td: { padding: '16px', fontSize: '13px', color: '#64748b', fontWeight: '600' },
  tdTask: { padding: '16px', fontSize: '14px', color: '#1e40af', fontWeight: '800' },
  tdLead: { padding: '16px', fontSize: '14px', color: '#334155', fontWeight: '700' },
  badge: { padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: '900' },
  badge_high: { backgroundColor: '#fee2e2', color: '#dc2626' },
  badge_medium: { backgroundColor: '#ffedd5', color: '#ea580c' },
  badge_low: { backgroundColor: '#ecfdf5', color: '#10b981' },

  actionContainer: { display: 'flex', alignItems: 'center', gap: '8px' },
  editBtn: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900' },
  doneBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px', borderRadius: '8px' },

  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '700' },
  pagination: { display: 'flex', gap: '4px' },
  pageBtn: { width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white' },
  pageBtnActive: { width: '36px', height: '36px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: '700' },
  emptyState: { padding: '80px', textAlign: 'center', color: '#94a3b8', fontWeight: '700' }
};

export default AgentTaskDashboard;