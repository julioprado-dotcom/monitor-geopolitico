'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { VerificationResult } from '@/lib/types';
import { VERACITY_CONFIG, SOURCE_CATEGORY_LABELS } from '@/lib/types';
import { Share2, Check, Copy, Twitter, MessageCircle } from '@/lib/icons';

interface ShareResultProps {
  result: VerificationResult;
}

function generateShareText(result: VerificationResult): string {
  const veracity = VERACITY_CONFIG[result.veracityLevel];
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://verinews.app';

  const dimensionLines = [
    `  Credibilidad de Fuente: ${result.sourceCredibility.score}/100`,
    `  Coherencia Interna: ${result.internalCoherence.score}/100`,
    `  Corroboración Externa: ${result.externalCorroboration.score}/100`,
    `  Lenguaje Sensacionalista: ${result.sensationalism.score}/100`,
    `  Veracidad Factual: ${result.factualAccuracy.score}/100`,
    `  Sesgo y Manipulación: ${result.biasManipulation.score}/100`,
  ].join('\n');

  // Source diversity summary
  const catCounts: Record<string, number> = {};
  result.sourcesFound.forEach((s) => {
    const label = SOURCE_CATEGORY_LABELS[s.category as keyof typeof SOURCE_CATEGORY_LABELS] || s.category;
    catCounts[label] = (catCounts[label] || 0) + 1;
  });
  const sourceLine = Object.entries(catCounts)
    .map(([cat, count]) => `${cat}: ${count}`)
    .join(', ');

  // Silenced voices
  const silencedLine = result.silencedVoices.length > 0
    ? `\nVoces silenciadas: ${result.silencedVoices.map((v) => v.perspective).join(', ')}`
    : '';

  const text = `VeriNews — Verificación Crítico-Pluralista

Veredicto: ${veracity.label} (${result.overallScore}/100)
${result.summary}

Dimensiones:
${dimensionLine}

Fuentes: ${result.sourcesFound.length} (${sourceLine})${silencedLine}

Verifica tú también: ${appUrl}`;

  return text;
}

function generateTwitterText(result: VerificationResult): string {
  const veracity = VERACITY_CONFIG[result.veracityLevel];
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://verinews.app';

  return `VeriNews: ${veracity.label} (${result.overallScore}/100)

${result.summary.slice(0, 180)}${result.summary.length > 180 ? '...' : ''}

Fuentes: ${result.sourcesFound.length} | Voces silenciadas: ${result.silencedVoices.length}

Verifica tú también: ${appUrl}`;
}

export function ShareResult({ result }: ShareResultProps) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const shareText = generateShareText(result);
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://verinews.app';

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VeriNews — Verificación Crítico-Pluralista',
          text: shareText,
          url: appUrl,
        });
        return;
      } catch {
        // User cancelled or error — fall through to copy
      }
    }
    handleCopy();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: textarea select + copy
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTwitter = () => {
    const twitterText = generateTwitterText(result);
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative">
      {/* Main share button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleNativeShare}
          className="gap-2 bg-neon text-deep hover:bg-neon/90 font-semibold"
          size="sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copiado
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Compartir resultado
            </>
          )}
        </Button>

        <Button
          onClick={() => setShowOptions(!showOptions)}
          variant="outline"
          size="sm"
          className="gap-1.5 border-border"
        >
          <span className="text-xs">Más opciones</span>
          <svg
            className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>

      {/* Expanded options dropdown */}
      {showOptions && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-xl shadow-xl p-2 min-w-[220px] animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm text-left"
          >
            {copied ? (
              <Check className="w-4 h-4 text-neon shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
            <div>
              <p className="font-medium">{copied ? 'Copiado al portapapeles' : 'Copiar texto'}</p>
              <p className="text-xs text-muted-foreground">Resumen completo + link</p>
            </div>
          </button>

          <button
            onClick={handleTwitter}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm text-left"
          >
            <Twitter className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <p className="font-medium">Compartir en X / Twitter</p>
              <p className="text-xs text-muted-foreground">Publicación con resumen</p>
            </div>
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-sm text-left"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-medium">Compartir por WhatsApp</p>
              <p className="text-xs text-muted-foreground">Mensaje con resumen + link</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
