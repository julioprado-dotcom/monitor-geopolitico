/**
 * Tipos TypeScript del Monitor Geopolítico — MIG-01
 * Fuente única de verdad para todas las interfaces del proyecto.
 * Re-exportados desde los archivos de datos para compatibilidad.
 */

// ── Tipos base ──

export type Relevance = 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA' | 'INFORMATIVA';

export type Region =
  | 'LATINOAMÉRICA'
  | 'EUROPA'
  | 'ASIA'
  | 'ÁFRICA'
  | 'MEDIO ORIENTE'
  | 'NORTEAMÉRICA';

export type SourceLevel = 'A' | 'B' | 'C' | 'D';

export type AccessLevel = 'ABIERTO' | 'RESTRINGIDO' | 'CLASIFICADO';

export type UserTier = 'gratuito' | 'premium' | 'profesional' | 'institucional';

// ── Señal Geopolítica ──

export interface Signal {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  region: Region;
  classifiers: string[];
  relevance: Relevance;
  source: string;
  sourceUrl: string;
  language: string;
  timestamp: string;
  verified: boolean;
  sourceLevel: SourceLevel;
  accessLevel: AccessLevel;
  image?: string;
}

// ── Análisis Editorial ──

export interface Analysis {
  id: string;
  title: string;
  summary: string;
  fullContent: string;
  author: string;
  authorRole: string;
  timestamp: string;
  region: Region;
  tags: string[];
  readTime: number;
  image?: string;
  sourceLevel: SourceLevel;
  verified: boolean;
  accessLevel: AccessLevel;
}

// ── Hilos Geopolíticos ──

export type ThreadStatus = 'EN_VIVO' | 'EVOLUCION' | 'RESUELTO' | 'DORMANTE';

export type ThreadType =
  | 'conflicto'
  | 'diplomacia'
  | 'economia'
  | 'tecnologia'
  | 'seguridad'
  | 'derechos_humanos'
  | 'energia'
  | 'desastre';

export interface ThreadSignal {
  id: string;
  source: string;
  sourceCountry: string;
  title: string;
  summary: string;
  timestamp: string;
  relevance: 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  tags: string[];
  sourceLevel: 'A' | 'B' | 'C';
  sourceUrl?: string;
}

export interface ThreadRelation {
  threadId: string;
  title: string;
  reason: string;
  type: 'causa' | 'efecto' | 'correlacion';
}

export interface Thread {
  id: string;
  title: string;
  description: string;
  fullContent: string;
  status: ThreadStatus;
  type: ThreadType;
  regions: Region[];
  signals: ThreadSignal[];
  relations: ThreadRelation[];
  tags: string[];
  sourceCount: number;
  startedAt: string;
  lastActivityAt: string;
  image?: string;
}

// ── TV Channel ──

export interface TVChannel {
  id: string;
  name: string;
  url: string;
  region: string;
  hlsUrl: string;
  youtubeUrl: string;
  logo: string;
  color: string;
  language: string;
}
