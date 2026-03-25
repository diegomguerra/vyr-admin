const sevIcons = { critical: '!', warning: '⚠' };
const sevColors = { critical: '#DC2626', warning: '#F59E0B' };

export default function AlertPanel({ alerts }) {
  if (alerts.length === 0) {
    return (
      <div style={{ background: '#0E0E0E', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
        <span style={{ fontSize: 9, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          ALERTAS
        </span>
        <p style={{ color: '#333', fontSize: 12, marginTop: 10, textAlign: 'center' }}>Nenhum alerta ativo</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#0E0E0E', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
      <span style={{ fontSize: 9, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
        ALERTAS ({alerts.length})
      </span>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
        {alerts.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 8,
            background: a.severity === 'critical' ? '#1A080815' : '#1A100815',
            border: `1px solid ${a.severity === 'critical' ? '#2D000030' : '#2D1A0030'}`,
          }}>
            <span style={{ color: sevColors[a.severity], fontSize: 12, fontWeight: 700, width: 16, textAlign: 'center' }}>
              {sevIcons[a.severity]}
            </span>
            <span style={{ fontSize: 11, color: '#E8E8E8', fontWeight: 500, minWidth: 80 }}>
              {a.user}
              {a.platform && <span style={{ fontSize: 8, color: '#555', marginLeft: 4 }}>{a.platform === 'apple' ? 'iOS' : 'And'}</span>}
            </span>
            <span style={{ fontSize: 11, color: '#778899', flex: 1 }}>{a.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
