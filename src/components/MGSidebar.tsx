'use client';

import { type Region, type Signal, demoSignals } from '@/data/signals';
import { ChevronRight, Globe, Info, Filter } from 'lucide-react';

interface MGSidebarProps {
  selectedRegion: Region | null;
  selectedClassifier: string | null;
  onRegionSelect: (r: Region | null) => void;
  onClassifierSelect: (c: string | null) => void;
}

const regions: Region[] = ['LATAM', 'EUROPA', 'ASIA', 'ÁFRICA', 'MEDIO ORIENTE', 'NORTEAMÉRICA'];

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
  LATAM: '🌎',
  EUROPA: '🌍',
  ASIA: '🌏',
  'ÁFRICA': '🌍',
  'MEDIO ORIENTE': '🌏',
  NORTEAMÉRICA: '🌎',
};

export default function MGSidebar({
  selectedRegion,
  selectedClassifier,
  onRegionSelect,
  onClassifierSelect,
}: MGSidebarProps) {
  return (
    <div className="flex flex-col gap-3">
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
              const count = demoSignals.filter((s: Signal) => s.region === region).length;
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
                    {region}
                  </span>
                  <span className="text-[10px] text-white/25">{count}</span>
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
              const count = demoSignals.filter((s: Signal) => s.classifiers.includes(cls)).length;
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
                  <span className="text-[10px] text-white/25">{count}</span>
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
