/**
 * Canales de TV en vivo — Monitor Geopolítico
 *
 * Fuentes "Espejo Sur": medios del Sur Global y perspectivas no occidentales.
 *
 * Tipos de stream:
 *  - youtube:  Embed via iframe usando /embed/VIDEO_ID (resuelto via API)
 *  - hls:      Stream HLS directo (.m3u8) reproducido con hls.js (via proxy)
 *  - iframe:   Embed directo via iframe (Odysee, teveo.cu, Dailymotion, etc.)
 *
 * IMPORTANTE:
 *  - /embed/live_stream?channel= ya NO funciona (deprecado por YouTube).
 *  - RT fue eliminado de YouTube. Se usa Odysee embed.
 *  - Press TV fue eliminado de YouTube. Se usa Odysee embed.
 *  - Cubavisión usa teveo.cu embed (plataforma oficial cubana).
 *  - Los streams HLS están detrás de CORS — se usa proxy o iframe embed.
 */

export type StreamType = 'youtube' | 'hls' | 'iframe';

export type PlatformId = 'youtube' | 'hls' | 'iframe' | 'rumble' | 'odysee' | 'dailymotion' | 'website';

export interface PlatformLink {
  platform: PlatformId;
  url: string;
  /** Si true, se puede embeber en iframe/player dentro del monitor */
  embeddable: boolean;
  /** Etiqueta corta para la UI */
  label: string;
}

export interface TVChannel {
  id: string;
  name: string;
  shortName: string;
  region: string;
  country: string;
  flag: string;
  /** Stream principal (el que se reproduce en el proyector) */
  streamType: StreamType;
  /**
   * URL del stream principal:
   *  - youtube → YouTube channel ID (empieza con UC)
   *  - hls     → URL del .m3u8
   *  - iframe  → URL del iframe embed (Odysee, teveo, Dailymotion, etc.)
   */
  streamUrl: string;
  /** Plataformas alternativas donde también se puede ver el canal */
  alternatives: PlatformLink[];
  description: string;
  color: string;
  espejoSur: boolean;
  website: string;
}

/**
 * YouTube embed URL con VIDEO_ID (método actual, /embed/live_stream está deprecado).
 * El videoId se obtiene dinámicamente via /api/youtube-live?channelId=...
 */
export function getYouTubeEmbedUrl(videoId: string, autoplay = false): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1&playsinline=1&controls=0&showinfo=0&iv_load_policy=3&disablekb=1`;
}

/**
 * API URL para resolver el video ID del live de un canal.
 * Se pasa channelName para que la API use YouTube Search (más confiable).
 */
export function getYouTubeLiveApiUrl(channelId: string, channelName?: string): string {
  const params = new URLSearchParams({ channelId });
  if (channelName) params.set('channelName', channelName);
  return `/api/youtube-live?${params.toString()}`;
}

/** Obtener la plataforma principal de un canal (para mostrar en UI) */
export function getPrimaryPlatformId(channel: TVChannel): PlatformId {
  if (channel.streamType === 'youtube') return 'youtube';
  if (channel.streamType === 'iframe') return 'iframe';
  return 'hls';
}

/** Etiqueta y color para cada plataforma en la UI */
export const platformMeta: Record<PlatformId, { label: string; color: string; icon: string }> = {
  youtube:    { label: 'YouTube',    color: '#FF0000', icon: '▶' },
  hls:        { label: 'Stream',     color: '#00E5A0', icon: '◉' },
  iframe:     { label: 'Embed',      color: '#A78BFA', icon: '◻' },
  rumble:     { label: 'Rumble',     color: '#85C742', icon: '⧖' },
  odysee:     { label: 'Odysee',     color: '#EF6C00', icon: '⊙' },
  dailymotion:{ label: 'Dailymotion',color: '#0066DC', icon: '▸' },
  website:    { label: 'Web',        color: '#60A5FA', icon: '↗' },
};

export const tvChannels: TVChannel[] = [
  // ── RT — Odysee embed (eliminado de YouTube, HLS con CORS) ──
  {
    id: 'rt',
    name: 'RT — Russia Today',
    shortName: 'RT',
    region: 'EUROPA',
    country: 'Rusia',
    flag: '\u{1F1F7}\u{1F1FA}',
    streamType: 'iframe',
    streamUrl: 'https://odysee.com/$/embed/livestream_RT/d?autoplay=1',
    alternatives: [
      { platform: 'rumble', url: 'https://rumble.com/c/RTNews', embeddable: false, label: 'Rumble' },
      { platform: 'odysee', url: 'https://odysee.com/@RT:fd/livestream_RT:d', embeddable: false, label: 'Odysee' },
      { platform: 'website', url: 'https://www.rt.com/on-air/', embeddable: false, label: 'RT Live' },
    ],
    description: 'Perspectiva rusa sobre geopolítica global. Cobertura 24/7 en inglés. Eliminado de YouTube — disponible vía Odysee, Rumble y web.',
    color: '#00E5A0',
    espejoSur: true,
    website: 'https://www.rt.com/',
  },
  {
    id: 'rt-es',
    name: 'RT en Español',
    shortName: 'RT Español',
    region: 'LATAM',
    country: 'Rusia',
    flag: '\u{1F1F7}\u{1F1FA}',
    streamType: 'iframe',
    streamUrl: 'https://odysee.com/$/embed/envivo_transmision_rt/6?autoplay=1',
    alternatives: [
      { platform: 'rumble', url: 'https://rumble.com/c/RTES', embeddable: false, label: 'Rumble' },
      { platform: 'odysee', url: 'https://odysee.com/@ActualidadRT:9/envivo_transmision_rt:6', embeddable: false, label: 'Odysee' },
      { platform: 'website', url: 'https://actualidad.rt.com/en_vivo', embeddable: false, label: 'RT en Vivo' },
    ],
    description: 'Versión en español de RT. Perspectiva rusa sobre geopolítica global con cobertura de Latinoamérica, conflictos y multipolaridad. Eliminado de YouTube — disponible vía Odysee, Rumble y web.',
    color: '#2ECC71',
    espejoSur: true,
    website: 'https://actualidad.rt.com/',
  },

  // ── Medio Oriente ────────────────────────────────────────
  {
    id: 'aljazeera',
    name: 'Al Jazeera English',
    shortName: 'Al Jazeera',
    region: 'MEDIO ORIENTE',
    country: 'Catar',
    flag: '\u{1F1F0}\u{1F1E6}',
    streamType: 'youtube',
    streamUrl: 'UCNye-wNBqNL5ZzHSJj3l8Bg',
    alternatives: [
      { platform: 'rumble', url: 'https://rumble.com/c/AlJazeeraEnglish', embeddable: false, label: 'Rumble' },
      { platform: 'odysee', url: 'https://odysee.com/@aljazeera', embeddable: false, label: 'Odysee' },
      { platform: 'website', url: 'https://www.aljazeera.com/live/', embeddable: false, label: 'AJ Live' },
    ],
    description: 'Red panaráabe con cobertura global. Referente en información de Medio Oriente, África y Sur Global.',
    color: '#FA9000',
    espejoSur: true,
    website: 'https://www.aljazeera.com/',
  },
  {
    id: 'trtworld',
    name: 'TRT World',
    shortName: 'TRT World',
    region: 'MEDIO ORIENTE',
    country: 'Turquía',
    flag: '\u{1F1F9}\u{1F1F7}',
    streamType: 'youtube',
    streamUrl: 'UC7fWeaHhqgM4Ry-RMpM2YYw',
    alternatives: [
      { platform: 'rumble', url: 'https://rumble.com/c/TRTWorld', embeddable: false, label: 'Rumble' },
      { platform: 'odysee', url: 'https://odysee.com/@trtworld', embeddable: false, label: 'Odysee' },
      { platform: 'website', url: 'https://www.trtworld.com/live', embeddable: false, label: 'TRT Live' },
    ],
    description: 'Perspectiva turca e islámica sobre eventos globales. Cobertura de conflictos y diplomacia desde Estambul.',
    color: '#E03030',
    espejoSur: true,
    website: 'https://www.trtworld.com/',
  },
  {
    id: 'almayadeen',
    name: 'Al Mayadeen',
    shortName: 'Al Mayadeen',
    region: 'MEDIO ORIENTE',
    country: 'Líbano',
    flag: '\u{1F1F1}\u{1F1E7}',
    streamType: 'youtube',
    streamUrl: 'UCb3Uix8CTbwSqEkXsAuR-UQ',
    alternatives: [
      { platform: 'website', url: 'https://www.almayadeen.net/live', embeddable: false, label: 'Al Mayadeen Live' },
    ],
    description: 'Red panaráabe con sede en Beirut. Línea editorial independiente y anti-imperialista. Cobertura de la resistencia palestina, libanesa y del eje regional.',
    color: '#D4A017',
    espejoSur: true,
    website: 'https://www.almayadeen.net/',
  },
  {
    id: 'presstv',
    name: 'Press TV',
    shortName: 'Press TV',
    region: 'MEDIO ORIENTE',
    country: 'Irán',
    flag: '\u{1F1EE}\u{1F1F7}',
    streamType: 'iframe',
    streamUrl: 'https://odysee.com/$/embed/Presstvlivestream/e?autoplay=1',
    alternatives: [
      { platform: 'rumble', url: 'https://rumble.com/c/PressTV', embeddable: false, label: 'Rumble' },
      { platform: 'odysee', url: 'https://odysee.com/@PressTV:2/Presstvlivestream:e', embeddable: false, label: 'Odysee' },
      { platform: 'website', url: 'https://www.presstv.ir/Live.aspx', embeddable: false, label: 'PressTV Live' },
    ],
    description: 'Perspectiva iraní sobre Medio Oriente y geopolítica global. Cobertura desde Teherán de la resistencia y el eje anti-imperialista.',
    color: '#239F40',
    espejoSur: true,
    website: 'https://www.presstv.ir/',
  },

  // ── Asia ─────────────────────────────────────────────────
  {
    id: 'cgtn',
    name: 'CGTN — China Global TV',
    shortName: 'CGTN',
    region: 'ASIA',
    country: 'China',
    flag: '\u{1F1E8}\u{1F1F3}',
    streamType: 'youtube',
    streamUrl: 'UCgrNz-aDmcr2uuto8_DL2jg',
    alternatives: [
      { platform: 'rumble', url: 'https://rumble.com/c/CGTNOfficial', embeddable: false, label: 'Rumble' },
      { platform: 'odysee', url: 'https://odysee.com/@cgtn', embeddable: false, label: 'Odysee' },
      { platform: 'website', url: 'https://news.cgtn.com/event/live-channel.html', embeddable: false, label: 'CGTN Live' },
    ],
    description: 'Visión china sobre geopolítica, economía y tecnología. Fuente clave para entender la posición de Pekín en el tablero global.',
    color: '#C8102E',
    espejoSur: true,
    website: 'https://www.cgtn.com/',
  },
  {
    id: 'nhkworld',
    name: 'NHK World Japan',
    shortName: 'NHK World',
    region: 'ASIA',
    country: 'Japón',
    flag: '\u{1F1EF}\u{1F1F5}',
    streamType: 'youtube',
    streamUrl: 'UCuTmKoN9EqiC9Z-IcMAFEYQ',
    alternatives: [
      { platform: 'website', url: 'https://www3.nhk.or.jp/nhkworld/en/live/', embeddable: false, label: 'NHK Live' },
    ],
    description: 'Perspectiva japonesa sobre Asia-Pacífico. Cobertura de desastres naturales, tecnología y diplomacia regional.',
    color: '#1E50A2',
    espejoSur: false,
    website: 'https://www3.nhk.or.jp/nhkworld/',
  },
  {
    id: 'wion',
    name: 'WION — World Is One News',
    shortName: 'WION',
    region: 'ASIA',
    country: 'India',
    flag: '\u{1F1EE}\u{1F1F3}',
    streamType: 'youtube',
    streamUrl: 'UC_gUM8rL-Lrg6O3adPW9K1g',
    alternatives: [
      { platform: 'website', url: 'https://www.wionews.com/live-tv', embeddable: false, label: 'WION Live' },
    ],
    description: 'Canal indio de noticias globales en inglés. Perspectiva del Sur Global asiático sobre geopolítica, comercio y diplomacia multipolar.',
    color: '#FF6600',
    espejoSur: true,
    website: 'https://www.wionews.com/',
  },
  {
    id: 'ndtv',
    name: 'NDTV India',
    shortName: 'NDTV',
    region: 'ASIA',
    country: 'India',
    flag: '\u{1F1EE}\u{1F1F3}',
    streamType: 'youtube',
    streamUrl: 'UCZFMm1mMw0F81Z37aaEzTUA',
    alternatives: [
      { platform: 'website', url: 'https://www.ndtv.com/video/live-channel', embeddable: false, label: 'NDTV Live' },
    ],
    description: 'Uno de los canales de noticias más importantes de India. Cobertura de política interna, relaciones internacionales y economía emergente.',
    color: '#CC0000',
    espejoSur: true,
    website: 'https://www.ndtv.com/',
  },

  // ── África ───────────────────────────────────────────────
  {
    id: 'africanews',
    name: 'Africanews',
    shortName: 'Africanews',
    region: 'ÁFRICA',
    country: 'Rep. del Congo',
    flag: '\u{1F1E8}\u{1F1EC}',
    streamType: 'youtube',
    streamUrl: 'UC25EuGAePOPvPrUA5cmu3dQ',
    alternatives: [
      { platform: 'website', url: 'https://www.africanews.com/live/', embeddable: false, label: 'Africanews Live' },
    ],
    description: 'Primer canal pan-africano de noticias en inglés. Cobertura de política, economía y sociedades del continente africano desde Brazzaville.',
    color: '#8B4513',
    espejoSur: true,
    website: 'https://www.africanews.com/',
  },

  // ── Latinoamérica ────────────────────────────────────────
  {
    id: 'telesur',
    name: 'TeleSUR',
    shortName: 'En Vivo teleSUR',
    region: 'LATAM',
    country: 'Venezuela',
    flag: '\u{1F1FB}\u{1F1EA}',
    streamType: 'youtube',
    streamUrl: 'UCZSdNK_ZmMQcLTz-obKr-Dw',
    alternatives: [
      { platform: 'rumble', url: 'https://rumble.com/c/teleurtv', embeddable: false, label: 'Rumble' },
      { platform: 'odysee', url: 'https://odysee.com/@telesurtv', embeddable: false, label: 'Odysee' },
      { platform: 'website', url: 'https://www.telesurtv.net/en-vivo.html', embeddable: false, label: 'TeleSUR Live' },
    ],
    description: 'Multiestatal latinoamericana. Voces del Sur Global con sede en Caracas. Cobertura de integración regional, movimientos sociales y geopolítica multipolar en español.',
    color: '#006747',
    espejoSur: true,
    website: 'https://www.telesurtv.net/',
  },
  {
    id: 'telesur-en',
    name: 'TeleSUR English',
    shortName: 'TeleSUR English live',
    region: 'LATAM',
    country: 'Venezuela',
    flag: '\u{1F1FB}\u{1F1EA}',
    streamType: 'youtube',
    streamUrl: 'UCmuTmpLY35O3csvhyA6vrkg',
    alternatives: [
      { platform: 'rumble', url: 'https://rumble.com/c/teleurtv', embeddable: false, label: 'Rumble' },
      { platform: 'odysee', url: 'https://odysee.com/@telesurtv', embeddable: false, label: 'Odysee' },
      { platform: 'website', url: 'https://www.telesurtv.net/en-vivo.html', embeddable: false, label: 'TeleSUR Live' },
    ],
    description: 'Versión en inglés de TeleSUR. Perspectiva latinoamericana y del Sur Global sobre geopolítica, integración regional y movimientos sociales.',
    color: '#009B5A',
    espejoSur: true,
    website: 'https://www.telesurtv.net/',
  },
  {
    id: 'cubavision',
    name: 'Cubavisión Internacional',
    shortName: 'Cubavisión',
    region: 'LATAM',
    country: 'Cuba',
    flag: '\u{1F1E8}\u{1F1FA}',
    streamType: 'iframe',
    streamUrl: 'https://teveo.cu/live/video/AKDdWvMTYzfsfnNJ/embed?auto=true&autoplay=1',
    alternatives: [
      { platform: 'website', url: 'https://www.cvi.icrt.cu/envivo', embeddable: false, label: 'Cubavisión Web' },
      { platform: 'website', url: 'https://www.tvcubana.cu/', embeddable: false, label: 'TVCubana' },
    ],
    description: 'Televisión cubana con alcance internacional. Perspectiva caribeña y antimperialista sobre Latinoamérica y el mundo.',
    color: '#CF2A27',
    espejoSur: true,
    website: 'https://www.cvi.icrt.cu/',
  },
];

/** Canales marcados como fuente Espejo Sur */
export const espejoSurChannels = tvChannels.filter(ch => ch.espejoSur);

/** Obtener canales por región */
export function getChannelsByRegion(region: string): TVChannel[] {
  return tvChannels.filter(ch => ch.region === region);
}

/**
 * Obtener el URL de embed para un canal.
 * NOTA: Para canales YouTube, se necesita resolver el videoId dinámicamente
 * via /api/youtube-live. Esta función devuelve la URL del API de resolución.
 * Para uso directo en iframe, usar getYouTubeEmbedUrl() con el videoId resuelto.
 */
export function getChannelEmbedUrl(channel: TVChannel): string {
  if (channel.streamType === 'youtube') {
    // Devuelve la API URL para resolver el videoId dinámicamente
    return getYouTubeLiveApiUrl(channel.streamUrl, channel.shortName);
  }
  return channel.streamUrl;
}

/** Obtener las plataformas alternativas que NO son el stream principal */
export function getAlternativePlatforms(channel: TVChannel): PlatformLink[] {
  return channel.alternatives.filter(a => {
    // No mostrar como alternativa la misma plataforma del stream principal
    if (channel.streamType === 'youtube' && a.platform === 'youtube') return false;
    if (channel.streamType === 'hls' && a.platform === 'hls') return false;
    if (channel.streamType === 'iframe' && a.platform === 'iframe') return false;
    return true;
  });
}
