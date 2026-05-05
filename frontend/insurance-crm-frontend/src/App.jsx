import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import BreakGuard from "./components/BreakGuard";
import api from "./services/api";
import './App.css';

function App() {
  // 1. Get the logged-in user from Redux
  const { user } = useSelector((state) => state.auth || {});
  
  // 2. Global state for the Break System
  const [isOnBreak, setIsOnBreak] = useState(false);

  // 3. Persistence: Check if the agent was already on break if they refresh the page
  useEffect(() => {
    if (user?.role === 'agent') {
      checkActiveBreak();
    }
  }, [user]);

  const checkActiveBreak = async () => {
    try {
      const res = await api.get('/agent/breaks/active/'); // You'll need this simple endpoint
      if (res.data.active) {
        setIsOnBreak(true);
      }
    } catch (err) {
      console.log("No active break found on mount.");
    }
  };

  return (
    <div className="app-layout" style={styles.layout}>
      
      {/* 1. SIDEBAR: Visible only if user is logged in */}
      {user && (
        <Navbar isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />
      )}

      {/* 2. BREAK GUARD: The "Freeze" overlay for Agents */}
      {user?.role === 'agent' && (
        <BreakGuard isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />
      )}

      {/* 3. MAIN CONTENT: Where your pages (Dashboard, Leads, etc.) render */}
      <div className="main-content" style={{
        ...styles.mainContent,
        // If user is logged in, push content to the right to make room for the 260px sidebar
        marginLeft: user ? '260px' : '0'
      }}>
        <AppRoutes />
      </div>

    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#f1f5f9' // Light grey background for the whole app
  },
  mainContent: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  }
};

export default App;