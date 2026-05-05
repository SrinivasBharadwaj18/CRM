import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Clock, Play } from 'lucide-react';

const BreakGuard = ({ isOnBreak, setIsOnBreak }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const idleTimer = useRef(null);
  const activityTimeout = 5 * 60 * 1000; // 5 Minutes

  // 1. Timer Logic for the "Freeze" Page
  useEffect(() => {
    let interval;
    if (isOnBreak) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isOnBreak]);

  // 2. Inactivity Watcher (The 5-minute rule)
  useEffect(() => {
    const handleActivity = () => {
      if (isOnBreak) return; // Don't track activity if already on break
      
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(triggerUnmentionedBreak, activityTimeout);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearTimeout(idleTimer.current);
    };
  }, [isOnBreak]);

  const triggerUnmentionedBreak = async () => {
    try {
      // API call to start an 'unmentioned' break
      await api.post('/agent/breaks/toggle/', { is_unmentioned: true });
      setIsOnBreak(true);
    } catch (err) {
      console.error("Failed to trigger idle break", err);
    }
  };

  const endBreak = async () => {
    try {
      await api.post('/agent/breaks/toggle/');
      setIsOnBreak(false);
    } catch (err) {
      alert("Error ending break");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOnBreak) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.timerCircle}>
          <Clock size={48} color="#2563eb" />
          <h1 style={styles.timerText}>{formatTime(elapsedTime)}</h1>
        </div>
        <h2 style={styles.statusText}>You are currently on a Break</h2>
        <p style={styles.subText}>The CRM is locked. Click below to resume your work.</p>
        
        <button onClick={endBreak} style={styles.resumeBtn}>
          <Play size={20} fill="white" /> Resume Work
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    backgroundColor: '#0f172a', zIndex: 9999, display: 'flex', 
    justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif'
  },
  modal: {
    backgroundColor: 'white', padding: '60px', borderRadius: '40px',
    textAlign: 'center', maxWidth: '500px', width: '90%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
  },
  timerCircle: {
    width: '180px', height: '180px', borderRadius: '50%', border: '8px solid #f1f5f9',
    margin: '0 auto 30px', display: 'flex', flexDirection: 'column', 
    justifyContent: 'center', alignItems: 'center', gap: '10px'
  },
  timerText: { fontSize: '42px', fontWeight: '900', color: '#1e293b', margin: 0 },
  statusText: { fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' },
  subText: { color: '#64748b', marginBottom: '40px', fontWeight: '500' },
  resumeBtn: {
    backgroundColor: '#10b981', color: 'white', border: 'none', padding: '18px 40px',
    borderRadius: '20px', fontSize: '18px', fontWeight: '900', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '12px', margin: '0 auto',
    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
  }
};

export default BreakGuard;