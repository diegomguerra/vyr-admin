import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Filler, Tooltip, Legend,
} from 'chart.js';
import RawTable from './RawTable';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend);

const chartOpts = (title) => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#111', borderColor: '#222', borderWidth: 1,
      titleFont: { family: 'Inter', size: 11 }, bodyFont: { family: 'Inter', size: 11 },
    },
  },
  scales: {
    x: { grid: { color: '#161616' }, ticks: { color: '#555', font: { size: 9, family: 'Inter' } } },
    y: { grid: { color: '#161616' }, ticks: { color: '#555', font: { size: 9, family: 'Inter' } } },
  },
});

function LatestCard({ label, value, unit, color, time }) {
  return (
    <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>{label}</div>
      <span style={{ fontSize: 20, fontWeight: 300, color }}>{value ?? '—'}</span>
      {unit && <span style={{ fontSize: 10, color: '#555', marginLeft: 3 }}>{unit}</span>}
      {time && <div style={{ fontSize: 9, color: '#333', marginTop: 2 }}>
        {new Date(time).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
      </div>}
    </div>
  );
}

export default function UserDetail({
  selectedUser, users, loadingDetail,
  userHrv14, userHr24, userStress24, userSleep7, userLatest, userRawToday,
}) {
  const user = users.find(u => u.id === selectedUser);
  if (!selectedUser || !user) {
    return (
      <div style={{ background: '#0E0E0E', border: '1px solid #222', borderRadius: 12, padding: 32, textAlign: 'center' }}>
        <p style={{ color: '#333', fontSize: 12 }}>Selecione um usuário na tabela acima</p>
      </div>
    );
  }

  if (loadingDetail) {
    return (
      <div style={{ background: '#0E0E0E', border: '1px solid #222', borderRadius: 12, padding: 32, textAlign: 'center' }}>
        <span style={{ color: '#4B7BEC', fontSize: 12 }}>Carregando dados...</span>
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
        borderColor: '#F59E0B', backgroundColor: '#F59E0B22',
        borderWidth: 2, tension: 0.3, fill: true, pointRadius: 3,
      },
      {
        label: 'Média',
        data: (() => {
          const vals = userHrv14.map(d => d.hrv).filter(v => v != null);
          const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
          return userHrv14.map(() => Math.round(avg * 10) / 10);
        })(),
        borderColor: '#F59E0B55', borderDash: [5, 5], borderWidth: 1, pointRadius: 0,
      },
    ],
  };

  // HR 24h
  const hrData = {
    labels: userHr24.map(d => d.isDaily ? d.ts.slice(5) : new Date(d.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })),
    datasets: [{
      label: 'FC (bpm)', data: userHr24.map(d => d.value),
      borderColor: '#4B7BEC', backgroundColor: '#4B7BEC22',
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
        d.hours >= 7 ? '#22c55e88' : d.hours >= 5 ? '#F59E0B88' : '#DC262688'
      ),
      borderRadius: 4,
    }],
  };

  return (
    <div style={{ background: '#0E0E0E', border: '1px solid #222', borderRadius: 12, padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#4B7BEC', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            DADOS DO USUÁRIO
          </span>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: '#E8E8E8', marginTop: 2 }}>
            {user.name}
            {user.platform && <span style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 600, marginLeft: 8,
              background: user.platform === 'apple' ? '#55555515' : '#22c55e15',
              color: user.platform === 'apple' ? '#999' : '#4CAF50',
              verticalAlign: 'middle',
            }}>{user.platform === 'apple' ? 'iOS' : 'Android'}</span>}
          </h2>
        </div>
        {user.score !== null && (
          <div style={{ textAlign: 'right' }}>
            <span style={{
              fontSize: 28, fontWeight: 300,
              color: user.score >= 70 ? '#22c55e' : user.score >= 45 ? '#F59E0B' : '#DC2626',
            }}>{user.score}</span>
            <div style={{ fontSize: 10, color: '#555' }}>{user.level}</div>
          </div>
        )}
      </div>

      {/* Latest readings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 16 }}>
        <LatestCard label="FC" value={userLatest.hr?.value} unit="bpm" color="#4B7BEC" time={userLatest.hr?.ts} />
        <LatestCard label="RHR" value={userLatest.rhr?.value} unit="bpm" color="#8B5CF6" time={userLatest.rhr?.ts} />
        <LatestCard label="HRV" value={userLatest.hrv?.value} unit="ms" color="#F59E0B" time={userLatest.hrv?.ts} />
        <LatestCard label="SpO2" value={userLatest.spo2?.value} unit="%" color="#06B6D4" time={userLatest.spo2?.ts} />
        <LatestCard label="RR" value={userLatest.rr?.value} unit="rpm" color="#EF4444" time={userLatest.rr?.ts} />
        <LatestCard label="Passos" value={userLatest.steps?.value} color="#22c55e" time={userLatest.steps?.ts} />
        <LatestCard label="Sono" value={typeof userLatest.sleep?.value === 'number' ? `${userLatest.sleep.value}h` : (userLatest.sleep?.payload_json?.sleepState || '—')} color="#EC4899" time={userLatest.sleep?.ts} />
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* HRV 14 days */}
        <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 10, padding: 14 }}>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            HRV · ÚLTIMOS 14 DIAS
          </span>
          <div style={{ height: 180, marginTop: 8 }}>
            <Line data={hrvData} options={chartOpts('HRV')} />
          </div>
        </div>

        {/* HR 24h */}
        <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 10, padding: 14 }}>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#4B7BEC', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {userHr24.length > 0 && userHr24[0].isDaily ? 'FC MÉDIA · ÚLTIMOS 14 DIAS' : 'FC · ÚLTIMAS 24H'}
          </span>
          <div style={{ height: 180, marginTop: 8 }}>
            {userHr24.length > 0 ? <Line data={hrData} options={chartOpts('FC')} /> :
              <p style={{ color: '#333', fontSize: 11, textAlign: 'center', paddingTop: 60 }}>Sem dados brutos de FC</p>}
          </div>
        </div>

        {/* Stress */}
        <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 10, padding: 14 }}>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            ESTRESSE · ÚLTIMOS 7 DIAS
          </span>
          <div style={{ height: 180, marginTop: 8 }}>
            <Line data={stressData} options={chartOpts('Stress')} />
          </div>
        </div>

        {/* Sleep 7 days */}
        <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 10, padding: 14 }}>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#EC4899', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            SONO · ÚLTIMOS 7 DIAS
          </span>
          <div style={{ height: 180, marginTop: 8 }}>
            <Bar data={sleepData} options={chartOpts('Sleep')} />
          </div>
        </div>
      </div>

      {/* Raw table */}
      <div style={{ marginTop: 16 }}>
        <RawTable samples={userRawToday} />
      </div>
    </div>
  );
}
