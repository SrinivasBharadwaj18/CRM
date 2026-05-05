import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import BreakGuard from "./components/BreakGuard";
import api from "./services/api";
import './App.css';

function App() {
  const { user } = useSelector((state) => state.auth || {});
  const [isOnBreak, setIsOnBreak] = useState(false);

  const isAgent = user?.role === 'agent';

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
      {/* Navbar sits here globally */}
      {user && <Navbar isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />}

      {/* BreakGuard sits here globally */}
      {isAgent && <BreakGuard isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />}

      <div className="main-content" style={{
        ...styles.mainContent,
        marginLeft: user ? '260px' : '0'
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