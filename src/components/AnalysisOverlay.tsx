'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import {
  X as XIcon,
  Brain,
  Loader2,
  BookOpen,
  User,
} from 'lucide-react';
import { type Analysis } from '@/data/analysis';
import { useMounted } from '@/hooks/useMounted';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // Lazy load fullContent desde analysisContent.ts — MISMO PATRÓN que SignalOverlay con signalContent.ts
  const [fullContent, setFullContent] = useState<string | null>(null);

  useEffect(() => {
    import('@/data/analysisContent').then(({ analysisFullContent }) => {
      const content = analysisFullContent[analysisData.id];
      setFullContent(content || analysisData.summary);
    });
  }, [analysisData.id]);

  // Detectar si hay contenido por debajo del viewport del overlay
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowScrollHint(scrollTop + clientHeight < scrollHeight - 20);
  }, []);

  // Mostrar hint después de montar si hay scroll disponible
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll, aiAnalysis]);

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
      {/* h-[90vh] explicito para que absolute y h-full funcionen correctamente */}
      <div className="relative glass-strong rounded-2xl w-full max-w-3xl h-[90vh] overflow-hidden animate-slide-in">
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
            style={{ background: `linear-gradient(to top, ${ACCENT}40 0%, transparent 100%)` }}
          >
            <svg width="14" height="8" viewBox="0 0 16 10" fill="none" className="animate-bounce">
              <path d="M2 2L8 8L14 2" stroke={ACCENT_LIGHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        {/* Scroll container — SIN backdrop-filter */}
        <div
          className="h-full overflow-y-auto overlay-scroll"
          ref={scrollRef}
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
              <Image
                src={analysisData.image}
                alt={analysisData.title}
                fill
                className="object-cover"
                unoptimized
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
      </div>
    </div>
  );
}
