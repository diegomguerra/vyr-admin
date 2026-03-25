import { useState, useEffect } from 'react';
import { useSupabase } from './hooks/useSupabase';
import KpiRow from './components/KpiRow';
import UserTable from './components/UserTable';
import AlertPanel from './components/AlertPanel';
import AvgMetrics from './components/AvgMetrics';
import UserDetail from './components/UserDetail';

const T = {
  bg: "#F4F6F9",
  surface: "#FFFFFF",
  surfaceAlt: "#F9FAFB",
  border: "#E5E8EF",
  text: "#111827",
  textSub: "#6B7280",
  textMuted: "#9CA3AF",
  accent: "#AAFF00",
  green: "#16A34A", greenBg: "#F0FDF4", greenBorder: "#BBF7D0",
  red: "#DC2626",   redBg: "#FEF2F2",   redBorder: "#FECACA",
  amber: "#D97706", amberBg: "#FFFBEB",
  blue: "#2563EB",  blueBg: "#EFF6FF",
  purple: "#7C3AED",
};

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%', background: T.green,
        animation: 'pulse 2s ease-in-out infinite',
      }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: T.textSub }}>
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
        minHeight: '100vh', background: T.bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: T.blue, fontSize: 13, fontFamily: "'Inter', sans-serif" }}>Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, fontFamily: "'Inter', sans-serif",
      color: T.text,
    }}>
      {/* Nav */}
      <nav style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`, height: 56,
        padding: '0 28px', position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}>VYR Admin</h1>
          <span style={{ fontSize: 10, fontWeight: 600, color: T.blue, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            PAINEL INTERNO
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LiveClock />
          <button onClick={refresh} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            background: T.surface, border: `1px solid ${T.border}`, color: T.textSub, cursor: 'pointer',
          }}>
            ↻ Atualizar
          </button>
        </div>
      </nav>

      <div style={{ padding: '20px 28px 40px' }}>
        {/* Section 1 — KPIs */}
        <section style={{ marginBottom: 20 }}>
          <KpiRow kpis={kpis} T={T} />
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 20 }}>
          <UserTable users={users} selectedUser={selectedUser} onSelect={(id, platform) => fetchUserDetail(id, platform)} T={T} />
          <AlertPanel alerts={alerts} T={T} />
        </div>

        {/* Section 2 — Média Geral */}
        <section style={{ marginBottom: 20 }}>
          <AvgMetrics avgToday={avgToday} avgYesterday={avgYesterday} T={T} />
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
            T={T}
          />
        </section>
      </div>

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
