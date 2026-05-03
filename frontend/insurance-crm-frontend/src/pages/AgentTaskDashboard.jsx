import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Bell, Settings, UserCircle, Search, ChevronDown, Plus, 
  ChevronLeft, ChevronRight, Edit2, CheckCircle, Filter, X
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

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null); 
  const [formData, setFormData] = useState({ title: '', due_date: '', priority: 'medium' });

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

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({ title: task.title, due_date: task.due_date, priority: task.priority });
    } else {
      setEditingTask(null);
      setFormData({ title: '', due_date: '', priority: 'medium' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.patch(`agent/tasks/${editingTask.id}/update/`, formData);
      } else {
        await api.post("agent/tasks/create/", formData);
      }
      setIsModalOpen(false);
      fetchTasks();
      fetchCounts();
    } catch (err) {
      alert("Error saving task.");
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      await api.put(`agent/tasks/${id}/complete/`);
      fetchTasks();
      fetchCounts();
    } catch (err) {
      alert("Could not update status.");
    }
  };

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>Agent Dashboard <ChevronDown size={16} /></div>
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
            {/* FIXED: Added flexShrink and fixed width to prevent overlap */}
            <button style={styles.filterBtn}>
              <Filter size={18} /> <span>Filters</span> <ChevronDown size={16} />
            </button>
          </div>
          <button onClick={() => openModal()} style={styles.primaryBtn}>
            <Plus size={20} /> New Task
          </button>
        </div>

        <div style={styles.card}>
          <div style={styles.tabBar}>
            {['all', 'pending', 'completed', 'overdue'].map(id => (
              <button key={id} onClick={() => { setStatusTab(id); setPage(1); }} style={statusTab === id ? styles.tabActive : styles.tab}>
                {id.charAt(0).toUpperCase() + id.slice(1)} <span style={styles.tabCount}>({counts[id] || 0})</span>
                {statusTab === id && <div style={styles.tabIndicator} />}
              </button>
            ))}
          </div>

          <div style={styles.priorityRow}>
            {['high', 'medium', 'low'].map(p => (
              <button 
                key={p} 
                onClick={() => { setPriorityFilter(priorityFilter === p ? null : p); setPage(1); }}
                style={{...styles.priorityBtn, ...styles[`p${p.charAt(0).toUpperCase() + p.slice(1)}`], border: priorityFilter === p ? '2px solid #2563eb' : '1px solid transparent'}}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)} <span>({counts[p] || 0})</span>
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
                  <tr><td colSpan={6} style={styles.emptyState}>Syncing...</td></tr>
                ) : tasks.length === 0 ? (
                  <tr><td colSpan={6} style={styles.emptyState}>No tasks found.</td></tr>
                ) : tasks.map((task, idx) => (
                  <tr key={task.id} style={idx % 2 === 1 ? styles.trAlt : styles.tr}>
                    <td style={styles.td}><input type="checkbox" /></td>
                    <td style={styles.tdTask}>{task.title}</td>
                    <td style={styles.td}>{task.due_date}</td>
                    <td style={styles.tdLead}>{task.lead_name || "—"}</td>
                    <td style={styles.td}><span style={{...styles.badge, ...styles[`badge_${task.priority}`]}}>{task.priority}</span></td>
                    <td style={styles.td}>
                      <div style={styles.actionContainer}>
                        <button onClick={() => openModal(task)} style={styles.editBtn}><Edit2 size={12} /> EDIT</button>
                        {!task.is_completed && <button onClick={() => handleCompleteTask(task.id)} style={styles.doneBtn}><CheckCircle size={18} /></button>}
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

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={{margin:0, fontWeight: 900}}>{editingTask ? "Edit Task" : "New Task"}</h2>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}><X /></button>
            </div>
            <form onSubmit={handleSubmit} style={styles.modalForm}>
              <label style={styles.label}>Task Description</label>
              <input required style={styles.modalInput} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Call client" />
              <label style={styles.label}>Due Date</label>
              <input required type="date" style={styles.modalInput} value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
              <label style={styles.label}>Priority</label>
              <select style={styles.modalInput} value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button type="submit" style={styles.modalSubmit}>{editingTask ? "Save Changes" : "Create Task"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  // REMOVED: marginLeft completely. flex: 1 makes it fill the space next to sidebar.
  pageContainer: { 
    flex: 1, 
    minHeight: '100vh', 
    backgroundColor: '#f1f5f9', 
    fontFamily: 'Inter, sans-serif' 
  },
  header: { 
    backgroundColor: 'white', 
    borderBottom: '1px solid #e2e8f0', 
    padding: '16px 32px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    position: 'sticky', 
    top: 0, 
    zIndex: 10 
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: '700', fontSize: '14px' },
  headerTitle: { fontSize: '20px', fontWeight: '900', color: '#1e293b', margin: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  iconBtn: { padding: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', cursor: 'pointer' },
  avatar: { width: '40px', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '50%', border: '2px solid white' },
  
  contentPadding: { padding: '40px' },
  controlsRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '32px', gap: '20px', alignItems: 'center' },
  
  searchAndFilter: { display: 'flex', gap: '12px', flex: 1, maxWidth: '650px' },
  searchWrapper: { position: 'relative', flex: 1 },
  searchIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  searchInput: { width: '100%', padding: '12px 16px 12px 48px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '14px', outline: 'none' },
  
  // FIXED: No more overlap
  filterBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 20px', 
    backgroundColor: 'white', 
    border: '1px solid #e2e8f0', 
    borderRadius: '16px', 
    fontWeight: '700', 
    color: '#475569', 
    cursor: 'pointer', 
    flexShrink: 0, // Prevents search bar from crushing it
    minWidth: '110px' 
  },

  primaryBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#fbbf24', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', flexShrink: 0 },

  card: { backgroundColor: 'white', borderRadius: '32px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  tabBar: { display: 'flex', gap: '32px', borderBottom: '1px solid #f1f5f9', marginBottom: '32px', position: 'relative' },
  tab: { paddingBottom: '16px', fontSize: '14px', fontWeight: '700', color: '#94a3b8', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' },
  tabActive: { paddingBottom: '16px', fontSize: '14px', fontWeight: '700', color: '#2563eb', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', position: 'relative' },
  tabCount: { fontWeight: '900', marginLeft: '4px' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', backgroundColor: '#2563eb', borderRadius: '10px' },
  
  priorityRow: { display: 'flex', gap: '16px', marginBottom: '32px' },
  priorityBtn: { padding: '10px 20px', borderRadius: '16px', fontSize: '12px', fontWeight: '900', cursor: 'pointer', display: 'flex', gap: '8px' },
  pHigh: { backgroundColor: '#fee2e2', color: '#dc2626' },
  pMedium: { backgroundColor: '#ffedd5', color: '#ea580c' },
  pLow: { backgroundColor: '#ecfdf5', color: '#10b981' },
  
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
  editBtn: { backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' },
  doneBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer' },
  
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: '700' },
  pagination: { display: 'flex', gap: '4px' },
  pageBtn: { width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white' },
  pageBtnActive: { width: '36px', height: '36px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: '700' },
  emptyState: { padding: '80px', textAlign: 'center', color: '#94a3b8', fontWeight: '700' },

  // MODAL STYLES
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { backgroundColor: 'white', padding: '32px', borderRadius: '32px', width: '100%', maxWidth: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  label: { fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
  modalInput: { padding: '14px', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', fontWeight: '600' },
  modalSubmit: { marginTop: '12px', padding: '16px', borderRadius: '16px', backgroundColor: '#2563eb', color: 'white', border: 'none', fontWeight: '900', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)' }
};

export default AgentTaskDashboard;