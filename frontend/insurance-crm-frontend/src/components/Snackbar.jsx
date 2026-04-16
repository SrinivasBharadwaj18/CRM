import { useEffect } from "react";

function Snackbar({ message, type, onClose }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const colors = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6"
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "40px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: colors[type] || colors.info,
      color: "white",
      padding: "12px 24px",
      borderRadius: "12px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
      zIndex: 9999,
      fontWeight: "700",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      minWidth: "300px",
      justifyContent: "center"
    }}>
      {type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}
      {message}
    </div>
  );
}

export default Snackbar;