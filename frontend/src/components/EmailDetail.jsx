import React from 'react';
import { CategoryBadge, SentimentBadge, StatusBadge, UrgencyBadge } from './Badges';

export default function EmailDetail({ email, onClose }) {
  if (!email) return null;

  const formatDate = (dateStr) => {
    try { return new Date(dateStr).toLocaleString(); } catch { return dateStr; }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()} className="animate-in">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.headerLabel}>Email Detail</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              <CategoryBadge category={email.category} />
              <StatusBadge status={email.status} />
              {email.category === 'Feedback' && <SentimentBadge sentiment={email.sentiment} />}
              <UrgencyBadge urgency={email.urgency} />
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.body}>
          {/* Meta */}
          <div style={styles.metaGrid}>
            <MetaRow label="From" value={email.from} />
            <MetaRow label="Subject" value={email.subject} />
            <MetaRow label="Date" value={formatDate(email.date)} />
            <MetaRow label="Key Issue" value={email.keyIssue} />
            {email.forwardedTo && <MetaRow label="Forwarded To" value={email.forwardedTo} highlight />}
          </div>

          {/* AI Summary */}
          {email.summary && (
            <Section title="🤖 AI Summary">
              <p style={styles.summaryText}>{email.summary}</p>
            </Section>
          )}

          {/* Original Email */}
          <Section title="📨 Original Message">
            <div style={styles.emailBody}>{email.body || email.snippet || 'No content'}</div>
          </Section>

          {/* Auto Response */}
          {email.responseBody && (
            <Section title="📤 Auto-Response Sent">
              <div style={styles.responseMeta}>
                <span style={styles.responseSubjectLabel}>Subject: </span>
                <span style={styles.responseSubject}>{email.responseSubject}</span>
              </div>
              <div style={styles.responseBody}>{email.responseBody}</div>
            </Section>
          )}

          {/* Processed At */}
          <div style={styles.processedAt}>
            Processed at {formatDate(email.processedAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

const MetaRow = ({ label, value, highlight }) => (
  <div style={styles.metaRow}>
    <span style={styles.metaLabel}>{label}</span>
    <span style={{ ...styles.metaValue, color: highlight ? 'var(--purple)' : 'var(--text)' }}>
      {value}
    </span>
  </div>
);

const Section = ({ title, children }) => (
  <div style={styles.section}>
    <div style={styles.sectionTitle}>{title}</div>
    {children}
  </div>
);

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    zIndex: 100, padding: '16px',
  },
  panel: {
    width: '100%', maxWidth: '580px', height: 'calc(100vh - 32px)',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
  },
  header: {
    padding: '20px 24px', borderBottom: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    flexShrink: 0,
  },
  headerLeft: { flex: 1, minWidth: 0 },
  headerLabel: { color: 'var(--text3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' },
  closeBtn: {
    background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text2)',
    borderRadius: '6px', padding: '4px 10px', fontSize: '14px', marginLeft: '12px', flexShrink: 0,
  },
  body: { flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  metaGrid: {
    background: 'var(--bg3)', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', overflow: 'hidden',
  },
  metaRow: {
    display: 'flex', gap: '12px', padding: '10px 14px',
    borderBottom: '1px solid var(--border)',
  },
  metaLabel: { color: 'var(--text3)', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '90px', paddingTop: '2px' },
  metaValue: { color: 'var(--text)', fontSize: '13px', flex: 1, wordBreak: 'break-word' },
  section: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sectionTitle: { color: 'var(--text2)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.6px' },
  summaryText: { color: 'var(--text)', fontSize: '13px', lineHeight: 1.7, fontStyle: 'italic', padding: '12px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' },
  emailBody: {
    color: 'var(--text2)', fontSize: '13px', lineHeight: 1.8,
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    background: 'var(--bg3)', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', padding: '14px',
    maxHeight: '240px', overflowY: 'auto',
  },
  responseMeta: { padding: '8px 14px', background: 'var(--bg4)', borderRadius: 'var(--radius) var(--radius) 0 0', border: '1px solid var(--border)', borderBottom: 'none' },
  responseSubjectLabel: { color: 'var(--text3)', fontSize: '11px' },
  responseSubject: { color: 'var(--accent)', fontSize: '12px', fontWeight: '500' },
  responseBody: {
    color: 'var(--text)', fontSize: '13px', lineHeight: 1.8,
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    background: 'var(--accent-dim)', borderRadius: '0 0 var(--radius) var(--radius)',
    border: '1px solid rgba(59,130,246,0.25)', borderTop: 'none',
    padding: '14px', maxHeight: '280px', overflowY: 'auto',
  },
  processedAt: { color: 'var(--text3)', fontSize: '11px', textAlign: 'center', paddingTop: '4px' },
};
