import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import BreakGuard from "./components/BreakGuard";
import api from "./services/api";
import './App.css';

function App() {
  const { user } = useSelector((state) => state.auth || {});
  const [isOnBreak, setIsOnBreak] = useState(false);
  
  const location = useLocation();
  const isAgent = user?.role === 'agent';

  const publicPaths = ["/", "/login"];
  const isPublicPage = publicPaths.includes(location.pathname);

  useEffect(() => {
    if (isAgent && !isPublicPage) {
      checkActiveBreak();
    }
  }, [user, location.pathname]);

  const checkActiveBreak = async () => {
    try {
      const res = await api.get('/agent/breaks/active/');
      if (res.data.active) setIsOnBreak(true);
    } catch (err) {
      // No active break
    }
  };

  const showSidebar = user && !isPublicPage;

  return (
    <div className="app-layout" style={styles.layout}>
      
      {/* Sidebar rendered here ONLY */}
      {showSidebar && (
        <Navbar isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />
      )}

      {/* Break Guard logic */}
      {isAgent && showSidebar && (
        <BreakGuard isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />
      )}

      <div className="main-content" style={{
        ...styles.mainContent,
        marginLeft: showSidebar ? '260px' : '0',
        width: showSidebar ? 'calc(100% - 260px)' : '100%'
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
    backgroundColor: '#f8fafc',
    margin: 0,
    padding: 0
  },
  mainContent: { 
    flex: 1, 
    position: 'relative', 
    display: 'flex', 
    flexDirection: 'column',
    minWidth: 0,
    boxSizing: 'border-box',
    transition: 'margin-left 0.3s ease'
  }
};

export default App;