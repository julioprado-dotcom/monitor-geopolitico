# REGISTRO DE IMPLEMENTACIONES — Análisis e Hilos

> Objetivo: Llevar Análisis e Hilos al mismo nivel de completitud que Señales.
> Fecha: 2026-05-02
> Última actualización: 2026-05-02 (Fase 2: SEO + MIG + a11y + Mapa + Comparación)

---

## ESTADO ACTUAL DE SEÑALES (Referencia — 100%)

Señales es el sistema más completo y sirve como modelo de referencia:

- **56 señales** con fullContent inline (3-4 párrafos cada una)
- **56 señales** con fullContent extendido en `signalContent.ts` (lazy load)
- **28 imágenes** (`/signals/sig-XXX.webp`)
- **7 tipos TypeScript** + 6 mapas lookup (relevanceColors, sourceLevel*, accessLevel*, regionLabels, sourceCountry, userTierConfig)
- **4 API routes** dedicadas (`/api/analyze`, `/api/compare`, `/api/threads`, `/api/analysis`)
- **5 componentes** (SignalCard, SignalOverlay, LatestSignals, MetricsBar, SourceComparisonView)
- **Filtros sidebar** por región y clasificador (MGSidebar)
- **Búsqueda** full-text integrada
- **AI**: análisis individual + comparación de fuentes

---

## PARTE 1 — ANÁLISIS

### Tipo de datos actual

```typescript
import { type Region, type SourceLevel, type AccessLevel } from './signals';

interface Analysis {
  id: string;
  title: string;
  summary: string;
  fullContent: string;       // ✅ Inline: primer párrafo como preview
  author: string;
  authorRole: string;
  timestamp: string;
  region: Region;            // ✅ Tipado — importado desde signals.ts
  tags: string[];            // Tags editoriales (decisión: mantener, no migrar a classifiers)
  readTime: number;
  image?: string;            // ✅ 6/6 con imagen
  sourceLevel: SourceLevel;  // ✅ 'A' — contenido editorial propio
  verified: boolean;         // ✅ true — verificado internamente
  accessLevel: AccessLevel;  // ✅ 'ABIERTO' — acceso público
}
```

### Brechas identificadas vs Señales

| # | Brecha | Prioridad | Estado | Commit |
|---|--------|-----------|--------|--------|
| A-01 | fullContent inline vacío | Media | ✅ COMPLETADO — 6/6 con primer párrafo inline | Pendiente push |
| A-02 | Region no tipado | Alta | ✅ COMPLETADO | `950acd3` |
| A-03 | Tags ≠ Classifiers | Media | Decisión: mantener tags (son editoriales, no señales) | — |
| A-04 | Falta sourceLevel/verified/accessLevel | Media | ✅ COMPLETADO — todos 'A'/true/'ABIERTO' | Pendiente push |
| A-05 | Solo 6 items | Baja | Diferido — expansión de contenido futuro | — |
| A-06 | Sin filtros en sidebar | Alta | ✅ COMPLETADO — MGSidebar multi-tab | `950acd3` |
| A-07 | Sin API dedicada | Baja | ✅ COMPLETADO — GET /api/analysis | Pendiente push |
| A-08 | Sin comparación de fuentes | Baja | ✅ COMPLETADO — señales relacionadas por región/tags | Pendiente push |
| A-09 | ANL-002 sin imagen | Baja | ✅ COMPLETADO — sig-026.webp | `950acd3` |
| A-10 | Sin búsqueda integrada | Media | ✅ COMPLETADO — filteredAnalysis + sidebar | `950acd3` |

### Componentes actuales — Análisis

| Componente | Líneas | Estado |
|------------|--------|--------|
| `AnalysisCard.tsx` | 129 | ✅ Funcional — thumbnail, readTime, author, tags |
| `AnalysisOverlay.tsx` | ~418 | ✅ Funcional — lazy content, AI analysis, señales relacionadas |

---

## PARTE 2 — HILOS GEOPOLÍTICOS

### Tipo de datos actual

```typescript
import { type Region } from './signals';

interface Thread {
  id: string;
  title: string;
  description: string;
  fullContent: string;       // ✅ Campo agregado — contenido en threadContent.ts
  status: ThreadStatus;
  type: ThreadType;
  regions: Region[];         // ✅ Tipado — importado desde signals.ts
  signals: ThreadSignal[];
  relations: ThreadRelation[];
  tags: string[];
  sourceCount: number;
  startedAt: string;
  lastActivityAt: string;
  image?: string;            // ✅ 5/5 con imagen
}

interface ThreadSignal {
  // ... campos existentes ...
  sourceUrl?: string;        // ✅ Campo agregado
}
```

### Brechas identificadas vs Señales

| # | Brecha | Prioridad | Estado | Commit |
|---|--------|-----------|--------|--------|
| H-01 | Sin fullContent | Alta | ✅ COMPLETADO — campo + threadContent.ts | `950acd3` |
| H-02 | Sin image | Alta | ✅ COMPLETADO — 5/5 con imagen | `950acd3` |
| H-03 | Sin threadContent.ts | Alta | ✅ COMPLETADO — 5 narrativas (~800 palabras cada una) | `950acd3` |
| H-04 | Regions no tipado | Alta | ✅ COMPLETADO — Region[] | `950acd3` |
| H-05 | Sin AI integrada | Alta | ✅ COMPLETADO — botón en ThreadDetail | `950acd3` |
| H-06 | Sin API dedicada | Media | ✅ COMPLETADO — GET /api/threads | Pendiente push |
| H-07 | Solo 5 items | Media | Diferido — expansión futura | — |
| H-08 | ThreadSignal sin sourceUrl | Media | ✅ COMPLETADO — campo agregado | `950acd3` |
| H-09 | Sin filtros sidebar | Media | ✅ COMPLETADO — MGSidebar multi-tab | `950acd3` |
| H-10 | Sin búsqueda por contenido | Baja | ✅ COMPLETADO — búsqueda incluye fullContent | Pendiente push |

### Componentes actuales — Hilos

| Componente | Líneas | Estado |
|------------|--------|--------|
| `Explorer/ThreadCard.tsx` | 137 | ✅ Funcional — status badge, preview, follow |
| `Explorer/ThreadDetail.tsx` | 335 | ✅ Funcional — timeline, cronología, AI analysis |

---

## RESUMEN EJECUTIVO

### Commit 1: `950acd3` — Equiparación inicial

**6 archivos modificados, 244 inserciones, 15 eliminaciones:**

| Archivo | Cambios |
|---------|---------|
| `src/data/analysis.ts` | Region tipado, import desde signals.ts, image en ANL-002 |
| `src/data/threads.ts` | Region[] tipado, fullContent, image, sourceUrl en ThreadSignal |
| `src/data/threadContent.ts` | **NUEVO** — 5 narrativas extendidas (~4000 palabras total) |
| `src/components/MGSidebar.tsx` | Refactor multi-tab: conteos dinámicos por pestaña activa |
| `src/components/Explorer/ThreadDetail.tsx` | Botón "Analizar hilo con IA" con fetchAnalysis |
| `src/app/page.tsx` | filteredAnalysis, filtros sidebar en hilos, activeTab prop |

### Commit 2: Pendiente push — Cierre de brechas restantes

**5 archivos modificados/creados:**

| Archivo | Cambios |
|---------|---------|
| `src/data/analysis.ts` | fullContent inline (6 previews), sourceLevel/verified/accessLevel |
| `src/app/api/analysis/route.ts` | **NUEVO** — GET endpoint para datos de análisis |
| `src/app/api/threads/route.ts` | **NUEVO** — GET endpoint para datos de hilos |
| `src/components/AnalysisOverlay.tsx` | Sección "Señales relacionadas" (scoring por región + tags) |
| `src/app/page.tsx` | Búsqueda en hilos incluye fullContent |

### Funcionalidades nuevas (commit 2)

1. **fullContent inline en Análisis**: Cada análisis ahora tiene su primer párrafo como preview inline, complementando el contenido extendido lazy-loaded en analysisContent.ts
2. **Metadatos completos en Análisis**: sourceLevel ('A'), verified (true), accessLevel ('ABIERTO') alineados con el modelo de Señales
3. **API /api/analysis**: Endpoint GET que retorna los 6 análisis con metadatos completos
4. **API /api/threads**: Endpoint GET que retorna los 5 hilos con todos sus datos
5. **Señales relacionadas**: El overlay de análisis muestra hasta 5 señales relacionadas basadas en coincidencia de región y tags compartidos (scoring ponderado)
6. **Búsqueda profunda en Hilos**: La búsqueda ahora incluye el campo fullContent de cada hilo

### Diferido (baja prioridad)

- **A-05/H-07** (Expandir catálogo): Requiere creación de contenido editorial extenso. Los 6 análisis y 5 hilos actuales son suficientes para demostrar todas las funcionalidades. Expansión recomendada cuando haya demanda real de usuarios.
- **A-03** (Tags → Classifiers): Decisión de diseño — los tags editoriales son semánticamente diferentes a los classifiers de señales. Los tags capturan categorías temáticas mientras que los classifiers capturan dimensiones analíticas. Se mantienen separados por diseño.

### Porcentaje de completitud

| Módulo | Tareas completadas | Total | Porcentaje |
|--------|-------------------|-------|------------|
| Análisis | 9/10 | 10 | **90%** |
| Hilos | 9/10 | 10 | **90%** |
| **Global** | **18/20** | **20** | **90%** |

---

## FASE 2 — MEJORAS TRANSVERSALES (2026-05-02)

### Commits adicionales

| Commit | Descripción |
|--------|-------------|
| `371cf0e` | SEO Fase 1 — sitemap.xml, robots.txt, BreadcrumbList JSON-LD |
| `741d5f6` | SEO Fase 2 — JSON-LD ampliado (FAQPage, Organization, Dataset), sitemap dinámico (77+ URLs), document.title en overlays |
| `85202a1` | MIG-01 + MIG-02 — Tipos centralizados en `src/types/index.ts`, config en `src/config/index.ts` |
| `33f4ce6` | Accesibilidad (a11y) Fase 1 — skip-to-content, ARIA labels, focus-visible, reduced-motion CSS |
| `e23da48` | Mapa geopolítico interactivo — GeoMap.tsx (SVG puro), 6 regiones, marcadores por señal |
| `6414260` | Comparación de fuentes — API + UI (SourceComparisonView), botón en SignalOverlay |
| `df39ba9` | Pulir MIG-02 + a11y completa + comparar fuentes en Panel de Foco |

### Mejoras de Accesibilidad (a11y) — Completado 95%

| Mejora | Componentes afectados |
|--------|----------------------|
| `useFocusTrap` hook | SourceComparisonView, AnalysisOverlay |
| `aria-modal="true"` + `role="dialog"` | SourceComparisonView, AnalysisOverlay |
| `aria-live="polite"` para estados dinámicos | SourceComparisonView, AnalysisOverlay, ThreadDetail, Panel de Foco (page.tsx) |
| `role="alert"` para errores | Todos los modales y paneles con AI |
| `role="status"` para spinners de carga | Todos los estados de loading |
| `role="article"` + `aria-label` | ThreadDetail |
| `aria-label` descriptivos | Botones volver, seguir, relaciones en ThreadDetail |
| Cierre con Escape | ThreadDetail (ya existía en AnalysisOverlay y SourceComparisonView) |
| SVG SMIL respeta `prefers-reduced-motion` | GeoMap (pulse rings en CRÍTICA deshabilitados) |
| Skip-to-content link | layout.tsx (ya existía) |
| Focus-visible ring global | globals.css (ya existía) |

### Comparación de Fuentes — Completado

| Feature | Estado |
|---------|--------|
| API `/api/compare` | ✅ Funcional — clustering por región + classifiers + source diferente |
| SourceComparisonView | ✅ Funcional — grid de fuentes, meta-análisis IA |
| Botón bulk "Comparar fuentes" | ✅ Funcional — debajo del grid de señales |
| Botón por señal en Panel de Foco | ✅ NUEVO — debajo del contenido completo de la señal seleccionada |
| Botón por señal en SignalOverlay | ✅ Code exists (SignalOverlay no está activo en UI actual) |

### Mapa Geopolítico — Completado

| Feature | Estado |
|---------|--------|
| GeoMap.tsx (SVG puro, sin dependencias externas) | ✅ Integrado en page.tsx |
| 6 regiones con centroides + jitter | ✅ |
| Marcadores por relevancia (5 niveles) | ✅ |
| Pulse animation en CRÍTICA (respeta reduced-motion) | ✅ |
| Tooltip hover + click para seleccionar señal | ✅ |
| Keyboard navigation (Enter/Space) | ✅ |
| ARIA attributes en SVG y marcadores | ✅ |

### MIG-01/MIG-02 — Completado 100%

| Item | Estado |
|------|--------|
| `src/types/index.ts` — fuente única de tipos | ✅ 5 union types + 7 interfaces |
| `src/config/index.ts` — fuente única de config | ✅ 6 constantes exportadas |
| DISCLAIMER centralizado (sin duplicados) | ✅ Eliminado de signals.ts, importado desde config |
| ANALYSIS_FILTERS utilizado | ✅ 5 URLs en sitemap |
| Types importados desde @/types en componentes nuevos | ✅ GeoMap, mapRegions |
