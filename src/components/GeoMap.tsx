'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Signal } from '@/types';
import { relevanceColors, regionLabels } from '@/data/signals';
import { mapRegions, continentPaths, jitterPosition } from '@/data/mapRegions';
import type { Relevance, Region } from '@/types';

interface GeoMapProps {
  signals: Signal[];
  onSelectSignal: (signal: Signal) => void;
}

const LEGEND_ITEMS: { relevance: Relevance; label: string }[] = [
  { relevance: 'CRÍTICA', label: 'Crítica' },
  { relevance: 'ALTA', label: 'Alta' },
  { relevance: 'MEDIA', label: 'Media' },
  { relevance: 'BAJA', label: 'Baja' },
  { relevance: 'INFORMATIVA', label: 'Informativa' },
];

/** Build a region→centroid lookup */
const regionCentroids: Record<Region, { cx: number; cy: number }> = {} as Record<Region, { cx: number; cy: number }>;
for (const r of mapRegions) {
  regionCentroids[r.region] = { cx: r.cx, cy: r.cy };
}

export default function GeoMap({ signals, onSelectSignal }: GeoMapProps) {
  const [hoveredSignal, setHoveredSignal] = useState<Signal | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const signalMarkers = useMemo(() => {
    return signals.map((s) => {
      const base = regionCentroids[s.region];
      if (!base) return null;
      const { cx, cy } = jitterPosition(s.id, base.cx, base.cy);
      return { signal: s, cx, cy };
    }).filter(Boolean) as { signal: Signal; cx: number; cy: number }[];
  }, [signals]);

  const handleMarkerEnter = useCallback((signal: Signal, e: React.MouseEvent<SVGCircleElement>) => {
    setHoveredSignal(signal);
    const rect = e.currentTarget.closest('svg')?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  const handleMarkerMove = useCallback((e: React.MouseEvent<SVGCircleElement>) => {
    const rect = e.currentTarget.closest('svg')?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, []);

  const handleMarkerLeave = useCallback(() => {
    setHoveredSignal(null);
    setTooltipPos(null);
  }, []);

  const handleMarkerClick = useCallback((signal: Signal) => {
    onSelectSignal(signal);
  }, [onSelectSignal]);

  return (
    <div className="glass-strong rounded-xl overflow-hidden">
      {/* Title bar */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#00E5A0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <h2 className="text-sm font-bold text-white font-[family-name:var(--font-space-grotesk)]">
            Mapa Geopolítico
          </h2>
          <span className="text-[9px] text-white/30 font-[family-name:var(--font-jetbrains-mono)] uppercase tracking-wider">
            {signals.length} señales activas
          </span>
        </div>
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-2">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.relevance} className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: relevanceColors[item.relevance] }}
              />
              <span className="text-[8px] text-white/40 font-[family-name:var(--font-jetbrains-mono)] uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Neon accent underline */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#00E5A0]/40 to-transparent" />

      {/* SVG Map */}
      <div className="relative" style={{ height: 400 }}>
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Mapa geopolítico interactivo con señales por región"
        >
          {/* Background */}
          <rect width="1000" height="500" fill="#070B15" />

          {/* Grid lines */}
          <defs>
            <pattern id="mapGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,229,160,0.04)" strokeWidth="0.5" />
            </pattern>
            {/* Glow filter for markers */}
            <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Stronger glow for critical markers */}
            <filter id="criticalGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="1000" height="500" fill="url(#mapGrid)" />

          {/* Equator line */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(0,229,160,0.06)" strokeWidth="0.5" strokeDasharray="8 4" />
          {/* Prime meridian */}
          <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(0,229,160,0.06)" strokeWidth="0.5" strokeDasharray="8 4" />

          {/* Continent shapes */}
          {(Object.keys(continentPaths) as Region[]).map((region) => (
            <path
              key={region}
              d={continentPaths[region]}
              fill="rgba(0,229,160,0.04)"
              stroke="rgba(0,229,160,0.12)"
              strokeWidth="1"
            />
          ))}

          {/* Region labels */}
          {mapRegions.map((mr) => (
            <g key={mr.region}>
              <text
                x={mr.cx}
                y={mr.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.12)"
                fontSize="10"
                fontFamily="var(--font-jetbrains-mono)"
                fontWeight="700"
                letterSpacing="0.08em"
                style={{ pointerEvents: 'none' }}
              >
                {mr.label.toUpperCase()}
              </text>
            </g>
          ))}

          {/* Signal markers */}
          {signalMarkers.map(({ signal, cx, cy }) => {
            const color = relevanceColors[signal.relevance];
            const isCritical = signal.relevance === 'CRÍTICA';
            const isHovered = hoveredSignal?.id === signal.id;

            return (
              <g key={signal.id}>
                {/* Pulse ring for CRÍTICA */}
                {isCritical && (
                  <>
                    <circle cx={cx} cy={cy} r="18" fill="none" stroke={color} strokeWidth="1" opacity="0.4">
                      <animate attributeName="r" values="6;22" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={cx} cy={cy} r="14" fill="none" stroke={color} strokeWidth="0.5" opacity="0.2">
                      <animate attributeName="r" values="6;18" dur="2s" begin="0.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0" dur="2s" begin="0.5s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}

                {/* Outer glow */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 12 : 8}
                  fill={color}
                  opacity={isHovered ? 0.15 : 0.08}
                  filter={isCritical ? 'url(#criticalGlow)' : 'url(#markerGlow)'}
                  style={{ pointerEvents: 'none' }}
                />

                {/* Main dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4.5}
                  fill={color}
                  opacity={isHovered ? 1 : 0.85}
                  filter={isCritical ? 'url(#criticalGlow)' : 'url(#markerGlow)'}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={(e) => handleMarkerEnter(signal, e)}
                  onMouseMove={handleMarkerMove}
                  onMouseLeave={handleMarkerLeave}
                  onClick={() => handleMarkerClick(signal)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Señal: ${signal.title}. Relevancia: ${signal.relevance}. Fuente: ${signal.source}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMarkerClick(signal); }}
                />

                {/* Inner bright core */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 2.5 : 1.8}
                  fill="white"
                  opacity={isHovered ? 0.9 : 0.5}
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredSignal && tooltipPos && (
          <div
            className="absolute z-50 pointer-events-none animate-fade-in"
            style={{
              left: Math.min(tooltipPos.x + 14, 700),
              top: tooltipPos.y - 10,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="glass-strong rounded-lg px-3 py-2 shadow-xl max-w-[260px]">
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: relevanceColors[hoveredSignal.relevance] }}
                />
                <span
                  className="text-[8px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]"
                  style={{ color: relevanceColors[hoveredSignal.relevance] }}
                >
                  {hoveredSignal.relevance}
                </span>
                <span className="text-[8px] text-white/30 font-[family-name:var(--font-jetbrains-mono)]">
                  · {regionLabels[hoveredSignal.region]}
                </span>
              </div>
              <p className="text-[11px] text-white/80 font-[family-name:var(--font-space-grotesk)] leading-snug line-clamp-2">
                {hoveredSignal.title}
              </p>
              <p className="text-[9px] text-white/35 font-[family-name:var(--font-jetbrains-mono)] mt-1">
                {hoveredSignal.source}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile legend */}
      <div className="sm:hidden px-4 py-2 border-t border-white/[0.06] flex flex-wrap items-center gap-x-3 gap-y-1">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.relevance} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: relevanceColors[item.relevance] }}
            />
            <span className="text-[8px] text-white/40 font-[family-name:var(--font-jetbrains-mono)] uppercase tracking-wider">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
