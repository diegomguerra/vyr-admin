const metrics = [
  { key: 'hrv', label: 'HRV (ms)', color: '#D97706' },
  { key: 'heart_rate', label: 'FC (bpm)', color: '#2563EB' },
  { key: 'sleep_hours', label: 'Sono (h)', color: '#7C3AED' },
  { key: 'stress_index', label: 'Estresse', color: '#DC2626' },
  { key: 'steps', label: 'Passos', color: '#16A34A' },
];

function Delta({ current, previous }) {
  if (!current || !previous) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.1) return null;
  const up = diff > 0;
  const pct = previous !== 0 ? Math.abs(Math.round((diff / previous) * 100)) : 0;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '3px 9px', marginLeft: 8,
      color: up ? '#16A34A' : '#DC2626',
      background: up ? '#F0FDF4' : '#FEF2F2',
      border: `1px solid ${up ? '#BBF7D0' : '#FECACA'}`,
    }}>
      {up ? '↑' : '↓'} {pct > 0 ? `${pct}%` : Math.abs(Math.round(diff * 10) / 10)}
    </span>
  );
}

export default function AvgMetrics({ avgToday, avgYesterday, T }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
      {metrics.map(m => (
        <div key={m.key} style={{
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, padding: '22px 24px',
        }}>
          <div style={{ fontSize: 12, color: T.textSub, fontWeight: 500, marginBottom: 5 }}>
            {m.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: T.text }}>
              {avgToday[m.key] ?? '—'}
            </span>
            <Delta current={avgToday[m.key]} previous={avgYesterday[m.key]} />
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 7 }}>
            Ontem: {avgYesterday[m.key] ?? '—'}
          </div>
        </div>
      ))}
    </div>
  );
}
