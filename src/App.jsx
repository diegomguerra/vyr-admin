import { useState, useEffect } from 'react';
import { useSupabase } from './hooks/useSupabase';
import KpiRow from './components/KpiRow';
import UserTable from './components/UserTable';
import AlertPanel from './components/AlertPanel';
import AvgMetrics from './components/AvgMetrics';
import UserDetail from './components/UserDetail';

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
        animation: 'pulse 2s ease-in-out infinite',
      }} />
      <span style={{ fontSize: 12, fontWeight: 300, color: '#667788', fontFamily: 'Inter, sans-serif' }}>
        {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
}

export default function App() {
  const {
    users, kpis, alerts, avgToday, avgYesterday, loading, refresh,
    selectedUser, fetchUserDetail, loadingDetail,
    userHrv14, userHr24, userStress24, userSleep7, userLatest, userRawToday,
  } = useSupabase();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A0A0A', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: '#4B7BEC', fontSize: 13, fontFamily: 'Inter' }}>Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A', fontFamily: 'Inter, sans-serif',
      color: '#E8E8E8', padding: '0 24px 40px',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 0', borderBottom: '1px solid #1A1A1A', marginBottom: 20,
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 500, color: '#fff', margin: 0 }}>VYR Admin Dashboard</h1>
          <span style={{ fontSize: 9, fontWeight: 500, color: '#4B7BEC', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
            PAINEL INTERNO · TEMPO REAL
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LiveClock />
          <button onClick={refresh} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 500,
            background: '#111', border: '1px solid #222', color: '#99AABB', cursor: 'pointer',
          }}>
            ↻ Atualizar
          </button>
        </div>
      </header>

      {/* Section 1 — Visão Geral */}
      <section style={{ marginBottom: 20 }}>
        <KpiRow kpis={kpis} />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 20 }}>
        <UserTable users={users} selectedUser={selectedUser} onSelect={(id, platform) => fetchUserDetail(id, platform)} />
        <AlertPanel alerts={alerts} />
      </div>

      {/* Section 2 — Média Geral */}
      <section style={{ marginBottom: 20 }}>
        <AvgMetrics avgToday={avgToday} avgYesterday={avgYesterday} />
      </section>

      {/* Section 3 — Dados por Usuário */}
      <section>
        <UserDetail
          selectedUser={selectedUser}
          users={users}
          loadingDetail={loadingDetail}
          userHrv14={userHrv14}
          userHr24={userHr24}
          userStress24={userStress24}
          userSleep7={userSleep7}
          userLatest={userLatest}
          userRawToday={userRawToday}
        />
      </section>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
