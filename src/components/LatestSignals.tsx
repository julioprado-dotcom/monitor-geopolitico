'use client';

import { type Signal, demoSignals, relevanceColors } from '@/data/signals';
import { useMounted } from '@/hooks/useMounted';

interface LatestSignalsProps {
  onSignalClick: (s: Signal) => void;
}

function timeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffHr < 24) return `hace ${diffHr}h`;
  return `hace ${diffDay}d`;
}

export default function LatestSignals({ onSignalClick }: LatestSignalsProps) {
  const mounted = useMounted();

  const latestSignals = [...demoSignals]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
          Últimas Señales
        </span>
        <span className="text-[10px] font-bold text-[#00E5A0]/60 font-[family-name:var(--font-jetbrains-mono)]">
          {latestSignals.length}
        </span>
      </div>

      {/* List */}
      <div className="max-h-64 overflow-y-auto p-2 flex flex-col gap-0.5">
        {latestSignals.map((signal) => (
          <button
            key={signal.id}
            onClick={() => onSignalClick(signal)}
            className="w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: relevanceColors[signal.relevance] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/70 truncate font-[family-name:var(--font-space-grotesk)]">
                {signal.title}
              </p>
              <p className="text-[9px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
                {signal.source} · {mounted ? timeAgo(signal.timestamp) : '...'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
