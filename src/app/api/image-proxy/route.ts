import { NextRequest, NextResponse } from 'next/server';

const WHITELIST = [
  'rt.com',
  'rtd.rt.com',
  'img.rt.com',
  'cdn.rt.com',
  'aljazeera.com',
  'telesurtv.net',
  'cctv.com',
  'cgtn.com',
  'france24.com',
  'dw.com',
  'presstv.ir',
  'trtworld.com',
];

function isDomainAllowed(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return WHITELIST.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain),
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (request.method !== 'GET') {
    return NextResponse.json({ error: 'Método no permitido' }, { status: 405 });
  }

  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Parámetro url requerido' }, { status: 400 });
  }

  if (!isDomainAllowed(imageUrl)) {
    return NextResponse.json(
      { error: 'Dominio no permitido' },
      { status: 403 },
    );
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'image/*,*/*',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error al obtener la imagen: HTTP ' + response.status },
        { status: 502 },
      );
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al obtener la imagen: ' + message },
      { status: 502 },
    );
  }
}
