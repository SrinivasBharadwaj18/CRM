import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import BreakGuard from "./components/BreakGuard";
import './App.css';

function App() {
  const { user } = useSelector((state) => state.auth || {});
  const [isOnBreak, setIsOnBreak] = useState(false);

  // If the user isn't logged in, don't run the break logic
  const isAgent = user?.role === 'agent';

  return (
    <div className="app-layout" style={{ display: 'flex' }}>
      {/* 1. Sidebar is always present if logged in */}
      {user && <Navbar isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />}

      {/* 2. BreakGuard watches for 5 mins idle or manual click */}
      {isAgent && (
        <BreakGuard isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />
      )}

      {/* 3. The actual CRM Content */}
      <div className="main-content" style={{ flex: 1, position: 'relative' }}>
        <AppRoutes />
      </div>
    </div>
  );
}

export default App;