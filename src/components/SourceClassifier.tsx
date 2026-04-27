'use client';

import { demoSignals, sourceLevelLabels, sourceLevelDescriptions, sourceLevelColors, type SourceLevel } from '@/data/signals';

const sourceLevels: SourceLevel[] = ['A', 'B', 'C', 'D'];

export default function SourceClassifier() {
  const total = demoSignals.length;

  const distribution = sourceLevels.map((level) => {
    const count = demoSignals.filter((s) => s.sourceLevel === level).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    const colors = sourceLevelColors[level];
    return { level, count, percentage, label: sourceLevelLabels[level], description: sourceLevelDescriptions[level], colors };
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
        {distribution.map(({ level, count, percentage, label, description, colors }) => (
          <div key={level} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className="px-1.5 py-0.5 rounded text-[8px] font-bold font-[family-name:var(--font-jetbrains-mono)]"
                  style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  {level}
                </span>
                <span className="text-[10px] font-bold text-white/60 font-[family-name:var(--font-jetbrains-mono)]">
                  {label}
                </span>
              </div>
              <span className="text-[10px] font-bold font-[family-name:var(--font-jetbrains-mono)]" style={{ color: colors.text }}>
                {count} ({percentage}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: colors.text }}
                />
              </div>
            </div>
            <p className="text-[9px] text-white/25 leading-relaxed font-[family-name:var(--font-space-grotesk)]">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
