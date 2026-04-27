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
      {/* Fila 1: Señales Geopolíticas + total */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
          Señales Geopolíticas
        </span>
        <span className="text-base font-bold text-[#00E5A0] font-[family-name:var(--font-space-grotesk)] leading-none">
          {filteredCount}
        </span>
        {selectedRelevances.size > 0 && (
          <button
            onClick={() => onClearRelevance()}
            className="ml-auto p-0.5 rounded bg-white/[0.06] hover:bg-white/[0.12] text-white/40 hover:text-white/70 transition-colors"
            title="Limpiar filtro"
          >
            <X className="w-3 h-3" />
          </button>
        )}
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
