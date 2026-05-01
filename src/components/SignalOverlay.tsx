'use client';
// SignalOverlay v3 — close via backdrop click or Escape (B5/B6 eliminated)
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
} from 'lucide-react';

// Lazy: react-markdown (~50KB) solo se carga cuando se genera el análisis IA
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

interface SignalOverlayProps {
  signal: Signal;
  onClose: () => void;
}

export default function SignalOverlay({ signal, onClose }: SignalOverlayProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useMounted();
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

  // AbortController para cancelar fetch si el usuario cierra el overlay
  const abortRef = useRef<AbortController | null>(null);

  const fetchAnalysis = async () => {
    // Cancelar fetch anterior si existe
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...signal,
        fullContent: fullContent || signal.fullContent || signal.summary,
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

  // Limpiar fetch al desmontar
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // NewsArticle JSON-LD — structured data para SEO (injectado client-side)
  useEffect(() => {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://monitor-geopolitico.vercel.app';
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: signal.title,
      description: signal.summary,
      datePublished: signal.timestamp,
      dateModified: signal.timestamp,
      author: {
        '@type': 'Organization',
        name: signal.source,
      },
      publisher: {
        '@type': 'Organization',
        name: 'News Connect',
        url: SITE_URL,
      },
      image: signal.image ? `${SITE_URL}${signal.image}` : undefined,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/?signal=${encodeURIComponent(signal.id)}`,
      },
      about: [
        { '@type': 'Thing', name: signal.region },
        ...signal.classifiers.map((c) => ({ '@type': 'Thing', name: c })),
      ],
      isAccessibleForFree: signal.accessLevel === 'ABIERTO',
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `newsarticle-${signal.id}`;
    script.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(script);

    return () => {
      document.getElementById(`newsarticle-${signal.id}`)?.remove();
    };
  }, [signal.id, signal.title, signal.summary, signal.timestamp, signal.source, signal.image, signal.region, signal.classifiers, signal.accessLevel]);

  // Update document.title for signal view (mejora SEO en social/analítica)
  useEffect(() => {
    const prev = document.title;
    document.title = `${signal.title} — Monitor Geopolítico`;
    return () => { document.title = prev; };
  }, [signal.title]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      {/* Contenedor de posicionamiento — SIN backdrop-filter ni transform para evitar stacking context */}
      <div className="relative rounded-2xl w-full max-w-3xl max-h-[90vh] animate-slide-in">
        {/* Wrapper visual — glass-strong con backdrop-filter — hijo interno, NO afecta posicionamiento de controles */}
        <div className="rounded-2xl overflow-hidden flex flex-col max-h-[90vh] glass-strong">
        {/* Scroll container — flex-1 min-h-0 permite scroll dentro de contenedor flex */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overlay-scroll"
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signal.image}
                alt={signal.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
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
        </div>{/* fin glass-strong */}
      </div>{/* fin contenedor de posicionamiento */}
    </div>
  );
}
