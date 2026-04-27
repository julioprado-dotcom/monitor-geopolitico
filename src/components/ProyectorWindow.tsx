'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Settings, Wifi, WifiOff, Loader2, Volume2, VolumeX, Subtitles, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { tvChannels, getYouTubeEmbedUrl, getYouTubeLiveApiUrl, getAlternativePlatforms, platformMeta, getPrimaryPlatformId, type TVChannel, type PlatformId } from '@/data/channels';
import { lazy, Suspense } from 'react';

// Lazy load — hls.js (~300KB) solo se carga si se necesita
const HLSPlayer = lazy(() => import('@/components/HLSPlayer'));
type QualityLevel = 'auto' | 'low' | 'medium' | 'high';
type ConnectionInfo = {
  quality: QualityLevel;
  currentBitrate: number | null;
  availableLevels: number;
  connected: boolean;
  buffering: boolean;
};

interface ProyectorWindowProps {
  channel: TVChannel;
  initialQuality: QualityLevel;
  onClose: () => void;
}

const qualityLabels: Record<QualityLevel, { label: string; desc: string }> = {
  low: { label: 'Baja', desc: '~240p · Mínimo consumo' },
  medium: { label: 'Media', desc: '~480p · Uso moderado' },
  high: { label: 'Alta', desc: '~720p+ · Máxima calidad' },
  auto: { label: 'Auto', desc: 'Adaptativa · Según conexión' },
};

export default function ProyectorWindow({ channel, initialQuality, onClose }: ProyectorWindowProps) {
  const [selectedChannel, setSelectedChannel] = useState<TVChannel>(channel);
  const [quality, setQuality] = useState<QualityLevel>(initialQuality);
  const [showSettings, setShowSettings] = useState(false);
  const [muted, setMuted] = useState(true);
  const [subtitles, setSubtitles] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connection, setConnection] = useState<ConnectionInfo>({
    quality,
    currentBitrate: null,
    availableLevels: 0,
    connected: false,
    buffering: true,
  });

  // YouTube live video ID (resuelto dinámicamente)
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);

  const resolveYouTubeLive = useCallback(async (channelId: string, channelName?: string) => {
    setYtLoading(true);
    setYtError(null);
    setYoutubeVideoId(null);
    try {
      const res = await fetch(getYouTubeLiveApiUrl(channelId, channelName));
      if (!res.ok) throw new Error('Error');
      const data = await res.json();
      if (data.videoId) {
        setYoutubeVideoId(data.videoId);
      } else {
        setYtError('No se encontró transmisión en vivo');
      }
    } catch {
      setYtError('Error de conexión con YouTube');
    } finally {
      setYtLoading(false);
    }
  }, []);

  // Resolver live cuando cambia el canal
  useEffect(() => {
    if (selectedChannel.streamType === 'youtube') {
      resolveYouTubeLive(selectedChannel.streamUrl, selectedChannel.shortName);
    } else {
      setYoutubeVideoId(null);
      setYtError(null);
    }
  }, [selectedChannel.id, resolveYouTubeLive]);

  const handleConnectionChange = useCallback((info: ConnectionInfo) => {
    setConnection(info);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Indicador de conexión
  const connColor = !connection.connected
    ? 'text-red-400'
    : connection.buffering
      ? 'text-yellow-400'
      : connection.currentBitrate && connection.currentBitrate < 400
        ? 'text-orange-400'
        : 'text-[#00E5A0]';

  const ConnIcon = !connection.connected ? WifiOff : connection.buffering ? Loader2 : Wifi;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-[90vw] max-w-[1100px] h-[85vh] max-h-[700px] flex flex-col glass-strong rounded-2xl overflow-hidden neon-glow-strong animate-slide-in">

        {/* ── Barra superior ─────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-black/30">
          <div className="flex items-center gap-3">
            <span className="text-lg">{selectedChannel.flag}</span>
            <div>
              <h3 className="text-sm font-bold text-white font-[family-name:var(--font-space-grotesk)]">
                {selectedChannel.name}
              </h3>
              <p className="text-[9px] text-white/30 font-[family-name:var(--font-jetbrains-mono)]">
                {selectedChannel.country} · {selectedChannel.region}
              </p>
            </div>
            {selectedChannel.espejoSur && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#00E5A0]/15 text-[#00E5A0]/80 font-bold font-[family-name:var(--font-jetbrains-mono)]">
                ESPEJO SUR
              </span>
            )}
            {/* ── Franja de plataformas disponibles ── */}
            <div className="flex items-center gap-1.5">
              <span className="text-[7px] text-white/30 font-[family-name:var(--font-jetbrains-mono)] shrink-0 uppercase tracking-wider">En:</span>
              {(() => {
                const primaryPlatform: PlatformId = getPrimaryPlatformId(selectedChannel);
                const allPlatforms = [
                  { platform: primaryPlatform, url: selectedChannel.streamUrl, isPrimary: true },
                  ...selectedChannel.alternatives.map(a => ({ platform: a.platform, url: a.url, isPrimary: false })),
                ];
                return allPlatforms.map(p => {
                  const meta = platformMeta[p.platform];
                  const isExternal = p.platform === 'rumble' || p.platform === 'odysee' || p.platform === 'dailymotion' || p.platform === 'website';
                  const badge = (
                    <span
                      className="text-[8px] px-1.5 py-0.5 rounded font-bold font-[family-name:var(--font-jetbrains-mono)] inline-flex items-center gap-0.5 transition-all"
                      style={{
                        backgroundColor: p.isPrimary ? `${meta.color}25` : `${meta.color}12`,
                        color: p.isPrimary ? `${meta.color}CC` : `${meta.color}99`,
                        border: p.isPrimary ? `1px solid ${meta.color}30` : `1px solid ${meta.color}15`,
                      }}
                    >
                      {meta.icon} {meta.label}
                      {isExternal && <ExternalLink className="w-2 h-2 ml-0.5 opacity-50" />}
                    </span>
                  );
                  if (isExternal) {
                    return (
                      <a key={p.platform} href={p.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80" title={`Ver en ${meta.label}`}>
                        {badge}
                      </a>
                    );
                  }
                  return <span key={p.platform}>{badge}</span>;
                });
              })()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Indicador de conexión detallado */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 ${connColor}`}>
              <ConnIcon className={`w-3.5 h-3.5 ${connection.buffering ? 'animate-spin' : ''}`} />
              <span className="text-[9px] font-bold font-[family-name:var(--font-jetbrains-mono)]">
                {qualityLabels[connection.quality].label}
                {connection.currentBitrate ? ` · ${connection.currentBitrate}kbps` : ''}
                {connection.availableLevels > 0 ? ` · ${connection.availableLevels} niveles` : ''}
              </span>
            </div>

            {/* Botón settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center justify-center w-8 h-7 rounded-md border transition-all ${
                showSettings
                  ? 'bg-[#00E5A0]/15 border-[#00E5A0]/30 text-[#00E5A0]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              <Settings className={`w-4 h-4 ${showSettings ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </button>

            {/* Fullscreen */}
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen?.();
                  setIsFullscreen(true);
                } else {
                  document.exitFullscreen?.();
                  setIsFullscreen(false);
                }
              }}
              className="flex items-center justify-center w-8 h-7 rounded-md bg-white/5 border border-white/10 text-white/40 hover:text-white/70 transition-all"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Cerrar */}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-7 rounded-md bg-red-500/10 border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Cuerpo: Video + Panel lateral ──────────── */}
        <div className="flex-1 flex min-h-0">
          {/* Video */}
          <div className="flex-1 relative bg-black">
            {selectedChannel.streamType === 'youtube' ? (
              youtubeVideoId ? (
                <iframe
                  key={selectedChannel.id + youtubeVideoId}
                  src={getYouTubeEmbedUrl(youtubeVideoId, true)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  title={`${selectedChannel.name} en vivo`}
                />
              ) : ytError ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black">
                  <svg className="w-6 h-6 text-red-400/70 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-[10px] text-white/50 text-center px-4">{ytError}</p>
                  <button
                    onClick={() => resolveYouTubeLive(selectedChannel.streamUrl, selectedChannel.shortName)}
                    className="text-[9px] text-[#00E5A0]/60 hover:text-[#00E5A0] mt-2 font-[family-name:var(--font-jetbrains-mono)]"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#00E5A0]/30 border-t-[#00E5A0] rounded-full animate-spin" />
                    <span className="text-[9px] text-white/40 font-[family-name:var(--font-jetbrains-mono)]">
                      Conectando con YouTube...
                    </span>
                  </div>
                </div>
              )
            ) : selectedChannel.streamType === 'iframe' ? (
              <iframe
                key={selectedChannel.id}
                src={selectedChannel.streamUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                title={`${selectedChannel.name} en vivo`}
              />
            ) : (
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <div className="w-8 h-8 border-2 border-[#00E5A0]/30 border-t-[#00E5A0] rounded-full animate-spin" />
                </div>
              }>
                <HLSPlayer
                  key={selectedChannel.id + quality}
                  src={selectedChannel.streamUrl}
                  initialQuality={quality}
                  onConnectionChange={handleConnectionChange}
                />
              </Suspense>
            )}

            {/* Controles inferiores sobre el video */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMuted(!muted)}
                  className="flex items-center justify-center w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 text-white/60 transition-all"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSubtitles(!subtitles)}
                  className={`flex items-center justify-center w-7 h-7 rounded-md transition-all ${
                    subtitles ? 'bg-[#00E5A0]/20 text-[#00E5A0]' : 'bg-white/10 text-white/40 hover:bg-white/20'
                  }`}
                  title="Subtítulos"
                >
                  <Subtitles className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[8px] text-white/30 font-[family-name:var(--font-jetbrains-mono)]">
                {selectedChannel.streamType === 'hls' ? 'Stream directo' : selectedChannel.streamType === 'iframe' ? 'Embed' : 'YouTube Live'}
              </span>
            </div>
          </div>

          {/* Panel lateral: Settings / Canales */}
          {showSettings && (
            <div className="w-[260px] border-l border-white/[0.06] bg-black/20 flex flex-col animate-fade-in overflow-y-auto">
              {/* Configuración de calidad */}
              <div className="p-3 border-b border-white/[0.06]">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] mb-2">
                  Calidad de video
                </h4>
                <div className="flex flex-col gap-1">
                  {(Object.keys(qualityLabels) as QualityLevel[]).map(q => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg transition-all text-left ${
                        quality === q
                          ? 'bg-[#00E5A0]/10 border border-[#00E5A0]/20'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div>
                        <span className={`text-[11px] font-medium block font-[family-name:var(--font-space-grotesk)] ${
                          quality === q ? 'text-[#00E5A0]' : 'text-white/60'
                        }`}>
                          {qualityLabels[q].label}
                        </span>
                        <span className="text-[9px] text-white/25 font-[family-name:var(--font-jetbrains-mono)]">
                          {qualityLabels[q].desc}
                        </span>
                      </div>
                      {quality === q && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtítulos */}
              <div className="p-3 border-b border-white/[0.06]">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] mb-2">
                  Subtítulos
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/60 font-[family-name:var(--font-space-grotesk)]">
                    Activar subtítulos
                  </span>
                  <button
                    onClick={() => setSubtitles(!subtitles)}
                    className={`w-9 h-5 rounded-full transition-all flex items-center ${
                      subtitles ? 'bg-[#00E5A0]/30 justify-end' : 'bg-white/10 justify-start'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full mx-0.5 transition-all ${
                      subtitles ? 'bg-[#00E5A0]' : 'bg-white/40'
                    }`} />
                  </button>
                </div>
                <p className="text-[9px] text-white/20 mt-1 font-[family-name:var(--font-jetbrains-mono)]">
                  {subtitles ? 'Disponibles según el canal' : 'Desactivados'}
                </p>
              </div>

              {/* Audio */}
              <div className="p-3 border-b border-white/[0.06]">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] mb-2">
                  Audio
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/60 font-[family-name:var(--font-space-grotesk)]">
                    Silenciar
                  </span>
                  <button
                    onClick={() => setMuted(!muted)}
                    className={`w-9 h-5 rounded-full transition-all flex items-center ${
                      !muted ? 'bg-[#00E5A0]/30 justify-end' : 'bg-white/10 justify-start'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full mx-0.5 transition-all ${
                      !muted ? 'bg-[#00E5A0]' : 'bg-white/40'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Selector de canales */}
              <div className="p-3 flex-1">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] mb-2">
                  Cambiar canal
                </h4>
                <div className="flex flex-col gap-1">
                  {tvChannels.map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setSelectedChannel(ch);
                        setShowSettings(false);
                      }}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left w-full ${
                        selectedChannel.id === ch.id
                          ? 'bg-white/10 border border-white/10'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="text-xs shrink-0">{ch.flag}</span>
                      <span className={`text-[10px] truncate font-[family-name:var(--font-space-grotesk)] ${
                        selectedChannel.id === ch.id ? 'text-white font-medium' : 'text-white/50'
                      }`}>
                        {ch.shortName}
                      </span>
                      {ch.espejoSur && (
                        <span className="text-[7px] px-1 py-0.5 rounded bg-[#00E5A0]/10 text-[#00E5A0]/60 font-bold font-[family-name:var(--font-jetbrains-mono)] ml-auto shrink-0">
                          SUR
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plataformas disponibles */}
              {selectedChannel.alternatives.length > 0 && (
                <div className="p-3 border-b border-white/[0.06]">
                  <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] mb-2">
                    Disponible en
                  </h4>
                  <div className="flex flex-col gap-1">
                    {getAlternativePlatforms(selectedChannel).map(alt => {
                      const am = platformMeta[alt.platform];
                      return (
                        <a
                          key={alt.platform}
                          href={alt.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-all"
                        >
                          <span
                            className="text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center"
                            style={{ backgroundColor: `${am.color}20`, color: am.color }}
                          >
                            {am.icon}
                          </span>
                          <div className="flex-1">
                            <span className="text-[11px] text-white/60 block font-[family-name:var(--font-space-grotesk)]">
                              {am.label}
                            </span>
                            <span className="text-[8px] text-white/20 font-[family-name:var(--font-jetbrains-mono)]">
                              {alt.embeddable ? 'Embebible' : 'Abrir en nueva pestaña'}
                            </span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-white/20 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info del canal */}
              <div className="p-3 border-t border-white/[0.06] bg-black/20">
                <p className="text-[9px] text-white/30 leading-relaxed font-[family-name:var(--font-space-grotesk)]">
                  {selectedChannel.description}
                </p>
                <a
                  href={selectedChannel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-[#00E5A0]/50 hover:text-[#00E5A0] transition-colors font-[family-name:var(--font-jetbrains-mono)] mt-1 block"
                >
                  {selectedChannel.website}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
