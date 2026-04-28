import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_DOMAINS = [
  'rt.com', 'rtd.rt.com',
  'aljazeera.com', 'telesurtv.net',
  'cctv.com', 'france24.com',
  'dw.com', 'presstv.ir',
  'trtworld.com', 'cgtn.com',
];

const DISCLAIMER = 'Contenido original de su fuente. El Monitor Geopolítico no se atribuye la propiedad del contenido. Análisis independiente con Óptica Sur Global.';

/**
 * Sanitización XSS: elimina scripts, event handlers, javascript: URLs, y elementos peligrosos.
 * Cumple PROPUESTAS_MEJORA.md §1.1 — vector de ataque crítico.
 */
function sanitizeHtml(html: string): string {
  let clean = html;
  // Remove script tags and content
  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '');
  // Remove style tags and content
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Remove iframe, object, embed, form, link[rel=import]
  clean = clean.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  clean = clean.replace(/<object[\s\S]*?<\/object>/gi, '');
  clean = clean.replace(/<embed[^>]*>/gi, '');
  clean = clean.replace(/<form[\s\S]*?<\/form>/gi, '');
  clean = clean.replace(/<link[^>]*rel=["']import["'][^>]*>/gi, '');
  // Remove all on* event handlers (onclick, onload, onerror, onmouseover, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|\S+)/gi, '');
  // Remove javascript: and vbscript: URLs in href/src/action attributes
  clean = clean.replace(/(?:href|src|action|formaction|data|background)\s*=\s*["']?(?:javascript|vbscript|data)\s*:[^"'>\s]*/gi, '');
  // Remove <meta http-equiv="refresh"> redirects
  clean = clean.replace(/<meta[^>]*http-equiv[\s]*=[\s]*["']?refresh["']?[^>]*>/gi, '');
  // Remove <base> tag (can hijack relative URLs)
  clean = clean.replace(/<base[^>]*>/gi, '');
  return clean;
}

function isUrlAllowed(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
  } catch { return false; }
}

function getDomainName(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '').split('.')[0].toUpperCase();
  } catch { return 'Fuente'; }
}

function extractContent(html: string, url: string) {
  const get = (re: RegExp) => html.match(re)?.[1]?.trim() || '';
  const og = (p: string) => get(new RegExp(`<meta[^>]*property="og:${p}"[^>]*content="([^"]+)"`, 'i'));

  const title = og('title') || get(/<title[^>]*>([^<]+)<\/title>/i);
  const desc = og('description') || get(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
  const author = get(/<meta[^>]*name="author"[^>]*content="([^"]+)"/i);
  const date = get(/<meta[^>]*property="article:published_time"[^>]*content="([^"]+)"/i);
  const image = og('image');
  const sourceName = getDomainName(url);
  const sourceUrl = new URL(url).origin;

  // Extracto breve para previews (tarjetas, notificaciones) — máximo 300 chars
  const article = html.match(/<article[\s\S]*?<\/article>/i)?.[0] || '';
  const excerpt = article
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 300);

  // Contenido ampliado para visualización dentro del Monitor — con sanitización XSS
  const fullContent = sanitizeHtml(article)
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .trim();

  // Textos para compartir — artículo solo con enlace, análisis con encabezado + enlace
  const shareArticle = sourceName + ': ' + title + ' → ' + url;
  const shareAnalysis = '📊 Análisis del Monitor Geopolítico\nFuente: ' + sourceName + ' — ' + title + '\n→ ' + url;

  return {
    url,
    sourceName,
    sourceUrl,
    title,
    description: desc,
    author,
    publishedAt: date,
    excerpt,
    fullContent,
    image,
    shareArticle,
    shareAnalysis,
    analysisUrl: '/api/analyze?url=' + encodeURIComponent(url),
    disclaimer: DISCLAIMER,
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) return NextResponse.json({ error: 'url requerida' }, { status: 400 });
  if (!isUrlAllowed(targetUrl)) return NextResponse.json({ error: 'Dominio no permitido' }, { status: 403 });

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,*/*',
        'Accept-Language': 'es,en;q=0.5',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) return NextResponse.json({ error: 'HTTP ' + response.status }, { status: response.status });

    const html = await response.text();
    const content = extractContent(html, targetUrl);

    return NextResponse.json(content, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}
