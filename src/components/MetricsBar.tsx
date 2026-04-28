'use client';

import { type Signal, type Relevance, relevanceColors } from '@/data/signals';
import { X } from 'lucide-react';

interface MetricsBarProps {
  allSignals: Signal[];
  filteredCount: number;
  selectedRelevances: Set<Relevance>;
  onToggleRelevance: (s: Relevance) => void;
  onClearRelevance: () => void;
}

const relevances: Relevance[] = ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'INFORMATIVA'];

export default function MetricsBar({ allSignals, filteredCount, selectedRelevances, onToggleRelevance, onClearRelevance }: MetricsBarProps) {
  const counts: Record<string, number> = {};
  relevances.forEach((sev) => {
    counts[sev] = allSignals.filter((s) => s.relevance === sev).length;
  });

  const maxCount = Math.max(...relevances.map((s) => counts[s]), 1);

  return (
    <div className="glass-strong rounded-xl px-3 py-2.5">
      {/* Barras de severidad — filtradas: {filteredCount}/{allSignals.length} */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
          Severidad
        </span>
        <span className="text-[9px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
          {filteredCount}<span className="text-white/15">/{allSignals.length}</span>
        </span>
      </div>

      {/* Barras sólidas verticales compactas */}
      <div className="flex items-end gap-2.5">
        {relevances.map((sev) => {
          const count = counts[sev];
          const color = relevanceColors[sev];
          const isSelected = selectedRelevances.has(sev);
          const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <button
              key={sev}
              onClick={() => onToggleRelevance(sev)}
              className="flex-1 flex flex-col items-center gap-1 transition-all duration-150"
            >
              {/* Botón limpiar encima de la barra seleccionada */}
              {isSelected && (
                <button
                  onClick={(e) => { e.stopPropagation(); onClearRelevance(); }}
                  className="px-1 py-px rounded text-[7px] font-bold font-[family-name:var(--font-jetbrains-mono)] transition-colors"
                  style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
                  title="Limpiar filtro"
                >
                  <X className="w-2 h-2 inline" /> <span className="ml-0.5">LIMPIAR</span>
                </button>
              )}

              {/* Contador */}
              <span
                className="text-[10px] font-bold font-[family-name:var(--font-jetbrains-mono)] leading-none"
                style={{ color }}
              >
                {count}
              </span>

              {/* Barra sólida */}
              <div
                className="w-full h-8 rounded-sm relative overflow-hidden transition-all duration-150"
                style={{
                  backgroundColor: `${color}15`,
                  border: isSelected ? `1.5px solid ${color}60` : '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-400"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>

              {/* Nombre completo */}
              <span
                className="text-[7px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] text-center leading-none"
                style={{ color }}
              >
                {sev}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
