'use client';
// AnalysisOverlay v3 — close via backdrop click or Escape (B5/B6 eliminated)
import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Brain,
  Loader2,
  BookOpen,
  User,
  Radio,
} from 'lucide-react';
// Lazy: react-markdown (~50KB) solo se carga cuando se genera el análisis IA
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import { type Analysis } from '@/data/analysis';
import { demoSignals, relevanceColors } from '@/data/signals';
import { useMounted } from '@/hooks/useMounted';
import { useMemo } from 'react';

interface AnalysisOverlayProps {
  analysis: Analysis;
  onClose: () => void;
}

// Colores del tema de análisis (dorado/ámbar)
const ACCENT = '#D4A017';
const ACCENT_LIGHT = `${ACCENT}70`;
const ACCENT_BG = `${ACCENT}12`;
const ACCENT_BORDER = `${ACCENT}20`;

export default function AnalysisOverlay({ analysis: analysisData, onClose }: AnalysisOverlayProps) {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useMounted();

  // Lazy load fullContent desde analysisContent.ts — MISMO PATRÓN que SignalOverlay con signalContent.ts
  const [fullContent, setFullContent] = useState<string | null>(null);

  useEffect(() => {
    import('@/data/analysisContent').then(({ analysisFullContent }) => {
      const content = analysisFullContent[analysisData.id];
      setFullContent(content || analysisData.summary);
    });
  }, [analysisData.id]);

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
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        id: analysisData.id,
        title: analysisData.title,
        summary: analysisData.summary,
        fullContent: fullContent || analysisData.summary,
        region: analysisData.region,
        classifiers: analysisData.tags,
        source: analysisData.author,
        sourceUrl: '',
        language: 'es',
        timestamp: analysisData.timestamp,
        relevance: 'MEDIA',
        verified: true,
        sourceLevel: 'A',
        accessLevel: 'ABIERTO',
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

      setAiAnalysis(data.analysis);
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

  // Article JSON-LD — structured data para análisis editorial
  useEffect(() => {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://monitor-geopolitico.vercel.app';
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: analysisData.title,
      description: analysisData.summary,
      datePublished: analysisData.timestamp,
      author: {
        '@type': 'Organization',
        name: analysisData.author,
        jobTitle: analysisData.authorRole,
      },
      publisher: {
        '@type': 'Organization',
        name: 'News Connect',
        url: SITE_URL,
      },
      image: analysisData.image ? `${SITE_URL}${analysisData.image}` : undefined,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/?analysis=${encodeURIComponent(analysisData.id)}`,
      },
      about: [
        { '@type': 'Thing', name: analysisData.region },
        ...analysisData.tags.map((tag) => ({ '@type': 'Thing', name: tag })),
      ],
      isAccessibleForFree: analysisData.accessLevel === 'ABIERTO',
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `article-${analysisData.id}`;
    script.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(script);

    return () => {
      document.getElementById(`article-${analysisData.id}`)?.remove();
    };
  }, [analysisData]);

  // Update document.title for analysis view
  useEffect(() => {
    const prev = document.title;
    document.title = `${analysisData.title} — Monitor Geopolítico`;
    return () => { document.title = prev; };
  }, [analysisData.title]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      {/* Contenedor de posicionamiento — SIN backdrop-filter ni transform */}
      <div className="relative rounded-2xl w-full max-w-3xl max-h-[90vh] animate-slide-in">
        {/* Wrapper visual — glass-strong con backdrop-filter */}
        <div className="rounded-2xl overflow-hidden flex flex-col max-h-[90vh] glass-strong">
        {/* Scroll container */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overlay-scroll"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="p-4 sm:p-6">
          {/* 1. Metadata row — badge de análisis + tiempo lectura + fecha */}
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-[family-name:var(--font-jetbrains-mono)]"
              style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
            >
              Análisis
            </span>

            <span className="flex items-center gap-1 text-[10px] text-white/35 font-[family-name:var(--font-jetbrains-mono)]">
              <BookOpen className="w-3.5 h-3.5" />
              {analysisData.readTime} min lectura
            </span>

            <span className="text-[10px] text-white/25 ml-auto font-[family-name:var(--font-jetbrains-mono)]">
              {mounted ? new Date(analysisData.timestamp).toLocaleDateString('es', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) : analysisData.id}
            </span>
          </div>

          {/* 2. Hero image */}
          {analysisData.image && (
            <div className="relative w-full h-48 overflow-hidden rounded-xl mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={analysisData.image}
                alt={analysisData.title}
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
            {analysisData.title}
          </h2>

          {/* 4. Autor + región — panel destacado */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-4 flex-wrap"
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <User className="w-3.5 h-3.5 text-white/30" />
              <span className="text-xs font-bold text-white/70 font-[family-name:var(--font-space-grotesk)]">
                {analysisData.author}
              </span>
              {analysisData.authorRole && (
                <>
                  <span className="text-white/10 text-xs">·</span>
                  <span className="text-[10px] text-white/35 font-[family-name:var(--font-jetbrains-mono)]">
                    {analysisData.authorRole}
                  </span>
                </>
              )}
            </div>

            <span className="text-white/10 text-xs">·</span>

            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]"
              style={{ backgroundColor: ACCENT_BG, color: ACCENT_LIGHT }}
            >
              {analysisData.region}
            </span>
          </div>

          {/* 5. Full content — lazy loaded desde analysisContent.ts */}
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
            {analysisData.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold font-[family-name:var(--font-jetbrains-mono)]"
                style={{ backgroundColor: ACCENT_BG, color: ACCENT_LIGHT }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 7. Señales relacionadas */}
          <RelatedSignals analysis={analysisData} />

          {/* Divider */}
          <div className="w-full h-px bg-white/[0.06] mb-6" />

          {/* AI Analysis section */}
          <div className="mb-6">
            {!aiAnalysis && !loading && !error && (
              <button
                onClick={fetchAnalysis}
                disabled={!fullContent}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors duration-150 font-[family-name:var(--font-space-grotesk)] ${
                  fullContent
                    ? 'bg-[#D4A017]/10 border border-[#D4A017]/20 text-[#D4A017] hover:bg-[#D4A017]/20'
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
                <Loader2 className="w-6 h-6 text-[#D4A017] animate-spin" />
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

            {aiAnalysis && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-[#D4A017]" />
                  <span className="text-sm font-bold text-[#D4A017]/80 font-[family-name:var(--font-space-grotesk)]">
                    Análisis IA — Perspectiva Sur Global
                  </span>
                </div>
                <div className="glass rounded-xl p-4 prose-invert">
                  <ReactMarkdown
                    components={{
                      h3: ({ children }) => (
                        <h3 className="text-xs font-bold text-[#D4A017]/70 uppercase tracking-wider mb-2 mt-4 first:mt-0 font-[family-name:var(--font-jetbrains-mono)]">
                          {children}
                        </h3>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xs font-bold text-[#D4A017]/70 uppercase tracking-wider mb-2 mt-4 first:mt-0 font-[family-name:var(--font-jetbrains-mono)]">
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
                    {aiAnalysis}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="border-t border-white/[0.06] pt-3">
            <p className="text-[9px] text-white/20 leading-relaxed font-[family-name:var(--font-jetbrains-mono)]">
              Los análisis publicados en esta sección reflejan la perspectiva editorial de Óptica Sur Global. Las fuentes citadas son verificables y públicas. Este contenido se ofrece con acceso libre bajo principios de inteligencia geopolítica abierta.
            </p>
          </div>
        </div>
        </div>
        </div>{/* fin glass-strong */}
      </div>{/* fin contenedor de posicionamiento */}
    </div>
  );
}

// ── Subcomponente: Señales relacionadas al análisis ──
function RelatedSignals({ analysis }: { analysis: Analysis }) {
  const related = useMemo(() => {
    return demoSignals
      .map((signal) => {
        let score = 0;
        if (signal.region === analysis.region) score += 2;
        const sharedTags = signal.classifiers.filter((c) =>
          analysis.tags.some((t) => t.toLowerCase() === c.toLowerCase())
        );
        score += sharedTags.length * 3;
        return { signal, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [analysis]);

  if (related.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Radio className="w-3.5 h-3.5 text-[#00E5A0]/60" />
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
          Señales relacionadas ({related.length})
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {related.map(({ signal }) => (
          <div
            key={signal.id}
            className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-white/60 leading-snug font-[family-name:var(--font-space-grotesk)] line-clamp-2">
                {signal.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
                  {signal.source}
                </span>
                <span className="text-white/10 text-[9px]">·</span>
                <span className="text-[9px] text-white/20 font-[family-name:var(--font-jetbrains-mono)]">
                  {signal.region}
                </span>
              </div>
            </div>
            <span
              className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold font-[family-name:var(--font-jetbrains-mono)]"
              style={{ backgroundColor: `${relevanceColors[signal.relevance]}18`, color: relevanceColors[signal.relevance] }}
            >
              {signal.relevance}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


