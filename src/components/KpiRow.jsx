const cards = [
  { key: 'active', label: 'Usuários Ativos', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { key: 'critical', label: 'Críticos', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  )},
  { key: 'offline', label: 'Wearables Offline', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
  )},
  { key: 'syncRate', label: 'Sync Rate (30min)', suffix: '%', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
  )},
];

export default function KpiRow({ kpis, T }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {cards.map(c => {
        const value = kpis[c.key] ?? 0;
        return (
          <div key={c.key} style={{
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, padding: '22px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, background: T.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {c.icon}
              </div>
            </div>
            <div style={{ fontSize: 12, color: T.textSub, fontWeight: 500, marginBottom: 5 }}>{c.label}</div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: T.text }}>
              {value}{c.suffix || ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}
