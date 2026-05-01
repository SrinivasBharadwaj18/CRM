import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoutes";
import MainLayout from "../components/MainLayout"; // Import the layout
import Login from "../pages/Login";
import AdminHome from "../pages/AdminHome";
import CurrentLead from "../pages/CurrentLead";
import Process from "../pages/Process";
import Await from "../pages/Await";
import CreateAgent from "../pages/CreateAgent";
import UploadLeads from "../pages/UploadLeads";
import Leads from "../pages/Leads.jsx";
import Dashboard from "../pages/AgentHome"
import MyEarnings from "../pages/MyEarnings.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - No Navbar */}
        <Route path="/" element={<Login />} />

        {/* Admin Routes - Wrapped in MainLayout */}
        <Route path="/admin" element={
          <ProtectedRoute role="owner"><MainLayout><AdminHome /></MainLayout></ProtectedRoute>
        } />
        <Route path="/admin/create-agent" element={
          <ProtectedRoute role="owner"><MainLayout><CreateAgent /></MainLayout></ProtectedRoute>
        } />
        <Route path="/admin/upload-leads" element={
          <ProtectedRoute role="owner"><MainLayout><UploadLeads /></MainLayout></ProtectedRoute>
        } />
        <Route path="/admin/finance" element={
          <ProtectedRoute role="owner"><MainLayout><AdminFinance /></MainLayout></ProtectedRoute>
        } />

        {/* Agent Routes - Wrapped in MainLayout */}
        <Route path="/agent/home" element={
          <ProtectedRoute role="agent"><MainLayout><Dashboard /></MainLayout></ProtectedRoute>
        } />
        <Route path="/agent/leads" element={
          <ProtectedRoute role="agent"><MainLayout><Leads /></MainLayout></ProtectedRoute>
        } />
        <Route path="/lead/:id" element={
          <ProtectedRoute role="agent"><MainLayout><CurrentLead /></MainLayout></ProtectedRoute>
        } />
        <Route path="/lead/:id/process" element={
          <ProtectedRoute role="agent"><MainLayout><Process /></MainLayout></ProtectedRoute>
        } />
        <Route path="/lead/:id/await" element={
          <ProtectedRoute role="agent"><MainLayout><Await /></MainLayout></ProtectedRoute>
        } />
        <Route path="/agent/earnings" element={
          <ProtectedRoute role="agent"><MainLayout><MyEarnings /></MainLayout></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;