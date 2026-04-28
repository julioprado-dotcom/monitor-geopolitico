import { NextRequest, NextResponse } from 'next/server';

const RSS_FEEDS: Record<string, Record<string, string>> = {
  rt: {
    es: 'https://rt.com/rss/',
    en: 'https://rt.com/rss/news/',
    ru: 'https://rtd.rt.com/rss/',
  },
  aljazeera: {
    en: 'https://www.aljazeera.com/xml/rss/all.xml',
    ar: 'https://www.aljazeera.net/aljazeera.rss',
  },
  telesur: {
    es: 'https://www.telesurtv.net/rss/',
  },
  france24: {
    es: 'https://www.france24.com/es/rss/',
    en: 'https://www.france24.com/en/rss/',
    fr: 'https://www.france24.com/fr/rss/',
  },
  dw: {
    es: 'https://rss.dw.com/xml/rss-es-all',
    en: 'https://rss.dw.com/xml/rss-en-all',
  },
  presstv: {
    en: 'https://www.presstv.ir/rss/',
  },
  trtworld: {
    en: 'https://www.trtworld.com/rss',
  },
  cgtn: {
    en: 'https://news.cgtn.com/rss/',
    zh: 'https://news.cgtn.com/resource/rss/rsslist.xml',
  },
  cctv: {
    zh: 'https://news.cctv.com/rss/',
  },
};

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
  proxyUrl: string;
}

function getTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
    || xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : null;
}

function getAttr(xml: string, tag: string, attr: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*${attr}="([^"]+)"`, 'i'))
    || xml.match(new RegExp(`<${tag}[^>]*${attr}='([^']+)'`, 'i'));
  return match ? match[1].trim() : null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];

  // Match each <item> block (non-greedy)
  const itemRegex = /<item[\s\S]*?>([\s\S]*?)<\/item>/gi;
  let itemMatch: RegExpExecArray | null;

  while ((itemMatch = itemRegex.exec(xml)) !== null && items.length < 15) {
    const block = itemMatch[1];

    const title = getTag(block, 'title');
    const link = getTag(block, 'link');
    const description = getTag(block, 'description');
    const pubDate = getTag(block, 'pubDate');

    if (!title) continue;

    // Try to extract an image from enclosure or media:content or <image> tag
    const enclosureUrl = getAttr(block, 'enclosure', 'url');
    const mediaUrl = getAttr(block, 'media:content', 'url');
    const mediaThumbnailUrl = getAttr(block, 'media:thumbnail', 'url');
    const imageTagUrl = getTag(block, 'image');
    // Also try extracting first <img> from description/encoded content
    const imgFromDesc = description?.match(/<img[^>]+src="([^"]+)"/i)?.[1];

    const image = enclosureUrl || mediaUrl || mediaThumbnailUrl || (imageTagUrl && !imageTagUrl.includes('<') ? imageTagUrl : null) || imgFromDesc || undefined;

    const cleanDescription = description ? stripHtml(description).substring(0, 300) : '';
    const cleanLink = link || '';

    items.push({
      title: stripHtml(title),
      link: cleanLink,
      description: cleanDescription,
      pubDate: pubDate || '',
      image: image ? image.trim() : undefined,
      proxyUrl: cleanLink ? '/api/content-proxy?url=' + encodeURIComponent(cleanLink) : '',
    });
  }

  return items;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  const lang = searchParams.get('lang') || 'es';

  if (!source || !RSS_FEEDS[source]) {
    return NextResponse.json(
      { error: 'Fuente no válida. Fuentes disponibles: ' + Object.keys(RSS_FEEDS).join(', ') },
      { status: 400 },
    );
  }

  const feedUrl = RSS_FEEDS[source][lang];

  if (!feedUrl) {
    const availableLangs = Object.keys(RSS_FEEDS[source]).join(', ');
    return NextResponse.json(
      { error: `Idioma "${lang}" no disponible para "${source}". Idiomas disponibles: ${availableLangs}` },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': lang + ',en;q=0.5',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error del servidor de origen: HTTP ${response.status}` },
        { status: 502 },
      );
    }

    const xml = await response.text();
    const items = parseRss(xml);

    return NextResponse.json({
      source,
      language: lang,
      itemCount: items.length,
      fetchedAt: new Date().toISOString(),
      items,
    }, {
      headers: { 'Cache-Control': 'public, max-age=120' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'No se pudo obtener el feed: ' + message },
      { status: 502 },
    );
  }
}
