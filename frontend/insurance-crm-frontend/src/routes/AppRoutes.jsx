import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoutes";
import Login from "../pages/Login";
import AdminHome from "../pages/AdminHome";
import CurrentLead from "../pages/CurrentLead";
import Process from "../pages/Process";
import Await from "../pages/Await";
import CreateAgent from "../pages/CreateAgent";
import UploadLeads from "../pages/UploadLeads";
import Leads from "../pages/Leads.jsx";
import Dashboard from "../pages/AgentHome"
import { Navigate } from "react-router-dom";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="owner"><AdminHome /></ProtectedRoute>} />
        <Route path="/admin/create-agent" element={<ProtectedRoute role="owner"><CreateAgent /></ProtectedRoute>} />
        <Route path="/admin/upload-leads" element={<ProtectedRoute role="owner"><UploadLeads /></ProtectedRoute>} />

        {/* Agent Routes */}
        <Route path="/agent/home" element={<ProtectedRoute role="agent"><Dashboard/></ProtectedRoute>} />
        <Route path="/agent/leads" element={<ProtectedRoute role="agent"><Leads /></ProtectedRoute>} />
        <Route path="/lead/:id" element={<ProtectedRoute role="agent"><CurrentLead /></ProtectedRoute>} />
        <Route path="/lead/:id/process" element={<ProtectedRoute role="agent"><Process /></ProtectedRoute>} />
        <Route path="/lead/:id/await" element={<ProtectedRoute role="agent"><Await /></ProtectedRoute>} />

        {/* THE CATCH-ALL MUST BE INSIDE THE ROUTES BLOCK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRoutes;