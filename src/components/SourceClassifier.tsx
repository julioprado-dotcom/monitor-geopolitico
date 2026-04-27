'use client';

import { demoSignals, sourceLevelLabels, type SourceLevel } from '@/data/signals';

const sourceLevels: SourceLevel[] = ['A', 'B', 'C', 'D'];

export default function SourceClassifier() {
  const total = demoSignals.length;

  const distribution = sourceLevels.map((level) => {
    const count = demoSignals.filter((s) => s.sourceLevel === level).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { level, count, percentage, label: sourceLevelLabels[level] };
  });

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/[0.06]">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
          Clasificación de Fuentes
        </span>
      </div>

      {/* Distribution */}
      <div className="p-3 flex flex-col gap-2.5">
        {distribution.map(({ level, count, percentage, label }) => (
          <div key={level} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/60 font-[family-name:var(--font-jetbrains-mono)]">
                Nivel {level}
              </span>
              <span className="text-[9px] text-white/30 font-[family-name:var(--font-jetbrains-mono)]">
                {label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00E5A0]/70 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#00E5A0]/80 min-w-[36px] text-right font-[family-name:var(--font-jetbrains-mono)]">
                {count} ({percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
