'use client';

import { type Signal, type Region, relevanceColors } from '@/data/signals';
import { ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';

interface SignalCardProps {
  signal: Signal;
  onRegionClick: (r: Region) => void;
  onClassifierClick: (c: string) => void;
  onSignalClick: (s: Signal) => void;
}

function timeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffHr < 24) return `hace ${diffHr}h`;
  return `hace ${diffDay}d`;
}

/** Señal "nueva" si tiene menos de 2 horas */
function isRecent(timestamp: string): boolean {
  const diff = Date.now() - new Date(timestamp).getTime();
  return diff < 2 * 60 * 60 * 1000;
}

/** Trunca texto a ~250 caracteres, cortando en límite de palabra */
function truncateContent(text: string): string {
  const TARGET = 250;
  const clean = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  if (clean.length <= TARGET + 20) return clean;

  const cut = clean.lastIndexOf(' ', TARGET + 20);
  return clean.slice(0, cut > TARGET - 30 ? cut : TARGET) + '…';
}

/** Mapa de fuente → bandera + abreviatura de país */
const sourceCountry: Record<string, { flag: string; code: string }> = {
  'Agencia BRICS de Noticias': { flag: '🌐', code: 'BRICS' },
  'Al Jazeera': { flag: '🇶🇦', code: 'QAT' },
  'Xinhua': { flag: '🇨🇳', code: 'CHN' },
  'Reuters África': { flag: '🇬🇧', code: 'GBR' },
  'EFE': { flag: '🇪🇸', code: 'ESP' },
  'The Hindu': { flag: '🇮🇳', code: 'IND' },
  'BBC África': { flag: '🇬🇧', code: 'GBR' },
  'TASS': { flag: '🇷🇺', code: 'RUS' },
  'Africa News': { flag: '🇦🇫', code: 'AFR' },
  'Folha de São Paulo': { flag: '🇧🇷', code: 'BRA' },
  'Middle East Eye': { flag: '🇬🇧', code: 'GBR' },
  'The East African': { flag: '🇰🇪', code: 'KEN' },
  'Euractiv': { flag: '🇪🇺', code: 'EUR' },
  'La Jornada': { flag: '🇲🇽', code: 'MEX' },
  'Africa Renewal': { flag: '🇺🇳', code: 'ONU' },
  'Washington Post': { flag: '🇺🇸', code: 'USA' },
  'OHCHR': { flag: '🇺🇳', code: 'ONU' },
  'Telesur': { flag: '🇻🇪', code: 'VEN' },
  'The National': { flag: '🇦🇪', code: 'EAU' },
  'Nordic Monitor': { flag: '🇸🇪', code: 'SWE' },
  'Página/12': { flag: '🇦🇷', code: 'ARG' },
  'Irrawaddy': { flag: '🇲🇲', code: 'MMR' },
  'Mongabay Latam': { flag: '🇵🇪', code: 'PER' },
  'Le Monde Diplomatique': { flag: '🇫🇷', code: 'FRA' },
  'MNOAL Official': { flag: '🇺🇳', code: 'ONU' },
  'CBC News': { flag: '🇨🇦', code: 'CAN' },
  'Anadolu Agency': { flag: '🇹🇷', code: 'TUR' },
  'CIJ Official': { flag: '🇳🇱', code: 'NLD' },
  'Prensa Latina': { flag: '🇨🇺', code: 'CUB' },
  'RT': { flag: '🇷🇺', code: 'RUS' },
  'TRT World': { flag: '🇹🇷', code: 'TUR' },
  'CGTN': { flag: '🇨🇳', code: 'CHN' },
};

export default function SignalCard({ signal, onRegionClick, onClassifierClick, onSignalClick }: SignalCardProps) {
  const relevanceColor = relevanceColors[signal.relevance];
  const mounted = useMounted();
  const recent = isRecent(signal.timestamp);
  const displayText = truncateContent(signal.fullContent);

  return (
    <div
      className="glass rounded-xl overflow-hidden hover:bg-white/[0.04] cursor-pointer transition-colors duration-150 group flex flex-col"
      style={{ borderLeft: `3px solid ${relevanceColor}` }}
      onClick={() => onSignalClick(signal)}
    >
      {/* Thumbnail — arriba de todo, solo si hay imagen */}
      {signal.image && (
        <div className="relative overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signal.image}
            alt=""
            className="w-full h-32 sm:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1C]/30 via-transparent to-[#0A0F1C]/60" />
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
        <p className="text-[11px] sm:text-xs text-white/55 leading-relaxed mb-3 font-[family-name:var(--font-space-grotesk)]">
          {displayText}
        </p>

        {/* Región + clasificadores — arriba de la línea */}
        <div className="mt-auto flex items-center gap-1.5 mb-2 flex-wrap">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegionClick(signal.region);
            }}
            className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#00E5A0]/10 text-[#00E5A0]/70 hover:bg-[#00E5A0]/20 transition-colors font-[family-name:var(--font-jetbrains-mono)]"
          >
            {signal.region}
          </button>
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

        {/* Línea + fuente con bandera — debajo de la línea */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-center gap-1.5">
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
      </div>
    </div>
  );
}
