import React, { useState, useEffect, useCallback } from 'react';
import StatsCard from '../components/StatsCard';
import EmailList from '../components/EmailList';
import EmailDetail from '../components/EmailDetail';
import { getStats, getEmails, getPollStatus, triggerPoll } from '../api';

export default function Dashboard({ onLogout }) {
  const [stats, setStats] = useState(null);
  const [emails, setEmails] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [pollStatus, setPollStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [page, setPage] = useState(1);

  // ─── Fetch Data ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, emailsRes, pollRes] = await Promise.all([
        getStats(),
        getEmails(1, filter),
        getPollStatus(),
      ]);
      setStats(statsRes.data);
      setEmails(emailsRes.data.emails || []);
      setTotal(emailsRes.data.total || 0);
      setPollStatus(pollRes.data);
      setLastRefresh(new Date());
      setPage(1);
    } catch (err) {
      console.error('Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial load + filter change
  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ─── Manual Poll ─────────────────────────────────────────────────────────
  const handlePollNow = async () => {
    setPolling(true);
    try {
      await triggerPoll();
      // Wait a moment then refresh data
      setTimeout(fetchData, 3000);
      setTimeout(fetchData, 8000);
    } catch (err) {
      console.error('Poll error:', err);
    } finally {
      setTimeout(() => setPolling(false), 8000);
    }
  };

  // ─── Filter Change ────────────────────────────────────────────────────────
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSelectedEmail(null);
  };

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString() : '—';

  return (
    <div style={styles.root}>
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside style={styles.sidebar}>
        {/* Brand */}
        <div style={styles.brand}>
          <div style={styles.brandIcon}>✦</div>
          <div>
            <div style={styles.brandName}>Team Tracfone</div>
            <div style={styles.brandSub}>Email Agent</div>
          </div>
        </div>

        {/* Agent Status */}
        <div style={styles.agentStatus}>
          <div style={styles.statusDot} />
          <div style={{ flex: 1 }}>
            <div style={styles.statusLabel}>Agent Status</div>
            <div style={styles.statusValue}>
              {pollStatus?.isPolling ? '🔄 Polling now...' : '✓ Active — polling every 5 min'}
            </div>
          </div>
        </div>

        {/* Last refresh */}
        <div style={styles.refreshRow}>
          <span style={styles.refreshLabel}>Last refresh</span>
          <span style={styles.refreshValue}>{formatTime(lastRefresh)}</span>
        </div>
        {pollStatus?.lastPollTime && (
          <div style={styles.refreshRow}>
            <span style={styles.refreshLabel}>Last poll</span>
            <span style={styles.refreshValue}>{formatTime(pollStatus.lastPollTime)}</span>
          </div>
        )}
        {pollStatus?.pollCount !== undefined && (
          <div style={styles.refreshRow}>
            <span style={styles.refreshLabel}>Total polls</span>
            <span style={styles.refreshValue}>{pollStatus.pollCount}</span>
          </div>
        )}

        {/* Action buttons */}
        <div style={styles.actions}>
          <button
            onClick={handlePollNow}
            disabled={polling}
            style={{ ...styles.btn, ...styles.btnPrimary }}
          >
            <span className={polling ? 'spin' : ''} style={{ display: 'inline-block' }}>
              {polling ? '⟳' : '⟳'}
            </span>
            {polling ? 'Polling...' : 'Poll Now'}
          </button>
          <button onClick={fetchData} style={{ ...styles.btn, ...styles.btnSecondary }}>
            ↺ Refresh
          </button>
        </div>

        {/* Category breakdown */}
        {stats && (
          <div style={styles.breakdown}>
            <div style={styles.breakdownTitle}>Category Breakdown</div>
            <BreakdownBar label="Feedback" value={stats.feedback} total={stats.total} color="var(--amber)" />
            <BreakdownBar label="Queries" value={stats.query} total={stats.total} color="var(--accent)" />
            <BreakdownBar label="Complaints" value={stats.complaint} total={stats.total} color="var(--red)" />
          </div>
        )}

        {/* Logout */}
        <button onClick={onLogout} style={styles.logoutBtn}>
          ← Logout
        </button>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main style={styles.main}>
        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <StatsCard label="Total Emails" value={stats?.total ?? 0} icon="📬" color="blue" />
          <StatsCard label="Feedback" value={stats?.feedback ?? 0} icon="💬" color="amber"
            sub={`${stats?.positive ?? 0} positive · ${stats?.negative ?? 0} negative`} />
          <StatsCard label="Queries" value={stats?.query ?? 0} icon="❓" color="blue" />
          <StatsCard label="Complaints" value={stats?.complaint ?? 0} icon="⚠️" color="red" />
          <StatsCard label="Responded" value={stats?.responded ?? 0} icon="✓" color="green"
            sub={stats?.failed ? `${stats.failed} failed` : 'All successful'} />
        </div>

        {/* Email Panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitle}>
              <span>Processed Emails</span>
              {loading && <span style={styles.loadingDot}>●</span>}
            </div>
            <span style={styles.panelSub}>
              Auto-categorized and responded by Gemini AI
            </span>
          </div>
          <div style={styles.panelBody}>
            <EmailList
              emails={emails}
              total={total}
              filter={filter}
              onFilterChange={handleFilterChange}
              onSelect={setSelectedEmail}
              selectedId={selectedEmail?.id}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {/* ── Detail Panel ──────────────────────────────────────────────── */}
      {selectedEmail && (
        <EmailDetail email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}
    </div>
  );
}

// ─── Breakdown Bar ──────────────────────────────────────────────────────────
function BreakdownBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: 'var(--text2)', fontSize: '11px' }}>{label}</span>
        <span style={{ color: 'var(--text3)', fontSize: '11px' }}>{value} ({pct}%)</span>
      </div>
      <div style={{ height: '4px', background: 'var(--bg4)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

const styles = {
  root: { display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' },
  sidebar: {
    width: '240px', flexShrink: 0, background: 'var(--bg2)',
    borderRight: '1px solid var(--border)', display: 'flex',
    flexDirection: 'column', padding: '20px 16px', gap: '0', overflowY: 'auto',
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' },
  brandIcon: {
    width: '32px', height: '32px', background: 'var(--accent)',
    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: '14px', flexShrink: 0,
  },
  brandName: { fontSize: '14px', fontWeight: '600', color: 'var(--text)', letterSpacing: '-0.3px' },
  brandSub: { fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.6px' },
  agentStatus: {
    display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px',
    background: 'var(--green-dim)', borderRadius: 'var(--radius)',
    border: '1px solid rgba(34,197,94,0.2)', marginBottom: '16px',
  },
  statusDot: {
    width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)',
    flexShrink: 0, marginTop: '3px', animation: 'pulse-dot 2s ease infinite',
  },
  statusLabel: { color: 'var(--text3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' },
  statusValue: { color: 'var(--green)', fontSize: '11px', lineHeight: 1.4 },
  refreshRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '4px 0', borderBottom: '1px solid var(--border)',
  },
  refreshLabel: { color: 'var(--text3)', fontSize: '11px' },
  refreshValue: { color: 'var(--text2)', fontSize: '11px', fontFamily: 'var(--mono)' },
  actions: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', marginBottom: '20px' },
  btn: {
    border: 'none', borderRadius: 'var(--radius)', padding: '9px 14px',
    fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '6px', transition: 'opacity 0.2s',
  },
  btnPrimary: { background: 'var(--accent)', color: '#fff' },
  btnSecondary: { background: 'var(--bg3)', color: 'var(--text2)', border: '1px solid var(--border)' },
  breakdown: {
    background: 'var(--bg3)', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', padding: '14px', marginBottom: 'auto',
  },
  breakdownTitle: { color: 'var(--text3)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px', fontWeight: '500' },
  logoutBtn: {
    background: 'none', border: '1px solid var(--border)', color: 'var(--text3)',
    borderRadius: 'var(--radius)', padding: '8px', fontSize: '12px', marginTop: '16px',
    transition: 'all 0.15s',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '20px', gap: '16px' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px', flexShrink: 0,
  },
  panel: {
    flex: 1, background: 'var(--bg2)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  panelHeader: {
    padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0,
    display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px',
  },
  panelTitle: { fontSize: '14px', fontWeight: '600', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' },
  loadingDot: { color: 'var(--accent)', fontSize: '8px', animation: 'pulse-dot 1s ease infinite' },
  panelSub: { color: 'var(--text3)', fontSize: '11px' },
  panelBody: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
};
