import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function CurrentLead() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  // States for Closing the Lead
  const [isClosing, setIsClosing] = useState(false);
  const [closeReason, setCloseReason] = useState("");

  useEffect(() => {
    fetchLeadData();
  }, [id]);

  const fetchLeadData = async () => {
    try {
      const res = await api.get(`leads/${id}/`); 
      setLead(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to ensure dates are displayed in Local (IST) format
  const formatLocalTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const handleMarkAsPaid = async () => {
    try {
      await api.post(`agent/${id}/mark-paid/`);
      fetchLeadData(); // Refresh to show "Paid" status
    } catch (err) {
      console.error("Payment update failed:", err);
      alert("Failed to update payment status.");
    }
  };

  const handleCloseLead = async () => {
    if (!closeReason.trim()) {
      alert("Please provide a reason for closing this lead.");
      return;
    }

    try {
      await api.post(`agent/${id}/close/`, { reason: closeReason });
      navigate("/agent/leads");
    } catch (err) {
      console.error("Failed to close lead:", err);
      alert("Error: Could not close the lead.");
    }
  };

  if (loading) return <div style={styles.loading}>Loading Lead Details...</div>;
  if (!lead) return <div style={styles.loading}>Lead not found.</div>;

  const isConverted = lead.status === 'converted';
  const isPaid = lead.payment_status === 'paid';

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.container}>
        <div style={styles.breadcrumb} onClick={() => navigate("/agent/leads")}>
          ← Back to My Leads
        </div>

        <div style={styles.profileCard}>
          {/* HEADER */}
          <div style={styles.cardHeader}>
            <div style={styles.avatar}>{lead.name.charAt(0)}</div>
            <div>
              <h2 style={styles.leadName}>{lead.name}</h2>
              <div style={styles.headerBadges}>
                <span style={styles.statusBadge}>{lead.status}</span>
                <span style={styles.typeBadge}>{lead.insurance_type}</span>
              </div>
            </div>
          </div>

          <div style={styles.mainContent}>
            
            {/* 📝 POLICY PLAN DETAILS (Show only for converted leads) */}
            {isConverted && (
              <section style={styles.planSection}>
                <h3 style={styles.sectionTitle}>Policy Plan Details</h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Company & Plan</span>
                    <p style={styles.value}>
                        {lead.plan_details?.company || "N/A"} - {lead.plan_details?.plan_name || "N/A"}
                    </p>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Premium Amount</span>
                    <p style={styles.value}>₹ {lead.plan_details?.premium_amount || "0"}</p>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Payment Status</span>
                    <div style={isPaid ? styles.paidBadge : styles.pendingBadge}>
                      {isPaid ? "PAID" : "PENDING"}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* CONTACT SECTION */}
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Contact Information</h3>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.label}>Phone</span>
                  <p style={styles.value}>📞 {lead.phone}</p>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.label}>Email</span>
                  <p style={styles.value}>✉️ {lead.email || "Not Provided"}</p>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.label}>Assigned Date</span>
                  <p style={styles.value}>📅 {formatLocalTime(lead.assigned_at)}</p>
                </div>
              </div>
            </section>

            <hr style={styles.divider} />

            {/* INTERACTION HISTORY */}
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>💬 Interaction History</h3>
              <div style={styles.timeline}>
                {lead.followups && lead.followups.length > 0 ? (
                  [...lead.followups]
                    .sort((a, b) => new Date(b.call_date) - new Date(a.call_date))
                    .map((note) => (
                      <div key={note.id} style={styles.timelineItem}>
                        <div style={styles.timelineHeader}>
                           <span style={styles.timelineDate}>
                             📅 {formatLocalTime(note.call_date)}
                           </span>
                           <span style={styles.statusPill}>{note.follow_up_status}</span>
                        </div>
                        <p style={styles.noteText}><strong>Notes:</strong> {note.notes}</p>
                        {note.next_action && (
                          <p style={styles.actionText}>🚀 <strong>Next Action:</strong> {note.next_action}</p>
                        )}
                      </div>
                    ))
                ) : (
                  <p style={{color: "#94a3b8", fontStyle: "italic"}}>No previous notes found.</p>
                )}
              </div>
            </section>

            <hr style={styles.divider} />

            {/* VEHICLE DETAILS */}
            {lead.motor_details && (
              <section style={styles.section}>
                <h3 style={styles.sectionTitle}>🚗 Motor Vehicle Details</h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Make & Model</span>
                    <p style={styles.value}>{lead.motor_details.make} - {lead.motor_details.model}</p>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Vehicle Number</span>
                    <p style={styles.value}>{lead.motor_details.vehicle_number}</p>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>RTO Location</span>
                    <p style={styles.value}>{lead.motor_details.rto_location}</p>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.label}>Policy Expiry</span>
                    <p style={styles.value}>{lead.motor_details.policy_expiry || "Unknown"}</p>
                  </div>
                </div>
              </section>
            )}

            {/* DYNAMIC ACTION FOOTER */}
            <div style={styles.actionFooter}>
              {isPaid ? (
                <div style={styles.closedMessage}>
                    🎉 This lead is converted and fully paid. No further action required.
                </div>
              ) : isConverted ? (
                /* Converted but Pending Payment */
                <button onClick={handleMarkAsPaid} style={styles.paidBtn}>
                  ✅ Confirm Payment Received
                </button>
              ) : isClosing ? (
                /* Closing Form */
                <div style={styles.closeFormContainer}>
                  <h4 style={styles.closeFormTitle}>Why is this lead not interested?</h4>
                  <textarea 
                    style={styles.textarea}
                    placeholder="Provide a detailed reason..."
                    value={closeReason}
                    onChange={(e) => setCloseReason(e.target.value)}
                  />
                  <div style={styles.closeBtnGroup}>
                    <button onClick={handleCloseLead} style={styles.confirmCloseBtn}>Confirm & Close Lead</button>
                    <button onClick={() => setIsClosing(false)} style={styles.cancelBtn}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* Standard Actions for Active Leads */
                <>
                  <button onClick={() => navigate(`/lead/${id}/process`)} style={styles.processBtn}>
                    Start Processing
                  </button>
                  <button onClick={() => navigate(`/lead/${id}/await`)} style={styles.awaitBtn}>
                    Move to Awaiting
                  </button>
                  <button onClick={() => setIsClosing(true)} style={styles.closeLeadBtn}>
                    Close Lead
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  pageWrapper: { backgroundColor: "#f1f5f9", minHeight: "100vh", paddingTop: "80px", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "1000px", margin: "0 auto", padding: "20px" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "1.2rem", color: "#64748b" },
  breadcrumb: { color: "#3b82f6", cursor: "pointer", marginBottom: "20px", fontWeight: "600" },
  profileCard: { backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", overflow: "hidden" },
  cardHeader: { padding: "40px", backgroundColor: "#1e293b", color: "white", display: "flex", alignItems: "center", gap: "25px" },
  avatar: { width: "70px", height: "70px", backgroundColor: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "bold" },
  leadName: { margin: 0, fontSize: "1.8rem" },
  headerBadges: { display: "flex", gap: "10px", marginTop: "10px" },
  statusBadge: { backgroundColor: "#10b981", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase" },
  typeBadge: { backgroundColor: "#6366f1", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase" },
  mainContent: { padding: "40px" },
  section: { marginBottom: "30px" },
  planSection: { backgroundColor: "#f0fdf4", padding: "20px", borderRadius: "12px", border: "1px solid #bbf7d0", marginBottom: "30px" },
  sectionTitle: { fontSize: "1.1rem", color: "#475569", marginBottom: "20px", borderLeft: "4px solid #3b82f6", paddingLeft: "15px" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "25px" },
  label: { display: "block", fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", marginBottom: "5px" },
  value: { fontSize: "1rem", color: "#1e293b", fontWeight: "600", margin: 0 },
  paidBadge: { backgroundColor: "#15803d", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "bold", display: "inline-block" },
  pendingBadge: { backgroundColor: "#f59e0b", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "bold", display: "inline-block" },
  divider: { border: 0, height: "1px", backgroundColor: "#e2e8f0", margin: "30px 0" },
  timeline: { display: "flex", flexDirection: "column", gap: "15px" },
  timelineItem: { padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" },
  timelineHeader: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  timelineDate: { fontSize: "0.8rem", fontWeight: "700", color: "#64748b" },
  statusPill: { fontSize: "0.6rem", textTransform: "uppercase", backgroundColor: "#e2e8f0", padding: "2px 8px", borderRadius: "10px", fontWeight: "bold" },
  noteText: { fontSize: "0.9rem", color: "#1e293b", margin: 0 },
  actionText: { fontSize: "0.85rem", color: "#2563eb", marginTop: "8px", backgroundColor: "#eff6ff", padding: "4px 8px", borderRadius: "4px", display: "inline-block" },
  actionFooter: { marginTop: "20px", width: "100%" },
  closedMessage: { backgroundColor: "#f0fdf4", color: "#166534", padding: "20px", borderRadius: "8px", fontWeight: "600", textAlign: "center", border: "1px solid #bbf7d0" },
  paidBtn: { width: "100%", backgroundColor: "#15803d", color: "white", border: "none", padding: "15px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  processBtn: { backgroundColor: "#3b82f6", color: "white", border: "none", padding: "15px 30px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginRight: "10px" },
  awaitBtn: { backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "15px 30px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginRight: "10px" },
  closeLeadBtn: { backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", padding: "15px 30px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  closeFormContainer: { padding: "20px", backgroundColor: "#fff1f2", borderRadius: "12px", border: "1px solid #fecaca" },
  closeFormTitle: { margin: "0 0 15px 0", color: "#991b1b", fontSize: "1rem" },
  textarea: { width: "100%", minHeight: "100px", padding: "12px", borderRadius: "8px", border: "1px solid #fda4af", fontSize: "0.9rem", fontFamily: "inherit" },
  closeBtnGroup: { marginTop: "15px", display: "flex", gap: "10px" },
  confirmCloseBtn: { backgroundColor: "#e11d48", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" },
  cancelBtn: { backgroundColor: "white", color: "#475569", border: "1px solid #cbd5e1", padding: "10px 20px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }
};

export default CurrentLead;