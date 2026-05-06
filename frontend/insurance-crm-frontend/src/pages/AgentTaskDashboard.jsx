import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Bell, Settings, UserCircle, Search, ChevronDown, Plus, 
  ChevronLeft, ChevronRight, Edit2, CheckCircle, X, PhoneCall
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
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    due_date: '', 
    due_time: '', 
    priority: 'medium' 
  });

  // Notification setup
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    
    const interval = setInterval(checkDueNotifications, 60000);
    return () => clearInterval(interval);
  }, [tasks]);

  useEffect(() => {
    fetchTasks();
    fetchCounts();
  }, [page, searchTerm, statusTab, priorityFilter]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("agent/tasks/", {
        params: { 
          page, 
          q: searchTerm, 
          status: statusTab !== 'all' ? statusTab : undefined, 
          priority: priorityFilter || undefined, 
          limit: 8 
        }
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

  const checkDueNotifications = () => {
    const now = new Date();
    tasks.forEach(task => {
      if (task.is_completed) return;
      const taskDue = new Date(`${task.due_date}T${task.due_time || '00:00'}`);
      if (Math.abs(taskDue - now) < 60000) {
        if (Notification.permission === "granted") {
          new Notification(`Task Reminder: ${task.title}`, {
            body: task.description || "This task is due now!",
            icon: "/favicon.ico"
          });
        }
      }
    });
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({ 
        title: task.title, 
        description: task.description || '', 
        due_date: task.due_date, 
        due_time: task.due_time || '', 
        priority: task.priority 
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', due_date: '', due_time: '', priority: 'medium' });
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
        <div style={styles.headerLeft}>Agent Dashboard <ChevronDown size={14} style={{marginLeft: 4}}/></div>
        <h1 style={styles.headerTitle}>Tasks</h1>
        <div style={styles.headerRight}>
          <button style={styles.iconBtn}><Bell size={20}/></button>
          <button style={styles.iconBtn}><Settings size={20}/></button>
          <div style={styles.avatar}><UserCircle size={32} /></div>
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
                style={{
                  ...styles.priorityPill, 
                  ...styles[`p${p.charAt(0).toUpperCase() + p.slice(1)}`],
                  border: priorityFilter === p ? `1.5px solid ${styles[`p${p.charAt(0).toUpperCase() + p.slice(1)}`].color}` : '1.5px solid transparent'
                }}
              >
                <div style={{...styles.dot, backgroundColor: styles[`p${p.charAt(0).toUpperCase() + p.slice(1)}`].color}} />
                {p.charAt(0).toUpperCase() + p.slice(1)} <span style={{marginLeft: 4, opacity: 0.8}}>{counts[p] || 0}</span>
              </button>
            ))}
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  <th style={styles.th}><input type="checkbox" style={styles.checkbox}/></th>
                  <th style={styles.th}>Task</th>
                  <th style={styles.th}>Due Date</th>
                  <th style={styles.th}>Lead Name</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={styles.emptyState}>Syncing tasks...</td></tr>
                ) : tasks.length === 0 ? (
                  <tr><td colSpan={7} style={styles.emptyState}>No tasks found.</td></tr>
                ) : tasks.map((task) => (
                  <tr key={task.id} style={styles.tr}>
                    <td style={styles.td}><input type="checkbox" style={styles.checkbox} /></td>
                    <td style={styles.tdTask}>
                        <div style={{fontWeight: 700}}>{task.title}</div>
                        <div style={{fontSize: '11px', color: '#94a3b8', fontWeight: 500}}>{task.due_time}</div>
                    </td>
                    <td style={styles.td}>{task.due_date}</td>
                    <td style={styles.tdLead}>{task.lead_name || "—"}</td>
                    <td style={styles.td}>
                        <span style={{...styles.tableBadge, ...styles[`badge_${task.priority}`]}}>
                            {task.priority.toUpperCase()}
                        </span>
                    </td>
                    <td style={styles.td}>
                         <div style={{display:'flex', alignItems:'center', gap: 4, color: styles[`badge_${task.priority}`].color}}>
                            <PhoneCall size={12}/> <span style={{fontSize: 12, fontWeight: 700}}>{task.priority}</span>
                         </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actionContainer}>
                        <button onClick={() => openModal(task)} style={styles.editBtn}><Edit2 size={14} /> Edit</button>
                        {!task.is_completed && (
                            <button onClick={() => handleCompleteTask(task.id)} style={styles.doneBtn}>
                                <CheckCircle size={20} />
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.footer}>
            <div style={styles.showingText}>Showing {tasks.length} of {counts.all} tasks</div>
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
              <label style={styles.label}>Task Title</label>
              <input required style={styles.modalInput} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Follow up with client" />
              
              <label style={styles.label}>Description</label>
              <textarea 
                style={{...styles.modalInput, minHeight: '80px', resize: 'none'}} 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Enter task details..."
              />

              <div style={{display: 'flex', gap: '15px'}}>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Due Date</label>
                  <input required type="date" style={styles.modalInput} value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                </div>
                <div style={{flex: 1}}>
                  <label style={styles.label}>Due Time</label>
                  <input required type="time" style={styles.modalInput} value={formData.due_time} onChange={e => setFormData({...formData, due_time: e.target.value})} />
                </div>
              </div>

              <label style={styles.label}>Priority</label>
              <select style={styles.modalInput} value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <button type="submit" style={styles.modalSubmit}>{editingTask ? "Update Task" : "Create Task"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: { flex: 1, backgroundColor: '#f4f7fe', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 30px', backgroundColor: '#3b5cb8', color: 'white' },
  headerLeft: { display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '500', opacity: 0.9 },
  headerTitle: { fontSize: '20px', fontWeight: '700', margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  iconBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' },
  avatar: { width: '32px', height: '32px', backgroundColor: '#e2e8f0', borderRadius: '50%', color: '#333' },
  contentPadding: { padding: '24px 30px' },
  controlsRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  searchAndFilter: { display: 'flex', flex: 1, maxWidth: '500px' },
  searchWrapper: { position: 'relative', width: '100%' },
  searchIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#a3b1cc' },
  searchInput: { width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', border: '1px solid #e0e7ff', outline: 'none', backgroundColor: 'white' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', backgroundColor: '#ffb300', color: '#1e293b', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
  card: { backgroundColor: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)', border: '1px solid #edf2f7' },
  tabBar: { display: 'flex', gap: '25px', borderBottom: '1px solid #f1f4f9', marginBottom: '20px', position: 'relative' },
  tab: { padding: '10px 5px 15px 5px', fontSize: '15px', fontWeight: '600', color: '#a3b1cc', border: 'none', background: 'none', cursor: 'pointer' },
  tabActive: { padding: '10px 5px 15px 5px', fontSize: '15px', fontWeight: '700', color: '#3b5cb8', border: 'none', background: 'none', cursor: 'pointer', position: 'relative' },
  tabIndicator: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', backgroundColor: '#3b5cb8' },
  tabCount: { marginLeft: '4px', opacity: 0.7 },
  priorityRow: { display: 'flex', gap: '12px', marginBottom: '24px' },
  priorityPill: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  dot: { width: '8px', height: '8px', borderRadius: '50%' },
  pHigh: { backgroundColor: '#fff1f1', color: '#ef4444' },
  pMedium: { backgroundColor: '#fff7ed', color: '#f97316' },
  pLow: { backgroundColor: '#f0fdf4', color: '#22c55e' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#a3b1cc', fontWeight: '700' },
  tr: { borderBottom: '1px solid #f8fafc' },
  td: { padding: '16px', fontSize: '14px', color: '#64748b', fontWeight: '500' },
  tdTask: { padding: '16px', color: '#3b5cb8' },
  tdLead: { padding: '16px', color: '#1e293b', fontWeight: '600' },
  tableBadge: { padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  badge_high: { backgroundColor: '#fee2e2', color: '#ef4444' },
  badge_medium: { backgroundColor: '#ffedd5', color: '#f97316' },
  badge_low: { backgroundColor: '#dcfce7', color: '#22c55e' },
  checkbox: { width: '16px', height: '16px' },
  actionContainer: { display: 'flex', gap: '10px', alignItems: 'center' },
  editBtn: { backgroundColor: '#3b5cb8', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  doneBtn: { background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' },
  showingText: { fontSize: '13px', color: '#a3b1cc' },
  pagination: { display: 'flex', gap: '5px' },
  pageBtn: { width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white' },
  pageBtnActive: { width: '32px', height: '32px', borderRadius: '6px', background: '#3b5cb8', color: 'white', fontWeight: '700', border: 'none' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#a3b1cc' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '100%', maxWidth: '480px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#a3b1cc', textTransform: 'uppercase' },
  modalInput: { padding: '12px', borderRadius: '12px', border: '1px solid #e0e7ff', outline: 'none', fontSize: '14px' },
  modalSubmit: { marginTop: '10px', padding: '14px', borderRadius: '12px', backgroundColor: '#3b5cb8', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }
};

export default AgentTaskDashboard;