import { NextRequest, NextResponse } from 'next/server';

/**
 * HLS Proxy — resuelve restricciones CORS para streams HLS.
 *
 * Uso: /api/hls-proxy?url=<encoded_url>
 *
 * - Archivos .m3u8: reescribe URLs internas para que también pasen por el proxy.
 * - Segmentos .ts / .key / .m4s: se transmiten tal cual.
 * - Soporta playlists multi-nivel (master → variant → segments).
 */

// Dominios permitidos (seguridad — solo canales del monitor)
const ALLOWED_HOSTS = [
  'rt-glb.rttv.com',
  'rt-us.rttv.com',
  'rt-uk.rttv.com',
  'live.presstv.ir',
  'live3.presstv.ir',
  'tv.picta.cu',
  'tvhd.picta.cu',
  'mblesmain01.telesur.ultrabase.net',
  'cdn2.mhlmi.com',
];

function isAllowed(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return ALLOWED_HOSTS.some(h => host === h || host.endsWith('.' + h));
  } catch {
    return false;
  }
}

/** Resolver URL relativa contra una base */
function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  try {
    return new URL(url, baseUrl).href;
  } catch {
    if (url.startsWith('/')) {
      const parsed = new URL(baseUrl);
      return `${parsed.protocol}//${parsed.host}${url}`;
    }
    return baseUrl + url;
  }
}

/** Reescribir URLs dentro de un m3u8 para que pasen por el proxy */
function rewriteM3U8(content: string, originalUrl: string): string {
  const baseUrl = originalUrl.substring(0, originalUrl.lastIndexOf('/') + 1);
  const proxyBase = '/api/hls-proxy?url=';

  const lines = content.split('\n');
  return lines
    .map((line) => {
      const trimmed = line.trim();

      // Líneas vacías
      if (!trimmed) return line;

      // Tags con atributo URI="..."
      if (trimmed.startsWith('#') && trimmed.includes('URI="')) {
        return trimmed.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
          const absolute = resolveUrl(uri, baseUrl);
          return `URI="${proxyBase}${encodeURIComponent(absolute)}"`;
        });
      }

      // Otros tags — dejar intactos
      if (trimmed.startsWith('#')) return line;

      // Línea de URL (segmento o sub-playlist)
      const absolute = resolveUrl(trimmed, baseUrl);
      return `${proxyBase}${encodeURIComponent(absolute)}`;
    })
    .join('\n');
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Falta parámetro url' }, { status: 400 });
  }

  // Seguridad: solo dominios permitidos
  if (!isAllowed(url)) {
    return NextResponse.json({ error: 'Dominio no permitido' }, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error upstream: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';

    // Detectar si es un playlist m3u8
    const isM3U8 =
      contentType.includes('mpegurl') ||
      contentType.includes('mpeg-url') ||
      url.endsWith('.m3u8') ||
      url.includes('.m3u8');

    if (isM3U8) {
      const text = await response.text();

      // Verificar que realmente es un m3u8
      if (text.trimStart().startsWith('#EXTM3U') || text.includes('#EXT-X')) {
        const rewritten = rewriteM3U8(text, url);
        return new NextResponse(rewritten, {
          headers: {
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache, no-store',
          },
        });
      }
    }

    // Contenido binario (segmentos .ts, .m4s, claves, etc.)
    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType || 'video/MP2T',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    const msg = err?.name === 'TimeoutError' ? 'Timeout del servidor upstream' : 'Error de proxy';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
