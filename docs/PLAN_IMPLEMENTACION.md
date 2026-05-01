# Plan de Implementación por Prioridades

## Proyecto: Monitor Geopolítico — News Connect
## Versión del plan: 1.0
## Fecha: 2026-04-28
## Estado: VIGENTE

---

## 0. AUDITORÍA PREVIA — Corrección de Inconsistencias (Semana 0)

Antes de cualquier implementación funcional, se deben corregir las 23 inconsistencias detectadas entre documentos y código fuente. Estas correcciones no agregan funcionalidad pero garantizan que la documentación refleje fielmente el estado real del proyecto, evitando errores de implementación basados en datos desactualizados.

### 0.1 Correcciones en CONTEXTO.md §4 (Estructura del Proyecto)
- Cambiar `app/` por `src/app/` en todas las referencias de paths
- Cambiar `components/` por `src/components/` y listar los 11 componentes existentes (no solo 4)
- Cambiar `lib/channels.ts` por `src/data/channels.ts` y corregir de "15 canales" a "14 canales"
- Cambiar `types/signals.ts` por `src/data/signals.ts`
- Añadir `src/app/api/content-proxy/route.ts` y `src/app/api/route.ts` a la lista de APIs
- Añadir `src/data/channels.ts` y `src/data/signals.ts` como archivos de datos

### 0.2 Correcciones de versiones
- CONTEXTO.md §2: Cambiar versión a "0.8.0-meridian" para consistencia con package.json, O actualizar package.json a 0.9.0-meridian
- CONTEXTO.md §3: Cambiar "Next.js 16.2.4" a "Next.js 16.1.x" para consistencia con package.json "^16.1.1"
- CONTEXTO.md §10: Corregir la referencia de package.json a la versión real

### 0.3 Correcciones en PLAN_PROXY_ANTICENSURA.md
- §3.4: Cambiar `/app/api/hls-proxy/route.ts` a `src/app/api/hls-proxy/route.ts`
- §4: Cambiar "15 canales" a "14 canales"
- §8: Cambiar todos los paths `/app/api/` a `src/app/api/`
- Estado: Cambiar de "PENDIENTE DE IMPLEMENTACIÓN" a "PARCIALMENTE IMPLEMENTADO" (content-proxy ya existe)

### 0.4 Correcciones en CLASIFICACION_FUENTES.md
- §5: Las fuentes marcadas como Nivel A que en §8 obtienen puntuación menor a 80 deben reclasificarse a Nivel B. Esto afecta a: Al Mayadeen (71.45→B), Democracy Now (75.9→B), Africa News (74.15→B). Press TV y Telesur no tienen evaluación numérica en §8 y deberían evaluarse antes de clasificar como A.
- §6: Armonizar límites de comparaciones de fuentes con PROPUESTA_COMPARACION_FUENTES.md §7.3

### 0.5 Correcciones cruzadas
- PROPUESTA_COMPARACION_FUENTES.md §4.2: Cambiar `sourceLevel: "A"` de RT a `"B"`
- Armonizar rate limiting de comparaciones entre CLASIFICACION_FUENTES.md §6 y PROPUESTA_COMPARACION_FUENTES.md §7.3
- CONTEXTO.md §15: Item 5 debe distinguir "content-proxy (ya existe, requiere XSS + política)" de "image-proxy + rss-proxy (no existen, requieren creación)"

### 0.6 Correcciones en código fuente
- `src/data/signals.ts`: Actualizar etiquetas de sourceLevel de "Fuente oficial primaria/B/C/D" a "Referencial/Complementaria/Contrastiva/Vigilada" para consistencia con CLASIFICACION_FUENTES.md
- ~~`src/data/signals.ts`: Verificar si regiones usan "LATAM" vs "LATINOAMÉRICA" y "ASIA" vs "ASIA-PACÍFICO" y alinear con documentación~~ ✅ COMPLETADO (commit b1ca829) — Valor técnico `LATINOAMÉRICA`, sin abreviaturas

### 0.7 Corrección de dependencias
- CONTEXTO.md §8: Eliminar `prisma` de la lista de dependencias no utilizadas (está activamente usada en `src/lib/db.ts`)

**Entregable**: CONTEXTO.md y todos los documentos de estrategia actualizados y consistentes entre sí.

---

## FASE 1 — PRIORIDAD MÁXIMA: Seguridad y Estabilidad (Semanas 1-2)

Objetivo: Eliminar vulnerabilidades críticas, establecer la infraestructura de datos, y sentar las bases para todas las funcionalidades posteriores. Sin esta fase, ninguna otra mejora es responsable de lanzar.

### Sprint 1A — Seguridad y Proxy (Semana 1, días 1-3)

**Tarea 1.1 — Sanitización XSS del content-proxy** (Ver docs/PROPUESTAS_MEJORA.md §1.1)
- Archivo: `src/app/api/content-proxy/route.ts`
- Acción: Implementar sanitización del HTML extraído antes de devolver `fullContent`. Eliminar: `<script>`, `<iframe>`, `<form>`, atributos `on*` (onclick, onload, etc.), URLs `javascript:`, `<object>`, `<embed>`, `<link rel="import">`. Usar una librería como DOMPurify (server-side) o sanitización manual con regex estricta.
- Criterio de aceptación: Ningún script o event handler sobrevive en `fullContent`. Prueba con payloads XSS conocidos (`<img src=x onerror=alert(1)>`, `<script>alert(1)</script>`, `javascript:alert(1)`).
- Impacto: Crítico — sin esto, el proxy es un vector de ataque activo.

**Tarea 1.2 — Rate limiting para APIs de IA** (Ver docs/PROPUESTAS_MEJORA.md §1.3)
- Archivo: Nuevo `src/lib/rateLimit.ts` + middleware en `src/app/api/analyze/route.ts` y futuro `src/app/api/translate/route.ts`
- Acción: Implementar rate limiting por IP usando un Map en memoria con expiración. Límites: Gratuito 5 análisis/día, Premium 50/día, Profesional 200/día, Institucional ilimitado. (Nota: requiere autenticación para tiers — por ahora, implementar rate limiting genérico por IP: 10 requests/hora como baseline).
- Criterio de aceptación: Al exceder el límite, la API devuelve HTTP 429 con header `Retry-After`. No es posible hacer más requests hasta que expire la ventana.
- Dependencia: Tarea 9 (modelo de datos User para tiers diferenciados). Solución temporal: rate limiting genérico por IP.

**Tarea 1.3 — Verificar acceso del servidor a RT** (Ver docs/PLAN_PROXY_ANTICENSURA.md §7)
- Comando: `curl -s -o /dev/null -w "%{http_code}" https://rt.com`
- Si 200/301: El proxy funciona, proceder. Si 000/403: Investigar proxy upstream (Tarea 24, prioridad baja).
- Criterio de aceptación: Documentar el resultado en CONTEXTO.md y worklog.md.

**Tarea 1.4 — Implementar image-proxy** (Ver docs/PLAN_PROXY_ANTICENSURA.md §3.2)
- Archivo: Nuevo `src/app/api/image-proxy/route.ts`
- Acción: Stream directo fetch→response sin Buffer. Whitelist de dominios incluyendo CDN (img.rt.com, cdn.rt.com, etc.). Timeout 8s. Cache-Control: public, max-age=3600.
- Criterio de aceptación: `curl http://localhost:3000/api/image-proxy?url=https://img.rt.com/test.jpg` devuelve imagen. Dominios no whitelist devuelven 403.

**Tarea 1.5 — Implementar rss-proxy** (Ver docs/PLAN_PROXY_ANTICENSURA.md §3.3)
- Archivo: Nuevo `src/app/api/rss-proxy/route.ts`
- Acción: Mapa de feeds RSS por fuente e idioma. Parseo en vuelo, máximo 15 items. Cada item con proxyUrl para content-proxy. Timeout 10s.
- Criterio de aceptación: `curl http://localhost:3000/api/rss-proxy?source=rt&lang=es` devuelve JSON con items.

### Sprint 1B — Datos y Política de Fuentes (Semana 1, días 4-5)

**Tarea 1.6 — Definir esquema Prisma completo** (Ver docs/POLITICA_FUENTES.md §4.3, docs/PROGRAMA_MONETIZACION.md §3.1)
- Archivo: `prisma/schema.prisma`
- Acción: Crear/actualizar modelos: Analysis (id, signalId, sourceUrl, sourceName, title, content JSON, filters, relevance, createdAt, accessExpiresAt, userId), EventCluster (id, title, region, classifiers[], signalIds[], sourceNames[], eventDate), Comparison (id, eventId, sources JSON, metaAnalysis JSON, shareCount, viewCount), Source (id, name, url, level A/B/C/D, region, language, score, evaluatedAt), User (id, email, tier, createdAt).
- Criterio de aceptación: `bun run db:push` ejecuta sin errores. Tablas creadas en SQLite.

**Tarea 1.7 — Modificar content-proxy para cumplir POLITICA_FUENTES.md** (Ver docs/POLITICA_FUENTES.md §4.1)
- Archivo: `src/app/api/content-proxy/route.ts`
- Acción: Añadir campo `sourceLevel` a la respuesta (consultar modelo Source). Añadir `disclaimer` explícito. Verificar que `shareArticle` y `shareAnalysis` cumplen el formato especificado.
- Criterio de aceptación: La respuesta incluye sourceLevel, disclaimer, shareArticle (título+enlace), shareAnalysis (encabezado+enlace+análisis).

### Sprint 1C — Actualización Documental (Semana 2, día 1-2)

**Tarea 1.8 — Actualizar Arquitectura_Tecnica.pdf** (Ver CONTEXTO.md §9)
- Acción: Actualizar diagramas y descripciones para reflejar: estructura real src/app/, 14 canales TV, 8 clasificadores, 5 filtros, bidireccionalidad, 6 regiones, sistema de proxy anti-censura, content-proxy, modelo de datos Prisma, epistemología operativa.
- Criterio de aceptación: PDF actualizado guardado en docs/Arquitectura_Tecnica.pdf.

**Tarea 1.9 — Actualizar Historial_Desarrollo.pdf** (Ver CONTEXTO.md §9)
- Acción: Registrar todo lo implementado pero no documentado: subsistema TV completo (3 componentes + 2 APIs), JSON-LD SEO, mobile tabs, 8 clasificadores (no 6), 8 secciones análisis (no 6), 5 filtros analíticos, bidireccionalidad, 5 bases semánticas, 6 regiones (no 5), multi-clasificación, metadatos de señal, content-proxy, sistema de comparación propuesto.
- Criterio de aceptación: PDF actualizado guardado en docs/Historial_Desarrollo.pdf.

### Sprint 1D — SEO Fase 1 y Multilingue Fase 1 (Semana 2, días 3-5)

**Tarea 1.10 — SEO Fase 1 Fundamentos** (Ver docs/ESTRATEGIA_SEO.md §8)
- Archivos: `src/app/layout.tsx`, nuevo `src/app/sitemap.ts`, nuevo `src/app/robots.ts`
- Acción: Ampliar JSON-LD con NewsArticle schema, ItemList para clasificadores, BreadcrumbList. Crear sitemap.xml dinámico. Crear robots.txt. Verificar Core Web Vitals. Implementar canonical URLs.
- Criterio de aceptación: Google Search Console puede verificar el sitio. Schema Markup Validator pasa sin errores.

**Tarea 1.11 — Multilingue Fase 1 — UI es/en** (Ver docs/ESTRATEGIA_MULTILINGUE.md §7)
- Archivos: Nuevos `src/dictionaries/es.json`, `src/dictionaries/en.json`, nuevo `src/lib/useTranslation.ts`, modificar `src/app/layout.tsx`, crear selector de idioma.
- Acción: Extraer todas las cadenas hardcodeadas a diccionarios. Crear hook `useTranslation` con soporte es/en. Crear selector dropdown en barra superior. Reemplazar todas las cadenas con `t()`.
- Criterio de aceptación: El usuario puede cambiar entre español e inglés. Toda la interfaz cambia instantáneamente. La preferencia se guarda en localStorage.

**Tarea 1.12 — Clasificación de Fuentes en la UI** (Ver docs/CLASIFICACION_FUENTES.md §3)
- Archivos: `src/components/SignalCard.tsx`, `src/data/signals.ts`, modelo Source en Prisma
- Acción: Actualizar etiquetas de sourceLevel en signals.ts a "Referencial/Complementaria/Contrastiva/Vigilada". Añadir badges visuales por nivel (verde/amarillo/naranja/rojo) en SignalCard. Añadir notas de contextualización automáticas para nivel C. Fuentes de nivel D ocultas para usuarios gratuitos.
- Criterio de aceptación: Cada señal muestra badge de nivel de fuente con color. Fuentes nivel C muestran nota de contextualización. Fuentes nivel D no aparecen para tier gratuito.

---

## FASE 2 — PRIORIDAD ALTA: Funcionalidades Core (Semanas 3-6)

Objetivo: Implementar las funcionalidades que definen al producto y generan su propuesta de valor única. Esta fase transforma el prototipo en un producto mínimamente viable.

### Sprint 2A — Vista de Comparación de Señales (Semanas 3-4)

**Tarea 2.1 — Vista de Comparación de Señales Fase 1 MVP** (Ver docs/PROPUESTA_COMPARACION_FUENTES.md §8)
- Archivos: Nuevo `src/app/api/compare/route.ts`, nuevos `src/components/SourceComparisonView.tsx`, `src/components/SourceColumn.tsx`, `src/components/ComparisonHeader.tsx`
- Acción: Crear modelo EventCluster en Prisma. Implementar clustering básico (misma región + clasificador + ventana 24h). Crear endpoint POST /api/compare con análisis individual por fuente. Crear vista con 2-4 columnas side by side.
- Criterio de aceptación: Desde una señal, el usuario puede clickear "Comparar fuentes" y ver 2-4 fuentes lado a lado con sus análisis.

**Tarea 2.2 — Vista de Comparación Fase 2 Meta-análisis** (Ver docs/PROPUESTA_COMPARACION_FUENTES.md §8)
- Archivos: Nuevos `src/components/MetaAnalysisPanel.tsx`, `src/components/FilterComparisonRadar.tsx`, `src/components/RelevanceComparisonChart.tsx`
- Acción: Implementar prompt de IA para meta-análisis transversal. Crear panel con tabs: convergencias, divergencias, omisiones cruzadas, mapa de intereses, síntesis del Sur Global. Crear gráfico radar comparativo de 5 filtros. Crear gráfico de barras de amenaza/emancipación.
- Criterio de aceptación: El meta-análisis muestra convergencias y divergencias entre fuentes con scores numéricos. Gráfico radar interactivo.

### Sprint 2B — Monetización y Autenticación (Semanas 4-5)

**Tarea 2.3 — Autenticación básica** (Ver docs/PROGRAMA_MONETIZACION.md §5 Fase 1)
- Archivos: Configurar autenticación simple (email + password). Evaluar si usar next-auth (ya en dependencias) o implementar JWT manual ligero.
- Acción: Registro, login, logout. Modelo User en Prisma con tier. Middleware de sesión. Página de pricing.
- Criterio de aceptación: Un usuario puede registrarse, iniciar sesión, y ver su tier. El tier controla acceso a funcionalidades.

**Tarea 2.4 — Lógica de acceso por tier** (Ver docs/PROGRAMA_MONETIZACION.md §3.1)
- Acción: Implementar checks de tier en: análisis IA (rate limiting diferenciado), comparación de señales (rate limiting), historial de análisis (30 días / 1 año / ilimitado / ilimitado+export), acceso a fuentes nivel D, funciones de compartir.
- Criterio de aceptación: Cada funcionalidad respeta los límites del tier del usuario.

**Tarea 2.5 — Rate limiting por tier** (Ver docs/PROPUESTAS_MEJORA.md §1.3)
- Acción: Reemplazar rate limiting genérico por IP con rate limiting por tier autenticado. Almacenar conteos en base de datos por userId.
- Criterio de aceptación: Usuario gratuito: 5 análisis/día, 2 comparaciones/día. Premium: ilimitado análisis, 10 comparaciones/día. Profesional: 200 análisis/día, 50 comparaciones/día. Institucional: sin límites.

### Sprint 2C — Accesibilidad y Disclaimer (Semana 5-6)

**Tarea 2.6 — Accesibilidad básica (a11y)** (Ver docs/PROPUESTAS_MEJORA.md §2.1)
- Acción: Contraste AA en todos los textos. Navegación por teclado (focus traps en modales, tabindex). ARIA labels en botones sin texto. Textos alternativos en imágenes. Roles semánticos.
- Criterio de aceptación: Lighthouse accessibility score > 90. Navegable completamente con teclado.

**Tarea 2.7 — Disclaimer legal y Transparencia** (Ver docs/POLITICA_FUENTES.md §3)
- Acción: Añadir disclaimer en footer de cada página. Crear página `/transparencia` con: metodología de filtros, IA utilizada, limitaciones, selección de fuentes, cómo reportar errores.
- Criterio de aceptación: Disclaimer visible en footer. Página de transparencia accesible desde el footer.

**Tarea 2.8 — Funciones de compartir** (Ver docs/POLITICA_FUENTES.md §4.2)
- Acción: Implementar `shareArticle` (título + enlace a fuente, nunca texto completo) y `shareAnalysis` (encabezado con enlace + análisis, formato diferenciado por tier). NOTA: Los botones de compartir fueron removidos del overlay SignalOverlay por decisión de diseño (sesión 2026-04-28). Reubicar a SignalCard o crear vista dedicada de compartir. Integrar también en SourceComparisonView.
- Criterio de aceptación: Compartir artículo copia solo título+enlace. Compartir análisis incluye referencia a fuente. Tier gratuito incluye footer branding.

---

## FASE 3 — PRIORIDAD MEDIA: Mejoras y Escala (Semanas 7-12)

Objetivo: Refinar la experiencia, agregar funcionalidades complementarias, y preparar la plataforma para crecimiento.

### Sprint 3A — Alertas y Comparación Avanzada (Semanas 7-8)

**Tarea 3.1 — Sistema de Alertas** (Ver docs/PROPUESTAS_MEJORA.md §2.5)
- Archivos: Nuevo `src/app/api/alerts/route.ts`, nuevo modelo Alert en Prisma, nuevo `src/components/AlertsPanel.tsx`
- Acción: Alertas configurables por clasificador, región, nivel de amenaza/emancipación. Entrega via email (Resend) y/o Telegram bot. Solo para usuarios Premium+.
- Criterio de aceptación: Usuario configura alerta "Conflicto + Medio Oriente". Al llegar señal matching, recibe notificación.

**Tarea 3.2 — Comparación Fase 3 Clustering Inteligente** (Ver docs/PROPUESTA_COMPARACION_FUENTES.md §8)
- Acción: Reemplazar clustering básico con clustering semántico vía IA. Implementar detección de entidades nombradas. Agregar badges "N fuentes" en dashboard. Botón "Comparar fuentes" en cada señal.
- Criterio de aceptación: El sistema agrupa automáticamente señales sobre el mismo evento. Badges muestran cuántas fuentes cubren cada evento.

### Sprint 3B — Mobile y UX (Semanas 9-10)

**Tarea 3.3 — Mobile-first redesign** (Ver docs/PROPUESTAS_MEJORA.md §3.5)
- Acción: Rediseñar pensando primero en móvil. El ProyectorWindow necesita rediseño para pantallas pequeñas. Sidebar en offcanvas (ya parcialmente implementado). Optimizar touch targets.
- Criterio de aceptación: Lighthouse mobile score > 90. Experiencia completa en móvil sin sacrificar funcionalidad.

**Tarea 3.4 — Integrar proxy en UI del dashboard** (Ver docs/PLAN_PROXY_ANTICENSURA.md §8 Fase 5)
- Acción: Botón "Leer en Monitor" en SignalCard que abre artículo amplido via content-proxy. Imágenes via image-proxy. Indicador visual de fuente bloqueada/desbloqueada.
- Criterio de aceptación: El usuario puede leer artículos de fuentes bloqueadas dentro del Monitor con atribución visible.

**Tarea 3.5 — Limpiar dependencias** (Ver CONTEXTO.md §8)
- Acción: Evaluar y eliminar dependencias no utilizadas: framer-motion, @mdxeditor/editor, @dnd-kit/core, @dnd-kit/sortable (salvo que se usen en comparación), recharts (salvo que se use en gráficos), zustand (salvo que se use en estado global).
- Criterio de aceptación: `package.json` solo tiene dependencias activamente importadas en el código.

### Sprint 3C — Monetización Fase 1 y Contenido (Semanas 10-12)

**Tarea 3.6 — Monetización Fase 1** (Ver docs/PROGRAMA_MONETIZACION.md §5)
- Acción: Configurar Stripe para pagos. Página de pricing. Checkout para Premium ($5/mes). Flujos de onboarding.
- Criterio de aceptación: Un usuario puede pagar con tarjeta y su tier se actualiza automáticamente.

**Tarea 3.7 — SEO Fase 2 Contenido** (Ver docs/ESTRATEGIA_SEO.md §8)
- Acción: Página FAQ con preguntas del modelo epistemológico. Publicar análisis profundo semanal optimizado para medium tail keywords. Implementar hreflang tags para i18n.
- Criterio de aceptación: FAQ page con schema FAQPage. Al menos 2 artículos semanales publicados.

**Tarea 3.8 — Auditoría de fuentes** (Ver docs/CLASIFICACION_FUENTES.md §4)
- Acción: Evaluar las 14 fuentes actuales de channels.ts contra los 5 criterios. Asignar niveles A/B/C/D con puntuación documentada. Publicar resultados.
- Criterio de aceptación: Cada fuente tiene nivel asignado con evaluación documentada. Resultados visibles en la plataforma.

---

## FASE 4 — PRIORIDAD BAJA: Innovación y Consolidación (Semanas 13-24)

Objetivo: Funcionalidades avanzadas que diferencian al producto a largo plazo y preparación para escala.

### Sprint 4A — Comparación Fase 4 y Multilingue Avanzado (Semanas 13-16)

**Tarea 4.1 — Comparación Fase 4 Compartir/Difusión** (Ver docs/PROPUESTA_COMPARACION_FUENTES.md §6)
- Acción: Generación de imagen card para compartir (1200x630px). Exportar como PDF. Cita académica automática (APA, Chicago, Harvard). Integración con redes sociales.
- Criterio de aceptación: Cada comparación puede compartirse como imagen card, PDF, o cita académica.

**Tarea 4.2 — Multilingue Fases 2-4** (Ver docs/ESTRATEGIA_MULTILINGUE.md §7)
- Acción: Crear /api/translate con z-ai-web-dev-sdk. Implementar traducción de contenido (no solo UI). Agregar pt, fr, ar, zh. Soporte RTL para árabe. Cache en navegador y servidor.
- Criterio de aceptación: La plataforma funciona en 6 idiomas. El contenido se traduce al expandir. Árabe muestra RTL.

### Sprint 4B — Funcionalidades Avanzadas (Semanas 17-20)

**Tarea 4.3 — Dark Mode** (Ver docs/PROPUESTAS_MEJORA.md §3.4)
- Acción: Usar next-themes (ya en dependencias) para toggle dark/light. Definir paleta Meridian dark.
- Criterio de aceptación: Toggle funcional. Toda la interfaz tiene versión dark.

**Tarea 4.4 — Glosario interactivo** (Ver docs/PROPUESTAS_MEJORA.md §3.2)
- Acción: Hover o click sobre términos epistemológicos muestra definición en idioma del usuario. Los términos no se traducen pero sí se explican.
- Criterio de aceptación: Click en "Congruencia Inversa" muestra definición accesible. Funciona en todos los idiomas.

**Tarea 4.5 — Vista de Mapa geográfico** (Ver docs/PROPUESTAS_MEJORA.md §2.4)
- Acción: Mapa interactivo con señales geolocalizadas. Calor de conflicto. Líneas de conexión interregional. Requiere coordenadas en señales.
- Criterio de aceptación: Mapa interactivo con señales posicionadas por región. Filtros por clasificador.

**Tarea 4.6 — Modo Offline / PWA** (Ver docs/PROPUESTAS_MEJORA.md §2.2)
- Acción: Service Worker + localStorage para señales y análisis almacenados. Funcionalidad básica sin conexión.
- Criterio de aceptación: PWA instalable. Últimas señales visitadas disponibles offline.

### Sprint 4C — Consolidación y Escala (Semanas 21-24)

**Tarea 4.7 — Expandir catálogo de fuentes** (Ver docs/CLASIFICACION_FUENTES.md §5)
- Acción: Incorporar fuentes sugeridas por región que no están actualmente en channels.ts. Priorizar: Al Mayadeen, The Intercept, Democracy Now, The Cradle, Middle East Eye.
- Criterio de aceptación: Al menos 25 fuentes disponibles.

**Tarea 4.8 — SEO Fases 3-4** (Ver docs/ESTRATEGIA_SEO.md §8)
- Acción: Expandir a 5 idiomas. Automatizar generación de contenido SEO. A/B testing de títulos. Link building con colaboraciones editoriales.
- Criterio de aceptación: Tráfico orgánico 500+ visitantes/día. Posición 1-5 en long tail keywords.

**Tarea 4.9 — Newsletter + API** (Ver docs/PROGRAMA_MONETIZACION.md §3.2-3.3)
- Acción: Lanzar newsletter premium. Documentar y lanzar API pública. Crear documentación para desarrolladores.
- Criterio de aceptación: Newsletter semanal enviada. API documentada con ejemplos. Al menos 3 desarrolladores externos usan la API.

---

## CRONOGRAMA RESUMIDO

| Fase | Semanas | Tareas Clave | Costo |
|------|---------|--------------|-------|
| Fase 0: Auditoría | 0 (pre-sprint) | Corregir 23 inconsistencias documentales | $0 |
| Fase 1: Seguridad | 1-2 | XSS, rate limiting, proxy endpoints, Prisma, SEO F1, i18n F1 | $0 |
| Fase 2: Core | 3-6 | Comparación de señales, autenticación, tiers, a11y, disclaimer | $0-5/mes |
| Fase 3: Mejoras | 7-12 | Alertas, mobile-first, monetización, contenido SEO | $5-20/mes |
| Fase 4: Innovación | 13-24 | Multilingue completo, PWA, mapa, newsletter, API | $20-100/mes |

---

## RIESGOS Y DEPENDENCIAS

- **Acceso a RT**: Si el servidor no puede acceder a RT (Tarea 1.3), el proxy anti-censura requiere alternativa (proxy upstream). Esto bloquea las Tareas 1.4, 1.5, 3.4 parcialmente.
- **Costos de IA**: Sin rate limiting efectivo (Tarea 1.2), los costos de IA pueden escalar incontrolablemente. Esta tarea es prerrequisito para la Fase 2.
- **Autenticación**: La Tarea 2.3 desbloquea la diferenciación por tiers (2.4, 2.5). Sin ella, el rate limiting es solo por IP.
- **Traducción IA**: La Fase 4B multilingue depende de que z-ai-web-dev-sdk soporte los 6 idiomas requeridos. Verificar antes de planificar.

---

## ALINEACIÓN EPISTEMOLÓGICA

Este plan de implementación respeta los principios del proyecto al priorizar la seguridad (Hermenéutica Crítica — revelar vectores de ataque), la accesibilidad (Justicia Cognitiva — el análisis debe ser accesible para todos), y la transparencia (Soberanía Cognitiva — el usuario debe saber qué fuentes consume y cómo se clasifican). La Vista de Comparación de Señales, como killer feature, es la máxima expresión de la Multipolaridad Epistémica: poner todas las voces al mismo nivel y dejar que el usuario, no el algoritmo, evalúe las diferencias entre las señales emitidas sobre un mismo evento.
