'use client';

import { type Signal, type Relevance, relevanceColors } from '@/data/signals';

interface MetricsBarProps {
  signals: Signal[];
  selectedRelevances: Set<Relevance>;
  onToggleRelevance: (s: Relevance) => void;
  selectedClassifier: string | null;
  onToggleClassifier: (c: string) => void;
}

const relevances: Relevance[] = ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'INFORMATIVA'];

const classifierColors: Record<string, string> = {
  'Conflicto': '#EF4444',
  'Economía': '#EAB308',
  'Diplomacia': '#00E5A0',
  'Seguridad': '#38BDF8',
  'Tecnología': '#A78BFA',
  'Ecosistema': '#22C55E',
  'Energía': '#F97316',
  'Derechos Humanos': '#F472B6',
};

const allClassifiers = Object.keys(classifierColors);

export default function MetricsBar({ signals, selectedRelevances, onToggleRelevance, selectedClassifier, onToggleClassifier }: MetricsBarProps) {
  const total = signals.length;
  const counts: Record<string, number> = {};
  relevances.forEach((sev) => {
    counts[sev] = signals.filter((s) => s.relevance === sev).length;
  });

  const classifierCounts: Record<string, number> = {};
  allClassifiers.forEach((cls) => {
    classifierCounts[cls] = signals.filter((s) => s.classifiers.includes(cls)).length;
  });

  const maxCount = Math.max(...relevances.map((s) => counts[s]), 1);
  const maxClsCount = Math.max(...allClassifiers.map((c) => classifierCounts[c]), 1);

  return (
    <div className="glass-strong rounded-xl px-3 py-2.5">
      {/* Fila 1: Señales Geopolíticas + total */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
          Señales Geopolíticas
        </span>
        <span className="text-base font-bold text-[#00E5A0] font-[family-name:var(--font-space-grotesk)] leading-none">
          {total}
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

      {/* Fila 2: Clasificadores temáticos */}
      <div className="flex items-end gap-1.5 mt-2">
        {allClassifiers.map((cls) => {
          const count = classifierCounts[cls];
          const color = classifierColors[cls];
          const isSelected = selectedClassifier === cls;
          const heightPct = maxClsCount > 0 ? (count / maxClsCount) * 100 : 0;

          return (
            <button
              key={cls}
              onClick={() => onToggleClassifier(cls)}
              className="flex-1 flex flex-col items-center gap-1 transition-all duration-150"
              title={cls}
            >
              <span
                className="text-[10px] font-bold font-[family-name:var(--font-jetbrains-mono)] leading-none"
                style={{ color }}
              >
                {count}
              </span>
              <div
                className="w-full h-6 rounded-sm relative overflow-hidden transition-all duration-150"
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
              <span
                className="text-[6px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] text-center leading-none"
                style={{ color, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {cls}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
