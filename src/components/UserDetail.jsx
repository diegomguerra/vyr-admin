import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Filler, Tooltip, Legend,
} from 'chart.js';
import RawTable from './RawTable';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

const chartOpts = (T) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: T.surface, borderColor: T.border, borderWidth: 1,
      titleFont: { family: 'Inter', size: 11 }, bodyFont: { family: 'Inter', size: 11 },
      titleColor: T.text, bodyColor: T.textSub,
    },
  },
  scales: {
    x: { grid: { color: T.border + '66' }, ticks: { color: T.textMuted, font: { size: 9, family: 'Inter' } } },
    y: { grid: { color: T.border + '66' }, ticks: { color: T.textMuted, font: { size: 9, family: 'Inter' } } },
  },
});

function LatestCard({ label, value, unit, color, time, T }) {
  return (
    <div style={{
      background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, padding: '14px 16px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: T.textSub, marginBottom: 6 }}>{label}</div>
      <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', color }}>{value ?? '—'}</span>
      {unit && <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 3 }}>{unit}</span>}
      {time && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>
        {new Date(time).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
      </div>}
    </div>
  );
}

export default function UserDetail({
  selectedUser, users, loadingDetail,
  userHrv14, userHr24, userStress24, userSleep7, userLatest, userRawToday, T,
}) {
  const user = users.find(u => u.id === selectedUser);
  if (!selectedUser || !user) {
    return (
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13,
        padding: 32, textAlign: 'center',
      }}>
        <p style={{ color: T.textMuted, fontSize: 13 }}>Selecione um usuário na tabela acima</p>
      </div>
    );
  }

  if (loadingDetail) {
    return (
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13,
        padding: 32, textAlign: 'center',
      }}>
        <span style={{ color: T.blue, fontSize: 13 }}>Carregando dados...</span>
      </div>
    );
  }

  // HRV 14 days
  const hrvData = {
    labels: userHrv14.map(d => d.day.slice(5)),
    datasets: [
      {
        label: 'HRV (ms)',
        data: userHrv14.map(d => d.hrv),
        borderColor: '#D97706', backgroundColor: '#D9770622',
        borderWidth: 2, tension: 0.3, fill: true, pointRadius: 3,
      },
      {
        label: 'Média',
        data: (() => {
          const vals = userHrv14.map(d => d.hrv).filter(v => v != null);
          const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
          return userHrv14.map(() => Math.round(avg * 10) / 10);
        })(),
        borderColor: '#D9770655', borderDash: [5, 5], borderWidth: 1, pointRadius: 0,
      },
    ],
  };

  // HR 24h
  const hrData = {
    labels: userHr24.map(d => d.isDaily ? d.ts.slice(5) : new Date(d.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })),
    datasets: [{
      label: 'FC (bpm)', data: userHr24.map(d => d.value),
      borderColor: '#2563EB', backgroundColor: '#2563EB22',
      borderWidth: 1.5, tension: 0.2, fill: true, pointRadius: 0,
    }],
  };

  // Stress
  const stressData = {
    labels: userStress24.map(d => d.day.slice(5)),
    datasets: [{
      label: 'Estresse', data: userStress24.map(d => d.value),
      borderColor: '#DC2626', backgroundColor: '#DC262622',
      borderWidth: 2, tension: 0.3, fill: true, pointRadius: 3,
    }],
  };

  // Sleep 7 days
  const sleepData = {
    labels: userSleep7.map(d => d.day.slice(5)),
    datasets: [{
      label: 'Sono (h)', data: userSleep7.map(d => d.hours),
      backgroundColor: userSleep7.map(d =>
        d.hours >= 7 ? '#16A34A88' : d.hours >= 5 ? '#D9770688' : '#DC262688'
      ),
      borderRadius: 6,
    }],
  };

  const opts = chartOpts(T);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header card */}
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, padding: '22px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: T.textSub, fontWeight: 500, marginBottom: 4 }}>Dados do Usuário</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: 0 }}>
              {user.name}
              {user.platform && <span style={{
                fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 10px', marginLeft: 10,
                background: user.platform === 'apple' ? T.surfaceAlt : '#F0FDF4',
                color: user.platform === 'apple' ? T.textSub : '#16A34A',
                border: `1px solid ${user.platform === 'apple' ? T.border : '#BBF7D0'}`,
                verticalAlign: 'middle',
              }}>{user.platform === 'apple' ? 'iOS' : 'Android'}</span>}
            </h2>
          </div>
          {user.score !== null && (
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em',
                color: user.score >= 70 ? T.green : user.score >= 45 ? T.amber : T.red,
              }}>{user.score}</span>
              <div style={{ fontSize: 11, color: T.textMuted }}>
                {user.level}
                {user.stateDay && user.stateDay !== new Date().toISOString().split('T')[0] && (
                  <span style={{ marginLeft: 6, fontSize: 10, color: T.textMuted }}>({user.stateDay})</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Latest readings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
        <LatestCard T={T} label="FC" value={userLatest.hr?.value} unit="bpm" color="#2563EB" time={userLatest.hr?.ts} />
        <LatestCard T={T} label="RHR" value={userLatest.rhr?.value} unit="bpm" color="#7C3AED" time={userLatest.rhr?.ts} />
        <LatestCard T={T} label="HRV" value={userLatest.hrv?.value} unit="ms" color="#D97706" time={userLatest.hrv?.ts} />
        <LatestCard T={T} label="SpO2" value={userLatest.spo2?.value} unit="%" color="#0891B2" time={userLatest.spo2?.ts} />
        <LatestCard T={T} label="RR" value={userLatest.rr?.value} unit="rpm" color="#DC2626" time={userLatest.rr?.ts} />
        <LatestCard T={T} label="Passos" value={userLatest.steps?.value} color="#16A34A" time={userLatest.steps?.ts} />
        <LatestCard T={T} label="Sono" value={typeof userLatest.sleep?.value === 'number' ? `${userLatest.sleep.value}h` : (userLatest.sleep?.payload_json?.sleepState || '—')} color="#7C3AED" time={userLatest.sleep?.ts} />
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, padding: '18px 20px' }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>HRV · Últimos 14 dias</span>
          <div style={{ height: 180, marginTop: 10 }}>
            <Line data={hrvData} options={opts} />
          </div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, padding: '18px 20px' }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>
            {userHr24.length > 0 && userHr24[0].isDaily ? 'FC Média · Últimos 14 dias' : 'FC · Últimas 24h'}
          </span>
          <div style={{ height: 180, marginTop: 10 }}>
            {userHr24.length > 0 ? <Line data={hrData} options={opts} /> :
              <p style={{ color: T.textMuted, fontSize: 12, textAlign: 'center', paddingTop: 60 }}>Sem dados brutos de FC</p>}
          </div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, padding: '18px 20px' }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>Estresse · Últimos 7 dias</span>
          <div style={{ height: 180, marginTop: 10 }}>
            <Line data={stressData} options={opts} />
          </div>
        </div>

        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 13, padding: '18px 20px' }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>Sono · Últimos 7 dias</span>
          <div style={{ height: 180, marginTop: 10 }}>
            <Bar data={sleepData} options={opts} />
          </div>
        </div>
      </div>

      {/* Raw table */}
      <RawTable samples={userRawToday} T={T} />
    </div>
  );
}
