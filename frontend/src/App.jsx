import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('tf_auth');
    setAuthenticated(auth === 'true');
    setChecking(false);
  }, []);

  const handleLogin = () => setAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('tf_auth');
    setAuthenticated(false);
  };

  if (checking) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontFamily: 'var(--font)' }}>
        Loading...
      </div>
    );
  }

  return authenticated
    ? <Dashboard onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}
