import { useState } from 'react';

function timeAgo(iso) {
  if (!iso) return 'Nunca';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Agora';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function getUserStatus(user) {
  if (!user.last_sync_at) return 'critical';
  const diff = Date.now() - new Date(user.last_sync_at).getTime();
  if (diff > 6 * 3600000) return 'critical';
  if (diff > 1 * 3600000 || !user.wearable_connected) return 'warning';
  return 'ok';
}

const statusConfig = {
  critical: { label: 'Crítico', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  warning:  { label: 'Atenção', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  ok:       { label: 'OK', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
};

const filterLabels = ['Todos', 'Críticos', 'Atenção', 'OK'];
const filterMap = { Todos: null, Críticos: 'critical', Atenção: 'warning', OK: 'ok' };

export default function UserTable({ users, selectedUser, onSelect, T }) {
  const [filter, setFilter] = useState('Todos');
  const [hoveredRow, setHoveredRow] = useState(null);
  const mapped = filterMap[filter];
  const filtered = mapped ? users.filter(u => getUserStatus(u) === mapped) : users;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>
          Usuários ({filtered.length})
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {filterLabels.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: filter === f ? T.text : 'transparent',
              color: filter === f ? '#fff' : T.textMuted,
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['', 'NOME', 'PLATAFORMA', 'STATUS', 'ÚLTIMO SYNC', 'SCORE', 'AMOSTRAS', 'DIAS'].map(h => (
                <th key={h} style={{
                  padding: '11px 18px', fontSize: 10, letterSpacing: '.07em', color: T.textMuted,
                  fontWeight: 700, textTransform: 'uppercase', background: T.surfaceAlt,
                  borderBottom: `1px solid ${T.border}`, textAlign: 'left',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const st = getUserStatus(u);
              const sc = statusConfig[st];
              const isSelected = selectedUser === u.id;
              return (
                <tr key={`${u.id}-${u.platform}`} onClick={() => onSelect(u.id, u.platform)}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
                    background: isSelected ? T.blueBg : hoveredRow === i ? T.bg : T.surface,
                    transition: 'background .1s',
                  }}
                >
                  <td style={{ padding: '14px 18px', width: 20 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', background: sc.color,
                    }} />
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: T.text, fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 10px',
                      background: u.platform === 'apple' ? T.surfaceAlt : '#F0FDF4',
                      color: u.platform === 'apple' ? T.textSub : '#16A34A',
                      border: `1px solid ${u.platform === 'apple' ? T.border : '#BBF7D0'}`,
                    }}>
                      {u.platform === 'apple' ? 'iOS' : 'Android'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 10px',
                      color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`,
                    }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={{
                    padding: '14px 18px', fontSize: 13,
                    color: st === 'critical' ? T.red : st === 'warning' ? T.amber : T.textSub,
                  }}>
                    {timeAgo(u.last_sync_at)}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {u.score !== null ? (
                      <span style={{
                        fontSize: 18, fontWeight: 800,
                        color: u.score >= 70 ? T.green : u.score >= 45 ? T.amber : T.red,
                      }}>{u.score}</span>
                    ) : <span style={{ color: T.textMuted, fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: T.textSub }}>{u.total_samples.toLocaleString()}</td>
                  <td style={{ padding: '14px 18px', fontSize: 13, color: T.textSub }}>{u.days}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
