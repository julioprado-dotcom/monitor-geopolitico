'use client';

import { Clock, Bookmark, BookmarkCheck, ChevronRight } from 'lucide-react';
import { type Thread, type ThreadSignal, statusConfig } from '@/data/threads';
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
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function sourceInitials(source: string): string {
  const words = source.split(' ');
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function ThreadCard({ thread, isFollowed, onToggleFollow, onExpand }: ThreadCardProps) {
  const status = statusConfig[thread.status];
  const latestSignals = thread.signals.slice(-3);

  return (
    <div className="glass rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-colors">
      {/* Fila superior: estado + seguir */}
      <div className="px-3 pt-2.5 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]"
            style={{
              backgroundColor: `${status.color}12`,
              color: status.color,
              border: `1px solid ${status.color}20`,
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${thread.status === 'EN_VIVO' ? 'animate-pulse' : ''}`} style={{ backgroundColor: status.color }} />
            {status.label}
          </span>
          <span className="text-[8px] text-white/20 font-[family-name:var(--font-jetbrains-mono)]">
            {thread.signals.length} señales · {thread.regions.join(' · ')}
          </span>
        </div>
        <button
          onClick={() => onToggleFollow(thread.id)}
          className="shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          title={isFollowed ? 'Dejar de seguir' : 'Seguir hilo'}
        >
          {isFollowed ? (
            <BookmarkCheck className="w-3.5 h-3.5 text-[#00E5A0]" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 text-white/25 hover:text-white/45" />
          )}
        </button>
      </div>

      {/* Título del evento — DESTACADO */}
      <div className="px-3 pt-2 pb-1">
        <h3 className="text-[15px] sm:text-base font-bold text-white/90 font-[family-name:var(--font-space-grotesk)] leading-snug">
          {thread.title}
        </h3>
      </div>

      {/* Descripción del evento */}
      <div className="px-3 pb-2">
        <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
          <p className="text-[11px] sm:text-xs text-white/45 leading-relaxed font-[family-name:var(--font-space-grotesk)]">
            {thread.description}
          </p>
        </div>
      </div>

      {/* Señales — título prominente, fuente secundaria */}
      <div className="px-3 py-2 border-t border-white/[0.04]">
        {latestSignals.map((signal) => {
          const color = relevanceColors[signal.relevance] || '#64748B';
          return (
            <div key={signal.id} className="flex items-start gap-2 py-1.5">
              {/* Indicador de relevancia */}
              <span
                className="shrink-0 w-1 h-1 rounded-full mt-[7px]"
                style={{ backgroundColor: color }}
              />
              {/* Título de la señal — prominente */}
              <p className="min-w-0 flex-1 text-[11px] text-white/55 leading-snug font-[family-name:var(--font-space-grotesk)] truncate">
                {signal.title}
              </p>
              {/* Fuente — secundaria */}
              <span className="shrink-0 text-[8px] font-bold font-[family-name:var(--font-jetbrains-mono)] text-white/20 bg-white/[0.03] px-1.5 py-0.5 rounded">
                {sourceInitials(signal.source)}
              </span>
            </div>
          );
        })}
        {thread.signals.length > 3 && (
          <span className="text-[9px] text-white/20 font-[family-name:var(--font-jetbrains-mono)] pl-3">
            +{thread.signals.length - 3} señales más
          </span>
        )}
      </div>

      {/* Footer: tags + cronología */}
      <div className="px-3 py-2 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {thread.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/[0.04] text-white/25 font-[family-name:var(--font-jetbrains-mono)]"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          onClick={() => onExpand(thread)}
          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] text-white/30 hover:text-white/55 hover:bg-white/[0.04] transition-colors"
        >
          <Clock className="w-3 h-3" />
          <span className="hidden sm:inline">Cronología</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
