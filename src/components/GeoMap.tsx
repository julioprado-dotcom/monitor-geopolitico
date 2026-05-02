'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { geoNaturalEarth1, geoPath, geoCentroid, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Signal } from '@/types';
import { relevanceColors, regionLabels } from '@/data/signals';
import { COUNTRY_REGION_MAP, regionChoroplethColors } from '@/data/countryRegionMap';
import type { Region, Relevance } from '@/types';
import { X } from 'lucide-react';

interface GeoMapProps {
  signals: Signal[];
  allSignals: Signal[];
  filteredCount: number;
  selectedRelevances: Set<Relevance>;
  onSelectSignal: (signal: Signal) => void;
  onToggleRelevance: (s: Relevance) => void;
  onClearRelevance: () => void;
}

const LEGEND_ITEMS: { relevance: Relevance; label: string }[] = [
  { relevance: 'CRÍTICA', label: 'Crítica' },
  { relevance: 'ALTA', label: 'Alta' },
  { relevance: 'MEDIA', label: 'Media' },
  { relevance: 'BAJA', label: 'Baja' },
  { relevance: 'INFORMATIVA', label: 'Informativa' },
];

const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface CountryFeature {
  type: string;
  id: string;
  properties: { name: string };
  geometry: GeoPermissibleObjects;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TopoData = any;

const DEFAULT_CENTROIDS: Record<Region, [number, number]> = {
  'NORTEAMÉRICA': [250, 155],
  'LATINOAMÉRICA': [280, 330],
  'EUROPA': [500, 130],
  'ÁFRICA': [500, 280],
  'MEDIO ORIENTE': [580, 200],
  'ASIA': [720, 190],
};

const SEVERITY_LEVELS: Relevance[] = ['CRÍTICA', 'ALTA', 'MEDIA', 'BAJA', 'INFORMATIVA'];

export default function GeoMap({ signals, allSignals, filteredCount, selectedRelevances, onSelectSignal, onToggleRelevance, onClearRelevance }: GeoMapProps) {
  const [hoveredSignal, setHoveredSignal] = useState<Signal | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State (not ref!) so useMemo and render re-trigger when data loads
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [regionCentroids, setRegionCentroids] = useState<Record<Region, [number, number]>>(DEFAULT_CENTROIDS);
  const [pathGenerator, setPathGenerator] = useState<ReturnType<typeof geoPath> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Fetch and process TopoJSON — sets state which triggers re-render
  useEffect(() => {
    let cancelled = false;

    async function loadWorld() {
      try {
        const res = await fetch(WORLD_TOPO_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const topology = await res.json() as TopoData;

        if (cancelled) return;

        // Convert TopoJSON to GeoJSON features
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const countriesGeo = feature(topology, topology.objects.countries) as any;
        const features: CountryFeature[] = countriesGeo.features || [];

        setCountries(features);

        // Build projection fitted to the features
        const fc = { type: 'FeatureCollection', features };
        const proj = geoNaturalEarth1().fitSize([1000, 500], fc);
        const path = geoPath().projection(proj);
        setPathGenerator(() => path);

        // Compute region centroids from actual country geometries
        const regionCoords: Record<string, [number, number][]> = {
          'NORTEAMÉRICA': [],
          'LATINOAMÉRICA': [],
          'EUROPA': [],
          'ÁFRICA': [],
          'MEDIO ORIENTE': [],
          'ASIA': [],
        };

        for (const country of features) {
          const region = COUNTRY_REGION_MAP[country.id];
          if (region) {
            try {
              const centroid = geoCentroid(country as GeoPermissibleObjects);
              const projected = proj(centroid);
              if (projected && isFinite(projected[0]) && isFinite(projected[1])) {
                regionCoords[region].push([projected[0], projected[1]]);
              }
            } catch {
              // Skip malformed geometries
            }
          }
        }

        // Average centroids per region
        const newCentroids = { ...DEFAULT_CENTROIDS };
        for (const region of Object.keys(regionCoords) as Region[]) {
          const coords = regionCoords[region];
          if (coords.length > 0) {
            const avgX = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
            const avgY = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;
            newCentroids[region] = [avgX, avgY];
          }
        }
        setRegionCentroids(newCentroids);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error cargando mapa');
          setLoading(false);
        }
      }
    }

    loadWorld();
    return () => { cancelled = true; };
  }, []);

  // Signal markers with jitter — depends on signals + regionCentroids
  const signalMarkers = useMemo(() => {
    return signals.map((s) => {
      const base = regionCentroids[s.region];
      if (!base) return null;
      const { cx, cy } = jitterPosition(s.id, base[0], base[1]);
      return { signal: s, cx, cy };
    }).filter(Boolean) as { signal: Signal; cx: number; cy: number }[];
  }, [signals, regionCentroids]);

  // Find hovered country name
  const hoveredCountryName = useMemo(() => {
    if (!hoveredCountry) return '';
    return countries.find(c => c.id === hoveredCountry)?.properties?.name || '';
  }, [hoveredCountry, countries]);

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

  const handleCountryEnter = useCallback((countryId: string) => {
    setHoveredCountry(countryId);
  }, []);

  const handleCountryLeave = useCallback(() => {
    setHoveredCountry(null);
  }, []);

  return (
    <div className="glass-strong rounded-xl overflow-hidden">
      {/* Title bar */}
      <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#00E5A0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <h2 className="text-sm font-bold text-white font-[family-name:var(--font-space-grotesk)]">
            Mapa Geopolítico
          </h2>
        </div>
        <span className="text-[9px] text-text-faint font-[family-name:var(--font-jetbrains-mono)] uppercase tracking-wider">
          {signals.length} señales activas
        </span>
      </div>
      {/* Neon accent underline */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#00E5A0]/40 to-transparent" />

      {/* Severidad — fila propia, centrada y ampliada */}
      <div className="px-4 pt-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold text-text-faint uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
            Severidad
          </span>
          <span className="text-[9px] text-text-faint font-[family-name:var(--font-jetbrains-mono)]">
            {filteredCount}<span className="text-text-faint">/{allSignals.length}</span>
          </span>
        </div>
        <div className="flex items-end gap-2.5" role="group" aria-label="Filtros por nivel de severidad">
          {SEVERITY_LEVELS.map((sev) => {
            const count = allSignals.filter((s) => s.relevance === sev).length;
            const color = relevanceColors[sev];
            const isSelected = selectedRelevances.has(sev);
            const maxCount = Math.max(...SEVERITY_LEVELS.map((s) => allSignals.filter((sig) => sig.relevance === s).length), 1);
            const heightPct = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div
                key={sev}
                role="button"
                tabIndex={0}
                aria-label={`Filtrar por severidad ${sev}${isSelected ? ' (seleccionado)' : ''} — ${count} señales`}
                aria-pressed={isSelected}
                onClick={() => onToggleRelevance(sev)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleRelevance(sev); } }}
                className="flex-1 flex flex-col items-center gap-1 transition-all duration-150 cursor-pointer"
              >
                {isSelected && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onClearRelevance(); }}
                    className="px-1 py-px rounded text-[7px] font-bold font-[family-name:var(--font-jetbrains-mono)] transition-colors"
                    style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
                    title="Limpiar filtro"
                  >
                    <X className="w-2 h-2 inline" /> <span className="ml-0.5">LIMPIAR</span>
                  </button>
                )}
                <span
                  className="text-[10px] font-bold font-[family-name:var(--font-jetbrains-mono)] leading-none"
                  style={{ color }}
                >
                  {count}
                </span>
                <div
                  className="w-full h-8 rounded-sm relative overflow-hidden transition-all duration-150"
                  style={{
                    backgroundColor: `${color}15`,
                    border: isSelected ? `1.5px solid ${color}60` : '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-sm transition-all duration-400"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span
                  className="text-[7px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] text-center leading-none"
                  style={{ color }}
                >
                  {sev}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative" style={{ height: 'auto', aspectRatio: '2 / 1' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-[#00E5A0]/30 border-t-[#00E5A0] rounded-full animate-spin" />
              <span className="text-[10px] text-text-faint font-[family-name:var(--font-jetbrains-mono)]">
                Cargando mapa mundial...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <span className="text-[11px] text-red-400/70 font-[family-name:var(--font-jetbrains-mono)]">
                Error: {error}
              </span>
            </div>
          </div>
        )}

        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full block"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Mapa geopolítico interactivo con señales por región"
        >
          {/* Background */}
          <rect width="1000" height="500" fill="#070B15" />

          <defs>
            <radialGradient id="oceanGlow" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="rgba(0,229,160,0.02)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <pattern id="mapGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,229,160,0.03)" strokeWidth="0.3" />
            </pattern>
            <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="criticalGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ocean background */}
          <rect width="1000" height="500" fill="url(#oceanGlow)" />
          <rect width="1000" height="500" fill="url(#mapGrid)" />

          {/* Equator & Prime Meridian */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(0,229,160,0.05)" strokeWidth="0.4" strokeDasharray="8 4" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="rgba(0,229,160,0.05)" strokeWidth="0.4" strokeDasharray="8 4" />

          {/* Country paths */}
          {pathGenerator && countries.map((country) => {
            const region = COUNTRY_REGION_MAP[country.id];
            const isHovered = hoveredCountry === country.id;
            const colors = region
              ? regionChoroplethColors[region]
              : { fill: 'rgba(255,255,255,0.03)', stroke: 'rgba(255,255,255,0.08)', hoverFill: 'rgba(255,255,255,0.1)' };

            const d = pathGenerator(country);
            if (!d) return null;

            return (
              <path
                key={country.id}
                d={d}
                fill={isHovered ? colors.hoverFill : colors.fill}
                stroke={isHovered ? colors.stroke : 'rgba(255,255,255,0.06)'}
                strokeWidth={isHovered ? 1.2 : 0.4}
                strokeLinejoin="round"
                className="transition-all duration-300"
                style={{ cursor: 'default' }}
                onMouseEnter={() => handleCountryEnter(country.id)}
                onMouseLeave={handleCountryLeave}
              />
            );
          })}

          {/* Hovered country info label */}
          {hoveredCountryName && (
            <text
              x="20"
              y="485"
              fill="rgba(255,255,255,0.25)"
              fontSize="9"
              fontFamily="var(--font-jetbrains-mono)"
              fontWeight="400"
              letterSpacing="0.05em"
              style={{ pointerEvents: 'none' }}
            >
              {hoveredCountryName}
            </text>
          )}

          {/* Signal markers */}
          {signalMarkers.map(({ signal, cx, cy }) => {
            const color = relevanceColors[signal.relevance];
            const isCritical = signal.relevance === 'CRÍTICA';
            const isHovered = hoveredSignal?.id === signal.id;

            return (
              <g key={signal.id}>
                {/* Pulse ring for CRÍTICA */}
                {isCritical && !prefersReducedMotion && (
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
                <circle cx={cx} cy={cy} r={isHovered ? 12 : 8} fill={color}
                  opacity={isHovered ? 0.15 : 0.08}
                  filter={isCritical ? 'url(#criticalGlow)' : 'url(#markerGlow)'}
                  style={{ pointerEvents: 'none' }} />

                {/* Main dot */}
                <circle cx={cx} cy={cy} r={isHovered ? 6 : 4.5} fill={color}
                  opacity={isHovered ? 1 : 0.85}
                  filter={isCritical ? 'url(#criticalGlow)' : 'url(#markerGlow)'}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={(e) => handleMarkerEnter(signal, e)}
                  onMouseMove={handleMarkerMove}
                  onMouseLeave={handleMarkerLeave}
                  onClick={() => handleMarkerClick(signal)}
                  role="button" tabIndex={0}
                  aria-label={`Señal: ${signal.title}. Relevancia: ${signal.relevance}. Fuente: ${signal.source}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleMarkerClick(signal); }} />

                {/* Inner bright core */}
                <circle cx={cx} cy={cy} r={isHovered ? 2.5 : 1.8} fill="white"
                  opacity={isHovered ? 0.9 : 0.5}
                  style={{ pointerEvents: 'none' }} />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredSignal && tooltipPos && (
          <div className="absolute z-50 pointer-events-none animate-fade-in"
            style={{ left: Math.min(tooltipPos.x + 14, 700), top: tooltipPos.y - 10, transform: 'translateY(-100%)' }}>
            <div className="glass-strong rounded-lg px-3 py-2 shadow-xl max-w-[260px]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: relevanceColors[hoveredSignal.relevance] }} />
                <span className="text-[8px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]"
                  style={{ color: relevanceColors[hoveredSignal.relevance] }}>{hoveredSignal.relevance}</span>
                <span className="text-[8px] text-text-faint font-[family-name:var(--font-jetbrains-mono)]">· {regionLabels[hoveredSignal.region]}</span>
              </div>
              <p className="text-[11px] text-white/80 font-[family-name:var(--font-space-grotesk)] leading-snug line-clamp-2">{hoveredSignal.title}</p>
              <p className="text-[9px] text-white/35 font-[family-name:var(--font-jetbrains-mono)] mt-1">{hoveredSignal.source}</p>
            </div>
          </div>
        )}
      </div>

      {/* Region color legend — debajo del mapa */}
      <div className="px-4 py-1.5 border-t border-border-subtle flex items-center gap-3 overflow-x-auto">
        {(Object.keys(regionChoroplethColors) as Region[]).map((region) => (
          <div key={region} className="flex items-center gap-1.5 shrink-0">
            <span
              className="w-2.5 h-2.5 rounded-sm shrink-0 border"
              style={{
                backgroundColor: regionChoroplethColors[region].fill,
                borderColor: regionChoroplethColors[region].stroke,
              }}
            />
            <span className="text-[8px] text-white/35 font-[family-name:var(--font-jetbrains-mono)] uppercase tracking-wider">
              {regionLabels[region]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Slight deterministic jitter so multiple markers in the same region don't overlap */
function jitterPosition(signalId: string, baseCx: number, baseCy: number): { cx: number; cy: number } {
  let hash = 0;
  for (let i = 0; i < signalId.length; i++) {
    hash = ((hash << 5) - hash + signalId.charCodeAt(i)) | 0;
  }
  const range = 30;
  const jitterX = ((hash & 0xFF) / 255) * range - range / 2;
  const jitterY = (((hash >> 8) & 0xFF) / 255) * range - range / 2;
  return { cx: baseCx + jitterX, cy: baseCy + jitterY };
}
