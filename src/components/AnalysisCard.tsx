'use client';

import { useState, useEffect, useRef } from 'react';
import { type Analysis } from '@/data/analysis';
import { Clock, BookOpen, ChevronDown, ChevronUp, Brain } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { timeAgo } from '@/lib/utils-time';

interface AnalysisCardProps {
  analysis: Analysis;
  isExpanded: boolean;
  onToggleExpand: (a: Analysis) => void;
  onReadFull: (a: Analysis) => void;
  hasAiAnalysis?: boolean;
}

export default function AnalysisCard({ analysis, isExpanded, onToggleExpand, onReadFull, hasAiAnalysis }: AnalysisCardProps) {
  const mounted = useMounted();
  const [imgVisible, setImgVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Lazy load imagen con IntersectionObserver
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !analysis.image) return;
    let cancelled = false;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => {
            if (!cancelled) setImgVisible(true);
          }, 150);
          obs.unobserve(el);
        }
      },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => { cancelled = true; obs.disconnect(); };
  }, [analysis.image]);

  return (
    <article
      className="glass rounded-xl overflow-hidden hover:bg-white/[0.04] transition-colors duration-150 group flex flex-col"
      style={{ borderLeft: '3px solid #D4A017' }}
      role="article"
      aria-label={`${analysis.title} — ${analysis.author}`}
    >
      {/* Imagen */}
      {analysis.image && (
        <div ref={imgRef} className="relative overflow-hidden shrink-0 h-36 sm:h-44">
          {!imgVisible && (
            <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.04) 0%, transparent 100%)' }} />
          )}
          {imgVisible && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={analysis.image}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1C]/40 via-transparent to-[#0A0F1C]/70" />
            </>
          )}
          {/* Badge de análisis superpuesto */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className="px-2 py-0.5 rounded text-[9px] font-bold uppercase font-[family-name:var(--font-jetbrains-mono)]"
              style={{ backgroundColor: 'rgba(212,160,23,0.2)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.3)' }}
            >
              En profundidad
            </span>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {/* Metadatos superiores: tiempo lectura + fecha */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-[9px] text-[#D4A017]/60 font-[family-name:var(--font-jetbrains-mono)]">
            <BookOpen className="w-3 h-3" />
            <span>{analysis.readTime} min lectura</span>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
            <Clock className="w-2.5 h-2.5" />
            {mounted ? timeAgo(analysis.timestamp) : '...'}
          </div>
        </div>

        {/* Título — clickable to toggle expand */}
        <button
          type="button"
          onClick={() => onToggleExpand(analysis)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleExpand(analysis); } }}
          className="text-left w-full"
          aria-expanded={isExpanded}
        >
          <h3 className="text-[13px] sm:text-sm font-bold text-white leading-snug mb-2 font-[family-name:var(--font-space-grotesk)] group-hover:text-[#D4A017]/90 transition-colors duration-150">
            {analysis.title}
          </h3>
        </button>

        {/* Resumen */}
        <p className={`text-[11px] sm:text-xs text-white/55 leading-relaxed mb-3 font-[family-name:var(--font-space-grotesk)] transition-all duration-300 ease-in-out overflow-hidden flex-1 ${isExpanded ? '' : 'line-clamp-4'}`}>
          {analysis.summary}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {analysis.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#D4A017]/8 text-[#D4A017]/50 font-[family-name:var(--font-jetbrains-mono)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Separador + autor + región */}
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-white/35 font-[family-name:var(--font-jetbrains-mono)]">
                {analysis.author}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Badge IA — indica que este análisis tiene análisis IA disponible */}
              {hasAiAnalysis && (
                <span className="relative flex items-center justify-center" title="Análisis IA disponible">
                  <span className="absolute inset-0 rounded-full bg-[#D4A017]/20 animate-pulse" />
                  <Brain className="w-4 h-4 text-[#D4A017] relative" />
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#D4A017]/10 text-[#D4A017]/60 font-[family-name:var(--font-jetbrains-mono)]">
                {analysis.region}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#D4A017]/50" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-white/20" />
              )}
            </div>
          </div>
        </div>

        {/* Expanded section — botones de acción */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-28 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
        >
          <div className="flex flex-col gap-2">
            {hasAiAnalysis && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReadFull(analysis);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-[#D4A017]/8 border border-[#D4A017]/15 text-[#D4A017]/70 hover:bg-[#D4A017]/15 hover:text-[#D4A017] rounded-xl transition-colors text-[10px] font-bold font-[family-name:var(--font-space-grotesk)]"
              >
                <Brain className="w-3 h-3" />
                Ver análisis IA
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReadFull(analysis);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#D4A017]/10 border border-[#D4A017]/20 text-[#D4A017] rounded-xl hover:bg-[#D4A017]/20 transition-colors text-[11px] font-bold font-[family-name:var(--font-space-grotesk)]"
            >
              Leer artículo completo
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
