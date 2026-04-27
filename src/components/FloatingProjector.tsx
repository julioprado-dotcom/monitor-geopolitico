'use client';

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { X, Minimize2, GripHorizontal } from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeLiveApiUrl, type TVChannel } from '@/data/channels';

const HLSPlayer = lazy(() => import('@/components/HLSPlayer'));

interface FloatingProjectorProps {
  channel: TVChannel;
  onClose: () => void;
  /** Minimizar = volver al mini proyector sin destruir el stream */
  onMinimize?: () => void;
}

export default function FloatingProjector({ channel, onClose, onMinimize }: FloatingProjectorProps) {
  const [selectedChannel] = useState<TVChannel>(channel);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // YouTube live video ID
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);

  // ── Drag state (lightweight, cero dependencias) ──
  const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number } | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null); // null = default CSS position
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (selectedChannel.streamType === 'youtube') {
      resolveYouTubeLive(selectedChannel.streamUrl, selectedChannel.shortName);
    }
  }, [selectedChannel.id, resolveYouTubeLive]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // ── Drag handlers (solo en header, no en video) ──
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: rect.left,
      offsetY: rect.top,
    };

    const handleMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      const newX = dragRef.current.offsetX + dx;
      const newY = dragRef.current.offsetY + dy;
      // Clamp to viewport
      const clampedX = Math.max(0, Math.min(newX, window.innerWidth - 390));
      const clampedY = Math.max(0, Math.min(newY, window.innerHeight - 100));
      setPosition({ x: clampedX, y: clampedY });
    };

    const handleUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseup', handleUp);
  }, []);

  // Touch drag para móvil
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      offsetX: rect.left,
      offsetY: rect.top,
    };

    const handleMove = (ev: TouchEvent) => {
      if (!dragRef.current) return;
      const t = ev.touches[0];
      const dx = t.clientX - dragRef.current.startX;
      const dy = t.clientY - dragRef.current.startY;
      const newX = dragRef.current.offsetX + dx;
      const newY = dragRef.current.offsetY + dy;
      const clampedX = Math.max(0, Math.min(newX, window.innerWidth - 300));
      const clampedY = Math.max(0, Math.min(newY, window.innerHeight - 100));
      setPosition({ x: clampedX, y: clampedY });
    };

    const handleEnd = () => {
      dragRef.current = null;
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
  }, []);

  // Estado de carga
  const isConnecting =
    (selectedChannel.streamType === 'youtube' && ytLoading && !youtubeVideoId) ||
    (selectedChannel.streamType === 'iframe' && !iframeLoaded);

  return (
    <div
      ref={containerRef}
      className="fixed z-[60] animate-fade-in"
      style={position
        ? { left: position.x, top: position.y, width: 'min(390px, calc(100vw - 2rem))' }
        : {
            left: 'max(1rem, calc(50vw - 768px + 240px))',
            top: '12.5rem',
            width: 'min(390px, calc(100vw - 2rem))',
          }
      }
    >
      <div className="glass-strong rounded-xl overflow-hidden flex flex-col neon-glow-strong border border-white/[0.08] shadow-2xl shadow-black/50">
        {/* ── Header (draggable) ── */}
        <div
          className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between bg-black/30 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleDragStart}
          onTouchStart={handleTouchStart}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isConnecting ? (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
              </span>
            ) : (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5A0] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5A0]" />
              </span>
            )}
            <span className={`text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] ${
              isConnecting ? 'text-yellow-400/80' : 'text-[#00E5A0]/80'
            }`}>
              {isConnecting ? 'Conectando...' : 'Proyector'}
            </span>
            <span className="text-xs shrink-0">{selectedChannel.flag}</span>
            <span className="text-[10px] font-medium text-white/60 font-[family-name:var(--font-space-grotesk)] truncate">
              {selectedChannel.shortName}
            </span>
            {!isConnecting && (
              <span className="text-[7px] px-1 py-0.5 rounded bg-red-500/80 text-white font-bold font-[family-name:var(--font-jetbrains-mono)] animate-pulse shrink-0">
                EN VIVO
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Grip indicator */}
            <GripHorizontal className="w-3.5 h-3.5 text-white/15" />

            {/* Minimizar al mini */}
            {onMinimize && (
              <button
                onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                className="flex items-center justify-center w-6 h-6 rounded-md bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                title="Volver al mini proyector"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
            )}

            {/* Cerrar */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="flex items-center justify-center w-6 h-6 rounded-md bg-red-500/10 border border-red-500/20 text-red-400/70 hover:text-red-400 hover:bg-red-500/20 transition-colors"
              title="Cerrar proyector"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Video ── */}
        <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
          {selectedChannel.streamType === 'youtube' ? (
            youtubeVideoId ? (
              <iframe
                key={selectedChannel.id + youtubeVideoId}
                src={getYouTubeEmbedUrl(youtubeVideoId, true)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                title={`${selectedChannel.shortName} en vivo`}
              />
            ) : ytError ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black/90">
                <svg className="w-5 h-5 text-red-400/70 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-[9px] text-white/50 text-center px-4">{ytError}</p>
                <button
                  onClick={() => resolveYouTubeLive(selectedChannel.streamUrl, selectedChannel.shortName)}
                  className="text-[10px] text-[#00E5A0]/60 hover:text-[#00E5A0] font-[family-name:var(--font-jetbrains-mono)] mt-2"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black">
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
              <div className="w-full h-full flex items-center justify-center bg-black">
                <div className="w-6 h-6 border-2 border-[#00E5A0]/30 border-t-[#00E5A0] rounded-full animate-spin" />
              </div>
            }>
              <HLSPlayer
                key={selectedChannel.id}
                src={selectedChannel.streamUrl}
                initialQuality="medium"
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
