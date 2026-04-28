'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import {
  X as XIcon,
  ShieldCheck,
  ShieldAlert,
  Brain,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Eye,
} from 'lucide-react';
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

interface SignalOverlayProps {
  signal: Signal;
  onClose: () => void;
}

export default function SignalOverlay({ signal, onClose }: SignalOverlayProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useMounted();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);
  // Lazy load fullContent desde signalContent.ts (incluye señales SIG-xxx y análisis ANL-xxx)
  const [fullContent, setFullContent] = useState<string | null>(null);

  useEffect(() => {
    import('@/data/signalContent').then(({ signalFullContent }) => {
      setFullContent(signalFullContent[signal.id] || signal.summary);
    });
  }, [signal.id]);

  const relevanceColor = relevanceColors[signal.relevance];
  const levelColors = sourceLevelColors[signal.sourceLevel];
  const isContrastiva = signal.sourceLevel === 'C';
  const isVigilada = signal.sourceLevel === 'D';

  // Detectar si hay contenido por debajo del viewport del overlay
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    // Mostrar hint si no está al fondo (con margen de 20px)
    setShowScrollHint(scrollTop + clientHeight < scrollHeight - 20);
  }, []);

  // Mostrar hint después de montar si hay scroll disponible
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, analysis]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Incluir fullContent cargado desde signalContent.ts — el Signal original tiene fullContent vacío
      const payload = {
        ...signal,
        fullContent: fullContent || signal.fullContent || signal.summary,
      };
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      {/* Wrapper visual — glass-strong con backdrop-filter */}
      {/* flex flex-col + flex-1 min-h-0: patron CSS para scroll dentro de contenedor con max-height */}
      <div className="relative glass-strong rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in">
        {/* Close button — absolute al wrapper, no scroll */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-colors"
          aria-label="Cerrar"
        >
          <XIcon className="w-4 h-4 text-red-400" />
        </button>
        {/* Indicador de scroll — absolute al wrapper, esquina inferior derecha */}
        <div
          className="absolute bottom-3 right-3 z-20 pointer-events-none transition-opacity duration-300"
          style={{ opacity: showScrollHint ? 1 : 0 }}
        >
          <div
            className="flex items-center justify-center w-10 h-6 rounded-full"
            style={{ background: 'linear-gradient(to top, rgba(0,229,160,0.25) 0%, transparent 100%)' }}
          >
            <svg width="14" height="8" viewBox="0 0 16 10" fill="none" className="animate-bounce">
              <path d="M2 2L8 8L14 2" stroke="rgba(0,229,160,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {/* Scroll container — flex-1 min-h-0 permite scroll dentro de contenedor flex */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overlay-scroll"
          ref={scrollRef}
          onClick={(e) => e.stopPropagation()}
        >
        <div className="p-4 sm:p-6">
          {/* 1. Metadata row */}
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-[family-name:var(--font-jetbrains-mono)]"
              style={{ backgroundColor: `${relevanceColor}15`, color: relevanceColor }}
            >
              {signal.relevance}
            </span>

            {/* Badge de nivel de fuente con color */}
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold font-[family-name:var(--font-jetbrains-mono)] flex items-center gap-1"
              style={{ backgroundColor: levelColors.bg, color: levelColors.text, border: `1px solid ${levelColors.border}` }}
            >
              {signal.sourceLevel} · {sourceLevelLabels[signal.sourceLevel]}
            </span>

            {signal.verified ? (
              <span className="flex items-center gap-1 text-[10px] text-[#00E5A0]/70 font-[family-name:var(--font-jetbrains-mono)]">
                <ShieldCheck className="w-5 h-5" /> Verificado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-white/30 font-[family-name:var(--font-jetbrains-mono)]">
                <ShieldAlert className="w-5 h-5" /> No verificado
              </span>
            )}
            <span className="text-[10px] text-white/25 ml-auto font-[family-name:var(--font-jetbrains-mono)]">
              {mounted ? new Date(signal.timestamp).toLocaleDateString('es', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : signal.id}
            </span>
          </div>

          {/* 2. Hero image */}
          {signal.image && (
            <div className="relative w-full h-48 overflow-hidden rounded-xl mb-3">
              <Image
                src={signal.image}
                alt={signal.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] to-transparent" />
            </div>
          )}

          {/* 3. Title */}
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 font-[family-name:var(--font-space-grotesk)] pr-8">
            {signal.title}
          </h2>

          {/* 4. Fuente, idioma y enlace — panel destacado */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-4 flex-wrap"
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            {/* Bandera + código país */}
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

            {/* Nombre de fuente — destacado */}
            <span className="text-xs font-bold text-white/70 font-[family-name:var(--font-space-grotesk)]">
              {signal.source}
            </span>

            {/* Separador */}
            <span className="text-white/10 text-xs">·</span>

            {/* Idioma — badge */}
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/[0.06] text-white/40 font-[family-name:var(--font-jetbrains-mono)] uppercase tracking-wider">
              {signal.language.toUpperCase()}
            </span>

            {/* Separador */}
            <span className="text-white/10 text-xs">·</span>

            {/* Enlace a fuente original */}
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
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" />
              Ir al artículo
            </a>
          </div>

          {/* 5. Full content — lazy loaded */}
          <div className="mb-4">
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

          {/* 6. Tags */}
          <div className="flex items-center flex-wrap gap-2 mb-3">
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

          {/* Nota de contextualización para fuentes nivel C */}
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

          {/* Advertencia para fuentes nivel D */}
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

          {/* AI Analysis section */}
          <div className="mb-6">
            {!analysis && !loading && !error && (
              <button
                onClick={fetchAnalysis}
                disabled={!fullContent}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors duration-150 font-[family-name:var(--font-space-grotesk)] ${
                  fullContent
                    ? 'bg-[#00E5A0]/10 border border-[#00E5A0]/20 text-[#00E5A0] hover:bg-[#00E5A0]/20'
                    : 'bg-white/[0.03] border border-white/[0.06] text-white/20 cursor-not-allowed'
                }`}
              >
                <Brain className={`w-4 h-4 ${!fullContent ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-bold">
                  {fullContent ? 'Análisis IA — Perspectiva Sur Global' : 'Cargando contenido...'}
                </span>
              </button>
            )}

            {loading && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="w-6 h-6 text-[#00E5A0] animate-spin" />
                <span className="text-sm text-white/50 font-[family-name:var(--font-space-grotesk)]">
                  Generando análisis...
                </span>
              </div>
            )}

            {error && (
              <div className="glass rounded-xl p-4 flex flex-col items-center gap-3">
                <p className="text-sm text-red-400 font-[family-name:var(--font-space-grotesk)]">
                  {error}
                </p>
                <button
                  onClick={fetchAnalysis}
                  className="px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors font-[family-name:var(--font-jetbrains-mono)]"
                >
                  Reintentar
                </button>
              </div>
            )}

            {analysis && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-[#00E5A0]" />
                  <span className="text-sm font-bold text-[#00E5A0]/80 font-[family-name:var(--font-space-grotesk)]">
                    Análisis IA — Perspectiva Sur Global
                  </span>
                </div>
                <div className="glass rounded-xl p-4 prose-invert">
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

          {/* Disclaimer — POLÍTICA_FUENTES.md §3 */}
          <div className="border-t border-white/[0.06] pt-3">
            <p className="text-[9px] text-white/20 leading-relaxed font-[family-name:var(--font-jetbrains-mono)]">
              {DISCLAIMER}
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
