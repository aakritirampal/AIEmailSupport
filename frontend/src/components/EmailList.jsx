import React from 'react';
import { CategoryBadge, SentimentBadge, StatusBadge } from './Badges';

const FILTERS = ['all', 'Feedback', 'Query', 'Complaint'];

export default function EmailList({ emails, total, filter, onFilterChange, onSelect, selectedId, loading }) {
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now - d;
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return d.toLocaleDateString();
    } catch { return dateStr; }
  };

  return (
    <div style={styles.container}>
      {/* Filter tabs */}
      <div style={styles.tabs}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            style={{ ...styles.tab, ...(filter === f ? styles.tabActive : {}) }}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
        <span style={styles.count}>{total} email{total !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      <div style={styles.list}>
        {loading && emails.length === 0 && (
          <div style={styles.empty}>
            <div className="spin" style={styles.spinner}>⟳</div>
            <span>Loading emails...</span>
          </div>
        )}

        {!loading && emails.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📭</div>
            <div style={styles.emptyTitle}>No emails yet</div>
            <div style={styles.emptySub}>Emails will appear here once the agent processes them</div>
          </div>
        )}

        {emails.map((email, i) => (
          <EmailRow
            key={email.id}
            email={email}
            isSelected={email.id === selectedId}
            onClick={() => onSelect(email)}
            formatDate={formatDate}
            delay={i * 30}
          />
        ))}
      </div>
    </div>
  );
}

function EmailRow({ email, isSelected, onClick, formatDate, delay }) {
  return (
    <div
      onClick={onClick}
      className="animate-in"
      style={{
        ...styles.row,
        ...(isSelected ? styles.rowSelected : {}),
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Left accent bar */}
      <div style={{
        ...styles.accent,
        background: email.category === 'Complaint' ? 'var(--red)'
          : email.category === 'Query' ? 'var(--accent)'
          : 'var(--amber)',
      }} />

      <div style={styles.rowContent}>
        <div style={styles.rowTop}>
          <span style={styles.sender}>{formatSender(email.from)}</span>
          <span style={styles.date}>{formatDate(email.processedAt || email.date)}</span>
        </div>
        <div style={styles.subject}>{email.subject || '(no subject)'}</div>
        <div style={styles.summary}>{email.summary || email.snippet || ''}</div>
        <div style={styles.rowBadges}>
          <CategoryBadge category={email.category} />
          {email.category === 'Feedback' && <SentimentBadge sentiment={email.sentiment} />}
          <StatusBadge status={email.status} />
        </div>
      </div>
    </div>
  );
}

const formatSender = (from) => {
  if (!from) return 'Unknown';
  const match = from.match(/^"?([^"<]+)"?\s*</);
  if (match) return match[1].trim();
  return from.replace(/<.*>/, '').trim() || from;
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 },
  tabs: {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '12px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0,
  },
  tab: {
    background: 'none', border: '1px solid transparent', color: 'var(--text3)',
    borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: '500',
    transition: 'all 0.15s', cursor: 'pointer',
  },
  tabActive: {
    background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)',
  },
  count: { marginLeft: 'auto', color: 'var(--text3)', fontSize: '11px' },
  list: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  empty: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: '10px', padding: '60px 20px', color: 'var(--text3)',
  },
  spinner: { fontSize: '28px', display: 'inline-block' },
  emptyIcon: { fontSize: '36px' },
  emptyTitle: { fontSize: '14px', fontWeight: '500', color: 'var(--text2)' },
  emptySub: { fontSize: '12px', textAlign: 'center', maxWidth: '240px', lineHeight: 1.5 },
  row: {
    display: 'flex', borderBottom: '1px solid var(--border)',
    cursor: 'pointer', transition: 'background 0.15s',
    background: 'transparent',
  },
  rowSelected: { background: 'var(--bg3)' },
  accent: { width: '3px', flexShrink: 0 },
  rowContent: { flex: 1, padding: '14px 16px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' },
  rowTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' },
  sender: { fontWeight: '500', color: 'var(--text)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  date: { color: 'var(--text3)', fontSize: '11px', flexShrink: 0 },
  subject: { color: 'var(--text2)', fontSize: '12px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  summary: { color: 'var(--text3)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowBadges: { display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '4px' },
};
