import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/youtube-live?channelId=UC...&channelName=...
 *
 * Resuelve dinámicamente el video ID del live stream activo de un canal YouTube.
 *
 * Estrategias (en orden de prioridad):
 *  1. YouTube Search API (con filtro Live) — el más confiable, primer resultado es el live
 *  2. YouTube Browse API — busca en el contenido del canal
 *  3. Scraping de /channel/{id}/live — fallback, afectado por consent page
 *
 * Cache: 5 minutos en memoria.
 */

interface CacheEntry {
  videoId: string | null;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/** YouTube Internal API key (pública, embebida en el cliente web de YouTube) */
const YT_API_KEY = 'AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8';

export async function GET(request: NextRequest) {
  const channelId = request.nextUrl.searchParams.get('channelId');
  const channelName = request.nextUrl.searchParams.get('channelName') || '';

  if (!channelId || !channelId.startsWith('UC')) {
    return NextResponse.json(
      { error: 'Se requiere channelId válido (formato UC...)' },
      { status: 400 }
    );
  }

  // Verificar cache
  const cached = cache.get(channelId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({
      channelId,
      videoId: cached.videoId,
      cached: true,
    });
  }

  try {
    let videoId: string | null = null;

    // Estrategia 1: YouTube Search API (con filtro Live) — más confiable
    if (channelName) {
      videoId = await resolveViaSearch(channelId, channelName);
    }

    // Estrategia 2: Browse API del canal
    if (!videoId) {
      videoId = await resolveViaBrowse(channelId, channelName);
    }

    // Estrategia 3: Scraping (fallback)
    if (!videoId) {
      videoId = await resolveViaScraping(channelId);
    }

    // Guardar en cache
    cache.set(channelId, { videoId, timestamp: Date.now() });

    return NextResponse.json({
      channelId,
      videoId,
      cached: false,
    });
  } catch (error: any) {
    console.error(`Error resolviendo live para ${channelId}:`, error.message);

    if (cached?.videoId) {
      return NextResponse.json({
        channelId,
        videoId: cached.videoId,
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json(
      { error: 'No se pudo resolver el live stream', channelId },
      { status: 502 }
    );
  }
}

/**
 * Estrategia 1: YouTube Search API con filtro Live
 *
 * Busca "{channelName} live" con el filtro de solo streams en vivo.
 * El primer resultado suele ser el live 24/7 del canal.
 * Luego verifica con oEmbed que el video pertenece al canal correcto.
 */
async function resolveViaSearch(channelId: string, channelName: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/youtubei/v1/search?key=${YT_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240101.00.00',
              hl: 'en',
              gl: 'US',
            },
          },
          params: 'EgJAAQ%3D%3D', // Filtro: Live
          query: `${channelName} live`,
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    // Extraer videoIds del response — primero mediante parsing estructurado (más confiable)
    // y luego mediante regex como fallback
    const videoIds = extractVideoIds(data);

    if (videoIds.length === 0) return null;

    // Verificar los primeros candidatos con oEmbed para confirmar que
    // el video pertenece al canal correcto y es un stream en vivo
    for (const vid of videoIds.slice(0, 5)) {
      const verified = await verifyVideoBelongsToChannel(vid, channelId, channelName);
      if (verified) return vid;
    }

    return null;
  } catch (err) {
    console.error(`Error en resolveViaSearch(${channelId}):`, err);
    return null;
  }
}

/**
 * Estrategia 2: Browse API del canal
 *
 * Obtiene el contenido del canal y busca videos con badge LIVE
 * que pertenezcan al canal (channelId cerca del videoId en el JSON).
 */
async function resolveViaBrowse(channelId: string, channelName?: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/youtubei/v1/browse?key=${YT_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240101.00.00',
              hl: 'en',
              gl: 'US',
            },
          },
          browseId: channelId,
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    // Buscar videos con badge LIVE en el contenido del canal
    const liveBadgeVids = extractLiveVideoIds(data);

    // Para cada video con LIVE badge, verificar con oEmbed
    for (const vid of liveBadgeVids.slice(0, 5)) {
      const verified = await verifyVideoBelongsToChannel(vid, channelId, channelName);
      if (verified) return vid;
    }

    return null;
  } catch (err) {
    console.error(`Error en resolveViaBrowse(${channelId}):`, err);
    return null;
  }
}

/**
 * Estrategia 3: Scraping de la página /live del canal (fallback)
 */
async function resolveViaScraping(channelId: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/channel/${channelId}/live`,
      {
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(8000),
      }
    );

    const html = await response.text();
    const finalUrl = response.url;

    // Si YouTube redirigió a un watch URL
    const urlVideoMatch = finalUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (urlVideoMatch && isPageLive(html)) {
      return urlVideoMatch[1];
    }

    // Buscar liveStreamability (con espacio opcional después de los dos puntos)
    const liveStreamMatch = html.match(/"liveStreamability"[\s\S]*?"videoId":\s*"([a-zA-Z0-9_-]{11})"/);
    if (liveStreamMatch) {
      return liveStreamMatch[1];
    }

    return null;
  } catch (err) {
    console.error(`Error en resolveViaScraping(${channelId}):`, err);
    return null;
  }
}

/**
 * Verifica que un video pertenece al canal especificado usando oEmbed.
 * Compara por channelId (UCxxx) en author_url o por coincidencia del
 * nombre del canal con el author_name del video.
 */
async function verifyVideoBelongsToChannel(
  videoId: string,
  channelId: string,
  channelName?: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) return false;

    const data = await res.json();
    const authorUrl: string = data.author_url || '';
    const authorName: string = (data.author_name || '').toLowerCase();

    // Método 1: Verificar si el author_url contiene el channelId (UCxxx)
    if (authorUrl.includes(channelId)) {
      return true;
    }

    // Método 2: Verificar si el author_name coincide con el channelName proporcionado
    if (channelName) {
      const normalizedChannelName = channelName.toLowerCase();
      // Coincidencia exacta
      if (authorName === normalizedChannelName) {
        return true;
      }
      // Rechazar si el author_name contiene "english" pero la búsqueda no (y viceversa)
      // Evita que "En Vivo teleSUR" acepte videos de "TeleSUR English"
      const authorHasEnglish = authorName.includes('english');
      const queryHasEnglish = normalizedChannelName.includes('english');
      if (authorHasEnglish !== queryHasEnglish) {
        return false;
      }
      // Coincidencia parcial (el author_name puede ser más corto o más largo)
      if (
        authorName.includes(normalizedChannelName) ||
        normalizedChannelName.includes(authorName)
      ) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Verifica que la página HTML corresponde a un live stream activo.
 */
function isPageLive(html: string): boolean {
  return (
    html.includes('liveStreamability') ||
    html.includes('"isLive":true') ||
    html.includes('"isLive": true') ||
    html.includes('"live":true') ||
    html.includes('"live": true') ||
    html.includes('"style":"LIVE"') ||
    html.includes('"style": "LIVE"')
  );
}

/**
 * Extrae videoIds del JSON de respuesta de YouTube Search API.
 * Usa parsing estructurado (recursivo) como método principal, y regex como fallback.
 * Esto evita problemas con espacios en JSON.stringify.
 */
function extractVideoIds(data: unknown): string[] {
  const found: string[] = [];

  function walk(obj: unknown, depth = 0) {
    if (depth > 20 || found.length >= 30) return; // límite de profundidad y cantidad
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        for (const item of obj) walk(item, depth + 1);
      } else {
        const record = obj as Record<string, unknown>;
        // Si este objeto tiene un videoId, extraerlo
        if (typeof record.videoId === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(record.videoId)) {
          found.push(record.videoId);
        }
        // Recorrer valores hijos
        for (const val of Object.values(record)) {
          walk(val, depth + 1);
        }
      }
    }
  }

  walk(data);

  // Fallback con regex si el parsing estructurado no encontró nada
  if (found.length === 0) {
    const jsonStr = JSON.stringify(data);
    const regexMatches = [...jsonStr.matchAll(/"videoId":\s*"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1]);
    found.push(...regexMatches);
  }

  // Devolver únicos preservando orden
  return [...new Set(found)];
}

/**
 * Extrae videoIds que tienen badge LIVE del JSON de respuesta de YouTube Browse API.
 * Usa parsing estructurado como método principal.
 */
function extractLiveVideoIds(data: unknown): string[] {
  const found: string[] = [];

  function walk(obj: unknown, depth = 0, hasLiveBadge = false) {
    if (depth > 20 || found.length >= 20) return;
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        for (const item of obj) walk(item, depth + 1, hasLiveBadge);
      } else {
        const record = obj as Record<string, unknown>;

        // Detectar badge LIVE en este nivel
        const badges = record.badges;
        let currentHasLive = hasLiveBadge;
        if (badges && Array.isArray(badges)) {
          for (const badge of badges) {
            if (badge && typeof badge === 'object') {
              const b = badge as Record<string, unknown>;
              const mdbr = b.metadataBadgeRenderer as Record<string, unknown> | undefined;
              if (mdbr && mdbr.style === 'LIVE') {
                currentHasLive = true;
              }
              // También verificar en label
              if (mdbr && typeof mdbr.label === 'string' && mdbr.label.toUpperCase().includes('LIVE')) {
                currentHasLive = true;
              }
            }
          }
        }

        // Verificar thumbnail badges (otra ubicación donde aparece LIVE)
        const thumbnailOverlays = record.thumbnailOverlays;
        if (thumbnailOverlays && Array.isArray(thumbnailOverlays)) {
          for (const overlay of thumbnailOverlays) {
            if (overlay && typeof overlay === 'object') {
              const o = overlay as Record<string, unknown>;
              const tor = o.thumbnailOverlayTimeStatusRenderer as Record<string, unknown> | undefined;
              if (tor && tor.style === 'LIVE') {
                currentHasLive = true;
              }
            }
          }
        }

        // Si este objeto tiene videoId y badge LIVE, agregar
        if (typeof record.videoId === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(record.videoId)) {
          if (currentHasLive) {
            found.push(record.videoId);
          }
        }

        // Recorrer hijos
        for (const val of Object.values(record)) {
          walk(val, depth + 1, currentHasLive);
        }
      }
    }
  }

  walk(data);

  // Fallback con regex si no se encontró nada
  if (found.length === 0) {
    const jsonStr = JSON.stringify(data);
    const regexMatches = [
      ...new Set([
        ...[...jsonStr.matchAll(/"style":\s*"LIVE"[\s\S]{0,5000}?"videoId":\s*"([a-zA-Z0-9_-]{11})"/g)].map((m) => m[1]),
        ...[...jsonStr.matchAll(/"videoId":\s*"([a-zA-Z0-9_-]{11})"[\s\S]{0,5000}?"style":\s*"LIVE"/g)].map((m) => m[1]),
      ]),
    ];
    found.push(...regexMatches);
  }

  return [...new Set(found)];
}
