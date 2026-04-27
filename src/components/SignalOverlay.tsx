'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import {
  X as XIcon,
  ShieldCheck,
  ShieldAlert,
  Brain,
  Loader2,
  Copy,
  Share2,
  MessageCircle,
  Mail,
  Check,
  ExternalLink,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import {
  type Signal,
  type UserTier,
  relevanceColors,
  sourceLevelLabels,
  sourceLevelDescriptions,
  sourceLevelColors,
  sourceCountry,
  accessLevelLabels,
  DISCLAIMER,
  SHARE_FOOTER_FREE,
} from '@/data/signals';
import { useMounted } from '@/hooks/useMounted';

interface SignalOverlayProps {
  signal: Signal;
  onClose: () => void;
  userTier?: UserTier;
}

export default function SignalOverlay({ signal, onClose, userTier = 'gratuito' }: SignalOverlayProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const mounted = useMounted();

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

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signal),
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

  // ── Funciones de compartir según POLÍTICA_FUENTES.md ──

  /** REGLA 3: Compartir artículo = solo título + enlace a fuente original */
  const shareArticleText = `${signal.source}: ${signal.title} → ${signal.sourceUrl}`;

  /** REGLA 5-6: Compartir análisis = encabezado con enlace + análisis + footer según tier */
  const shareAnalysisText = analysis
    ? `Análisis del Monitor Geopolítico\nFuente: ${signal.source} — ${signal.title}\n→ ${signal.sourceUrl}\n\n${analysis.slice(0, 800)}${userTier === 'gratuito' ? SHARE_FOOTER_FREE : ''}`
    : '';

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
    }
  };

  const encodedArticleText = encodeURIComponent(shareArticleText);
  const encodedArticleUrl = encodeURIComponent(signal.sourceUrl);
  const encodedAnalysisText = encodeURIComponent(shareAnalysisText);
  const encodedAnalysisUrl = encodeURIComponent(signal.sourceUrl);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.7)' }}
    >
      <div
        className="relative glass-strong rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-in"
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

        {/* Hero image */}
        {signal.image && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
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

        <div className="p-4 sm:p-6">
          {/* Metadata row */}
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

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 font-[family-name:var(--font-space-grotesk)] pr-8">
            {signal.title}
          </h2>

          {/* Fuente, idioma y enlace — panel destacado */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3 flex-wrap"
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

          {/* Tags */}
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

          {/* Full content */}
          <div className="mb-6">
            {signal.fullContent.split('\n\n').map((paragraph, i) => (
              <p
                key={i}
                className="text-sm text-white/70 leading-relaxed mb-3 last:mb-0 font-[family-name:var(--font-space-grotesk)]"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/[0.06] mb-6" />

          {/* AI Analysis section */}
          <div className="mb-6">
            {!analysis && !loading && !error && (
              <button
                onClick={fetchAnalysis}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#00E5A0]/10 border border-[#00E5A0]/20 text-[#00E5A0] hover:bg-[#00E5A0]/20 transition-colors duration-150 font-[family-name:var(--font-space-grotesk)]"
              >
                <Brain className="w-4 h-4" />
                <span className="text-sm font-bold">Análisis IA — Perspectiva Sur Global</span>
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

          {/* Divider */}
          <div className="w-full h-px bg-white/[0.06] mb-4" />

          {/* Share buttons — con separación clara artículo vs análisis */}
          <div className="mb-4">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] mb-2">
              Compartir artículo
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => copyToClipboard(shareArticleText, 'article')}
                className="h-8 px-2.5 flex items-center justify-center gap-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[10px] text-white/40 font-[family-name:var(--font-jetbrains-mono)]"
                title="Copiar título + enlace (POLÍTICA: nunca incluye texto completo)"
              >
                {copied === 'article' ? (
                  <Check className="w-3.5 h-3.5 text-[#00E5A0]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Copiar enlace</span>
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodedArticleText}&url=${encodedArticleUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-[#1DA1F2]/10 transition-colors"
                title="Compartir artículo en X"
              >
                <svg className="w-3.5 h-3.5 text-white/40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href={`https://t.me/share/url?url=${encodedArticleUrl}&text=${encodedArticleText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-[#26A5E4]/10 transition-colors"
                title="Compartir artículo en Telegram"
              >
                <MessageCircle className="w-3.5 h-3.5 text-white/40" />
              </a>
              <a
                href={`https://wa.me/?text=${encodedArticleText}%20${encodedArticleUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-[#25D366]/10 transition-colors"
                title="Compartir artículo en WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-white/40" />
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(signal.title)}&body=${encodedArticleText}%0A%0A${encodedArticleUrl}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title="Compartir artículo por email"
              >
                <Mail className="w-3.5 h-3.5 text-white/40" />
              </a>
            </div>
          </div>

          {/* Compartir análisis — solo visible si hay análisis */}
          {analysis && (
            <div className="mb-4">
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] mb-2">
                Compartir análisis
                {userTier === 'gratuito' && (
                  <span className="text-[#00E5A0]/40 ml-1">— incluye branding</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => copyToClipboard(shareAnalysisText, 'analysis')}
                  className="h-8 px-2.5 flex items-center justify-center gap-1.5 rounded-lg bg-[#00E5A0]/5 hover:bg-[#00E5A0]/10 transition-colors text-[10px] text-[#00E5A0]/50 font-[family-name:var(--font-jetbrains-mono)]"
                  title="Copiar análisis con referencia a fuente"
                >
                  {copied === 'analysis' ? (
                    <Check className="w-3.5 h-3.5 text-[#00E5A0]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">Copiar análisis</span>
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodedAnalysisText}&url=${encodedAnalysisUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#00E5A0]/5 hover:bg-[#00E5A0]/10 transition-colors"
                  title="Compartir análisis en X"
                >
                  <svg className="w-3.5 h-3.5 text-[#00E5A0]/40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodedAnalysisUrl}&text=${encodedAnalysisText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#00E5A0]/5 hover:bg-[#00E5A0]/10 transition-colors"
                  title="Compartir análisis en Telegram"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#00E5A0]/40" />
                </a>
              </div>
            </div>
          )}

          {/* Disclaimer — POLÍTICA_FUENTES.md §3 */}
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
