const metrics = [
  { key: 'hrv', label: 'HRV (ms)', color: '#F59E0B' },
  { key: 'heart_rate', label: 'FC (bpm)', color: '#4B7BEC' },
  { key: 'sleep_hours', label: 'SONO (h)', color: '#EC4899' },
  { key: 'stress_index', label: 'ESTRESSE', color: '#DC2626' },
  { key: 'steps', label: 'PASSOS', color: '#22c55e' },
];

function Delta({ current, previous }) {
  if (!current || !previous) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 0.1) return null;
  const up = diff > 0;
  return (
    <span style={{ fontSize: 10, color: up ? '#22c55e' : '#DC2626', marginLeft: 6 }}>
      {up ? '↑' : '↓'} {Math.abs(Math.round(diff * 10) / 10)}
    </span>
  );
}

export default function AvgMetrics({ avgToday, avgYesterday }) {
  return (
    <div style={{ background: '#0E0E0E', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
      <span style={{ fontSize: 9, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
        MÉDIA GERAL · HOJE vs ONTEM
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 12 }}>
        {metrics.map(m => (
          <div key={m.key} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
              {m.label}
            </div>
            <div>
              <span style={{ fontSize: 22, fontWeight: 300, color: m.color }}>
                {avgToday[m.key] ?? '—'}
              </span>
              <Delta current={avgToday[m.key]} previous={avgYesterday[m.key]} />
            </div>
            <div style={{ fontSize: 10, color: '#333', marginTop: 2 }}>
              Ontem: {avgYesterday[m.key] ?? '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
