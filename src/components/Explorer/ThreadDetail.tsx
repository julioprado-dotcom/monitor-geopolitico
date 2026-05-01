'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Bookmark, BookmarkCheck, Link2, Clock, Globe, Brain, Loader2, ExternalLink } from 'lucide-react';
import { type Thread, type ThreadSignal, statusConfig, typeLabels } from '@/data/threads';
import type { Region } from '@/types';
import { relevanceColors } from '@/data/signals';

interface ThreadDetailProps {
  thread: Thread;
  isFollowed: boolean;
  onToggleFollow: (id: string) => void;
  onClose: () => void;
  onNavigateRelation: (threadId: string) => void;
  onSignalClick?: (signal: ThreadSignal, region: Region) => void;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return 'Hace minutos';
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Hace ${diffD}d`;
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const relationTypeLabels: Record<string, { label: string; color: string }> = {
  causa: { label: 'Causa', color: '#EF4444' },
  efecto: { label: 'Efecto', color: '#F59E0B' },
  correlacion: { label: 'Correlación', color: '#38BDF8' },
};

export default function ThreadDetail({ thread, isFollowed, onToggleFollow, onClose, onNavigateRelation, onSignalClick }: ThreadDetailProps) {
  const status = statusConfig[thread.status];
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAnalysis = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);

    try {
      // Construir payload con toda la información del hilo
      const allSignalTitles = thread.signals.map((s) => `[${s.source}] ${s.title}`).join('\n');
      const payload = {
        id: thread.id,
        title: thread.title,
        summary: thread.description,
        fullContent: `${thread.description}\n\nSeñales del hilo:\n${allSignalTitles}\n\nRelaciones: ${thread.relations.map((r) => `${r.title} (${r.type})`).join(', ')}`,
        region: thread.regions[0],
        classifiers: [typeLabels[thread.type]],
        relevance: 'ALTA',
        language: 'es',
        source: 'Monitor Geopolítico — Hilos',
      };

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error('Límite diario de análisis alcanzado. Intenta más tarde.');
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text.slice(0, 120)}`);
      }

      const raw = await res.text();
      let data: { analysis?: string; error?: string };
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('La respuesta del servidor no es válida. Intenta de nuevo.');
      }

      if (data.error) throw new Error(data.error);
      if (!data.analysis) throw new Error('El análisis no se generó correctamente.');
      setAnalysis(data.analysis);
    } catch (err: any) {
      if (err.name !== 'AbortError') setAnalysisError(err.message || 'Error de conexión');
    } finally {
      setAnalyzing(false);
    }
  }, [thread]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="glass rounded-xl overflow-hidden border border-white/[0.06]" role="article" aria-label={`Hilo geopolítico: ${thread.title}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            onClick={onClose}
            aria-label="Volver a la lista de hilos"
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/35 hover:text-white/60 font-[family-name:var(--font-jetbrains-mono)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver
          </button>
          <button
            onClick={() => onToggleFollow(thread.id)}
            aria-label={isFollowed ? `Dejar de seguir: ${thread.title}` : `Seguir: ${thread.title}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] transition-colors"
            style={isFollowed
              ? { backgroundColor: '#00E5A015', color: '#00E5A0', border: '1px solid #00E5A025' }
              : { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            {isFollowed ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            {isFollowed ? 'Siguiendo' : 'Seguir'}
          </button>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]"
            style={{
              backgroundColor: `${status.color}15`,
              color: status.color,
              border: `1px solid ${status.color}25`,
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${thread.status === 'EN_VIVO' ? 'animate-pulse' : ''}`} style={{ backgroundColor: status.color }} />
            {status.label}
          </span>
          <span className="text-[9px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
            {thread.signals.length} señales · {formatTimestamp(thread.lastActivityAt)}
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-white/90 font-[family-name:var(--font-space-grotesk)] leading-tight mb-1">
          {thread.title}
        </h2>
        <p className="text-[11px] text-white/40 font-[family-name:var(--font-space-grotesk)] leading-relaxed">
          {thread.description}
        </p>

        {/* Metadatos */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-white/25" />
            <span className="text-[9px] text-white/35 font-[family-name:var(--font-jetbrains-mono)]">
              {thread.regions.join(' · ')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
              {typeLabels[thread.type]}
            </span>
          </div>
        </div>
      </div>

      {/* Cronología */}
      <div className="px-4 py-3">
        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] mb-3">
          Cronología
        </h3>

        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/[0.06]" />

          <div className="flex flex-col gap-3">
            {thread.signals.map((signal, idx) => {
              const isLatest = idx === thread.signals.length - 1;
              const color = relevanceColors[signal.relevance] || '#64748B';

              return (
                <div key={signal.id} className="relative pl-5">
                  {/* Punto en timeline */}
                  <div
                    className={`absolute left-0 top-2 w-[11px] h-[11px] rounded-full border-2 ${isLatest && thread.status === 'EN_VIVO' ? 'animate-pulse' : ''}`}
                    style={{
                      backgroundColor: isLatest ? color : 'transparent',
                      borderColor: color,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => onSignalClick?.(signal, thread.regions[0])}
                    className={`w-full text-left rounded-lg p-3 transition-colors cursor-pointer group ${isLatest ? 'bg-white/[0.04] border border-white/[0.08]' : 'hover:bg-white/[0.03]'}`}
                    aria-label={`Leer artículo completo: ${signal.title} — ${signal.source}`}
                  >
                    {/* Fuente + timestamp */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold font-[family-name:var(--font-jetbrains-mono)]"
                          style={{ color }}
                        >
                          {signal.source}
                        </span>
                        <span className="text-[8px] px-1 py-px rounded bg-white/[0.04] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
                          {signal.sourceLevel}
                        </span>
                      </div>
                      <span className="text-[9px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
                        {formatFullDate(signal.timestamp)}
                      </span>
                    </div>

                    {/* Título */}
                    <h4 className="text-[12px] font-bold text-white/70 group-hover:text-white/90 font-[family-name:var(--font-space-grotesk)] leading-snug mb-1 transition-colors">
                      {signal.title}
                    </h4>

                    {/* Resumen */}
                    <p className="text-[11px] text-white/40 font-[family-name:var(--font-space-grotesk)] leading-relaxed">
                      {signal.summary}
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span
                        className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]"
                        style={{ backgroundColor: `${color}12`, color }}
                      >
                        {signal.relevance}
                      </span>
                      {signal.tags.map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded text-[8px] bg-white/[0.04] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Indicador "Leer más" */}
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3 text-[#38BDF8]/50" />
                      <span className="text-[8px] font-bold text-[#38BDF8]/50 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
                        Leer artículo completo
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Relaciones */}
      {thread.relations.length > 0 && (
        <div className="px-4 py-3 border-t border-white/[0.06]">
          <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] mb-2">
            Relaciones
          </h3>
          {thread.relations.map((rel) => {
            const relType = relationTypeLabels[rel.type] || relationTypeLabels.correlacion;
            return (
              <button
                key={rel.threadId}
                onClick={() => onNavigateRelation(rel.threadId)}
                aria-label={`Ir a hilo relacionado: ${rel.title} (${relType.label})`}
                className="w-full text-left flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] transition-colors group mb-2 last:mb-0"
              >
                <Link2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: relType.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-white/50 group-hover:text-white/70 font-[family-name:var(--font-space-grotesk)]">
                      {rel.title}
                    </span>
                    <span
                      className="text-[7px] px-1 py-px rounded font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]"
                      style={{ backgroundColor: `${relType.color}15`, color: relType.color }}
                    >
                      {relType.label}
                    </span>
                  </div>
                  <p className="text-[9px] text-white/25 font-[family-name:var(--font-space-grotesk)]">
                    {rel.reason}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tags del hilo */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {thread.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-white/[0.04] text-white/30 font-[family-name:var(--font-jetbrains-mono)] border border-white/[0.06]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Análisis IA del Hilo */}
      <div className="px-4 py-3 border-t border-white/[0.06]" aria-live="polite" aria-atomic="true">
        {!analysis && !analyzing && !analysisError && (
          <button
            onClick={fetchAnalysis}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#38BDF8]/8 border border-[#38BDF8]/15 text-[#38BDF8]/70 rounded-xl hover:bg-[#38BDF8]/15 hover:text-[#38BDF8] transition-colors font-bold font-[family-name:var(--font-space-grotesk)] text-[11px]"
          >
            <Brain className="w-3.5 h-3.5" />
            Analizar hilo con IA — Perspectiva Sur Global
          </button>
        )}

        {analyzing && (
          <div className="flex flex-col items-center gap-2 py-6" role="status">
            <Loader2 className="w-5 h-5 text-[#38BDF8] animate-spin" />
            <span className="text-[11px] text-white/40 font-[family-name:var(--font-space-grotesk)]">Analizando {thread.signals.length} señales del hilo...</span>
          </div>
        )}

        {analysisError && (
          <div className="glass rounded-xl p-3 flex flex-col items-center gap-2" role="alert">
            <p className="text-[11px] text-red-400 font-[family-name:var(--font-space-grotesk)]">{analysisError}</p>
            <button
              onClick={fetchAnalysis}
              className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-colors font-[family-name:var(--font-jetbrains-mono)]"
            >
              Reintentar
            </button>
          </div>
        )}

        {analysis && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Brain className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span className="text-[10px] font-bold text-[#38BDF8]/70 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">Análisis IA — Hilo</span>
            </div>
            <div className="text-[11px] text-white/55 leading-relaxed font-[family-name:var(--font-space-grotesk)] whitespace-pre-line">{analysis}</div>
          </div>
        )}
      </div>
    </div>
  );
}
