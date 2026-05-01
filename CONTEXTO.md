# CONTEXTO — Monitor Geopolítico — News Connect

## 1. PROTOCOLO DE ACCIÓN INMEDIATA

### Restaurar Preview (3 pasos)
El preview funciona así: `bun run dev` levanta Next.js en puerto 3000, y Caddy (que ya corre de fondo) redirige automáticamente el puerto 81 al 3000. El preview URL (`https://preview-<bot-id>.space.chatglm.site/`) apunta a ese proxy. No hay comando adicional ni paso extra.

Si el preview no funciona:
```bash
# 1. Verificar si hay proceso en el puerto 3000
lsof -i :3000

# 2. Si existe, matarlo
kill -9 <PID>

# 3. Arrancar el servidor (ejecutar dentro de subshell para que corra en background)
(bun run dev > /dev/null 2>&1 &)

# 4. Esperar ~10 segundos y verificar
sleep 10 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Debe devolver 200
```

### LO QUE NO SE DEBE HACER
- NUNCA usar `nohup bun run dev > /tmp/next-dev.log 2>&1 &` — no funciona correctamente en este sandbox, el proceso muere inmediatamente
- NUNCA ejecutar `bun run dev` en foreground — bloquea la consola del agente
- NUNCA hacer commit o trackear archivos en .zscripts/ — son infraestructura del sandbox, causan merge conflicts mortales
- NUNCA dejar merge conflicts sin resolver — el health check del sandbox bloquea TODAS las herramientas
- NUNCA hacer git reset --hard HEAD sin verificar primero qué commit es HEAD

### Arquitectura del Sandbox
- /start.sh (PID 1 via tini) arranca todo
- Si .zscripts/dev.sh existe → lo ejecuta como custom entry point
- Si NO existe → ejecuta bun install → bun run db:push → bun run dev automáticamente
- Caddy (PID 2) proxy puerto 81 → 3000 para el panel de preview
- El health check del sandbox intercepta TODAS las herramientas si hay merge conflicts en Git

## 2. IDENTIDAD DEL PROYECTO

Nombre: Monitor Geopolítico — News Connect
Versión: 0.9.0-meridian
Repositorio: https://github.com/julioprado-dotcom/monitor-geopolitico
Último commit: b1ca829 — refactor: renombrar valor técnico de región 'LATAM' → 'LATINOAMÉRICA'
Tags: v0.9.0-meridian, v0.9.1-meridian
Descripción: Plataforma de monitoreo geopolítico con óptica del Sur Global que recopila, clasifica y analiza señales de múltiples fuentes mediante IA. Combina un sistema de TV en vivo con análisis automatizado para ofrecer una perspectiva crítica y no hegemónica de la realidad internacional.

## 3. STACK TECNOLÓGICO

Framework: Next.js 16.1.x (App Router)
Runtime: Bun
Lenguaje: TypeScript
Estilo: Tailwind CSS + Meridian theme
Base de datos: Prisma ORM (SQLite en desarrollo)
IA: z-ai-web-dev-sdk (GLM models)
TV/Video: HLS.js, YouTube IFrame API
Deployment: Z.ai sandbox + GitHub

## 4. ESTRUCTURA DEL PROYECTO

/home/z/my-project/
src/app/ — layout.tsx (JSON-LD SEO, metadata), page.tsx (Dashboard + mobile tabs), globals.css, api/analyze/route.ts (7 dimensiones de análisis, 5 filtros, 2 tipos simple/profundo, bidireccionalidad), api/content-proxy/route.ts (proxy anti-censura), api/hls-proxy/route.ts (150 líneas), api/youtube-live/route.ts (432 líneas), api/route.ts
src/components/ — 13 componentes: FloatingProjector.tsx (293 líneas), ProyectorWindow.tsx (481 líneas), HLSPlayer.tsx (271 líneas), LivePlayer.tsx, LatestSignals.tsx ("Últimas Señales Geopolíticas"), SignalCard.tsx (footer: clasificadores → región → separador → fuente + nivel badge), SignalOverlay.tsx (overlay de noticia ampliada: metadata → imagen → título → panel fuente → contenido → tags → advertencias nivel C/D → análisis IA → disclaimer; cierre al clic fuera o Escape; sin botones de compartir, sin X ni indicador de scroll), AnalysisCard.tsx (tarjetas de análisis con overlay), AnalysisOverlay.tsx (overlay de análisis, mismo patrón que SignalOverlay, fuente de datos en analysisContent.ts; cierre al clic fuera o Escape; sin X ni indicador de scroll), SearchBar.tsx, SourceClassifier.tsx, MGSidebar.tsx, MetricsBar.tsx (barras de relevancia exclusivas con botón limpiar, cuenta desde allSignals)
src/components/ui/ — 53 componentes shadcn/ui (accordion, alert, badge, button, card, dialog, drawer, select, tabs, tooltip, etc.)
src/data/ — channels.ts (14 canales de TV con metadatos de streaming), signals.ts (tipos TypeScript + datos demo + sourceCountry compartido + DISCLAIMER actualizado con marca Newsconnect), signalContent.ts (contenido completo de señales SIG-xxx, lazy load), analysis.ts (tipos TypeScript + datos de análisis ANL-xxx), analysisContent.ts (contenido completo de análisis, lazy load)
src/lib/ — db.ts (Prisma ORM), utils.ts, analysisPrompt.ts (prompt compartido de análisis con 7 dimensiones y 2 tipos), rateLimit.ts
src/hooks/ — use-toast.ts, use-mobile.ts, useMounted.ts
docs/ — 14 documentos estratégicos (ver §22-23) + 3 PDFs (Marco_Conceptual.pdf NO cambiar)
CONTEXTO.md, PROTOCOLO_GIT.md, .gitignore (incluye .zscripts/, worklog.md, download/)

## 5. PARADIGMAS EPISTEMOLÓGICOS

### Epistemologías del Sur (Boaventura de Sousa Santos)
1. Superación del eurocentrismo — Rechazo del pensamiento abismal que divide el mundo en civilizado y salvaje
2. Justicia cognitiva — Igualdad de dignidad epistémica entre todas las formas de conocimiento
3. Diversidad de gramáticas emancipadoras — Múltiples caminos de liberación, no un solo modelo

### 5 Bases Semánticas / Parámetros Cognitivos
(Nombres académicos completos — ver Marco_Conceptual.pdf §3 para desarrollo detallado)
1. Ecología de Saberes — Legitimación de la diversidad de formas de conocimiento sin subordinarlas a un paradigma hegemónico. Autores: Boaventura de Sousa Santos, Aníbal Quijano, Walter Mignolo, Catherine Walsh, Arturo Escobar.
2. Economía Política Crítica — Lectura de fenómenos económicos como relaciones de poder asimétrico, no como procesos neutrales de mercado. Autores: Marx, Luxemburgo, Prebisch, Marini, Rodney, Arrighi.
3. Materialismo Histórico e Historias desde Abajo — Conexión del presente con estructuras del pasado, reconociendo que quien narra determina qué se ve. Autores: Marx, Wallerstein, Guha, Spivak, C.L.R. James, Galeano.
4. Pensamiento Decolonial, Panafricanismo y Tradiciones de Liberación — Detección de lógicas coloniales vigentes y diversidad de tradiciones emancipatorias del Sur. Autores: Quijano, Mignolo, Dussel, Nkrumah, Fanon, Said, Mohanty.
5. Geopolítica Crítica Periférica — Lectura del poder territorial, recursos y soberanía desde la periferia. Autores: Samir Amin, Arrighi, Jalife-Rahme, Mbembe, Mamdani, Hau'ofa.

### Tabla de Correspondencia Bases-Filtros (Base principal + Base secundaria)
Congruencia Inversa → Geopolítica Crítica Periférica + Economía Política Crítica
Coherencia Histórica → Materialismo Histórico + Ecología de Saberes
Integridad Epistémica → Ecología de Saberes + Pensamiento Decolonial/Panafricanismo
Confiabilidad Asimétrica → Ecología de Saberes + Geopolítica Crítica Periférica
Flexibilidad Pragmática → Geopolítica Crítica Periférica + Economía Política Crítica

### Óptica Sur Global — 6 Principios Operativos
1. Descentramiento del Norte como referencia
2. Revalorización de voces marginadas
3. Contextualización histórica no eurocéntrica
4. Análisis de asimetrías de poder epistémico
5. Priorización de impactos en el Sur Global
6. Articulación de resistencias y alternativas

AVISO CRÍTICO: Estos paradigmas NO son decoración teórica — son el ADN filosófico del proyecto. Cada decisión técnica, cada clasificador, cada filtro debe ser consistente con ellos.

## 6. MARCO CONCEPTUAL — OPERATIVO

8 Clasificadores: Conflicto, Economía, Diplomacia, Seguridad, Tecnología, Ecosistema, Energía, Derechos Humanos
Multi-clasificación: classifiers es string[] (una señal puede tener múltiples clasificadores)

6 Regiones: NORTEAMÉRICA, LATINOAMÉRICA, EUROPA, ASIA, MEDIO ORIENTE, ÁFRICA (valor técnico del tipo Region = 'LATINOAMÉRICA', no abreviaturas)

5 Filtros Analíticos: Congruencia Inversa, Coherencia Histórica, Integridad Epistémica, Confiabilidad Asimétrica, Flexibilidad Pragmática

Bidireccionalidad de la Relevancia: Toda señal se evalúa en DOS dimensiones: Amenaza (riesgo para el Sur Global) y Emancipación (oportunidad de liberación)

7 Dimensiones de Análisis IA (ver Marco_Conceptual.pdf Tabla 11): Son criterios de razonamiento, NO subtítulos. El análisis es texto fluido. Única excepción: "Escenarios Prospectivos" como última parte.
1. Contexto Geopolítico (Filtro: Coherencia Histórica)
2. Intereses y Actores (Filtro: Congruencia Inversa)
3. Dimensión de Amenaza
4. Dimensión de Emancipación (Filtro: Integridad Epistémica)
5. Dimensiones Transversales
6. Voces del Sur (Filtro: Confiabilidad Asimétrica)
7. Escenarios Prospectivos (Filtro: Flexibilidad Pragmática)

2 Tipos de Análisis: Simple (MEDIA/BAJA/INFORMATIVA, ~500-800 tokens, sin subtítulos) y En Profundidad (CRÍTICA/ALTA, ~2000-3000 tokens, subtítulos opcionales descriptivos del contenido, nunca los nombres de los criterios). El Monitor NO incluye conclusiones ni recomendaciones: proporciona criterios de análisis y enfoque desde el Sur Global; el lector formula sus propias conclusiones.

Metadatos de Señal: sourceLevel (A/B/C/D), accessLevel (ABIERTO/RESTRINGIDO/CLASIFICADO), verified (boolean), language (código ISO)

## 7. SUBSISTEMA TV

Componentes: FloatingProjector.tsx (293 líneas, ventana flotante draggable/resizable), ProyectorWindow.tsx (481 líneas, ventana principal con pestañas), HLSPlayer.tsx (271 líneas, player HLS con fallbacks), LivePlayer.tsx (integración en dashboard)
APIs: /api/hls-proxy/route.ts (150 líneas), /api/youtube-live/route.ts (432 líneas)
Canales: channels.ts con 14 canales (RT, RT Español, Al Jazeera, CGTN, NHK World, WION, NDTV, Africanews, TeleSUR, TeleSUR English, Cubavisión, TRT World, Al Mayadeen, Press TV)
JSON-LD SEO: Esquema structured data en layout.tsx
Proxy anti-censura: content-proxy ya implementado en src/app/api/content-proxy/route.ts

## 8. DEPENDENCIAS NO UTILIZADAS

TODAS eliminadas en sesión 2026-04-29 (25 paquetes removidos con bun remove):
next-auth, zustand, @tanstack/react-query, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities,
@mdxeditor/editor, framer-motion, recharts, next-intl, next-themes, react-hook-form,
@hookform/resolvers, @tanstack/react-table, react-day-picker, react-resizable-panels,
react-syntax-highlighter, date-fns, embla-carousel-react, input-otp, vaul, cmdk, sonner,
@reactuses/core, uuid
NOTA: prisma fue eliminada de esta lista — está activamente usada en src/lib/db.ts

## 9. ESTADO DE DOCUMENTACIÓN

Marco_Conceptual.pdf — Vigente, modificado en sesión 2026-04-29 (Tabla 11: 8→7 dimensiones, nota §9 y §12 sobre no conclusiones/recomendaciones)
Arquitectura_Tecnica.pdf — Desactualizado, actualizar para consistencia con MC e implementación real
Historial_Desarrollo.pdf — Desactualizado, actualizar con: items implementados pero no registrados, 8 clasificadores, 7 dimensiones de análisis, 5 filtros, bidireccionalidad, 6 regiones, multi-clasificación, metadatos, subsistema TV, JSON-LD SEO, mobile tabs

Principales gaps en Historial de Desarrollo: Subsistema TV completo no registrado, JSON-LD SEO no registrado, mobile tabs no registrados, dice 6 clasificadores pero son 8, dice 6 secciones de análisis pero son 7 dimensiones, no menciona 5 filtros analíticos, no menciona bidireccionalidad, no menciona 5 bases semánticas, dice 5 regiones pero son 6 (falta NORTEAMÉRICA), no menciona multi-clasificación, no documenta metadatos de señal, versión dice 0.8.0 pero es 0.9.0

## 10. VERSIONES

package.json: 0.9.0-meridian
Historial_Desarrollo.pdf: referencia 0.8.0 DESACTUALIZADO (pendiente actualización)
Marco Conceptual: v0.9.0
Tags Git: v0.9.0-meridian, v0.9.1-meridian, v0.9.2-meridian

## 11. PREFERENCIAS DEL USUARIO

Idioma: Español (todas las comunicaciones, documentos, código cuando sea posible)
Metodología: Analiza, investiga y resuelve, no supongas ni hagas intentos a lo loco
Formato de entregas: PDFs para documentación formal
Filosofía: Los paradigmas epistemológicos no son decoración — son el ADN del proyecto
Git: Trabajar con protocolo claro, no actualizar el repo hasta estar listos

## 12. PROBLEMAS RESUELTOS / LECCIONES APRENDIDAS

1. Preview panel colapsa → Solución: .zscripts/dev.sh con nohup; NO ejecutar bun run dev manualmente
2. Merge conflict deadlock → Los merge conflicts en .zscripts/ bloquean TODAS las herramientas. Solución: .zscripts/ en .gitignore, NUNCA trackear archivos del sandbox
3. git reset --hard sin verificar → Puede destruir archivos no commiteados. SIEMPRE verificar qué es HEAD antes de reset
4. Sesiones no comparten estado → Cada sesión empieza desde cero. CONTEXTO.md y worklog.md son la memoria persistente
5. Health check cacheado → Si una sesión tiene merge conflict, aunque se resuelva externamente, la sesión queda bloqueada. Hay que continuar en nuevo chat.
6. Hydration mismatch (overflow-hidden) → Si page.tsx tiene overflow-hidden en el grid y se quita, el servidor cachea el HTML viejo y el cliente renderiza distinto. Solución: mantener overflow-hidden consistente entre servidor y cliente.
7. AnalysisOverlay → Creado clonando patrón de SignalOverlay con fuente de datos en analysisContent.ts. Tarjetas de análisis ahora muestran artículo completo correctamente.
8. AnalysisOverlay verificado funcional (sesión 2026-04-29) → Flujo completo AnalysisCard → AnalysisOverlay → Análisis IA probado con browser automation. 6 tarjetas visibles, contenido completo (1564px scroll), análisis IA generado (~11,000 caracteres), cierre por backdrop click, 0 errores en consola.

## 13. PROTOCOLO GIT

Ver archivo: /home/z/my-project/PROTOCOLO_GIT.md

## 14. PROXY ANTI-CENSURA

Ver plan completo: /home/z/my-project/docs/PLAN_PROXY_ANTICENSURA.md

## 15. TAREAS PENDIENTES

PRE-REQUISITO: Ejecutar migraciones de docs/PLAN_MIGRACION.md (22 migraciones, ~3 días) antes de iniciar cualquier tarea funcional. Ver también docs/PLAN_IMPLEMENTACION.md para el plan completo con cronograma.

Prioridad 0 — URGENTE (bugs activos en la UI):
1. ~~**Overlays (SignalOverlay + AnalysisOverlay) — flecha scroll y botón cerrar**~~ ✅ RESUELTO (sesión 2026-04-29)
   - Estrategia final: Eliminación completa de ambos elementos (botón X rojo + flecha indicadora de scroll).
   - El overlay se cierra clickeando fuera del contenido o con Escape. El scroll es evidente por la barra del contenedor.
   - Se removió: `X as XIcon` import, `scrollRef`, `showScrollHint`, `handleScroll`, `useEffect` de scroll detection, botón close `<button>`, div indicador scroll, y importaciones `useRef`.
   - Archivos: `src/components/SignalOverlay.tsx`, `src/components/AnalysisOverlay.tsx`
2. ~~Crear shared analysis prompt en `src/lib/analysisPrompt.ts` y unificar en `analyze/route.ts` y `compare/route.ts`~~ ✅ HECHO (sesión 2026-04-28, archivo: `src/lib/analysisPrompt.ts`, ambos routes lo importan)

Prioridad 0.5 — PRE-IMPLEMENTACIÓN (auditoría y correcciones documentales):
- Corregir 23 inconsistencias entre documentos y código (ver docs/PLAN_IMPLEMENTACION.md §0) — PARCIALMENTE HECHO: MIG-10 labels (✅), MIG-13 CONTEXTO §4 (✅), MIG-18 prisma deps (✅), MIG-14 versiones (✅ ya 0.9.0). Restantes 19 inconsistencias PENDIENTES (ver lista en worklog.md).
- Ejecutar migraciones M1-M5 de docs/PLAN_MIGRACION.md — PENDIENTE (M1 parcial, M2-M5 sin iniciar)

Prioridad 1 — MÁXIMA (implementar primero, requiere migraciones completadas):
1. Sanitización XSS del content-proxy (URGENTE — ver docs/PROPUESTAS_MEJORA.md)
2. ~~Rate limiting para /api/analyze y /api/translate~~ PARCIALMENTE HECHO: `src/lib/rateLimit.ts` existe con limiting por IP (10/hr analyze, 5/hr compare). PENDIENTE: tier-based (requiere autenticación MIG-08)
3. Accesibilidad básica (a11y) — ver docs/PROPUESTAS_MEJORA.md
4. Verificar acceso del servidor a RT (precondición para proxy anti-censura)
5. Implementar proxy anti-censura: image-proxy y rss-proxy (content-proxy ya existe, requiere XSS + política de fuentes — ver docs/PLAN_PROXY_ANTICENSURA.md)
6. Implementar POLÍTICA_FUENTES.md en todos los componentes (ver docs/POLITICA_FUENTES.md)
7. Modificar content-proxy para cumplir política: visualización ampliada dentro del Monitor, compartir solo con enlace a fuente, disclaimer automático
8. Implementar Fase 1 de estrategia SEO (ver docs/ESTRATEGIA_SEO.md)
9. Definir estrategia de almacenamiento de análisis por tier junto con modelo de datos Analysis (ver docs/PROGRAMA_MONETIZACION.md y docs/POLITICA_FUENTES.md sección 2.4)
10. Implementar Fase 1 de estrategia multilingue: UI en es/en con selector de idioma (ver docs/ESTRATEGIA_MULTILINGUE.md)
11. Implementar Vista de Comparación de Señales Fase 1 MVP (ver docs/PROPUESTA_COMPARACION_FUENTES.md)
12. Implementar sistema de clasificación de fuentes en la interfaz del Monitor (etiquetas por nivel A/B/C/D, notas de contextualización automáticas para nivel C, acceso restringido para nivel D — ver docs/CLASIFICACION_FUENTES.md)
13. Actualizar Historial_Desarrollo.pdf
14. Actualizar Arquitectura_Tecnica.pdf

Prioridad media:
15. Implementar Fase 1 de programa de monetización (ver docs/PROGRAMA_MONETIZACION.md)
16. Vista de Comparación de Señales Fase 2 — meta-análisis IA (ver docs/PROPUESTA_COMPARACION_FUENTES.md)
17. Sistema de Alertas configurables (ver docs/PROPUESTAS_MEJORA.md)
18. Mobile-first redesign (ver docs/PROPUESTAS_MEJORA.md)
19. Limpiar dependencias no utilizadas en package.json
20. Integrar proxy en la UI del dashboard
21. Agregar disclaimer legal en footer + página de Transparencia Metodológica
22. Implementar funciones de compartir artículo y compartir análisis con diferenciación por tier (NOTA: botones de compartir removidos del overlay SignalOverlay por decisión de diseño; reubicar a SignalCard o vista dedicada si se reimplementan)
23. Auditar y reclasificar las 14 fuentes actuales de channels.ts según docs/CLASIFICACION_FUENTES.md

UI mejoradas (implementadas en sesión 2026-04-28):
- SignalOverlay: reordenado (metadata → imagen → título → panel fuente → contenido → tags → análisis IA → disclaimer)
- Panel de fuente destacado: bandera + código país + fuente + idioma + "Ir al artículo" con color de nivel
- ~~Botón X de cierre en rojo~~ — ELIMINADO (sesión 2026-04-29, estrategia: cierre por clic fuera + Escape)
- Cierre al hacer clic fuera del overlay (backdrop onClick)
- ~~Indicador de scroll~~ — ELIMINADO (sesión 2026-04-29, el scroll es evidente por la barra del contenedor)
- sourceCountry extraído a signals.ts para reutilización entre SignalCard y SignalOverlay
- AnalysisOverlay creado con mismo patrón que SignalOverlay (fuentes en analysisContent.ts)
- Explorer renombrado a "Hilos Geopolíticos" en tabs
- DISCLAIMER actualizado: sin frase de compartir, con marca "Newsconnect"
- MetricsBar: filtro de relevancia exclusivo (un solo nivel a la vez), botón limpiar, conteo desde allSignals
- SignalCard: footer reorganizado (clasificadores → región → separador → fuente + nivel badge)
- Nombres: "Señales" → "Señales Geopolíticas" en tabs, métricas y búsqueda

Prioridad baja:
24. Evaluar proxy upstream si servidor no accede a RT
25. Rotación de mirrors HLS
26. Más fuentes RSS
27. Expandir catálogo de fuentes según selección sugerida en docs/CLASIFICACION_FUENTES.md §5
28. Implementar Fases 2-4 de estrategia multilingue (ver docs/ESTRATEGIA_MULTILINGUE.md)
29. Dark Mode
30. Glosario interactivo de términos epistemológicos
31. Modo Offline / PWA
32. Vista de Mapa geográfico
33. Vista de Comparación de Señales Fases 3-4 — clustering inteligente + compartir (ver docs/PROPUESTA_COMPARACION_FUENTES.md)
34. Sistema automatizado de evaluación de honestidad periodística (ver docs/CLASIFICACION_FUENTES.md §7)

## 16. ESTRATEGIA SEO

Ver documento completo: docs/ESTRATEGIA_SEO.md

Resumen: 4 fases (fundamentos, contenido, escala, autoridad), keywords en 3 niveles (long tail, medium tail, head terms), SEO técnico (schema ampliado, Core Web Vitals, sitemap, i18n), contenido por clasificador, link building con bajo presupuesto, métricas con herramientas gratuitas. Costo total fase 1: $0.

## 17. PROGRAMA DE MONETIZACIÓN

Ver documento completo: docs/PROGRAMA_MONETIZACION.md

Resumen: 5 principios rectores (Soberanía Cognitiva, Justicia Cognitiva, Transparencia, Independencia, Sostenibilidad), modelo freemium con 4 tiers (gratuito, $5/mes, $25/mes, $200/mes), newsletter premium, API como servicio, donaciones, contenido patrocinado ético, consultoría. Punto de equilibrio: 14-30 suscriptores premium. Costo operativo mes 1: $0-70.

## 18. ESTRATEGIA MULTILINGUE

Ver documento completo: docs/ESTRATEGIA_MULTILINGUE.md

Resumen: Interfaz por defecto en español, contenido en idioma original con badges. Al cambiar idioma se traduce TODO (no solo títulos). Dos capas: UI con diccionarios JSON, contenido con IA. 6 idiomas: es, en, pt, fr, ar, zh. Endpoint /api/translate con z-ai-web-dev-sdk. Términos epistemológicos nunca se traducen. Cache en navegador y servidor. Soporte RTL para árabe. 4 fases de implementación.

## 19. PROPUESTAS DE MEJORA

Ver documento completo: docs/PROPUESTAS_MEJORA.md

Killer feature: Vista de Comparación de Señales (ver mismo evento cubierto por múltiples fuentes con filtros aplicados). Advertencias críticas: XSS en proxy, sesgo IA, costos IA. Ver docs/PROPUESTAS_MEJORA.md para lista completa y priorización.

## 20. VISTA DE COMPARACIÓN DE SEÑALES

Ver documento completo: docs/PROPUESTA_COMPARACION_FUENTES.md

Killer feature del proyecto. Seleccionar un evento → ver señales de 4+ fuentes lado a lado → meta-análisis con convergencias, divergencias, omisiones cruzadas, mapa de intereses, evaluación bidireccional comparada, síntesis del Sur Global. Endpoint /api/compare. Componentes: SourceComparisonView, SourceColumn, MetaAnalysisPanel, FilterComparisonRadar. 4 fases: MVP visual, meta-análisis IA, clustering inteligente, compartir/difusión.

## 21. CLASIFICACIÓN DE FUENTES

Ver documento completo: docs/CLASIFICACION_FUENTES.md

Sistema de clasificación cualitativa (sin puntuaciones numéricas ni rankings). Cinco criterios internos de evaluación (solo equipo e IA): Honestidad periodística, Sesgos, Transparencia editorial, Cobertura del Sur Global, Accesibilidad técnica. Cuatro niveles: A Referencial, B Complementaria, C Contrastiva, D Vigilada. Actualmente no hay fuentes en Nivel A. La mayoría de las fuentes activas están en Nivel B. Fuentes institucionales (OHCHR, CIJ) clasificadas como A por ser organismos internacionales, no medios. Catálogo con identidad del medio + nivel. Revisiones trimestrales. Perfiles detallados de uso interno. Ver documento completo para estructura completa.

## 22. PLAN DE IMPLEMENTACIÓN

Ver documento completo: docs/PLAN_IMPLEMENTACION.md

Plan de implementación por prioridades con 4 fases y 5 sprints. Fase 0: Corrección de 23 inconsistencias documentales. Fase 1 (semanas 1-2): Seguridad (XSS, rate limiting), proxy endpoints, Prisma, SEO F1, i18n F1, clasificación de fuentes en UI. Fase 2 (semanas 3-6): Comparación de señales, autenticación, tiers, a11y, disclaimer. Fase 3 (semanas 7-12): Alertas, mobile-first, monetización, contenido SEO. Fase 4 (semanas 13-24): Multilingue completo, PWA, mapa, newsletter, API.

## 23. PLAN DE MIGRACIÓN

Ver documento completo: docs/PLAN_MIGRACION.md

22 migraciones técnicas en 5 fases. M1: Documentación (6 correcciones). M2: Estructura de código (separar tipos, config centralizada, normalizar regiones). M3: Base de datos (esquema Prisma, datos demo, autenticación). M4: Datos de fuentes (metadatos, evaluación, catálogo RSS). M5: API y seguridad (rutas protegidas, deploy). Duración estimada: 22 horas (~3 días). PRE-REQUISITO para toda implementación funcional.
