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

const statusColors = { critical: '#DC2626', warning: '#F59E0B', ok: '#22c55e' };
const filterLabels = ['Todos', 'Críticos', 'Atenção', 'OK'];
const filterMap = { Todos: null, Críticos: 'critical', Atenção: 'warning', OK: 'ok' };

export default function UserTable({ users, selectedUser, onSelect }) {
  const [filter, setFilter] = useState('Todos');
  const mapped = filterMap[filter];
  const filtered = mapped ? users.filter(u => getUserStatus(u) === mapped) : users;

  return (
    <div style={{ background: '#0E0E0E', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 9, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
          USUÁRIOS ({filtered.length})
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {filterLabels.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 500, border: 'none', cursor: 'pointer',
              background: filter === f ? '#1E293B' : 'transparent',
              color: filter === f ? '#fff' : '#555',
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1A1A1A' }}>
              {['', 'NOME', 'PLATAFORMA', 'STATUS', 'ÚLTIMO SYNC', 'SCORE', 'AMOSTRAS', 'DIAS'].map(h => (
                <th key={h} style={{
                  fontSize: 9, fontWeight: 500, color: '#555', textTransform: 'uppercase',
                  letterSpacing: '0.14em', padding: '6px 8px', textAlign: 'left',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const st = getUserStatus(u);
              const isSelected = selectedUser === u.id;
              return (
                <tr key={`${u.id}-${u.platform}`} onClick={() => onSelect(u.id, u.platform)}
                  style={{
                    borderBottom: '1px solid #111', cursor: 'pointer',
                    background: isSelected ? '#111827' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#0A0A0A'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '8px 8px', width: 20 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', background: statusColors[st],
                      boxShadow: `0 0 6px ${statusColors[st]}44`,
                    }} />
                  </td>
                  <td style={{ padding: '8px 8px', fontSize: 13, color: '#E8E8E8', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '8px 8px' }}>
                    <span style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 600,
                      background: u.platform === 'apple' ? '#55555515' : '#22c55e15',
                      color: u.platform === 'apple' ? '#999' : '#4CAF50',
                      letterSpacing: '0.05em',
                    }}>
                      {u.platform === 'apple' ? 'iOS' : 'Android'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 8px' }}>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 500,
                      background: u.wearable_connected ? '#22c55e15' : '#DC262615',
                      color: u.wearable_connected ? '#22c55e' : '#DC2626',
                    }}>
                      {u.wearable_connected ? 'Conectado' : 'Offline'}
                    </span>
                  </td>
                  <td style={{
                    padding: '8px 8px', fontSize: 11,
                    color: st === 'critical' ? '#DC2626' : st === 'warning' ? '#F59E0B' : '#667788',
                  }}>
                    {timeAgo(u.last_sync_at)}
                  </td>
                  <td style={{ padding: '8px 8px' }}>
                    {u.score !== null ? (
                      <span style={{
                        fontSize: 16, fontWeight: 300,
                        color: u.score >= 70 ? '#22c55e' : u.score >= 45 ? '#F59E0B' : '#DC2626',
                      }}>{u.score}</span>
                    ) : <span style={{ color: '#333', fontSize: 11 }}>—</span>}
                  </td>
                  <td style={{ padding: '8px 8px', fontSize: 11, color: '#667788' }}>{u.total_samples.toLocaleString()}</td>
                  <td style={{ padding: '8px 8px', fontSize: 11, color: '#667788' }}>{u.days}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
