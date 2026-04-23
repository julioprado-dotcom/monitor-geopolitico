'use client';

import type { AnalysisStage } from '@/lib/types';
import { STAGE_LABELS } from '@/lib/types';

interface ProgressIndicatorProps {
  stage: AnalysisStage;
}

const STAGES: AnalysisStage[] = [
  'extracting',
  'searching',
  'analyzing',
  'generating',
];

const STAGE_ICONS: Record<AnalysisStage, string> = {
  idle: '',
  extracting: '📄',
  searching: '🔍',
  analyzing: '🧠',
  generating: '📊',
  complete: '✅',
  error: '❌',
};

export function ProgressIndicator({ stage }: ProgressIndicatorProps) {
  if (stage === 'idle' || stage === 'complete' || stage === 'error') return null;

  const currentIndex = STAGES.indexOf(stage);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 border-2 border-neon/30 border-t-neon rounded-full animate-spin" />
          <span className="text-sm font-medium">{STAGE_LABELS[stage]}</span>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-between gap-1">
          {STAGES.map((s, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                      isCompleted
                        ? 'bg-neon text-deep'
                        : isCurrent
                        ? 'bg-neon/10 text-neon border-2 border-neon'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? '✓' : STAGE_ICONS[s]}
                  </div>
                  <span
                    className={`text-xs font-medium text-center whitespace-nowrap ${
                      isCompleted
                        ? 'text-neon'
                        : isCurrent
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {s === 'extracting'
                      ? 'Extraer'
                      : s === 'searching'
                      ? 'Buscar'
                      : s === 'analyzing'
                      ? 'Analizar'
                      : 'Reporte'}
                  </span>
                </div>
                {idx < STAGES.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-neon' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
