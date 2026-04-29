'use client';
// FocoPanel — Panel de Foco del Sistema de Foco Dinámico v2
// Reutiliza la lógica de SignalOverlay pero renderiza inline (sin modal)
import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  ShieldCheck,
  ShieldAlert,
  Brain,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Eye,
  ArrowLeft,
  Radar,
} from 'lucide-react';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import {
  type Signal,
  relevanceColors,
  sourceLevelLabels,
  sourceLevelDescriptions,
  sourceLevelColors,
  sourceCountry,
  accessLevelLabels,
  DISCLAIMER,
} from '@/data/signals';
import { useMounted } from '@/hooks/useMounted';

interface FocoPanelProps {
  signal: Signal;
  onBack: () => void;
}

export default function FocoPanel({ signal, onBack }: FocoPanelProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useMounted();
  const [fullContent, setFullContent] = useState<string | null>(null);

  const relevanceColor = relevanceColors[signal.relevance];
  const levelColors = sourceLevelColors[signal.sourceLevel];
  const isContrastiva = signal.sourceLevel === 'C';
  const isVigilada = signal.sourceLevel === 'D';

  // Close on Escape → go back to context
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    },
    [onBack]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Load full content from signalContent.ts
  useEffect(() => {
    import('@/data/signalContent').then(({ signalFullContent }) => {
      setFullContent(signalFullContent[signal.id] || signal.summary);
    });
  }, [signal.id]);

  // Reset analysis when signal changes
  useEffect(() => {
    setAnalysis(null);
    setError(null);
    setLoading(false);
  }, [signal.id]);

  // Auto-trigger analysis when signal changes (after content loads)
  const hasAutoTriggered = useRef<string | null>(null);
  useEffect(() => {
    if (fullContent && hasAutoTriggered.current !== signal.id) {
      hasAutoTriggered.current = signal.id;
      const timer = setTimeout(() => fetchAnalysis(fullContent), 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullContent, signal.id]);

  const abortRef = useRef<AbortController | null>(null);

  const fetchAnalysis = async (content?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...signal,
        fullContent: content || fullContent || signal.fullContent || signal.summary,
      };
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('La respuesta del servidor no es JSON válido');
      }

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) throw new Error('Límite diario de análisis alcanzado. Intenta más tarde o mejora tu plan.');
        throw new Error(data.error || 'Error al generar el análisis');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0A0F1C]">
      {/* ── Header bar: back button + signal ID ── */}
      <div className="shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-white/[0.06] glass-strong">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors text-xs font-bold font-[family-name:var(--font-jetbrains-mono)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al Contexto
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-[family-name:var(--font-jetbrains-mono)]"
            style={{ backgroundColor: `${relevanceColor}15`, color: relevanceColor }}
          >
            {signal.relevance}
          </span>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold font-[family-name:var(--font-jetbrains-mono)] flex items-center gap-1"
            style={{ backgroundColor: levelColors.bg, color: levelColors.text, border: `1px solid ${levelColors.border}` }}
          >
            {signal.sourceLevel} · {sourceLevelLabels[signal.sourceLevel]}
          </span>
          {signal.verified ? (
            <ShieldCheck className="w-4 h-4 text-[#00E5A0]/70" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-white/20" />
          )}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto overlay-scroll">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

          {/* 1. Hero image */}
          {signal.image && (
            <div className="relative w-full h-56 sm:h-64 overflow-hidden rounded-xl mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signal.image}
                alt={signal.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/20 to-transparent" />
            </div>
          )}

          {/* 2. Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 font-[family-name:var(--font-space-grotesk)]">
            {signal.title}
          </h2>

          {/* 3. Source panel */}
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 flex-wrap"
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex items-center gap-1.5 shrink-0">
              {(() => {
                const country = sourceCountry[signal.source];
                return country ? (
                  <>
                    <span className="text-base leading-none">{country.flag}</span>
                    <span className="text-[10px] font-bold text-white/35 font-[family-name:var(--font-jetbrains-mono)]">{country.code}</span>
                    <span className="text-white/10 text-xs">·</span>
                  </>
                ) : null;
              })()}
            </div>
            <span className="text-xs font-bold text-white/70 font-[family-name:var(--font-space-grotesk)]">
              {signal.source}
            </span>
            <span className="text-white/10 text-xs">·</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/[0.06] text-white/40 font-[family-name:var(--font-jetbrains-mono)] uppercase tracking-wider">
              {signal.language.toUpperCase()}
            </span>
            <span className="text-white/10 text-xs">·</span>
            <span className="text-[10px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
              {mounted ? new Date(signal.timestamp).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' }) : signal.id}
            </span>
            <a
              href={signal.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold font-[family-name:var(--font-jetbrains-mono)] transition-colors duration-150"
              style={{
                backgroundColor: `${levelColors.bg}`,
                color: levelColors.text,
                border: `1px solid ${levelColors.border}`,
              }}
            >
              <ExternalLink className="w-3 h-3" />
              Ir al artículo
            </a>
          </div>

          {/* 4. Full content */}
          <div className="mb-5">
            {!fullContent ? (
              <div className="flex items-center gap-2 py-4">
                <div className="w-4 h-4 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
                <span className="text-xs text-white/30 font-[family-name:var(--font-jetbrains-mono)]">Cargando contenido...</span>
              </div>
            ) : (
              fullContent.split('\n\n').map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm text-white/70 leading-relaxed mb-3 last:mb-0 font-[family-name:var(--font-space-grotesk)]"
                >
                  {paragraph}
                </p>
              ))
            )}
          </div>

          {/* 5. Tags */}
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00E5A0]/10 text-[#00E5A0]/70 font-[family-name:var(--font-jetbrains-mono)]">
              {signal.region}
            </span>
            {signal.classifiers.map((cls) => (
              <span key={cls} className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.06] text-white/50 font-[family-name:var(--font-jetbrains-mono)]">
                {cls}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.06] text-white/40 font-[family-name:var(--font-jetbrains-mono)]">
              {accessLevelLabels[signal.accessLevel]}
            </span>
          </div>

          {/* Nota contextualización nivel C */}
          {isContrastiva && (
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-lg mb-4"
              style={{ backgroundColor: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}
            >
              <AlertTriangle className="w-4 h-4 text-[#F97316] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#F97316]/80 leading-relaxed font-[family-name:var(--font-space-grotesk)]">
                <strong>Fuente contrastiva (Nivel C):</strong> {sourceLevelDescriptions[signal.sourceLevel]} Verifica la información con otras fuentes antes de formar opinión.
              </p>
            </div>
          )}

          {/* Advertencia nivel D */}
          {isVigilada && (
            <div
              className="flex items-start gap-2 px-3 py-2 rounded-lg mb-4"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <Eye className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
              <p className="text-[11px] text-[#EF4444]/80 leading-relaxed font-[family-name:var(--font-space-grotesk)]">
                <strong>Fuente vigilada (Nivel D):</strong> {sourceLevelDescriptions[signal.sourceLevel]} Se muestra para fines de vigilancia de narrativas, no como fuente informativa.
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="w-full h-px bg-white/[0.06] mb-6" />

          {/* ── AI Analysis ── */}
          <div className="mb-6">
            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center gap-3 py-10">
                <div className="relative">
                  <Brain className="w-8 h-8 text-[#00E5A0]/30" />
                  <Loader2 className="w-8 h-8 text-[#00E5A0] animate-spin absolute inset-0" />
                </div>
                <span className="text-sm text-white/50 font-[family-name:var(--font-space-grotesk)]">
                  Generando análisis desde la perspectiva del Sur Global...
                </span>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="glass rounded-xl p-4 flex flex-col items-center gap-3">
                <Radar className="w-6 h-6 text-red-400/50" />
                <p className="text-sm text-red-400 font-[family-name:var(--font-space-grotesk)]">{error}</p>
                <button
                  onClick={() => fetchAnalysis()}
                  className="px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors font-[family-name:var(--font-jetbrains-mono)]"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Analysis rendered */}
            {analysis && !loading && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-[#00E5A0]" />
                  <span className="text-sm font-bold text-[#00E5A0]/80 font-[family-name:var(--font-space-grotesk)]">
                    Análisis IA — Perspectiva Sur Global
                  </span>
                </div>
                <div className="glass rounded-xl p-5 prose-invert">
                  <ReactMarkdown
                    components={{
                      h3: ({ children }) => (
                        <h3 className="text-xs font-bold text-[#00E5A0]/70 uppercase tracking-wider mb-2 mt-5 first:mt-0 font-[family-name:var(--font-jetbrains-mono)]">
                          {children}
                        </h3>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xs font-bold text-[#00E5A0]/70 uppercase tracking-wider mb-2 mt-5 first:mt-0 font-[family-name:var(--font-jetbrains-mono)]">
                          {children}
                        </h2>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-white/90 font-bold">{children}</strong>
                      ),
                      p: ({ children }) => (
                        <p className="text-sm text-white/65 leading-relaxed mb-3 last:mb-0 font-[family-name:var(--font-space-grotesk)]">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="text-sm text-white/65 leading-relaxed mb-3 pl-4 list-disc font-[family-name:var(--font-space-grotesk)]">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="text-sm text-white/65 leading-relaxed mb-3 pl-4 list-decimal font-[family-name:var(--font-space-grotesk)]">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-1">{children}</li>
                      ),
                    }}
                  >
                    {analysis}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="border-t border-white/[0.06] pt-3">
            <p className="text-[9px] text-white/20 leading-relaxed font-[family-name:var(--font-jetbrains-mono)]">
              {DISCLAIMER}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
