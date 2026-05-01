'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useFocusTrap } from '@/hooks/useFocusTrap';

// Lazy: react-markdown (~50KB) solo se carga cuando se muestra el meta-análisis
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import {
  X as XIcon,
  GitCompareArrows,
  Loader2,
  ExternalLink,
  Globe,
} from 'lucide-react';
import {
  type Signal,
  sourceLevelLabels,
  sourceLevelColors,
  relevanceColors,
} from '@/data/signals';

interface ComparisonSource {
  signalId: string;
  sourceName: string;
  sourceLevel: 'A' | 'B' | 'C' | 'D';
  language: string;
  title: string;
  excerpt: string;
  url?: string;
  relevance: string;
  region: string;
  classifiers: string[];
}

interface ComparisonData {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  classifiers: string[];
  region: string;
  sources: ComparisonSource[];
  metaAnalysis: string | null;
  note?: string;
  sourceCount: number;
  createdAt: string;
}

interface SourceComparisonViewProps {
  seedSignal: Signal;
  onClose: () => void;
}

export default function SourceComparisonView({ seedSignal, onClose }: SourceComparisonViewProps) {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useFocusTrap(true, onClose);

  const fetchComparison = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId: seedSignal.id }),
        signal,
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 429) throw new Error('Límite de comparaciones alcanzado. Intenta más tarde.');
        throw new Error(result.error || 'Error al generar comparación');
      }

      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount + AbortController para cancelar si se desmonta
  useEffect(() => {
    const controller = new AbortController();
    fetchComparison(controller.signal);
    return () => controller.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const closeOnEscape = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.8)' }}
      onKeyDown={closeOnEscape}
      aria-hidden="true"
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Comparación de fuentes geopolíticas"
        className="relative glass-strong rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Cerrar"
        >
          <XIcon className="w-4 h-4 text-white/60" />
        </button>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#00E5A0]/10 border border-[#00E5A0]/20">
              <GitCompareArrows className="w-5 h-5 text-[#00E5A0]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                Comparación de Fuentes
              </h2>
              <p className="text-[10px] text-white/40 font-[family-name:var(--font-jetbrains-mono)]">
                Vista de Comparación — Óptica Sur Global
              </p>
            </div>
          </div>

          {/* Loading state — aria-live para lectores de pantalla */}
          <div aria-live="polite" aria-atomic="true">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-16" role="status">
              <Loader2 className="w-8 h-8 text-[#00E5A0] animate-spin" />
              <span className="text-sm text-white/50 font-[family-name:var(--font-space-grotesk)]">
                Buscando fuentes relacionadas y generando análisis comparativo...
              </span>
              <span className="text-[10px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
                Esto puede tomar unos segundos
              </span>
            </div>
          )}

          {error && !loading && (
            <div className="glass rounded-xl p-4 flex flex-col items-center gap-3 py-12" role="alert">
              <p className="text-sm text-red-400 font-[family-name:var(--font-space-grotesk)]">{error}</p>
              <button
                onClick={() => fetchComparison()}
                className="px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors font-[family-name:var(--font-jetbrains-mono)]"
              >
                Reintentar
              </button>
            </div>
          )}

          </div>
          {/* Comparison result */}
          {data && !loading && (
            <div className="flex flex-col gap-5">
              {/* Event header */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
                    Evento
                  </span>
                  <span className="text-[9px] text-white/20 font-[family-name:var(--font-jetbrains-mono)]">
                    {data.eventDate}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white font-[family-name:var(--font-space-grotesk)] mb-2">
                  {data.eventTitle}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#00E5A0]/10 text-[#00E5A0]/70 font-[family-name:var(--font-jetbrains-mono)]">
                    {data.region}
                  </span>
                  {data.classifiers.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded text-[9px] font-bold bg-white/[0.06] text-white/50 font-[family-name:var(--font-jetbrains-mono)]">
                      {c}
                    </span>
                  ))}
                  <span className="ml-auto text-[10px] text-[#00E5A0]/60 font-[family-name:var(--font-jetbrains-mono)]">
                    {data.sourceCount} fuentes
                  </span>
                </div>
              </div>

              {/* Note if not enough sources */}
              {data.note && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
                  <p className="text-[11px] text-[#EAB308]/80 leading-relaxed font-[family-name:var(--font-space-grotesk)]">
                    {data.note}
                  </p>
                </div>
              )}

              {/* Source columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.sources.map((source, idx) => {
                  const levelColors = sourceLevelColors[source.sourceLevel];
                  const relevanceColor = relevanceColors[source.relevance as keyof typeof relevanceColors] || '#38BDF8';

                  return (
                    <div
                      key={source.signalId}
                      className="glass rounded-xl overflow-hidden"
                      style={{ borderTop: `2px solid ${levelColors.text}` }}
                    >
                      {/* Column header */}
                      <div className="px-3 py-2 border-b border-white/[0.06]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-white/70 font-[family-name:var(--font-space-grotesk)]">
                            {source.sourceName}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="px-1.5 py-0.5 rounded text-[8px] font-bold font-[family-name:var(--font-jetbrains-mono)]"
                              style={{ backgroundColor: levelColors.bg, color: levelColors.text, border: `1px solid ${levelColors.border}` }}
                            >
                              {source.sourceLevel} · {sourceLevelLabels[source.sourceLevel]}
                            </span>
                            <span className="flex items-center gap-0.5 text-[8px] text-white/30 font-[family-name:var(--font-jetbrains-mono)]">
                              <Globe className="w-2.5 h-2.5" />
                              {source.language.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column content */}
                      <div className="p-3">
                        <h4 className="text-[12px] font-bold text-white leading-snug mb-2 font-[family-name:var(--font-space-grotesk)] line-clamp-3">
                          {source.title}
                        </h4>
                        <p className="text-[11px] text-white/50 leading-relaxed mb-3 font-[family-name:var(--font-space-grotesk)]">
                          {source.excerpt}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="px-1.5 py-0.5 rounded text-[8px] font-bold font-[family-name:var(--font-jetbrains-mono)]"
                            style={{ backgroundColor: `${relevanceColor}18`, color: relevanceColor }}
                          >
                            {source.relevance}
                          </span>
                          <span className="text-[8px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
                            {source.region} · {source.classifiers.join(', ')}
                          </span>
                        </div>
                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-[9px] text-[#00E5A0]/50 hover:text-[#00E5A0]/80 transition-colors font-[family-name:var(--font-jetbrains-mono)]"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            Leer en fuente original
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Meta-analysis */}
              {data.metaAnalysis && (
                <div className="glass rounded-xl overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-white/[0.06] flex items-center gap-2">
                    <GitCompareArrows className="w-3.5 h-3.5 text-[#00E5A0]/70" />
                    <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
                      Meta-análisis Comparativo
                    </span>
                  </div>
                  <div className="p-4 prose-invert">
                    <ReactMarkdown
                      components={{
                        h3: ({ children }) => (
                          <h3 className="text-xs font-bold text-[#00E5A0]/70 uppercase tracking-wider mb-2 mt-4 first:mt-0 font-[family-name:var(--font-jetbrains-mono)]">
                            {children}
                          </h3>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xs font-bold text-[#00E5A0]/70 uppercase tracking-wider mb-2 mt-4 first:mt-0 font-[family-name:var(--font-jetbrains-mono)]">
                            {children}
                          </h2>
                        ),
                        strong: ({ children }) => (
                          <strong className="text-white/90 font-bold">{children}</strong>
                        ),
                        p: ({ children }) => (
                          <p className="text-[12px] text-white/60 leading-relaxed mb-2.5 last:mb-0 font-[family-name:var(--font-space-grotesk)]">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="text-[12px] text-white/60 leading-relaxed mb-2.5 pl-4 list-disc font-[family-name:var(--font-space-grotesk)]">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="text-[12px] text-white/60 leading-relaxed mb-2.5 pl-4 list-decimal font-[family-name:var(--font-space-grotesk)]">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="mb-1">{children}</li>
                        ),
                        hr: () => (
                          <hr className="border-white/[0.06] my-4" />
                        ),
                      }}
                    >
                      {data.metaAnalysis}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
