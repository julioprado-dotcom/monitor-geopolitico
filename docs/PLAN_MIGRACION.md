# Plan de Migración

## Proyecto: Monitor Geopolítico — News Connect
## Versión: 1.0
## Fecha: 2026-04-28
## Estado: VIGENTE

---

## 1. ALCANCE Y OBJETIVO

Este plan describe las migraciones necesarias para pasar del estado actual del proyecto (v0.8.0-meridian, prototipo funcional con demo data) a un producto mínimo viable (v1.0.0) listo para usuarios reales. No cubre nuevas funcionalidades — cubre exclusivamente los cambios estructurales, de datos, de infraestructura y de configuración que son prerrequisitos para implementar las funcionalidades del Plan de Implementación.

El objetivo es que al finalizar esta migración, el proyecto tenga: estructura de archivos consistente, esquema de base de datos estable, sistema de configuración centralizado, y pipelines de datos funcionales para alimentar el dashboard con datos reales en vez de datos demo.

---

## 2. MIGRACIÓN DE ESTRUCTURA DE ARCHIVOS

### 2.1 Estado Actual

El proyecto tiene una estructura mixta heredada de múltiples sesiones de desarrollo:

```
/home/z/my-project/
├── src/app/           ← Código fuente principal (CORRECTO, en uso)
│   ├── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── analyze/route.ts
│       ├── content-proxy/route.ts
│       ├── hls-proxy/route.ts
│       ├── youtube-live/route.ts
│       └── route.ts
├── src/components/    ← Componentes React (CORRECTO)
├── src/data/          ← Datos estáticos (CORRECTO)
│   ├── channels.ts    ← 14 canales TV
│   └── signals.ts     ← Señales demo + tipos TypeScript
├── src/lib/           ← Utilidades (CORRECTO)
├── src/hooks/         ← Hooks React (CORRECTO)
├── docs/              ← Documentación estratégica (12 archivos)
├── app/               ← NO EXISTE (eliminado en sesión anterior)
└── CONTEXTO.md        ← Memoria del proyecto
```

### 2.2 Problemas Detectados

1. **Tipos TypeScript mezclados con datos**: `src/data/signals.ts` contiene tanto la interfaz `Signal` (tipo) como `demoSignals` (datos demo). Estos deberían separarse.
2. **Canales sin metadatos de clasificación**: `src/data/channels.ts` tiene información de TV pero no niveles de fuente (A/B/C/D) según CLASIFICACION_FUENTES.md.
3. **Rutas API sin autenticación**: Todas las rutas en `src/app/api/` son públicas. Necesitan middleware de autenticación antes de implementar rate limiting por tier.
4. **Sin archivo de configuración centralizado**: Los valores de configuración (URLs de API, límites, dominios whitelist) están hardcodeados en los archivos de ruta.

### 2.3 Migraciones Requeridas

**MIG-01 — Separar tipos de datos demo**
- Crear `src/types/index.ts` con todas las interfaces TypeScript: Signal, TVChannel, Analysis, EventCluster, Comparison, Source
- Mover las interfaces desde `src/data/signals.ts` a `src/types/index.ts`
- `src/data/signals.ts` queda solo con `demoSignals` y el import de tipos
- `src/data/channels.ts` importa tipos desde `src/types/index.ts`
- Impacto: 8+ archivos importan tipos desde signals.ts. Requieren actualizar imports.

**MIG-02 — Crear configuración centralizada**
- Crear `src/config/index.ts` con constantes centralizadas:
  - `ALLOWED_PROXY_DOMAINS`: Array de dominios whitelist (actualmente hardcodeado en content-proxy)
  - `ANALYSIS_RATE_LIMITS`: Objeto con límites por tier
  - `COMPARISON_RATE_LIMITS`: Objeto con límites por tier
  - `SOURCE_LEVELS`: Definición de niveles A/B/C/D con labels y colores
  - `CLASSIFIERS`: Array de 8 clasificadores
  - `REGIONS`: Array de 6 regiones con códigos normalizados
  - `FILTERS`: Array de 5 filtros analíticos
  - `EPSTEMOLOGICAL_TERMS`: Array de 18 términos que nunca se traducen
- Impacto: content-proxy, compare route, analyze route, y todos los componentes que usen estos valores deben importar desde config.

**MIG-03 — Normalizar nombres de regiones**
- Estado actual: El código usa `LATAM` y `ASIA`. La documentación usa `LATINOAMÉRICA` y `ASIA-PACÍFICO`.
- Decisión: Normalizar a códigos cortos en el código (`LATAM`, `ASIA`) con display names en el config (`{ code: 'LATAM', display: 'LATINOAMÉRICA' }`).
- Impacto: signals.ts, channels.ts, y todos los componentes que referencian regiones.

**MIG-04 — Añadir metadatos de fuente a canales**
- Extender la interfaz TVChannel en `src/types/index.ts` con campos de CLASIFICACION_FUENTES.md:
  - `sourceLevel`: 'A' | 'B' | 'C' | 'D'
  - `sourceScore`: number (puntuación combinada 0-100)
  - `honestyScore`: number
  - `biasScore`: number
  - `transparencyScore`: number
  - `coverageScore`: number
  - `accessibilityScore`: number
- Actualizar `src/data/channels.ts` con evaluaciones iniciales basadas en CLASIFICACION_FUENTES.md §8
- Impacto: SignalCard, SourceClassifier, y cualquier componente que muestre información de fuente.

---

## 3. MIGRACIÓN DE BASE DE DATOS

### 3.1 Estado Actual

- Prisma ORM configurado con SQLite
- `src/lib/db.ts` existe con import de PrismaClient
- No hay `prisma/schema.prisma` visible (puede existir o no)
- Scripts de DB en package.json: `db:push`, `db:generate`, `db:migrate`, `db:reset`
- No hay tablas creadas — todo funciona con datos demo estáticos

### 3.2 Migraciones Requeridas

**MIG-05 — Crear esquema Prisma completo**
- Crear/verificar `prisma/schema.prisma` con modelos:
  - **User**: id, email, passwordHash, name, tier (FREE/PREMIUM/PROFESSIONAL/INSTITUTIONAL), createdAt, updatedAt
  - **Source**: id, name, url, region, language, sourceLevel, sourceScore, honestyScore, biasScore, transparencyScore, coverageScore, accessibilityScore, evaluatedAt, isActive
  - **Signal**: id, sourceId, sourceUrl, sourceName, title, summary, excerpt, classifiers[], region, relevance (JSON con threat/emancipation), language, imageUrl, publishedAt, fetchedAt, createdAt
  - **Analysis**: id, signalId, sourceUrl, sourceName, title, content (JSON), filters (JSON), relevance (JSON), userId, createdAt, accessExpiresAt
  - **EventCluster**: id, title, region, classifiers[], signalIds[], sourceNames[], eventDate, createdAt, updatedAt
  - **Comparison**: id, eventId, sources (JSON), metaAnalysis (JSON), shareCount, viewCount, userId, createdAt
  - **Alert**: id, userId, classifiers[], regions[], relevanceType, frequency, active, createdAt
- Ejecutar `bun run db:push` para crear tablas
- Verificar con `bunx prisma studio` que las tablas existen

**MIG-06 — Migrar datos demo a base de datos**
- Crear script `scripts/seed-demo.ts` que:
  - Inserte las 14 fuentes TV en tabla Source con niveles de CLASIFICACION_FUENTES.md
  - Inserte las señales demo de `src/data/signals.ts` en tabla Signal
  - No inserte análisis (se generan bajo demanda)
- Ejecutar: `bun run scripts/seed-demo.ts`
- Criterio: Dashboard puede cargar señales desde la base de datos en vez de datos estáticos

**MIG-07 — Crear migración de datos de señales RSS**
- Preparar el pipeline para que el rss-proxy (Tarea 1.5 del Plan de Implementación) inserte señales en la tabla Signal automáticamente
- Cada item del RSS se convierte en un registro Signal con sourceId de la tabla Source
- Duplicados se detectan por sourceUrl + publishedAt

### 3.3 Consideración SQLite → PostgreSQL

- SQLite es adecuado para desarrollo y prototipado
- Para producción con múltiples usuarios concurrentes, se necesitará PostgreSQL
- Prisma facilita la migración: cambiar el provider en schema.prisma y ejecutar `prisma migrate`
- Momento de migración: Antes de lanzar Fase 2 (usuarios reales autenticados)
- Proveedores recomendados: Supabase (free tier), PlanetScale (MySQL), Neon (PostgreSQL)

---

## 4. MIGRACIÓN DE AUTENTICACIÓN

### 4.1 Estado Actual

- `next-auth` está en package.json como dependencia pero NO se usa
- No hay autenticación implementada
- Todas las rutas API son públicas
- No hay modelo User

### 4.2 Migraciones Requeridas

**MIG-08 — Implementar autenticación**
- Opción A: Usar next-auth (ya instalado, soporta email+password, OAuth, JWT)
  - Ventaja: Ya está en dependencias, bien documentado, soporta múltiples providers
  - Desventaja: Configuración compleja para un caso simple
- Opción B: Implementar JWT manual con bcrypt
  - Ventaja: Más simple, más control, sin dependencias adicionales
  - Desventaja: Hay que implementar todo (login, register, refresh, logout)
- Recomendación: Opción B para MVP (email + password simple). Migrar a next-auth si se necesitan OAuth providers.
- Archivos: Nuevo `src/lib/auth.ts`, nuevo `src/app/api/auth/[...nextauth]/route.ts` o `src/app/api/auth/register/route.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/session/route.ts`
- Middleware: Crear `src/middleware.ts` para verificar sesión en rutas protegidas

**MIG-09 — Migrar rutas API a autenticación diferenciada**
- Rutas públicas (sin auth): `/api/content-proxy`, `/api/image-proxy`, `/api/rss-proxy`, `/api/hls-proxy`
- Rutas con rate limiting básico (sin auth): `/api/analyze` (IP-based para no autenticados)
- Rutas protegidas (auth requerida): `/api/compare`, `/api/translate`, `/api/alerts`
- Crear middleware helper `src/lib/requireAuth.ts` que verifique sesión y tier
- Crear middleware helper `src/lib/rateLimit.ts` que aplique límites por IP o por userId

---

## 5. MIGRACIÓN DE DATOS DE FUENTES

### 5.1 Estado Actual

- `src/data/channels.ts` tiene 14 canales de TV con: id, name, url, region, hlsUrl, youtubeUrl, logo, color, language
- No tiene información de clasificación de fuentes (CLASIFICACION_FUENTES.md)
- Las señales demo en `src/data/signals.ts` tienen `sourceLevel: 'A' | 'B' | 'C' | 'D'` pero con labels antiguos ("Fuente oficial primaria" en vez de "Referencial")
- `src/data/signals.ts` tiene interfaz `Relevance` con `type: 'AMENAZA' | 'EMANCIPACIÓN'` y `level: 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA'`

### 5.2 Migraciones Requeridas

**MIG-10 — Actualizar labels de sourceLevel en código**
- Actualizar `src/data/signals.ts`: Cambiar labels de sourceLevel a "Referencial", "Complementaria", "Contrastiva", "Vigilada"
- Actualizar cualquier componente que muestre estos labels (SignalCard, SourceClassifier)
- Asegurar consistencia con CLASIFICACION_FUENTES.md §3

**MIG-11 — Evaluar y clasificar las 14 fuentes actuales**
- Aplicar la metodología de CLASIFICACION_FUENTES.md §7 a cada una de las 14 fuentes de channels.ts
- Documentar la evaluación con puntuaciones por criterio
- Resultado esperado (basado en §8 del documento):
  - Nivel B: RT, Al Jazeera, CGTN, NHK World, WION, NDTV, Africanews
  - Nivel C: France 24, TRT World, Press TV, CubaVisión
  - Sin evaluación directa: Al Mayadeen, TeleSUR
- Insertar resultados en tabla Source (MIG-05)

**MIG-12 — Ampliar catálogo de fuentes para RSS**
- Las 14 fuentes actuales son canales de TV
- Para el RSS proxy y señales escritas, se necesitan fuentes periodísticas:
  - Fuentes de CLASIFICACION_FUENTES.md §5 no TV: Página12, La Jornada, The Intercept, Democracy Now, Middle East Eye, The Cradle, AllAfrica, Mediapart, The Grayzone, etc.
- Crear `src/data/sources.ts` con metadatos de fuentes RSS (separado de channels.ts que es TV)
- Mínimo 10 fuentes RSS para MVP

---

## 6. MIGRACIÓN DE DOCUMENTACIÓN

### 6.1 Inconsistencias Detectadas

Se encontraron 23 inconsistencias entre documentos y código fuente en la auditoría previa (ver sección 0 del Plan de Implementación).

### 6.2 Migraciones Requeridas

**MIG-13 — Actualizar CONTEXTO.md §4 (Estructura del Proyecto)**
- Cambiar todos los paths de `app/` a `src/app/`
- Cambiar `lib/channels.ts` a `src/data/channels.ts`
- Cambiar `types/signals.ts` a `src/data/signals.ts`
- Cambiar `components/` a `src/components/`
- Listar los 11 componentes existentes
- Corregir "15 canales" a "14 canales"

**MIG-14 — Actualizar versiones en CONTEXTO.md**
- §2: Alinear versión con package.json (0.8.0-meridian) O actualizar package.json a 0.9.0-meridian
- §3: Cambiar "Next.js 16.2.4" a "Next.js 16.1.x"
- §10: Corregir referencia de versión

**MIG-15 — Actualizar PLAN_PROXY_ANTICENSURA.md**
- Cambiar todos los paths `/app/api/` a `src/app/api/`
- Cambiar "15 canales" a "14 canales"
- Cambiar estado a "PARCIALMENTE IMPLEMENTADO"

**MIG-16 — Armonizar CLASIFICACION_FUENTES.md §5 vs §8**
- Reclasificar fuentes que en §5 aparecen como Nivel A pero en §8 obtienen < 80 puntos:
  - Al Mayadeen: 71.45 → Nivel B
  - Democracy Now: 75.9 → Nivel B
  - Africa News: 74.15 → Nivel B
  - Press TV: Sin evaluación numérica → requiere evaluación antes de clasificar
  - Telesur: Sin evaluación numérica → requiere evaluación antes de clasificar
- Decisión: Cambiar §5 para reflejar las puntuaciones de §8, O documentar que §5 es la clasificación "aspiracional" (lo que deberían ser tras período de prueba)

**MIG-17 — Armonizar rate limiting entre documentos**
- CLASIFICACION_FUENTES.md §6 vs PROPUESTA_COMPARACION_FUENTES.md §7.3
- Decisión sugerida (conservadora): Gratuito 2/día, Premium 10/día, Profesional 50/día, Institucional ilimitado
- Actualizar CLASIFICACION_FUENTES.md §6 con estos valores

**MIG-18 — Corregir PRISMA en lista de dependencias no usadas**
- CONTEXTO.md §8: Eliminar `prisma` de la lista (está usada en `src/lib/db.ts`)

---

## 7. MIGRACIÓN DE CONFIGURACIÓN

### 7.1 Variables de Entorno

Actualmente no hay archivo `.env`. Se necesitan para producción:

**MIG-19 — Crear .env.example con variables requeridas**
```
# Base de datos
DATABASE_URL="file:./dev.db"

# Autenticación
NEXTAUTH_SECRET="[generar con openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"

# API de IA (z-ai-web-dev-sdk) — configurado automáticamente en Z.ai

# Email (para alertas y newsletter)
RESEND_API_KEY="[obtener de resend.com]"

# Pagos (Stripe)
STRIPE_SECRET_KEY="[obtener de stripe.com]"
STRIPE_PUBLISHABLE_KEY="[obtener de stripe.com]"
STRIPE_WEBHOOK_SECRET="[generar con stripe cli]"

# Rate limiting
RATE_LIMIT_FREE_ANALYSIS="5"
RATE_LIMIT_FREE_COMPARISON="2"
```

### 7.2 Configuración de Deploy

**MIG-20 — Verificar vercel.json para producción**
- El archivo `vercel.json` existe pero puede estar desactualizado
- Verificar que las routes de API están correctamente configuradas
- Verificar que los headers de seguridad están presentes

---

## 8. MIGRACIÓN DEL SISTEMA DE TV

### 8.1 Estado Actual

- 14 canales de TV en `src/data/channels.ts`
- HLS Player funcional (`src/components/HLSPlayer.tsx`)
- HLS Proxy funcional (`src/app/api/hls-proxy/route.ts`)
- YouTube Live API funcional (`src/app/api/youtube-live/route.ts`)
- Floating Projector funcional (`src/components/FloatingProjector.tsx`)
- Proyector Window funcional (`src/components/ProyectorWindow.tsx`)
- LivePlayer que integra canales en el dashboard (`src/components/LivePlayer.tsx`)

### 8.2 Migraciones Requeridas

**MIG-21 — Integrar clasificación de fuentes en el sistema TV**
- Añadir badge de nivel de fuente (A/B/C/D) junto al logo de cada canal en LivePlayer y ProyectorWindow
- Añadir nota de contextualización para canales de nivel C
- Fuentes de nivel D ocultas del LivePlayer para usuarios gratuitos

**MIG-22 — Mover datos de canales a base de datos**
- Actualmente channels.ts es estático
- Migar a tabla Source en Prisma (MIG-05)
- Los canales TV son un subset de Source (con campos adicionales: hlsUrl, youtubeUrl)
- Crear modelo TVChannel que extienda Source con campos de streaming

---

## 9. ORDEN DE EJECUCIÓN

Las migraciones deben ejecutarse en este orden estricto debido a dependencias:

### Fase M1 — Preparación (Sin cambios funcionales)
1. MIG-13: Actualizar CONTEXTO.md §4
2. MIG-14: Actualizar versiones
3. MIG-15: Actualizar PLAN_PROXY_ANTICENSURA.md
4. MIG-16: Armonizar CLASIFICACION_FUENTES.md
5. MIG-17: Armonizar rate limiting
6. MIG-18: Corregir lista dependencias

### Fase M2 — Estructura de código
7. MIG-01: Separar tipos de datos demo
8. MIG-02: Crear configuración centralizada
9. MIG-03: Normalizar nombres de regiones
10. MIG-19: Crear .env.example

### Fase M3 — Base de datos
11. MIG-05: Crear esquema Prisma completo
12. MIG-06: Migrar datos demo a base de datos
13. MIG-08: Implementar autenticación básica
14. MIG-10: Actualizar labels de sourceLevel

### Fase M4 — Datos de fuentes
15. MIG-04: Añadir metadatos de fuente a canales
16. MIG-11: Evaluar y clasificar las 14 fuentes
17. MIG-12: Ampliar catálogo de fuentes RSS
18. MIG-21: Integrar clasificación en sistema TV

### Fase M5 — API y Seguridad
19. MIG-07: Migración de datos RSS
20. MIG-09: Migrar rutas API a autenticación diferenciada
21. MIG-20: Verificar configuración de deploy
22. MIG-22: Mover datos de canales a base de datos

---

## 10. CRONOGRAMA

| Fase | Duración Estimada | Prerrequisito | Bloquea |
|------|-----------------|---------------|---------|
| M1: Documentación | 2 horas | Ninguno | Nada (documental) |
| M2: Estructura | 4 horas | M1 | M3, M4 |
| M3: Base de datos | 6 horas | M2 | M4, M5 |
| M4: Fuentes | 4 horas | M2, M3 | M5 |
| M5: API | 6 horas | M3, M4 | Plan de Implementación Fase 1 |

**Total estimado**: 22 horas de trabajo (~3 días de desarrollo intensivo)

---

## 11. VERIFICACIÓN POST-MIGRACIÓN

Al completar todas las migraciones, ejecutar este checklist:

- [ ] `bun run build` compila sin errores
- [ ] `bun run db:push` crea todas las tablas sin errores
- [ ] `bun run db:seed` inserta datos demo (si se crea el script)
- [ ] El dashboard carga señales desde la base de datos
- [ ] Todos los paths en CONTEXTO.md coinciden con la estructura real
- [ ] Las versiones en CONTEXTO.md coinciden con package.json
- [ ] Las 14 fuentes de TV tienen nivel de clasificación asignado
- [ ] Las regiones usan códigos normalizados en todo el código
- [ ] Los types TypeScript están separados de los datos demo
- [ ] La configuración centralizada reemplaza todos los valores hardcodeados
- [ ] La autenticación funciona (registro, login, logout)
- [ ] Las rutas API tienen el nivel de protección correcto
- [ ] El content-proxy tiene sanitización XSS
- [ ] No hay inconsistencias entre los 12 documentos de docs/

---

## 12. ROLLBACK

Si una migración falla y no se puede reparar:

1. `git stash` — Guardar cambios actuales
2. `git log --oneline -5` — Verificar commit actual
3. `git checkout .` — Restaurar a último commit limpio
4. `git stash pop` — Recuperar cambios si se desea reintentar
5. Documentar el fallo en worklog.md
6. Abrir nuevo chat de Z.ai si el sandbox queda bloqueado

Importante: NUNCA hacer `git reset --hard` sin verificar primero HEAD (ver PROTOCOLO_GIT.md).
