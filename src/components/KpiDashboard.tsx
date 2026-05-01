'use client';

import { useMemo } from 'react';
import { type Signal, type Region, type Relevance, regionLabels } from '@/data/signals';
import { Activity, ShieldAlert, Globe } from 'lucide-react';

interface KpiDashboardProps {
  signals: Signal[];
}

const RELEVANCE_THREATS: Relevance[] = ['CRÍTICA', 'ALTA'];
const RELEVANCE_STABLE: Relevance[] = ['INFORMATIVA', 'BAJA'];

export default function KpiDashboard({ signals }: KpiDashboardProps) {
  const kpis = useMemo(() => {
    // 1. Señales Activas
    const total = signals.length;

    // 2. Balance de Poder: Amenazas vs Estabilidad
    const threats = signals.filter((s) => RELEVANCE_THREATS.includes(s.relevance)).length;
    const stable = signals.filter((s) => RELEVANCE_STABLE.includes(s.relevance)).length;

    // 3. Foco Regional: región con más señales
    const regionCount = signals.reduce<Partial<Record<Region, number>>>((acc, s) => {
      acc[s.region] = (acc[s.region] || 0) + 1;
      return acc;
    }, {});

    let topRegion: Region = 'LATINOAMÉRICA';
    let topCount = 0;
    for (const [region, count] of Object.entries(regionCount)) {
      if (count > topCount) {
        topCount = count;
        topRegion = region as Region;
      }
    }

    return { total, threats, stable, topRegion, topCount };
  }, [signals]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {/* KPI 1: Señales Activas */}
      <div className="glass rounded-xl p-4 sm:p-5 flex flex-col gap-2 border border-white/[0.06]">
        <div className="flex items-center gap-2 text-white/40">
          <Activity className="w-4 h-4" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
            Señales Activas
          </span>
        </div>
        <span className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-space-grotesk)]">
          {kpis.total}
        </span>
        <span className="text-[10px] text-white/30 font-[family-name:var(--font-jetbrains-mono)]">
          monitoreo en tiempo real
        </span>
      </div>

      {/* KPI 2: Balance de Poder */}
      <div className="glass rounded-xl p-4 sm:p-5 flex flex-col gap-2 border border-white/[0.06]">
        <div className="flex items-center gap-2 text-white/40">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
            Balance de Poder
          </span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)]" style={{ color: '#EF4444' }}>
            {kpis.threats}
          </span>
          <span className="text-lg text-white/20 mb-1">vs</span>
          <span className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-space-grotesk)]" style={{ color: '#22C55E' }}>
            {kpis.stable}
          </span>
        </div>
        <span className="text-[10px] text-white/30 font-[family-name:var(--font-jetbrains-mono)]">
          Amenazas vs. Estabilidad
        </span>
      </div>

      {/* KPI 3: Foco Regional */}
      <div className="glass rounded-xl p-4 sm:p-5 flex flex-col gap-2 border border-white/[0.06]">
        <div className="flex items-center gap-2 text-white/40">
          <Globe className="w-4 h-4" />
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
            Foco Regional
          </span>
        </div>
        <span className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space-grotesk)]" style={{ color: '#00E5A0' }}>
          {regionLabels[kpis.topRegion] || kpis.topRegion}
        </span>
        <span className="text-[10px] text-white/30 font-[family-name:var(--font-jetbrains-mono)]">
          {kpis.topCount} señales en la región
        </span>
      </div>
    </div>
  );
}
