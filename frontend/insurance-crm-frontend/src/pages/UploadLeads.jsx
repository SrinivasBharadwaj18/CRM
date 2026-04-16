import { useState } from "react";
import axiosInstance from "../services/axiosInstance";
import Navbar from "../components/Navbar";
import Snackbar from "../components/Snackbar";

function UploadLeads() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null); // Clear previous results when new file is selected
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setToast({ message: "Please select a CSV file first", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await axiosInstance.post("admin/upload-leads/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data);
      setToast({ message: "Leads processed successfully!", type: "success" });
      setFile(null); // Reset file input
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || "Failed to upload leads";
      setToast({ message: errMsg, type: "error" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Navbar />

      <main style={styles.container}>
        <header style={styles.header}>
          <h2 style={styles.title}>Bulk Lead Import</h2>
          <p style={styles.subtitle}>Upload a CSV file to automatically assign leads to active agents.</p>
        </header>

        <div style={styles.uploadCard}>
          <form onSubmit={handleUpload} style={styles.form}>
            <div style={styles.dropZone}>
              <span style={styles.icon}>📄</span>
              <p style={styles.dropText}>
                {file ? `Selected: ${file.name}` : "Click to select or drag & drop CSV file"}
              </p>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                style={styles.hiddenInput} 
              />
            </div>

            <button 
              type="submit" 
              disabled={uploading || !file}
              style={{
                ...styles.uploadBtn,
                backgroundColor: uploading || !file ? "#94a3b8" : "#3b82f6"
              }}
            >
              {uploading ? "Processing Leads..." : "Start Upload"}
            </button>
          </form>

          {result && (
            <div style={styles.resultBox}>
              <h4 style={styles.resultTitle}>✅ Upload Complete</h4>
              <p style={styles.resultData}>
                <strong>{result.count}</strong> leads were successfully created and distributed.
              </p>
            </div>
          )}
        </div>

        <div style={styles.instructions}>
          <h4 style={styles.infoTitle}>CSV Requirements:</h4>
          <ul style={styles.list}>
            <li>Required columns: <strong>name, phone, insurance_type</strong></li>
            <li>Optional columns: <strong>email</strong></li>
            <li>Leads are assigned using a round-robin algorithm among active agents.</li>
          </ul>
        </div>
      </main>

      <Snackbar 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: "", type: "" })} 
      />
    </div>
  );
}

const styles = {
  pageWrapper: { backgroundColor: "#f8fafc", minHeight: "100vh", paddingTop: "90px", fontFamily: "'Inter', sans-serif" },
  container: { maxWidth: "700px", margin: "0 auto", padding: "0 20px" },
  header: { marginBottom: "30px", textAlign: "center" },
  title: { fontSize: "1.8rem", fontWeight: "800", color: "#0f172a", margin: 0 },
  subtitle: { color: "#64748b", marginTop: "8px" },
  uploadCard: { backgroundColor: "white", padding: "40px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" },
  dropZone: { position: "relative", border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "40px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", backgroundColor: "#fbfcfd" },
  hiddenInput: { position: "absolute", inset: 0, opacity: 0, cursor: "pointer" },
  icon: { fontSize: "2rem", marginBottom: "10px", display: "block" },
  dropText: { color: "#475569", fontWeight: "500", margin: 0 },
  uploadBtn: { width: "100%", marginTop: "24px", color: "white", border: "none", padding: "14px", borderRadius: "10px", fontWeight: "700", fontSize: "1rem", cursor: "pointer", transition: "background 0.2s" },
  resultBox: { marginTop: "30px", padding: "20px", backgroundColor: "#f0fdf4", borderRadius: "10px", border: "1px solid #dcfce7", textAlign: "center" },
  resultTitle: { color: "#166534", margin: "0 0 5px 0" },
  resultData: { color: "#15803d", margin: 0 },
  instructions: { marginTop: "30px", padding: "20px", color: "#64748b" },
  infoTitle: { fontSize: "0.9rem", fontWeight: "700", color: "#475569", marginBottom: "10px" },
  list: { fontSize: "0.85rem", paddingLeft: "20px", lineHeight: "1.6" }
};

export default UploadLeads;