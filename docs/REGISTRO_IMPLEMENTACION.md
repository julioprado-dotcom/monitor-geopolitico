# REGISTRO DE IMPLEMENTACIONES PENDIENTES — Análisis e Hilos

> Objetivo: Llevar Análisis e Hilos al mismo nivel de completitud que Señales.
> Fecha: 2026-05-02
> Última actualización: 2026-05-02

---

## ESTADO ACTUAL DE SEÑALES (Referencia — 100%)

Señales es el sistema más completo y sirve como modelo de referencia:

- **56 señales** con fullContent inline (3-4 párrafos cada una)
- **56 señales** con fullContent extendido en `signalContent.ts` (lazy load)
- **28 imágenes** (`/signals/sig-XXX.webp`)
- **7 tipos TypeScript** + 6 mapas lookup (relevanceColors, sourceLevel*, accessLevel*, regionLabels, sourceCountry, userTierConfig)
- **2 API routes** dedicadas (`/api/analyze`, `/api/compare`)
- **5 componentes** (SignalCard, SignalOverlay, LatestSignals, MetricsBar, SourceComparisonView)
- **Filtros sidebar** por región y clasificador (MGSidebar)
- **Búsqueda** full-text integrada
- **AI**: análisis individual + comparación de fuentes

---

## PARTE 1 — ANÁLISIS

### Tipo de datos actual

```typescript
import { type Region } from './signals';

interface Analysis {
  id: string;
  title: string;
  summary: string;
  fullContent: string;      // '' vacío — contenido real en analysisContent.ts (lazy)
  author: string;
  authorRole: string;
  timestamp: string;
  region: Region;            // ✅ Tipado — importado desde signals.ts
  tags: string[];            // Tags editoriales (decisión: mantener, no migrar a classifiers)
  readTime: number;
  image?: string;            // ✅ 6/6 con imagen
}
```

### Brechas identificadas vs Señales

| # | Brecha | Prioridad | Estado | Commit |
|---|--------|-----------|--------|--------|
| A-01 | fullContent inline vacío | Media | Abierto (lazy-only es correcto para análisis) | — |
| A-02 | Region no tipado | Alta | ✅ COMPLETADO | `950acd3` |
| A-03 | Tags ≠ Classifiers | Media | Decisión: mantener tags (son editoriales, no señales) | — |
| A-04 | Falta sourceLevel/verified/accessLevel | Media | Abierto (requiere definición de fuente de análisis) | — |
| A-05 | Solo 6 items | Baja | Abierto (expansión de contenido futuro) | — |
| A-06 | Sin filtros en sidebar | Alta | ✅ COMPLETADO — MGSidebar multi-tab | `950acd3` |
| A-07 | Sin API dedicada | Baja | Abierto (baja prioridad) | — |
| A-08 | Sin comparación de fuentes | Baja | Abierto (baja prioridad) | — |
| A-09 | ANL-002 sin imagen | Baja | ✅ COMPLETADO — sig-026.webp | `950acd3` |
| A-10 | Sin búsqueda integrada | Media | ✅ COMPLETADO — filteredAnalysis + sidebar | `950acd3` |

### Componentes actuales — Análisis

| Componente | Líneas | Estado |
|------------|--------|--------|
| `AnalysisCard.tsx` | 129 | ✅ Funcional — thumbnail, readTime, author, tags |
| `AnalysisOverlay.tsx` | 349 | ✅ Funcional — lazy content, AI analysis |

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
  image?: string;            // ✅ Campo agregado
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
| H-06 | Sin API dedicada | Media | Abierto (baja prioridad) | — |
| H-07 | Solo 5 items | Media | Abierto (expansión futura) | — |
| H-08 | ThreadSignal sin sourceUrl | Media | ✅ COMPLETADO — campo agregado | `950acd3` |
| H-09 | Sin filtros sidebar | Media | ✅ COMPLETADO — MGSidebar multi-tab | `950acd3` |
| H-10 | Sin búsqueda por contenido | Baja | Parcial (búsqueda por título/tags ya existe) | — |

### Componentes actuales — Hilos

| Componente | Líneas | Estado |
|------------|--------|--------|
| `Explorer/ThreadCard.tsx` | 137 | ✅ Funcional — status badge, preview, follow |
| `Explorer/ThreadDetail.tsx` | 335 | ✅ Funcional — timeline, cronología, AI analysis |

---

## RESUMEN EJECUTIVO

### Completado en commit `950acd3`

**6 archivos modificados, 244 inserciones, 15 eliminaciones:**

| Archivo | Cambios |
|---------|---------|
| `src/data/analysis.ts` | Region tipado, import desde signals.ts, image en ANL-002 |
| `src/data/threads.ts` | Region[] tipado, fullContent, image, sourceUrl en ThreadSignal |
| `src/data/threadContent.ts` | **NUEVO** — 5 narrativas extendidas (~4000 palabras total) |
| `src/components/MGSidebar.tsx` | Refactor multi-tab: conteos dinámicos por pestaña activa |
| `src/components/Explorer/ThreadDetail.tsx` | Botón "Analizar hilo con IA" con fetchAnalysis |
| `src/app/page.tsx` | filteredAnalysis, filtros sidebar en hilos, activeTab prop |

### Funcionalidades nuevas

1. **Sidebar inteligente**: Al cambiar pestaña (Señales/Análisis/Hilos), los contadores de región y clasificador se recalculan según el contenido de esa pestaña
2. **Búsqueda en Análisis**: Las tarjetas de análisis ahora se filtran por búsqueda, región y clasificador
3. **Filtros en Hilos**: Los hilos ahora se filtran por región y clasificador desde el sidebar
4. **AI en Hilos**: Botón "Analizar hilo con IA" en ThreadDetail que envía toda la información del hilo (señales + relaciones) al endpoint /api/analyze
5. **Contenido narrativo**: 5 hilos con contenido editorial extendido en threadContent.ts

### Pendiente (baja prioridad)

- A-01: fullContent inline para análisis (lazy-only funciona bien)
- A-04: sourceLevel/verified/accessLevel en análisis (requiere definición)
- A-05/H-07: Expandir catálogo (contenido extensivo)
- A-07/H-06: APIs dedicadas (no crítico con datos demo)
- A-08: Comparación de fuentes para análisis (funcionalidad avanzada)
