function LeadCard({ lead, onClick }) {
  const isPlaceholder = lead.name.includes("...");

  return (
    <div onClick={onClick} style={cardStyles.card}>
      <div style={cardStyles.header}>
        <span style={cardStyles.statusTag}>{lead.status.toUpperCase()}</span>
      </div>

      <h3 style={cardStyles.name}>{lead.name}</h3>
      <p style={cardStyles.phone}>📞 {lead.phone}</p>

      {/* This matches your JSON: motor_details.vehicle_number */}
      {lead.motor_details ? (
        <div style={cardStyles.vehicleDetails}>
          <p style={cardStyles.vehicleNo}>🚗 {lead.motor_details.vehicle_number}</p>
          <p style={cardStyles.modelText}>{lead.motor_details.make} - {lead.motor_details.model}</p>
        </div>
      ) : (
        !isPlaceholder && <p style={cardStyles.modelText}>No vehicle details</p>
      )}
    </div>
  );
}

const cardStyles = {
  card: { backgroundColor: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: "pointer" },
  statusTag: { backgroundColor: "#e2e8f0", padding: "4px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "bold" },
  name: { fontSize: "1.1rem", margin: "10px 0 5px 0", color: "#1e293b" },
  phone: { color: "#64748b", fontSize: "0.9rem", marginBottom: "15px" },
  vehicleDetails: { borderTop: "1px solid #f1f5f9", paddingTop: "10px" },
  vehicleNo: { fontWeight: "bold", fontSize: "0.85rem", margin: 0 },
  modelText: { fontSize: "0.75rem", color: "#94a3b8", margin: "4px 0 0 0" }
};

export default LeadCard;