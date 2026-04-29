'use client';

import { useState, useEffect, useRef } from 'react';
import { type Signal, type Region, relevanceColors, sourceLevelLabels, sourceLevelColors, sourceCountry } from '@/data/signals';
import { ShieldCheck, ShieldAlert, Clock, Eye } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { timeAgo, isRecent } from '@/lib/utils-time';

interface SignalCardProps {
  signal: Signal;
  onRegionClick: (r: Region) => void;
  onClassifierClick: (c: string) => void;
  onSignalClick: (s: Signal) => void;
}

export default function SignalCard({ signal, onRegionClick, onClassifierClick, onSignalClick }: SignalCardProps) {
  const relevanceColor = relevanceColors[signal.relevance];
  const mounted = useMounted();
  // isRecent solo en cliente para evitar hydration mismatch (Date.now() difiere server vs client)
  const recent = mounted ? isRecent(signal.timestamp) : false;
  const displayText = signal.summary || signal.fullContent || '';
  const levelColors = sourceLevelColors[signal.sourceLevel];
  const [thumbReady, setThumbReady] = useState(false);
  const thumbRef = useRef<HTMLDivElement>(null);

  // Cargar thumbnail solo cuando el contenedor es visible (IntersectionObserver)
  useEffect(() => {
    const el = thumbRef.current;
    if (!el || !signal.image) return;
    let cancelled = false;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Retraso mínimo para que el contenido de texto renderice primero
          const timer = setTimeout(() => {
            if (!cancelled) setThumbReady(true);
          }, 150);
          obs.unobserve(el);
        }
      },
      { rootMargin: '200px' } // empezar a cargar 200px antes de entrar al viewport
    );
    obs.observe(el);
    return () => { cancelled = true; obs.disconnect(); };
  }, [signal.image]);

  return (
    <div
      className="glass rounded-xl overflow-hidden hover:bg-white/[0.04] cursor-pointer transition-colors duration-150 group flex flex-col"
      style={{ borderLeft: `3px solid ${relevanceColor}` }}
      onClick={() => onSignalClick(signal)}
    >
      {/* Thumbnail — arriba de todo, solo si hay imagen */}
      {signal.image && (
        <div ref={thumbRef} className="relative overflow-hidden shrink-0 h-32 sm:h-40">
          {/* Placeholder gradiente mientras carga */}
          {!thumbReady && (
            <div
              className="absolute inset-0 animate-pulse"
              style={{
                background: `linear-gradient(135deg, ${relevanceColor}08 0%, ${relevanceColor}04 50%, transparent 100%)`,
              }}
            />
          )}
          {/* Imagen real — solo se renderiza cuando thumbReady=true */}
          {thumbReady && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={signal.image}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1C]/30 via-transparent to-[#0A0F1C]/60" />
            </>
          )}
        </div>
      )}

      {/* Contenido con flex-grow para igualar alturas */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {/* Fila 1: relevancia + verificado + nuevo + timestamp */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span
              className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold font-[family-name:var(--font-jetbrains-mono)]"
              style={{ backgroundColor: `${relevanceColor}18`, color: relevanceColor }}
            >
              {signal.relevance}
            </span>
            {signal.verified ? (
              <ShieldCheck className="w-5 h-5 text-[#00E5A0]/70" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-white/20" />
            )}
            {recent && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5A0] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00E5A0]" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
            <Clock className="w-2.5 h-2.5" />
            {mounted ? timeAgo(signal.timestamp) : '...'}
          </div>
        </div>

        {/* Título */}
        <h3 className="text-[13px] sm:text-sm font-bold text-white leading-snug line-clamp-2 mb-2 font-[family-name:var(--font-space-grotesk)] group-hover:text-[#00E5A0]/90 transition-colors duration-150">
          {signal.title}
        </h3>

        {/* Contenido — empuja el botón hacia abajo con flex-1 */}
        <p className="text-[11px] sm:text-xs text-white/55 leading-relaxed mb-3 font-[family-name:var(--font-space-grotesk)] line-clamp-4">
          {displayText}
        </p>

        {/* Clasificadores temáticos */}
        <div className="mt-auto flex items-center gap-1.5 flex-wrap mb-1">
          {signal.classifiers.map((cls) => (
            <button
              key={cls}
              onClick={(e) => {
                e.stopPropagation();
                onClassifierClick(cls);
              }}
              className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/[0.05] text-white/45 hover:bg-white/10 transition-colors font-[family-name:var(--font-jetbrains-mono)]"
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Región */}
        <div className="mb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegionClick(signal.region);
            }}
            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#00E5A0]/10 text-[#00E5A0]/70 hover:bg-[#00E5A0]/20 transition-colors font-[family-name:var(--font-jetbrains-mono)]"
          >
            {signal.region}
          </button>
        </div>

        {/* Línea de separación */}
        <div className="pt-2 border-t border-white/[0.06]">
          {/* Fuente con bandera */}
          <div className="flex items-center gap-1.5 mb-0.5">
            {(() => {
              const country = sourceCountry[signal.source];
              return country ? (
                <>
                  <span className="text-xs leading-none">{country.flag}</span>
                  <span className="text-[9px] text-white/35 font-bold font-[family-name:var(--font-jetbrains-mono)]">{country.code}</span>
                  <span className="text-[9px] text-white/15">·</span>
                </>
              ) : null;
            })()}
            <span className="text-[9px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
              {signal.source}
            </span>
          </div>

          {/* Señalizador de fuente — al fondo */}
          <div className="flex items-center">
            <span
              className="px-1.5 py-0.5 rounded text-[8px] font-bold font-[family-name:var(--font-jetbrains-mono)]"
              style={{ backgroundColor: levelColors.bg, color: levelColors.text, border: `1px solid ${levelColors.border}` }}
            >
              {signal.sourceLevel} · {sourceLevelLabels[signal.sourceLevel]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
