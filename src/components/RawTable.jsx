const typeColors = {
  hr: '#4B7BEC', rhr: '#8B5CF6', hrv: '#F59E0B', spo2: '#06B6D4',
  rr: '#EF4444', steps: '#22c55e', sleep: '#EC4899',
};

export default function RawTable({ samples }) {
  return (
    <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 10, padding: 14 }}>
      <span style={{ fontSize: 9, fontWeight: 500, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
        REGISTROS BRUTOS · HOJE ({samples.length})
      </span>
      {samples.length === 0 ? (
        <p style={{ color: '#333', fontSize: 11, textAlign: 'center', marginTop: 16 }}>Sem amostras hoje</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: 8, maxHeight: 320, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1A1A1A', position: 'sticky', top: 0, background: '#0A0A0A' }}>
                {['TIPO', 'TIMESTAMP', 'VALOR', 'SOURCE', 'META'].map(h => (
                  <th key={h} style={{
                    fontSize: 9, fontWeight: 500, color: '#555', textTransform: 'uppercase',
                    letterSpacing: '0.1em', padding: '6px 8px', textAlign: 'left',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {samples.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '5px 8px' }}>
                    <span style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 500,
                      background: `${typeColors[s.type] || '#555'}15`,
                      color: typeColors[s.type] || '#555',
                    }}>{s.type}</span>
                  </td>
                  <td style={{ padding: '5px 8px', fontSize: 10, color: '#99AABB' }}>
                    {new Date(s.ts).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td style={{ padding: '5px 8px', fontSize: 12, fontWeight: 300, color: '#fff' }}>
                    {s.value !== null ? s.value : '—'}
                  </td>
                  <td style={{ padding: '5px 8px', fontSize: 10, color: '#555', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {(s.source || '').split('.').pop()}
                  </td>
                  <td style={{ padding: '5px 8px', fontSize: 10, color: '#555' }}>
                    {s.payload_json ? JSON.stringify(s.payload_json) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
