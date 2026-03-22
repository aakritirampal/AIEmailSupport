import React from 'react';

const config = {
  Feedback: { bg: 'var(--amber-dim)', border: 'rgba(245,158,11,0.3)', text: 'var(--amber)', icon: '💬' },
  Query:    { bg: 'var(--accent-dim)', border: 'rgba(59,130,246,0.3)', text: 'var(--accent)', icon: '❓' },
  Complaint:{ bg: 'var(--red-dim)', border: 'rgba(239,68,68,0.3)', text: 'var(--red)', icon: '⚠️' },
  Unknown:  { bg: 'var(--bg3)', border: 'var(--border)', text: 'var(--text3)', icon: '•' },
};

const sentimentConfig = {
  positive: { bg: 'var(--green-dim)', border: 'rgba(34,197,94,0.3)', text: 'var(--green)', label: '↑ Positive' },
  negative: { bg: 'var(--red-dim)', border: 'rgba(239,68,68,0.3)', text: 'var(--red)', label: '↓ Negative' },
  neutral:  { bg: 'var(--bg3)', border: 'var(--border)', text: 'var(--text3)', label: '→ Neutral' },
};

const urgencyConfig = {
  high:   { text: 'var(--red)', label: '🔴 High' },
  medium: { text: 'var(--amber)', label: '🟡 Medium' },
  low:    { text: 'var(--green)', label: '🟢 Low' },
};

const statusConfig = {
  responded: { bg: 'var(--green-dim)', border: 'rgba(34,197,94,0.3)', text: 'var(--green)', label: '✓ Responded' },
  forwarded: { bg: 'var(--purple-dim)', border: 'rgba(168,85,247,0.3)', text: 'var(--purple)', label: '↗ Forwarded' },
  failed:    { bg: 'var(--red-dim)', border: 'rgba(239,68,68,0.3)', text: 'var(--red)', label: '✗ Failed' },
};

const badge = (cfg, label) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '500',
    background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text,
    whiteSpace: 'nowrap',
  }}>
    {label}
  </span>
);

export const CategoryBadge = ({ category }) => {
  const c = config[category] || config.Unknown;
  return badge(c, `${c.icon} ${category}`);
};

export const SentimentBadge = ({ sentiment }) => {
  const c = sentimentConfig[sentiment] || sentimentConfig.neutral;
  return badge(c, c.label);
};

export const UrgencyBadge = ({ urgency }) => {
  const c = urgencyConfig[urgency] || urgencyConfig.medium;
  return <span style={{ color: c.text, fontSize: '11px', fontWeight: '500' }}>{c.label}</span>;
};

export const StatusBadge = ({ status }) => {
  const c = statusConfig[status] || statusConfig.responded;
  return badge(c, c.label);
};
