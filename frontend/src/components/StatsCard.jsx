import React from 'react';

export default function StatsCard({ label, value, icon, color, sub }) {
  const colorMap = {
    blue: { bg: 'var(--accent-dim)', border: 'rgba(59,130,246,0.25)', text: 'var(--accent)' },
    green: { bg: 'var(--green-dim)', border: 'rgba(34,197,94,0.25)', text: 'var(--green)' },
    amber: { bg: 'var(--amber-dim)', border: 'rgba(245,158,11,0.25)', text: 'var(--amber)' },
    red: { bg: 'var(--red-dim)', border: 'rgba(239,68,68,0.25)', text: 'var(--red)' },
    purple: { bg: 'var(--purple-dim)', border: 'rgba(168,85,247,0.25)', text: 'var(--purple)' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div style={{ ...styles.card, background: c.bg, border: `1px solid ${c.border}` }}>
      <div style={styles.top}>
        <span style={styles.icon}>{icon}</span>
        <span style={{ ...styles.value, color: c.text }}>{value ?? '—'}</span>
      </div>
      <div style={styles.label}>{label}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
    </div>
  );
}

const styles = {
  card: {
    borderRadius: 'var(--radius-lg)',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
  },
  top: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  icon: { fontSize: '18px' },
  value: { fontSize: '28px', fontWeight: '600', letterSpacing: '-1px', lineHeight: 1 },
  label: { color: 'var(--text2)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' },
  sub: { color: 'var(--text3)', fontSize: '11px', marginTop: '2px' },
};
