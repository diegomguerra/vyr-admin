import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/* ── helpers ── */
const today = () => new Date().toISOString().split('T')[0];
const yesterday = () => {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};
const daysAgo = (n) => {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString();
};

/* ── Main hook ── */
export function useSupabase() {
  const [users, setUsers] = useState([]);
  const [kpis, setKpis] = useState({ active: 0, critical: 0, offline: 0, syncRate: 0 });
  const [alerts, setAlerts] = useState([]);
  const [avgToday, setAvgToday] = useState({});
  const [avgYesterday, setAvgYesterday] = useState({});
  const [loading, setLoading] = useState(true);
  const selectedRef = useRef(null);

  /* — user detail state — */
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHrv14, setUserHrv14] = useState([]);
  const [userHr24, setUserHr24] = useState([]);
  const [userStress24, setUserStress24] = useState([]);
  const [userSleep7, setUserSleep7] = useState([]);
  const [userLatest, setUserLatest] = useState({});
  const [userRawToday, setUserRawToday] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  /* ────────────────────────── FETCH ALL ────────────────────────── */
  const fetchAll = useCallback(async () => {
    try {
      // 1. Users (view joins auth.users + participantes)
      const { data: parts } = await supabase
        .from('admin_users').select('user_id, nome, email');
      const nameMap = new Map((parts || []).map(p => [p.user_id, p.nome || p.email || 'Sem nome']));

      // 2. Integrations
      const { data: integs } = await supabase
        .from('user_integrations').select('user_id, status, last_sync_at, scopes')
        .eq('provider', 'health_connect');
      const integMap = new Map((integs || []).map(i => [i.user_id, i]));

      // 3. ring_daily_data count per user
      const { data: rings } = await supabase
        .from('ring_daily_data').select('user_id, day, metrics');
      const daysMap = new Map();
      for (const r of (rings || [])) {
        daysMap.set(r.user_id, (daysMap.get(r.user_id) || 0) + 1);
      }

      // 4. Today's scores
      const { data: states } = await supabase
        .from('computed_states').select('user_id, score, level')
        .eq('day', today());
      const scoreMap = new Map((states || []).map(s => [s.user_id, s]));

      // 5. Biomarker sample counts
      const { data: samples } = await supabase
        .from('biomarker_samples').select('user_id, type');
      const countMap = new Map();
      let totalGlobal = 0;
      for (const s of (samples || [])) {
        const m = countMap.get(s.user_id) || {};
        m[s.type] = (m[s.type] || 0) + 1;
        countMap.set(s.user_id, m);
        totalGlobal++;
      }

      // Fallback: derive sample counts from ring_daily_data when biomarker_samples is empty
      if (totalGlobal === 0) {
        for (const r of (rings || [])) {
          const m = r.metrics || {};
          const uid = r.user_id;
          const c = countMap.get(uid) || {};
          if (m.hr_avg != null) c.hr = (c.hr || 0) + 1;
          if (m.rhr != null) c.rhr = (c.rhr || 0) + 1;
          if (m.hrv_sdnn != null) c.hrv = (c.hrv || 0) + 1;
          if (m.spo2 != null) c.spo2 = (c.spo2 || 0) + 1;
          if (m.steps != null) c.steps = (c.steps || 0) + 1;
          if (m.sleep_duration_hours != null) c.sleep = (c.sleep || 0) + 1;
          if (m.stress_level != null) c.stress = (c.stress || 0) + 1;
          countMap.set(uid, c);
        }
      }

      // Build user list
      const allIds = new Set([...nameMap.keys(), ...integMap.keys(), ...daysMap.keys()]);
      const rows = [];
      for (const uid of allIds) {
        const integ = integMap.get(uid) || {};
        const sc = scoreMap.get(uid) || {};
        const counts = countMap.get(uid) || {};
        const totalSamples = Object.values(counts).reduce((a, b) => a + b, 0);
        rows.push({
          id: uid,
          name: nameMap.get(uid) || 'Usuário',
          status: integ.status || 'not_connected',
          last_sync_at: integ.last_sync_at || null,
          wearable_connected: integ.status === 'connected' || integ.status === 'active',
          days: daysMap.get(uid) || 0,
          score: sc.score ?? null,
          level: sc.level ?? null,
          total_samples: totalSamples,
          counts,
        });
      }

      // KPIs
      const now = Date.now();
      const active = rows.filter(u => u.wearable_connected).length;
      const critical = rows.filter(u => {
        if (!u.last_sync_at) return true;
        return now - new Date(u.last_sync_at).getTime() > 6 * 3600000;
      }).length;
      const offline = rows.filter(u => !u.wearable_connected).length;
      const recentSync = rows.filter(u => u.last_sync_at && now - new Date(u.last_sync_at).getTime() < 30 * 60000).length;
      const syncRate = rows.length > 0 ? Math.round((recentSync / rows.length) * 100) : 0;

      // Alerts
      const alertList = [];
      for (const u of rows) {
        if (!u.last_sync_at) {
          alertList.push({ severity: 'critical', user: u.name, msg: 'Nunca sincronizou', uid: u.id });
        } else if (now - new Date(u.last_sync_at).getTime() > 24 * 3600000) {
          alertList.push({ severity: 'critical', user: u.name, msg: 'Sem dados há mais de 24h', uid: u.id });
        } else if (now - new Date(u.last_sync_at).getTime() > 6 * 3600000) {
          alertList.push({ severity: 'warning', user: u.name, msg: 'Sem dados há mais de 6h', uid: u.id });
        }
        if (!u.wearable_connected) {
          alertList.push({ severity: 'warning', user: u.name, msg: 'Wearable desconectado', uid: u.id });
        }
        if (u.score !== null && u.score < 40) {
          alertList.push({ severity: 'critical', user: u.name, msg: `Estado crítico (score ${u.score})`, uid: u.id });
        }
      }
      alertList.sort((a, b) => (a.severity === 'critical' ? 0 : 1) - (b.severity === 'critical' ? 0 : 1));

      // Avg metrics today vs yesterday
      const todayRings = (rings || []).filter(r => r.day === today());
      const yesterdayRings = (rings || []).filter(r => r.day === yesterday());
      const computeAvg = (list) => {
        if (list.length === 0) return {};
        const sums = { hrv: 0, heart_rate: 0, sleep_hours: 0, stress_index: 0, steps: 0, n: 0 };
        for (const r of list) {
          const m = r.metrics || {};
          if (m.hrv_sdnn) { sums.hrv += m.hrv_sdnn; }
          if (m.hr_avg) { sums.heart_rate += m.hr_avg; }
          if (m.sleep_duration_hours) { sums.sleep_hours += m.sleep_duration_hours; }
          if (m.stress_level != null) { sums.stress_index += m.stress_level; }
          if (m.steps) { sums.steps += m.steps; }
          sums.n++;
        }
        const n = sums.n || 1;
        return {
          hrv: Math.round((sums.hrv / n) * 10) / 10,
          heart_rate: Math.round(sums.heart_rate / n),
          sleep_hours: Math.round((sums.sleep_hours / n) * 10) / 10,
          stress_index: Math.round(sums.stress_index / n),
          steps: Math.round(sums.steps / n),
        };
      };

      rows.sort((a, b) => {
        const aT = a.last_sync_at ? new Date(a.last_sync_at).getTime() : 0;
        const bT = b.last_sync_at ? new Date(b.last_sync_at).getTime() : 0;
        return bT - aT;
      });

      setUsers(rows);
      setKpis({ active, critical, offline, syncRate });
      setAlerts(alertList);
      setAvgToday(computeAvg(todayRings));
      setAvgYesterday(computeAvg(yesterdayRings));
    } catch (e) {
      console.error('[admin] fetchAll error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ────────────────────────── FETCH USER DETAIL ────────────────────────── */
  const fetchUserDetail = useCallback(async (userId) => {
    selectedRef.current = userId;
    setSelectedUser(userId);
    setLoadingDetail(true);
    try {
      // HRV last 14 days (from ring_daily_data)
      const { data: rings14 } = await supabase
        .from('ring_daily_data').select('day, metrics')
        .eq('user_id', userId)
        .gte('day', daysAgo(14).split('T')[0])
        .order('day');
      setUserHrv14((rings14 || []).map(r => ({
        day: r.day,
        hrv: r.metrics?.hrv_sdnn ?? null,
      })));

      // HR + Stress last 24h (from biomarker_samples)
      const since24h = daysAgo(1);
      const { data: hrRaw } = await supabase
        .from('biomarker_samples').select('ts, value')
        .eq('user_id', userId).eq('type', 'hr')
        .gte('ts', since24h).order('ts');
      if (hrRaw && hrRaw.length > 0) {
        setUserHr24(hrRaw.map(r => ({ ts: r.ts, value: r.value })));
      } else {
        // Fallback: daily HR avg from ring_daily_data
        const { data: hrDaily } = await supabase
          .from('ring_daily_data').select('day, metrics')
          .eq('user_id', userId)
          .gte('day', daysAgo(14).split('T')[0])
          .order('day');
        setUserHr24((hrDaily || []).map(r => ({
          ts: r.day,
          value: r.metrics?.hr_avg ?? null,
          isDaily: true,
        })));
      }

      // Stress from ring_daily_data (daily granularity)
      const { data: stressRaw } = await supabase
        .from('ring_daily_data').select('day, metrics')
        .eq('user_id', userId)
        .gte('day', daysAgo(7).split('T')[0])
        .order('day');
      setUserStress24((stressRaw || []).map(r => ({
        day: r.day,
        value: r.metrics?.stress_level ?? null,
      })));

      // Sleep last 7 days
      const { data: sleepRaw } = await supabase
        .from('ring_daily_data').select('day, metrics')
        .eq('user_id', userId)
        .gte('day', daysAgo(7).split('T')[0])
        .order('day');
      setUserSleep7((sleepRaw || []).map(r => ({
        day: r.day,
        hours: r.metrics?.sleep_duration_hours ?? 0,
      })));

      // Latest reading of each type
      const types = ['hr', 'rhr', 'hrv', 'spo2', 'rr', 'steps', 'sleep'];
      const latest = {};
      for (const t of types) {
        const { data } = await supabase
          .from('biomarker_samples').select('ts, value, payload_json')
          .eq('user_id', userId).eq('type', t)
          .order('ts', { ascending: false }).limit(1);
        if (data && data[0]) latest[t] = data[0];
      }
      // Fallback: derive latest from ring_daily_data
      if (Object.keys(latest).length === 0) {
        const { data: latestRing } = await supabase
          .from('ring_daily_data').select('day, metrics, updated_at')
          .eq('user_id', userId)
          .order('day', { ascending: false })
          .limit(1);
        if (latestRing && latestRing[0]) {
          const m = latestRing[0].metrics || {};
          const ts = latestRing[0].updated_at || latestRing[0].day;
          if (m.hr_avg != null) latest.hr = { ts, value: m.hr_avg };
          if (m.rhr != null) latest.rhr = { ts, value: m.rhr };
          if (m.hrv_sdnn != null) latest.hrv = { ts, value: m.hrv_sdnn };
          if (m.spo2 != null) latest.spo2 = { ts, value: m.spo2 };
          if (m.respiratory_rate != null) latest.rr = { ts, value: m.respiratory_rate };
          if (m.steps != null) latest.steps = { ts, value: m.steps };
          if (m.sleep_duration_hours != null) latest.sleep = { ts, value: m.sleep_duration_hours, payload_json: { sleepQuality: m.sleep_quality } };
        }
      }
      setUserLatest(latest);

      // Raw samples today
      const { data: rawToday } = await supabase
        .from('biomarker_samples').select('type, ts, end_ts, value, source, payload_json')
        .eq('user_id', userId)
        .gte('ts', today() + 'T00:00:00')
        .order('ts', { ascending: false })
        .limit(200);
      if (rawToday && rawToday.length > 0) {
        setUserRawToday(rawToday);
      } else {
        // Fallback: expand ring_daily_data metrics into synthetic rows
        const { data: ringToday } = await supabase
          .from('ring_daily_data').select('day, metrics, source_provider, updated_at')
          .eq('user_id', userId)
          .eq('day', today());
        const syntheticRows = [];
        for (const r of (ringToday || [])) {
          const m = r.metrics || {};
          const ts = r.updated_at || r.day + 'T00:00:00';
          const entries = [
            { type: 'hr', value: m.hr_avg },
            { type: 'rhr', value: m.rhr },
            { type: 'hrv', value: m.hrv_sdnn },
            { type: 'spo2', value: m.spo2 },
            { type: 'steps', value: m.steps },
            { type: 'sleep', value: m.sleep_duration_hours },
            { type: 'stress', value: m.stress_level },
          ];
          for (const e of entries) {
            if (e.value != null) {
              syntheticRows.push({
                type: e.type, ts, end_ts: null, value: e.value,
                source: r.source_provider || 'health_connect',
                payload_json: null,
              });
            }
          }
        }
        setUserRawToday(syntheticRows);
      }
    } catch (e) {
      console.error('[admin] fetchUserDetail error:', e);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  /* ────────────────────────── REALTIME ────────────────────────── */
  useEffect(() => {
    fetchAll();

    // Subscribe to biomarker_samples inserts
    const bioChannel = supabase
      .channel('admin-biomarkers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'biomarker_samples' }, (payload) => {
        console.info('[realtime] new biomarker sample:', payload.new?.type);
        // Refresh KPIs
        fetchAll();
        // If this user is selected, refresh detail
        if (selectedRef.current && payload.new?.user_id === selectedRef.current) {
          fetchUserDetail(selectedRef.current);
        }
      })
      .subscribe();

    // Subscribe to user_integrations changes
    const integChannel = supabase
      .channel('admin-integrations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_integrations' }, () => {
        console.info('[realtime] integration change');
        fetchAll();
      })
      .subscribe();

    // Subscribe to ring_daily_data changes
    const ringChannel = supabase
      .channel('admin-ring-daily')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ring_daily_data' }, (payload) => {
        console.info('[realtime] ring_daily_data change');
        fetchAll();
        if (selectedRef.current && payload.new?.user_id === selectedRef.current) {
          fetchUserDetail(selectedRef.current);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bioChannel);
      supabase.removeChannel(integChannel);
      supabase.removeChannel(ringChannel);
    };
  }, [fetchAll, fetchUserDetail]);

  return {
    users, kpis, alerts, avgToday, avgYesterday, loading,
    selectedUser, fetchUserDetail, loadingDetail,
    userHrv14, userHr24, userStress24, userSleep7, userLatest, userRawToday,
    refresh: fetchAll,
  };
}
