'use client';

import { useMemo } from 'react';
import { type Region, demoSignals, regionLabels } from '@/data/signals';
import { demoAnalysis } from '@/data/analysis';
import { demoThreads } from '@/data/threads';
import { ChevronRight, Globe, Info, Filter, Radio } from 'lucide-react';

type ContentTab = 'signals' | 'analysis' | 'explorer';

interface MGSidebarProps {
  selectedRegion: Region | null;
  selectedClassifier: string | null;
  onRegionSelect: (r: Region | null) => void;
  onClassifierSelect: (c: string | null) => void;
  activeTab: ContentTab;
}

const regions: Region[] = ['LATINOAMÉRICA', 'EUROPA', 'ASIA', 'ÁFRICA', 'MEDIO ORIENTE', 'NORTEAMÉRICA'];

const classifiers = [
  'Diplomacia',
  'Conflicto',
  'Economía',
  'Tecnología',
  'Seguridad',
  'Ecosistema',
  'Derechos Humanos',
  'Energía',
];

const regionIcons: Record<string, string> = {
  'LATINOAMÉRICA': '🌎',
  EUROPA: '🌍',
  ASIA: '🌏',
  'ÁFRICA': '🌍',
  'MEDIO ORIENTE': '🌏',
  NORTEAMÉRICA: '🌎',
};

const tabLabels: Record<ContentTab, string> = {
  signals: 'Señales Geopolíticas',
  analysis: 'En profundidad',
  explorer: 'Hilos Geopolíticos',
};

export default function MGSidebar({
  selectedRegion,
  selectedClassifier,
  onRegionSelect,
  onClassifierSelect,
  activeTab,
}: MGSidebarProps) {
  const regionCounts = useMemo(() => {
    const c: Record<string, number> = {};
    regions.forEach((r) => {
      switch (activeTab) {
        case 'signals':
          c[r] = demoSignals.filter((s) => s.region === r).length;
          break;
        case 'analysis':
          c[r] = demoAnalysis.filter((a) => a.region === r).length;
          break;
        case 'explorer':
          c[r] = demoThreads.filter((t) => t.regions.includes(r)).length;
          break;
      }
    });
    return c;
  }, [activeTab]);

  const classifierCounts = useMemo(() => {
    const c: Record<string, number> = {};
    classifiers.forEach((cls) => {
      switch (activeTab) {
        case 'signals':
          c[cls] = demoSignals.filter((s) => s.classifiers.includes(cls)).length;
          break;
        case 'analysis':
          c[cls] = demoAnalysis.filter((a) => a.tags.includes(cls)).length;
          break;
        case 'explorer':
          c[cls] = demoThreads.filter((t) => t.tags.some((tag) => tag.toLowerCase().includes(cls.toLowerCase()))).length;
          break;
      }
    });
    return c;
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-3">
      {/* Señales Geopolíticas — título + indicador */}
      <div className="glass rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#00E5A0]/10 flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-[#00E5A0]" />
          </div>
          <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
            {tabLabels[activeTab]}
          </span>
        </div>
      </div>

      {/* Region Section */}
      <div className="glass rounded-xl overflow-hidden">
        <details className="mg-collapse" open>
          <summary className="px-3 py-2.5 hover:bg-white/5 transition-colors">
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#00E5A0]" />
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
                Región
              </span>
            </span>
            <ChevronRight className="chevron-icon w-3.5 h-3.5 text-white/30" />
          </summary>
          <div className="collapse-content px-2 pb-2 flex flex-col gap-0.5">
            <button
              onClick={() => onRegionSelect(null)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors duration-100 font-[family-name:var(--font-jetbrains-mono)] ${
                selectedRegion === null
                  ? 'bg-[#00E5A0]/10 text-[#00E5A0]'
                  : 'text-white/45 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              Todas
            </button>
            {regions.map((region) => {
              return (
                <button
                  key={region}
                  onClick={() => onRegionSelect(selectedRegion === region ? null : region)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors duration-100 flex items-center justify-between font-[family-name:var(--font-jetbrains-mono)] ${
                    selectedRegion === region
                      ? 'bg-[#00E5A0]/10 text-[#00E5A0]'
                      : 'text-white/45 hover:bg-white/5 hover:text-white/70'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs">{regionIcons[region]}</span>
                    {regionLabels[region]}
                  </span>
                  <span className="text-[10px] text-white/25">{regionCounts[region]}</span>
                </button>
              );
            })}
          </div>
        </details>
      </div>

      {/* Classifier Section */}
      <div className="glass rounded-xl overflow-hidden">
        <details className="mg-collapse" open>
          <summary className="px-3 py-2.5 hover:bg-white/5 transition-colors">
            <span className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#00E5A0]" />
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
                Clasificador
              </span>
            </span>
            <ChevronRight className="chevron-icon w-3.5 h-3.5 text-white/30" />
          </summary>
          <div className="collapse-content px-2 pb-2 flex flex-col gap-0.5">
            <button
              onClick={() => onClassifierSelect(null)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors duration-100 font-[family-name:var(--font-jetbrains-mono)] ${
                selectedClassifier === null
                  ? 'bg-[#00E5A0]/10 text-[#00E5A0]'
                  : 'text-white/45 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              Todos
            </button>
            {classifiers.map((cls) => {
              return (
                <button
                  key={cls}
                  onClick={() => onClassifierSelect(selectedClassifier === cls ? null : cls)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-[11px] transition-colors duration-100 flex items-center justify-between font-[family-name:var(--font-jetbrains-mono)] ${
                    selectedClassifier === cls
                      ? 'bg-[#00E5A0]/10 text-[#00E5A0]'
                      : 'text-white/45 hover:bg-white/5 hover:text-white/70'
                  }`}
                >
                  {cls}
                  <span className="text-[10px] text-white/25">{classifierCounts[cls]}</span>
                </button>
              );
            })}
          </div>
        </details>
      </div>

      {/* Espejo Sur Info — con identidad reforzada */}
      <div className="glass rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-[#00E5A0]/10 flex items-center justify-center">
            <Filter className="w-3 h-3 text-[#00E5A0]" />
          </div>
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
            Espejo Sur
          </span>
        </div>
        <p className="text-[10px] text-white/30 leading-relaxed font-[family-name:var(--font-space-grotesk)]">
          Red de fuentes del Sur Global que refleja y contextualiza señales geopolíticas desde perspectivas no hegemónicas. 13 de 15 canales marcados como Sur Global.
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00E5A0] animate-pulse" />
          <span className="text-[8px] text-[#00E5A0]/50 font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
            13 fuentes activas
          </span>
        </div>
      </div>
    </div>
  );
}
