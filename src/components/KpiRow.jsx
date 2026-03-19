const cards = [
  { key: 'active', label: 'USUÁRIOS ATIVOS', color: '#22c55e', icon: '●' },
  { key: 'critical', label: 'CRÍTICOS', color: '#DC2626', icon: '!' },
  { key: 'offline', label: 'WEARABLES OFFLINE', color: '#F59E0B', icon: '◌' },
  { key: 'syncRate', label: 'SYNC RATE (30MIN)', color: '#4B7BEC', icon: '↻', suffix: '%' },
];

export default function KpiRow({ kpis }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {cards.map(c => (
        <div key={c.key} style={{
          background: '#0E0E0E', border: '1px solid #222', borderRadius: 12, padding: '16px 14px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ color: c.color, fontSize: 12 }}>{c.icon}</span>
            <span style={{
              fontSize: 9, fontWeight: 500, color: '#555',
              textTransform: 'uppercase', letterSpacing: '0.18em',
            }}>{c.label}</span>
          </div>
          <span style={{ fontSize: 28, fontWeight: 300, color: '#fff' }}>
            {kpis[c.key] ?? 0}{c.suffix || ''}
          </span>
        </div>
      ))}
    </div>
  );
}
