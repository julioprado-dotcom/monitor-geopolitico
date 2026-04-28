'use client';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Tv, ChevronDown, ChevronUp, Play, Maximize2 } from 'lucide-react';
import { tvChannels, getYouTubeEmbedUrl, getYouTubeLiveApiUrl, platformMeta, getPrimaryPlatformId, type TVChannel } from '@/data/channels';

// ── Lazy load: HLSPlayer + hls.js solo se descargan si el usuario da play ──
const HLSPlayer = lazy(() => import('@/components/HLSPlayer'));

interface LivePlayerProps {
  onOpenFloating?: (channel: TVChannel) => void;
}

/** Agrupar canales por región */
function groupByRegion(channels: TVChannel[]) {
  const groups: Record<string, TVChannel[]> = {};
  for (const ch of channels) {
    if (!groups[ch.region]) groups[ch.region] = [];
    groups[ch.region].push(ch);
  }
  return groups;
}

export default function LivePlayer({ onOpenFloating }: LivePlayerProps) {
  const [selectedChannel, setSelectedChannel] = useState<TVChannel>(tvChannels[0]);
  const [mounted, setMounted] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!mounted) {
      const idx = Math.floor(Math.random() * tvChannels.length);
      setSelectedChannel(tvChannels[idx]);
      setMounted(true);
    }
  }, [mounted]);

  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);

  const primaryPlatform = platformMeta[getPrimaryPlatformId(selectedChannel)];

  const resolveYouTubeLive = useCallback(async (channelId: string, channelName?: string) => {
    setYtLoading(true);
    setYtError(null);
    setYoutubeVideoId(null);
    try {
      const res = await fetch(getYouTubeLiveApiUrl(channelId, channelName));
      if (!res.ok) throw new Error('Error al resolver live stream');
      const data = await res.json();
      if (data.videoId) {
        setYoutubeVideoId(data.videoId);
      } else {
        setYtError('No se encontró transmisión en vivo');
      }
    } catch (err: any) {
      setYtError('Error de conexión con YouTube');
    } finally {
      setYtLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChannel.streamType === 'youtube' && isPlaying) {
      resolveYouTubeLive(selectedChannel.streamUrl, selectedChannel.shortName);
    } else {
      setYoutubeVideoId(null);
      setYtError(null);
    }
  }, [selectedChannel.id, isPlaying, resolveYouTubeLive]);

  const handleChannelSelect = (ch: TVChannel) => {
    setSelectedChannel(ch);
    setIsPlaying(true);
    setIframeLoaded(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const isConnecting = isPlaying && (
    (selectedChannel.streamType === 'youtube' && ytLoading && !youtubeVideoId) ||
    (selectedChannel.streamType === 'iframe' && !iframeLoaded)
  );

  const channelGroups = groupByRegion(tvChannels);

  return (
    <div className={`glass rounded-xl overflow-hidden flex flex-col transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
            </span>
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5A0] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5A0]" />
            </span>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] ${
            isConnecting ? 'text-yellow-400/80' : 'text-[#00E5A0]/80'
          }`}>
            {isConnecting ? 'Conectando...' : 'Monitor en Vivo'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isPlaying && onOpenFloating && (
            <button
              onClick={() => onOpenFloating(selectedChannel)}
              className="flex items-center justify-center w-5 h-5 rounded bg-white/5 hover:bg-white/10 border border-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
              title="Abrir proyector flotante"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Línea de canal activo */}
      {isPlaying && (
        <div className="px-3 py-1 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">{selectedChannel.flag}</span>
            <span className="text-[9px] font-medium text-white/60 font-[family-name:var(--font-space-grotesk)]">
              {selectedChannel.shortName}
            </span>
          </div>
          {!isConnecting && (
            <span className="text-[7px] px-1.5 py-0.5 rounded bg-red-500/80 text-white font-bold font-[family-name:var(--font-jetbrains-mono)] animate-pulse">
              EN VIVO
            </span>
          )}
        </div>
      )}

      {/* Mini Reproductor */}
      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        {isPlaying ? (
          <>
            {selectedChannel.streamType === 'youtube' ? (
              youtubeVideoId ? (
                <iframe
                  key={selectedChannel.id + youtubeVideoId}
                  src={getYouTubeEmbedUrl(youtubeVideoId, true)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen={false}
                  referrerPolicy="strict-origin-when-cross-origin"
                  title={`${selectedChannel.shortName} en vivo`}
                />
              ) : ytError ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-black/90">
                  <svg className="w-5 h-5 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-[9px] text-white/50 text-center px-4 leading-tight">{ytError}</p>
                  <button
                    onClick={() => resolveYouTubeLive(selectedChannel.streamUrl, selectedChannel.shortName)}
                    className="text-[8px] text-[#00E5A0]/60 hover:text-[#00E5A0] font-[family-name:var(--font-jetbrains-mono)] mt-1"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#00E5A0]/30 border-t-[#00E5A0] rounded-full animate-spin" />
                    <span className="text-[8px] text-white/40 font-[family-name:var(--font-jetbrains-mono)]">
                      Conectando con YouTube...
                    </span>
                  </div>
                </div>
              )
            ) : selectedChannel.streamType === 'iframe' ? (
              <div className="relative w-full h-full">
                <iframe
                  key={selectedChannel.id}
                  src={selectedChannel.streamUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                  title={`${selectedChannel.shortName} en vivo`}
                  onLoad={() => setIframeLoaded(true)}
                />
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                      <span className="text-[8px] text-yellow-400/60 font-[family-name:var(--font-jetbrains-mono)]">
                        Cargando stream...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#00E5A0]/30 border-t-[#00E5A0] rounded-full animate-spin" />
                </div>
              }>
                <HLSPlayer key={selectedChannel.id} src={selectedChannel.streamUrl} initialQuality="low" />
              </Suspense>
            )}
          </>
        ) : (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 group cursor-pointer"
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: `radial-gradient(circle at center, ${selectedChannel.color}40, transparent 70%)` }}
            />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-x-0 h-6 bg-gradient-to-b from-[#00E5A0]/[0.02] to-transparent animate-scanline" />
            </div>
            <div className="relative z-10 w-10 h-10 rounded-full bg-[#00E5A0]/15 border border-[#00E5A0]/30 flex items-center justify-center group-hover:bg-[#00E5A0]/25 group-hover:border-[#00E5A0]/50 group-hover:scale-110 transition-transform duration-150 neon-glow">
              <Play className="w-4 h-4 text-[#00E5A0] ml-0.5" fill="currentColor" />
            </div>
            <div className="relative z-10 flex items-center gap-1.5">
              <span className="text-sm">{selectedChannel.flag}</span>
              <span className="text-[10px] text-white/60 font-[family-name:var(--font-space-grotesk)]">
                {selectedChannel.shortName}
              </span>
              <span
                className="text-[7px] px-1 py-0.5 rounded font-bold font-[family-name:var(--font-jetbrains-mono)]"
                style={{ backgroundColor: `${primaryPlatform.color}20`, color: `${primaryPlatform.color}AA` }}
              >
                {primaryPlatform.icon} {primaryPlatform.label}
              </span>
            </div>
            <span className="relative z-10 text-[8px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
              Click para reproducir
            </span>
          </button>
        )}
      </div>

      {/* Selector de canales agrupados por región */}
      <div className="border-t border-white/[0.06]">
        <button
          onClick={() => setChannelsOpen(!channelsOpen)}
          className="w-full px-3 py-1.5 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Tv className="w-3 h-3 text-white/30" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
              Canales
            </span>
            <span className="text-[8px] text-white/20 font-[family-name:var(--font-jetbrains-mono)]">
              ({tvChannels.length})
            </span>
          </div>
          {channelsOpen ? (
            <ChevronUp className="w-3 h-3 text-white/30" />
          ) : (
            <ChevronDown className="w-3 h-3 text-white/30" />
          )}
        </button>

        {channelsOpen && (
          <div className="px-1.5 pb-1.5 max-h-[240px] overflow-y-auto animate-fade-in">
            {Object.entries(channelGroups).map(([region, channels]) => (
              <div key={region}>
                <div className="px-2 py-1">
                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
                    {region}
                  </span>
                </div>
                {channels.map(ch => {
                  const chMeta = platformMeta[getPrimaryPlatformId(ch)];
                  return (
                    <button
                      key={ch.id}
                      onClick={() => handleChannelSelect(ch)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors duration-100 text-left ${
                        selectedChannel.id === ch.id
                          ? 'bg-white/10 border border-white/10'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="text-xs shrink-0">{ch.flag}</span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] block truncate font-[family-name:var(--font-space-grotesk)] ${
                          selectedChannel.id === ch.id ? 'text-white font-medium' : 'text-white/50'
                        }`}>
                          {ch.shortName}
                        </span>
                      </div>
                      <span
                        className="text-[7px] px-1 py-0.5 rounded font-bold font-[family-name:var(--font-jetbrains-mono)] shrink-0"
                        style={{ backgroundColor: `${chMeta.color}15`, color: `${chMeta.color}99` }}
                      >
                        {chMeta.icon}
                      </span>
                      {ch.espejoSur && (
                        <span className="text-[7px] px-1 py-0.5 rounded bg-[#00E5A0]/10 text-[#00E5A0]/60 font-bold font-[family-name:var(--font-jetbrains-mono)] shrink-0">
                          SUR
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
