/**
 * Configuración centralizada del Monitor Geopolítico — MIG-02
 * Fuente única de verdad para constantes y valores de configuración.
 * Elimina hardcoded values dispersos en rutas API y componentes.
 */

// ── Dominio ──

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://monitor-geopolitico.vercel.app';

// ── Clasificadores temáticos (8 dimensiones analíticas) ──

export const CLASSIFIERS = [
  'Conflicto',
  'Economía',
  'Diplomacia',
  'Seguridad',
  'Tecnología',
  'Ecosistema',
  'Energía',
  'Derechos Humanos',
] as const;

export type Classifier = (typeof CLASSIFIERS)[number];

// ── Filtros analíticos (5 filtros de la Óptica Sur Global) ──

export const ANALYSIS_FILTERS = [
  'Congruencia Inversa',
  'Coherencia Histórica',
  'Integridad Epistémica',
  'Confiabilidad Asimétrica',
  'Flexibilidad Pragmática',
] as const;

// ── Dominios permitidos para content-proxy ──

export const ALLOWED_PROXY_DOMAINS = [
  'rt.com', 'rtd.rt.com',
  'aljazeera.com', 'telesurtv.net',
  'cctv.com', 'france24.com',
  'dw.com', 'presstv.ir',
  'trtworld.com', 'cgtn.com',
] as const;

// ── Términos epistemológicos que nunca se traducen ──

export const EPISTEMOLOGICAL_TERMS = [
  'Óptica Sur Global',
  'Soberanía Cognitiva',
  'Justicia Cognitiva',
  'Multipolaridad Epistémica',
  'Hermenéutica Crítica',
  'Pragmatismo Emancipador',
  'Ecología de Saberes',
  'Economía Política Crítica',
  'Materialismo Histórico',
  'Pensamiento Decolonial',
  'Panafricanismo',
  'Geopolítica Crítica Periférica',
  'Bidireccionalidad de la Relevancia',
  'Congruencia Inversa',
  'Coherencia Histórica',
  'Integridad Epistémica',
  'Confiabilidad Asimétrica',
  'Flexibilidad Pragmática',
] as const;

// ── Disclaimer legal ──

export const DISCLAIMER =
  'Monitor Geopolítico es una plataforma de análisis e investigación geopolítica. Los artículos y contenido original pertenecen a sus fuentes. El análisis geopolítico generado por el Monitor — Óptica Sur Global, con filtros analíticos y bidireccionalidad de relevancia — es contenido original del Monitor Geopolítico - Newsconnect';
