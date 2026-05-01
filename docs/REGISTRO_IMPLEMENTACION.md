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
interface Analysis {
  id: string;
  title: string;
  summary: string;
  fullContent: string;      // Siempre '' vacío — contenido real en analysisContent.ts
  author: string;
  authorRole: string;
  timestamp: string;
  region: string;            // No tipado como Region
  tags: string[];            // No usa classifiers[]
  readTime: number;
  image?: string;
}
```

### Brechas identificadas vs Señales

| # | Brecha | Prioridad | Esfuerzo | Descripción |
|---|--------|-----------|----------|-------------|
| A-01 | fullContent inline vacío | Media | M | Las 6 entradas tienen `fullContent: ''`. El contenido real vive en `analysisContent.ts`. Señales tiene contenido en AMBOS. Decisión: ¿mover contenido inline o mantener lazy-only? |
| A-02 | Region no tipado | Alta | XS | `region: string` en vez de `region: Region`. No comparte el tipo de signals.ts |
| A-03 | Tags ≠ Classifiers | Media | S | Usa `tags[]` genérico en vez de `classifiers[]` (los 8 clasificadores del Marco Conceptual). Inconsistente con Señales e Hilos |
| A-04 | Falta sourceLevel/verified/accessLevel | Media | M | No tiene metadatos de fuente (fuente del análisis, nivel, verificación). Señales sí los tiene |
| A-05 | Solo 6 items | Baja | L | Poco volumen comparado con 56 señales. Cada análisis requiere contenido extenso (1500+ palabras) |
| A-06 | Sin filtros en sidebar | Alta | S | No se puede filtrar análisis por región ni clasificador en MGSidebar |
| A-07 | Sin API dedicada | Baja | M | No hay `/api/analysis` ni CRUD. Comparte `/api/analyze` con señales (correcto para generación, pero no para listado) |
| A-08 | Sin comparación de fuentes | Baja | L | No tiene equivalente a `/api/compare`. Cada análisis es de una sola fuente |
| A-09 | ANL-002 sin imagen | Baja | XS | El análisis sobre BRICS+ no tiene campo image |
| A-10 | Sin búsqueda integrada | Media | S | SearchBar no busca en análisis (solo señales e hilos) |

### Componentes actuales — Análisis

| Componente | Líneas | Estado |
|------------|--------|--------|
| `AnalysisCard.tsx` | 129 | ✅ Funcional — thumbnail, readTime, author, tags |
| `AnalysisOverlay.tsx` | 349 | ✅ Funcional — lazy content, AI analysis |

### Plan de implementación sugerido

**Fase A1 — Tipado y consistencia (esfuerzo: ~1h)**
- [ ] A-02: Cambiar `region: string` → `region: Region` importando desde signals.ts
- [ ] A-03: Evaluar migración `tags[]` → `classifiers[]` o mantener como tags (los análisis son editoriales, no señales — podría ser correcto usar tags)
- [ ] A-09: Agregar image a ANL-002

**Fase A2 — Filtros y búsqueda (esfuerzo: ~1.5h)**
- [ ] A-06: Agregar filtros de región y clasificador para análisis en MGSidebar (o crear sección dedicada)
- [ ] A-10: Integrar análisis en SearchBar

**Fase A3 — Metadatos (esfuerzo: ~2h)**
- [ ] A-04: Agregar `sourceLevel`, `verified`, `accessLevel` al tipo Analysis (o heredar de interfaz base compartida)
- [ ] A-01: Decidir estrategia de fullContent (inline vs lazy-only)

**Fase A4 — API y comparación (esfuerzo: ~3h, prioridad baja)**
- [ ] A-07: Crear `/api/analysis` para listado/filtrado/paginación
- [ ] A-08: Crear equivalente de comparación para análisis

**Fase A5 — Contenido (esfuerzo: ~8h, prioridad baja)**
- [ ] A-05: Expandir catálogo a 12-15 análisis (doble del actual)

---

## PARTE 2 — HILOS GEOPOLÍTICOS

### Tipo de datos actual

```typescript
interface Thread {
  id: string;
  title: string;
  description: string;       // 1-2 oraciones, NO contenido narrativo
  status: ThreadStatus;      // 'EN_VIVO' | 'EVOLUCION' | 'RESUELTO' | 'DORMANTE'
  type: ThreadType;          // 8 tipos alineados con clasificadores
  regions: string[];         // No tipado como Region[]
  signals: ThreadSignal[];   // Sub-señales embebidas
  relations: ThreadRelation[];
  tags: string[];
  sourceCount: number;
  startedAt: string;
  lastActivityAt: string;
}
// NOTA: No tiene fullContent ni image
```

### Brechas identificadas vs Señales

| # | Brecha | Prioridad | Esfuerzo | Descripción |
|---|--------|-----------|----------|-------------|
| H-01 | Sin fullContent | **Alta** | M | El tipo Thread no tiene campo fullContent. No hay narrativa/editorial, solo description (1-2 líneas). Necesita contenido extendido tipo análisis para cada hilo |
| H-02 | Sin image | Alta | S | El tipo Thread no tiene campo image. No hay representación visual en tarjetas ni detalle |
| H-03 | Sin threadContent.ts | Alta | L | No existe archivo de contenido lazy-loaded. Señales tiene signalContent.ts, Análisis tiene analysisContent.ts |
| H-04 | Regions no tipado | Alta | XS | `regions: string[]` en vez de `regions: Region[]` |
| H-05 | Sin AI integrada | **Alta** | M | No se puede generar análisis IA de un hilo. Señales y Análisis sí tienen `/api/analyze` |
| H-06 | Sin API dedicada | Media | M | No hay `/api/threads` ni endpoints CRUD. Todo es estático/client-side |
| H-07 | Solo 5 items | Media | L | Catálogo pequeño. Cada hilo requiere múltiples sub-señales + narrativa |
| H-08 | ThreadSignal sin sourceUrl | Media | S | Las sub-señales dentro de hilos no tienen enlace a fuente externa |
| H-09 | Sin filtros sidebar | Media | S | MGSidebar no filtra por hilos. Solo filtro status in-tab |
| H-10 | Sin búsqueda por contenido | Baja | S | SearchBar busca título/descripción pero no contenido de sub-señales |

### Componentes actuales — Hilos

| Componente | Líneas | Estado |
|------------|--------|--------|
| `Explorer/ThreadCard.tsx` | 137 | ✅ Funcional — status badge, preview, follow |
| `Explorer/ThreadDetail.tsx` | 232 | ✅ Funcional — timeline, cronología, relaciones |

### Plan de implementación sugerido

**Fase H1 — Schema y datos base (esfuerzo: ~2h)**
- [ ] H-02: Agregar `image?: string` al tipo Thread
- [ ] H-04: Tipar `regions: Region[]` importando desde signals.ts
- [ ] H-08: Agregar `sourceUrl?: string` a ThreadSignal
- [ ] Asignar imágenes a los 5 hilos existentes (usar sig-XXX.webp existentes)

**Fase H2 — Contenido narrativo (esfuerzo: ~4h)**
- [ ] H-01: Agregar `fullContent: string` al tipo Thread
- [ ] H-03: Crear `src/data/threadContent.ts` con narrativa extendida para cada hilo
- [ ] Escribir contenido editorial para los 5 hilos existentes (contexto, cronología ampliada, análisis de tendencias, 1500+ palabras cada uno)

**Fase H3 — AI y API (esfuerzo: ~2h)**
- [ ] H-05: Integrar botón "Analizar con IA" en ThreadDetail que use `/api/analyze`
- [ ] H-06: Crear `/api/threads` para listado/filtrado (o dejar estático si no se necesita CRUD aún)

**Fase H4 — Filtros y UX (esfuerzo: ~1.5h)**
- [ ] H-09: Agregar filtros de región/status/tipo en MGSidebar para hilos
- [ ] H-10: Mejorar búsqueda para incluir contenido de sub-señales

**Fase H5 — Expansión (esfuerzo: ~6h, prioridad baja)**
- [ ] H-07: Expandir a 8-10 hilos (agregar temas: crisis energética, ciberseguridad, migración climática, etc.)

---

## RESUMEN DE ESFUERZO

| Sistema | Inmediato (Alta) | Corto plazo (Media) | Bajo (Baja) | Total est. |
|---------|:---:|:---:|:---:|:---:|
| **Análisis** | A-02, A-06 | A-01, A-03, A-04, A-10 | A-05, A-07, A-08, A-09 | ~15.5h |
| **Hilos** | H-01, H-02, H-03, H-05 | H-04, H-06, H-07, H-08, H-09 | H-10 | ~15.5h |
| **TOTAL** | **6 items** | **9 items** | **5 items** | **~31h** |

---

## DEPENDENCIAS

- A-02 y H-04 dependen del tipo `Region` en signals.ts ✅ (ya normalizado a LATINOAMÉRICA)
- H-05 depende de `/api/analyze` ✅ (ya existe, reutilizable)
- A-06 y H-09 dependen de refactor de MGSidebar para soportar múltiples sistemas
- H-01 y H-03 son pre-requisito para H-05 (necesita contenido para analizar)
