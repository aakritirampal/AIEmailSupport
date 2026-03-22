import React, { useState } from 'react';
import { login } from '../api';

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(password);
      localStorage.setItem('tf_auth', 'true');
      onLogin();
    } catch {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="animate-in">
        {/* Logo / Title */}
        <div style={styles.logoRow}>
          <div style={styles.logoBox}>
            <span style={styles.logoIcon}>✦</span>
          </div>
          <div>
            <div style={styles.title}>Team Tracfone</div>
            <div style={styles.subtitle}>Email Intelligence Agent</div>
          </div>
        </div>

        {/* Status indicator */}
        <div style={styles.statusRow}>
          <span style={styles.dot} />
          <span style={styles.statusText}>System Online</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Dashboard Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            style={styles.input}
            autoFocus
          />
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Authenticating...' : 'Access Dashboard →'}
          </button>
        </form>

        <div style={styles.footer}>
          Automated email routing & response system
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '36px',
    boxShadow: 'var(--shadow)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '28px',
  },
  logoBox: {
    width: '44px',
    height: '44px',
    background: 'var(--accent)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { color: '#fff', fontSize: '20px' },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text)',
    letterSpacing: '-0.3px',
  },
  subtitle: { color: 'var(--text2)', fontSize: '12px', marginTop: '2px' },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '28px',
    padding: '8px 12px',
    background: 'var(--green-dim)',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(34,197,94,0.2)',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'var(--green)',
    animation: 'pulse-dot 2s ease infinite',
    display: 'inline-block',
  },
  statusText: { color: 'var(--green)', fontSize: '12px', fontWeight: '500' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  label: { color: 'var(--text2)', fontSize: '12px', fontWeight: '500', letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: {
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '11px 14px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  error: {
    color: 'var(--red)',
    fontSize: '13px',
    padding: '8px 12px',
    background: 'var(--red-dim)',
    borderRadius: 'var(--radius)',
    border: '1px solid rgba(239,68,68,0.2)',
  },
  button: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '4px',
    transition: 'opacity 0.2s',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    color: 'var(--text3)',
    fontSize: '12px',
    borderTop: '1px solid var(--border)',
    paddingTop: '20px',
  },
};
