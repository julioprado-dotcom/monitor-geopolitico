'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import type { Level } from 'hls.js';

export type QualityLevel = 'auto' | 'low' | 'medium' | 'high';

export interface ConnectionInfo {
  quality: QualityLevel;
  currentBitrate: number | null;   // kbps
  availableLevels: number;         // cuántos niveles de calidad hay
  connected: boolean;
  buffering: boolean;
}

interface HLSPlayerProps {
  src: string;
  /** Calidad inicial — por omisión 'low' para conexiones lentas */
  initialQuality?: QualityLevel;
  /** Callback para reportar estado de conexión */
  onConnectionChange?: (info: ConnectionInfo) => void;
  className?: string;
}

/**
 * Convierte una URL HLS directa en URL del proxy para evitar CORS.
 * Si ya es una URL del proxy, la deja intacta.
 */
function proxifyHlsUrl(url: string): string {
  if (url.startsWith('/api/hls-proxy')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/hls-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

/** Mapa de preferencia de calidad → índice de nivel HLS */
function resolveLevelIndex(levels: Level[], quality: QualityLevel): number {
  if (quality === 'auto' || levels.length === 0) return -1; // auto
  // Ordenar niveles por bitrate ascendente
  const sorted = levels
    .map((l, i) => ({ bitrate: l.bitrate, index: i }))
    .sort((a, b) => a.bitrate - b.bitrate);

  if (sorted.length === 0) return -1;

  switch (quality) {
    case 'low':
      return sorted[0].index;          // nivel más bajo
    case 'medium':
      return sorted[Math.floor(sorted.length / 2)].index;
    case 'high':
      return sorted[sorted.length - 1].index;
    default:
      return -1;
  }
}

export default function HLSPlayer({
  src,
  initialQuality = 'low',
  onConnectionChange,
  className = '',
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const qualityRef = useRef<QualityLevel>(initialQuality);

  const notifyConnection = useCallback((overrides: Partial<ConnectionInfo> = {}) => {
    const hls = hlsRef.current;
    onConnectionChange?.({
      quality: qualityRef.current,
      currentBitrate: hls && hls.currentLevel >= 0 && hls.levels?.[hls.currentLevel]
        ? Math.round(hls.levels[hls.currentLevel].bitrate / 1000)
        : null,
      availableLevels: hls?.levels?.length ?? 0,
      connected: !error && !loading,
      buffering: false,
      ...overrides,
    });
  }, [onConnectionChange, error, loading]);

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  /** Cambiar calidad en vivo (expuesto via ref o event) */
  const setQuality = useCallback((q: QualityLevel) => {
    qualityRef.current = q;
    const hls = hlsRef.current;
    if (!hls) return;
    const idx = resolveLevelIndex(hls.levels ?? [], q);
    hls.currentLevel = idx;
    notifyConnection();
  }, [notifyConnection]);

  // Exponer setQuality globalmente para que el ProyectorWindow pueda accederlo
  useEffect(() => {
    (videoRef.current as any).__hlsSetQuality = setQuality;
    (videoRef.current as any).__hlsGetInfo = () => {
      const hls = hlsRef.current;
      return {
        quality: qualityRef.current,
        levels: hls?.levels?.length ?? 0,
        currentLevel: hls?.currentLevel ?? -1,
      };
    };
  }, [setQuality]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setLoading(true);
    destroyHls();

    notifyConnection({ connected: false, buffering: true });

    // Safari: HLS nativo — usar proxy también para evitar CORS
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = proxifyHlsUrl(src);

      const onLoadedMetadata = () => {
        setLoading(false);
        notifyConnection({ connected: true, buffering: false });
      };
      const onWaiting = () => notifyConnection({ buffering: true });
      const onPlaying = () => notifyConnection({ buffering: false });
      const onError = () => {
        setError('No se pudo cargar el stream HLS');
        notifyConnection({ connected: false, buffering: false });
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('waiting', onWaiting);
      video.addEventListener('playing', onPlaying);
      video.addEventListener('error', onError);
      video.play().catch(() => {});

      return () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('waiting', onWaiting);
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('error', onError);
      };
    }

    // Otros navegadores: hls.js
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,          // desactivado para conexiones lentas
        backBufferLength: 15,           // buffer reducido
        maxBufferLength: 10,            // buffer corto para inicio rápido
        maxMaxBufferLength: 30,
        startFragPrefetch: true,        // prefetch del primer fragmento
        startLevel: -1,                 // arrancar en auto, luego forzamos low
        abrEwmaDefaultEstimate: 200000, // asumir conexión lenta (~200kbps)
        testBandwidth: false,           // no gastar ancho de banda testeando
        progressive: true,              // inicio progresivo
      });
      hlsRef.current = hls;

      // Enrutar a través del proxy para evitar restricciones CORS
      hls.loadSource(proxifyHlsUrl(src));
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
        // Forzar calidad baja al inicio
        if (qualityRef.current !== 'auto' && data.levels.length > 0) {
          const idx = resolveLevelIndex(data.levels, qualityRef.current);
          hls.currentLevel = idx;
        }
        setLoading(false);
        notifyConnection({ connected: true, buffering: false });
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, () => {
        notifyConnection();
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        notifyConnection();
      });

      // Eventos de buffering del elemento <video> (no de hls.js)
      video.addEventListener('waiting', () => {
        notifyConnection({ buffering: true });
      });
      video.addEventListener('playing', () => {
        notifyConnection({ buffering: false });
      });

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Error de red. Reintentando...');
              hls.startLoad();
              notifyConnection({ connected: false, buffering: true });
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Error de reproducción. Recuperando...');
              hls.recoverMediaError();
              break;
            default:
              setError('Stream no disponible.');
              destroyHls();
              notifyConnection({ connected: false, buffering: false });
              break;
          }
        }
      });

      return () => {
        destroyHls();
      };
    } else {
      setError('Tu navegador no soporta HLS.');
      notifyConnection({ connected: false, buffering: false });
    }

    return () => {
      destroyHls();
    };
  }, [src, destroyHls, notifyConnection]);

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted
        autoPlay
      />

      {/* Loading */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#00E5A0]/30 border-t-[#00E5A0] rounded-full animate-spin" />
            <span className="text-[9px] text-white/40 font-[family-name:var(--font-jetbrains-mono)]">
              Conectando...
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-2 max-w-[160px] text-center px-3">
            <svg className="w-5 h-5 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-[9px] text-white/50 leading-tight">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
