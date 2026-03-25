import { useState } from 'react';

const typeConfig = {
  hr:     { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  rhr:    { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  hrv:    { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  spo2:   { color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC' },
  rr:     { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  steps:  { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  sleep:  { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  stress: { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

const defaultType = { color: '#6B7280', bg: '#F9FAFB', border: '#E5E8EF' };

export default function RawTable({ samples, T }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px 12px' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>
          Dados de Hoje ({samples.length})
        </span>
      </div>
      {samples.length === 0 ? (
        <p style={{ color: T.textMuted, fontSize: 12, textAlign: 'center', padding: '16px 0 24px' }}>Sem amostras hoje</p>
      ) : (
        <div style={{ overflowX: 'auto', maxHeight: 320, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0 }}>
                {['TIPO', 'TIMESTAMP', 'VALOR', 'SOURCE', 'META'].map(h => (
                  <th key={h} style={{
                    padding: '11px 18px', fontSize: 10, letterSpacing: '.07em', color: T.textMuted,
                    fontWeight: 700, textTransform: 'uppercase', background: T.surfaceAlt,
                    borderBottom: `1px solid ${T.border}`, textAlign: 'left',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {samples.map((s, i) => {
                const tc = typeConfig[s.type] || defaultType;
                return (
                  <tr key={i}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: `1px solid ${T.border}`,
                      background: hoveredRow === i ? T.bg : T.surface,
                      transition: 'background .1s',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 10px',
                        color: tc.color, background: tc.bg, border: `1px solid ${tc.border}`,
                      }}>{s.type}</span>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: T.textSub }}>
                      {new Date(s.ts).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 600, color: T.text }}>
                      {s.value !== null ? s.value : '—'}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: T.textMuted, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(s.source || '').split('.').pop()}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: 13, color: T.textMuted }}>
                      {s.payload_json ? JSON.stringify(s.payload_json) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
