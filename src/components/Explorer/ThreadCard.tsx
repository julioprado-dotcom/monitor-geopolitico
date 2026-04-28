'use client';

import { Clock, Bookmark, BookmarkCheck, ChevronRight } from 'lucide-react';
import { type Thread, type ThreadSignal, statusConfig, typeLabels } from '@/data/threads';
import { relevanceColors } from '@/data/signals';

interface ThreadCardProps {
  thread: Thread;
  isFollowed: boolean;
  onToggleFollow: (id: string) => void;
  onExpand: (thread: Thread) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return 'Ahora';
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD}d`;
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function SignalSourceTag({ signal }: { signal: ThreadSignal }) {
  const color = relevanceColors[signal.relevance] || '#64748B';
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span
        className="shrink-0 w-1 h-1 rounded-full mt-1.5"
        style={{ backgroundColor: color }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[9px] font-bold font-[family-name:var(--font-jetbrains-mono)]" style={{ color }}>
            {signal.source}
          </span>
          <span className="text-[8px] text-white/20 font-[family-name:var(--font-jetbrains-mono)]">
            {formatTime(signal.timestamp)}
          </span>
        </div>
        <p className="text-[11px] text-white/50 leading-snug font-[family-name:var(--font-space-grotesk)] truncate">
          {signal.title}
        </p>
      </div>
    </div>
  );
}

export default function ThreadCard({ thread, isFollowed, onToggleFollow, onExpand }: ThreadCardProps) {
  const status = statusConfig[thread.status];
  const latestSignals = thread.signals.slice(-3); // Últimas 3 señales visibles

  return (
    <div className="glass rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-colors">
      {/* Header: título + estado */}
      <div className="px-3 py-2.5 border-b border-white/[0.04]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]"
                style={{
                  backgroundColor: `${status.color}15`,
                  color: status.color,
                  border: `1px solid ${status.color}25`,
                }}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${thread.status === 'EN_VIVO' ? 'animate-pulse' : ''}`} style={{ backgroundColor: status.color }} />
                {status.label}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white/80 font-[family-name:var(--font-space-grotesk)] leading-tight">
              {thread.title}
            </h3>
          </div>
          <button
            onClick={() => onToggleFollow(thread.id)}
            className="shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            title={isFollowed ? 'Dejar de seguir' : 'Seguir hilo'}
          >
            {isFollowed ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-[#00E5A0]" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-white/30 hover:text-white/50" />
            )}
          </button>
        </div>
      </div>

      {/* Señales resumidas */}
      <div className="px-3 py-2">
        {latestSignals.map((signal) => (
          <SignalSourceTag key={signal.id} signal={signal} />
        ))}
        {thread.signals.length > 3 && (
          <span className="text-[9px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
            +{thread.signals.length - 3} señales más
          </span>
        )}
      </div>

      {/* Footer: metadatos + expandir */}
      <div className="px-3 py-2 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {thread.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/[0.04] text-white/30 font-[family-name:var(--font-jetbrains-mono)]"
            >
              {tag}
            </span>
          ))}
          <span className="text-[8px] text-white/20 font-[family-name:var(--font-jetbrains-mono)]">
            {thread.sourceCount} fuentes · {thread.regions[0]}
          </span>
        </div>
        <button
          onClick={() => onExpand(thread)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] text-white/35 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
        >
          <Clock className="w-3 h-3" />
          <span className="hidden sm:inline">Cronología</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
