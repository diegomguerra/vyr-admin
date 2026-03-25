const sevConfig = {
  critical: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    ),
    color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',
  },
  warning: {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    ),
    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
  },
};

export default function AlertPanel({ alerts, T }) {
  if (alerts.length === 0) {
    return (
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, padding: '22px 24px' }}>
        <div style={{ fontSize: 12, color: T.textSub, fontWeight: 500, marginBottom: 12 }}>Alertas</div>
        <p style={{ color: T.textMuted, fontSize: 12, textAlign: 'center', marginTop: 10 }}>Nenhum alerta ativo</p>
      </div>
    );
  }

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, padding: '22px 24px' }}>
      <div style={{ fontSize: 12, color: T.textSub, fontWeight: 500, marginBottom: 12 }}>
        Alertas ({alerts.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
        {alerts.map((a, i) => {
          const sc = sevConfig[a.severity] || sevConfig.warning;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
              background: sc.bg, border: `1px solid ${sc.border}`,
            }}>
              <span style={{ width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sc.icon}
              </span>
              <span style={{ fontSize: 12, color: T.text, fontWeight: 600, minWidth: 80 }}>
                {a.user}
                {a.platform && <span style={{ fontSize: 9, color: T.textMuted, marginLeft: 4 }}>{a.platform === 'apple' ? 'iOS' : 'And'}</span>}
              </span>
              <span style={{ fontSize: 12, color: T.textSub, flex: 1 }}>{a.msg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
