import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom'; // 1. Import useLocation
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import BreakGuard from "./components/BreakGuard";
import api from "./services/api";
import './App.css';

function App() {
  const { user } = useSelector((state) => state.auth || {});
  const [isOnBreak, setIsOnBreak] = useState(false);
  
  const location = useLocation(); // 2. Initialize location
  const isAgent = user?.role === 'agent';

  // 3. Define which paths should NOT have a sidebar (like the Login page)
  const isLoginPage = location.pathname === "/";

  useEffect(() => {
    if (isAgent) {
      checkActiveBreak();
    }
  }, [user]);

  const checkActiveBreak = async () => {
    try {
      const res = await api.get('/agent/breaks/active/');
      if (res.data.active) setIsOnBreak(true);
    } catch (err) {
      console.log("No active break found.");
    }
  };

  return (
    <div className="app-layout" style={styles.layout}>
      
      {/* 4. Only show Navbar if user is logged in AND we aren't on the login page */}
      {user && !isLoginPage && (
        <Navbar isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />
      )}

      {/* 5. Only run BreakGuard if logged in and not on login page */}
      {isAgent && !isLoginPage && (
        <BreakGuard isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />
      )}

      <div className="main-content" style={{
        ...styles.mainContent,
        // 6. Only add the 260px margin if the Sidebar is actually visible
        marginLeft: (user && !isLoginPage) ? '260px' : '0'
      }}>
        <AppRoutes />
      </div>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: '#f1f5f9' },
  mainContent: { flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }
};

export default App;