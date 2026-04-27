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
} from 'lucide-react';
import {
  type Signal,
  relevanceColors,
  sourceLevelLabels,
  accessLevelLabels,
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
  const [copied, setCopied] = useState(false);
  const mounted = useMounted();

  const relevanceColor = relevanceColors[signal.relevance];

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
        throw new Error(data.error || 'Error al generar el análisis');
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const shareText = analysis
    ? `🔍 ${signal.title}\n\n📊 Análisis IA - Perspectiva Sur Global:\n\n${analysis.slice(0, 500)}...`
    : `🔍 ${signal.title}\n\n${signal.summary}`;
  const shareUrl = signal.sourceUrl;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText + '\n\n' + shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

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

          {/* Source and language */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[11px] text-white/40 font-[family-name:var(--font-jetbrains-mono)]">
              Fuente: {signal.source}
            </span>
            <span className="text-[11px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
              Idioma: {signal.language.toUpperCase()}
            </span>
          </div>

          {/* Tags */}
          <div className="flex items-center flex-wrap gap-2 mb-5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00E5A0]/10 text-[#00E5A0]/70 font-[family-name:var(--font-jetbrains-mono)]">
              {signal.region}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.06] text-white/50 font-[family-name:var(--font-jetbrains-mono)]">
              {signal.classifiers.join(' · ')}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.06] text-white/40 font-[family-name:var(--font-jetbrains-mono)]">
              {sourceLevelLabels[signal.sourceLevel]}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/[0.06] text-white/40 font-[family-name:var(--font-jetbrains-mono)]">
              {accessLevelLabels[signal.accessLevel]}
            </span>
          </div>

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

          {/* Share buttons */}
          <div className="border-t border-white/[0.06] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
                Compartir
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={copyToClipboard}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="Copiar al portapapeles"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#00E5A0]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white/40" />
                  )}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-[#1DA1F2]/10 transition-colors"
                  title="Compartir en X"
                >
                  <svg className="w-3.5 h-3.5 text-white/40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-[#26A5E4]/10 transition-colors"
                  title="Compartir en Telegram"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-white/40" />
                </a>
                <a
                  href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-[#25D366]/10 transition-colors"
                  title="Compartir en WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 text-white/40" />
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(signal.title)}&body=${encodedText}%0A%0A${encodedUrl}`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  title="Compartir por email"
                >
                  <Mail className="w-3.5 h-3.5 text-white/40" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
