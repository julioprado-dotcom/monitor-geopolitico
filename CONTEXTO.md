# CONTEXTO — Monitor Geopolítico — News Connect

## 1. PROTOCOLO DE ACCIÓN INMEDIATA

### Diagnóstico del Preview (5 pasos)
1. Verificar si el servidor Next.js corre: curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
2. Si devuelve 000 → servidor caído. NO ejecutar bun run dev manualmente.
3. Verificar si .zscripts/dev.sh existe: ls -la .zscripts/dev.sh
4. Si NO existe, crearlo con este contenido:
#!/bin/bash
cd /home/z/my-project
bun install 2>/dev/null || true
bun run db:push 2>/dev/null || true
nohup bun run dev > /tmp/next-dev.log 2>&1 &
echo $! > /tmp/next-dev.pid
echo "Dev server started with PID $(cat /tmp/next-dev.pid)"
5. Verificar Caddy: curl -s -o /dev/null -w "%{http_code}" http://localhost:81

### LO QUE NO SE DEBE HACER
- NUNCA ejecutar bun run dev manualmente desde consola — interfiere con el auto-start del sandbox y colapsa el panel de preview
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
Último commit: 865a6c7 — feat: Monitor Geopolítico — News Connect v0.9.0-meridian
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
src/app/ — layout.tsx (JSON-LD SEO, metadata), page.tsx (Dashboard + mobile tabs), globals.css, api/analyze/route.ts (8 secciones, 5 filtros, bidireccionalidad), api/content-proxy/route.ts (proxy anti-censura), api/hls-proxy/route.ts (150 líneas), api/youtube-live/route.ts (432 líneas), api/route.ts
src/components/ — 11 componentes: FloatingProjector.tsx (293 líneas), ProyectorWindow.tsx (481 líneas), HLSPlayer.tsx (271 líneas), LivePlayer.tsx, LatestSignals.tsx ("Últimas Señales Geopolíticas"), SignalCard.tsx (footer: clasificadores → región → separador → fuente + nivel badge), SignalOverlay.tsx (overlay de noticia ampliada: metadata → imagen → título → panel fuente → contenido → tags → advertencias nivel C/D → análisis IA → disclaimer; cierre al clic fuera; X roja; indicador de scroll; sin botones de compartir), SearchBar.tsx, SourceClassifier.tsx, MGSidebar.tsx, MetricsBar.tsx (barras de relevancia exclusivas con botón limpiar, cuenta desde allSignals)
src/components/ui/ — 53 componentes shadcn/ui (accordion, alert, badge, button, card, dialog, drawer, select, tabs, tooltip, etc.)
src/data/ — channels.ts (14 canales de TV con metadatos de streaming), signals.ts (tipos TypeScript + datos demo + sourceCountry compartido + DISCLAIMER actualizado con marca Newsconnect)
src/lib/ — db.ts (Prisma ORM), utils.ts
src/hooks/ — use-toast.ts, use-mobile.ts, useMounted.ts
docs/ — 14 documentos estratégicos (ver §22-23) + 3 PDFs (Marco_Conceptual.pdf NO cambiar)
CONTEXTO.md, PROTOCOLO_GIT.md, .gitignore (incluye .zscripts/, worklog.md, download/)

## 5. PARADIGMAS EPISTEMOLÓGICOS

### Epistemologías del Sur (Boaventura de Sousa Santos)
1. Superación del eurocentrismo — Rechazo del pensamiento abismal que divide el mundo en civilizado y salvaje
2. Justicia cognitiva — Igualdad de dignidad epistémica entre todas las formas de conocimiento
3. Diversidad de gramáticas emancipadoras — Múltiples caminos de liberación, no un solo modelo

### 5 Bases Semánticas / Parámetros Cognitivos
1. Multipolaridad Epistémica — Pluralidad de marcos interpretativos, no hegemonía occidental
2. Justicia Cognitiva — Equidad entre sistemas de conocimiento del Norte y Sur
3. Soberanía Cognitiva — Derecho de los pueblos a sus propios marcos de sentido
4. Hermenéutica Crítica — Interpretación que revela relaciones de poder ocultas
5. Pragmatismo Emancipador — El conocimiento debe servir a la liberación, no solo describir

### Tabla de Correspondencia Bases-Filtros
Multipolaridad Epistémica → Congruencia Inversa
Justicia Cognitiva → Coherencia Histórica
Soberanía Cognitiva → Integridad Epistémica
Hermenéutica Crítica → Confiabilidad Asimétrica
Pragmatismo Emancipador → Flexibilidad Pragmática

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

6 Regiones: NORTEAMÉRICA, LATINOAMÉRICA, EUROPA, ASIA-PACÍFICO, MEDIO ORIENTE, ÁFRICA

5 Filtros Analíticos: Congruencia Inversa, Coherencia Histórica, Integridad Epistémica, Confiabilidad Asimétrica, Flexibilidad Pragmática

Bidireccionalidad de la Relevancia: Toda señal se evalúa en DOS dimensiones: Amenaza (riesgo para el Sur Global) y Emancipación (oportunidad de liberación)

8 Secciones del Análisis IA: 1.Clasificación primaria y secundaria, 2.Resumen ejecutivo, 3.Análisis contextual, 4.Perspectiva Sur Global, 5.Cadenas causales, 6.Evaluación de relevancia bidireccional, 7.Conexiones interregionales, 8.Implicaciones prospectivas

Metadatos de Señal: sourceLevel (A/B/C/D), accessLevel (ABIERTO/RESTRINGIDO/CLASIFICADO), verified (boolean), language (código ISO)

## 7. SUBSISTEMA TV

Componentes: FloatingProjector.tsx (293 líneas, ventana flotante draggable/resizable), ProyectorWindow.tsx (481 líneas, ventana principal con pestañas), HLSPlayer.tsx (271 líneas, player HLS con fallbacks), LivePlayer.tsx (integración en dashboard)
APIs: /api/hls-proxy/route.ts (150 líneas), /api/youtube-live/route.ts (432 líneas)
Canales: channels.ts con 14 canales (RT, RT Español, Al Jazeera, CGTN, NHK World, WION, NDTV, Africanews, TeleSUR, TeleSUR English, Cubavisión, TRT World, Al Mayadeen, Press TV)
JSON-LD SEO: Esquema structured data en layout.tsx
Proxy anti-censura: content-proxy ya implementado en src/app/api/content-proxy/route.ts

## 8. DEPENDENCIAS NO UTILIZADAS

next-auth, zustand, @tanstack/react-query, @dnd-kit/core, @dnd-kit/sortable, @mdxeditor/editor, framer-motion, recharts
NOTA: prisma fue eliminada de esta lista — está activamente usada en src/lib/db.ts

## 9. ESTADO DE DOCUMENTACIÓN

Marco_Conceptual.pdf — Completo y vigente, NO modificar
Arquitectura_Tecnica.pdf — Desactualizado, actualizar para consistencia con MC e implementación real
Historial_Desarrollo.pdf — Desactualizado, actualizar con: items implementados pero no registrados, 8 clasificadores, 8 secciones análisis, 5 filtros, bidireccionalidad, 6 regiones, multi-clasificación, metadatos, subsistema TV, JSON-LD SEO, mobile tabs

Principales gaps en Historial de Desarrollo: Subsistema TV completo no registrado, JSON-LD SEO no registrado, mobile tabs no registrados, dice 6 clasificadores pero son 8, dice 6 secciones de análisis pero son 8, no menciona 5 filtros analíticos, no menciona bidireccionalidad, no menciona 5 bases semánticas, dice 5 regiones pero son 6 (falta NORTEAMÉRICA), no menciona multi-clasificación, no documenta metadatos de señal, versión dice 0.8.0 pero es 0.9.0

## 10. VERSIONES

package.json: 0.9.0-meridian
Historial_Desarrollo.pdf: referencia 0.8.0 DESACTUALIZADO (pendiente actualización)
Marco Conceptual: v0.9.0
Tags Git: v0.9.0-meridian, v0.9.1-meridian

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

## 13. PROTOCOLO GIT

Ver archivo: /home/z/my-project/PROTOCOLO_GIT.md

## 14. PROXY ANTI-CENSURA

Ver plan completo: /home/z/my-project/docs/PLAN_PROXY_ANTICENSURA.md

## 15. TAREAS PENDIENTES

PRE-REQUISITO: Ejecutar migraciones de docs/PLAN_MIGRACION.md (22 migraciones, ~3 días) antes de iniciar cualquier tarea funcional. Ver también docs/PLAN_IMPLEMENTACION.md para el plan completo con cronograma.

Prioridad 0 — URGENTE (bugs activos en la UI):
1. **Overlays (SignalOverlay + AnalysisOverlay) — flecha scroll y botón cerrar mal posicionados**: Se aplicaron múltiples intentos de corrección. Estado actual del código:
   - Wrapper: `relative glass-strong rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in`
   - Close button: `absolute top-3 right-3 z-10` (hijo directo del wrapper)
   - Scroll indicator: `absolute bottom-3 right-3 z-20 pointer-events-none` (hijo directo del wrapper)
   - Scroll container: `flex-1 min-h-0 overflow-y-auto overlay-scroll` (hijo directo del wrapper)
   - Problema: El botón de cerrar y la flecha NO aparecen en la esquina inferior derecha del cuadro visible. Posiblemente el `glass-strong` (que tiene `backdrop-filter`) crea un nuevo stacking context que interfere con `absolute`, o el wrapper no tiene altura resuelta al momento del render. Investigar con DevTools inspeccionando los computed styles del wrapper.
   - Archivos: `src/components/SignalOverlay.tsx`, `src/components/AnalysisOverlay.tsx`
   - NOTA: No ejecutar bun run dev manualmente. Usar bash .zscripts/dev.sh o dejar que el sandbox lo maneje.
2. Crear shared analysis prompt en `src/lib/analysis-prompt.ts` y unificar en `analyze/route.ts` y `compare/route.ts`
3. Remover sección "Recomendaciones" del análisis IA

Prioridad 0.5 — PRE-IMPLEMENTACIÓN (auditoría y correcciones documentales):
- Corregir 23 inconsistencias entre documentos y código (ver docs/PLAN_IMPLEMENTACION.md §0)
- Ejecutar migraciones M1-M5 de docs/PLAN_MIGRACION.md

Prioridad 1 — MÁXIMA (implementar primero, requiere migraciones completadas):
1. Sanitización XSS del content-proxy (URGENTE — ver docs/PROPUESTAS_MEJORA.md)
2. Rate limiting para /api/analyze y /api/translate (URGENTE — ver docs/PROPUESTAS_MEJORA.md)
3. Accesibilidad básica (a11y) — ver docs/PROPUESTAS_MEJORA.md
4. Verificar acceso del servidor a RT (precondición para proxy anti-censura)
5. Implementar proxy anti-censura: image-proxy y rss-proxy (content-proxy ya existe, requiere XSS + política de fuentes — ver docs/PLAN_PROXY_ANTICENSURA.md)
6. Implementar POLÍTICA_FUENTES.md en todos los componentes (ver docs/POLITICA_FUENTES.md)
7. Modificar content-proxy para cumplir política: visualización ampliada dentro del Monitor, compartir solo con enlace a fuente, disclaimer automático
8. Implementar Fase 1 de estrategia SEO (ver docs/ESTRATEGIA_SEO.md)
9. Definir estrategia de almacenamiento de análisis por tier junto con modelo de datos Analysis (ver docs/PROGRAMA_MONETIZACION.md y docs/POLITICA_FUENTES.md sección 2.4)
10. Implementar Fase 1 de estrategia multilingue: UI en es/en con selector de idioma (ver docs/ESTRATEGIA_MULTILINGUE.md)
11. Implementar Vista de Comparación de Fuentes Fase 1 MVP (ver docs/PROPUESTA_COMPARACION_FUENTES.md)
12. Implementar sistema de clasificación de fuentes en la interfaz del Monitor (etiquetas por nivel A/B/C/D, notas de contextualización automáticas para nivel C, acceso restringido para nivel D — ver docs/CLASIFICACION_FUENTES.md)
13. Actualizar Historial_Desarrollo.pdf
14. Actualizar Arquitectura_Tecnica.pdf

Prioridad media:
15. Implementar Fase 1 de programa de monetización (ver docs/PROGRAMA_MONETIZACION.md)
16. Vista de Comparación de Fuentes Fase 2 — meta-análisis IA (ver docs/PROPUESTA_COMPARACION_FUENTES.md)
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
- Botón X de cierre en rojo (bg-red-500/20, hover bg-red-500/40, text-red-400)
- Cierre al hacer clic fuera del overlay (backdrop onClick)
- Indicador de scroll: flecha animada en esquina inferior derecha, se oculta al llegar al fondo (PENDIENTE: posicionamiento incorrecto, ver Prioridad 0 #1)
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
33. Vista de Comparación de Fuentes Fases 3-4 — clustering inteligente + compartir (ver docs/PROPUESTA_COMPARACION_FUENTES.md)
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

Killer feature: Vista de Comparación de Fuentes (ver mismo evento cubierto por múltiples fuentes con filtros aplicados). Advertencias críticas: XSS en proxy, sesgo IA, costos IA. Ver docs/PROPUESTAS_MEJORA.md para lista completa y priorización.

## 20. VISTA DE COMPARACIÓN DE FUENTES

Ver documento completo: docs/PROPUESTA_COMPARACION_FUENTES.md

Killer feature del proyecto. Seleccionar un evento → ver cobertura de 4+ fuentes lado a lado → meta-análisis con convergencias, divergencias, omisiones cruzadas, mapa de intereses, evaluación bidireccional comparada, síntesis del Sur Global. Endpoint /api/compare. Componentes: SourceComparisonView, SourceColumn, MetaAnalysisPanel, FilterComparisonRadar. 4 fases: MVP visual, meta-análisis IA, clustering inteligente, compartir/difusión.

## 21. CLASIFICACIÓN DE FUENTES

Ver documento completo: docs/CLASIFICACION_FUENTES.md

Jerarquía de criterios: (1) Honestidad periodística 40%, (2) Sesgos 25%, (3) Transparencia editorial 20%, (4) Cobertura 10%, (5) Accesibilidad 5%. Cuatro niveles: A Referencial (>80), B Complementaria (60-80), C Contrastiva (40-60), D Vigilada (<40). NOTA: Actualmente ninguna fuente evaluada numéricamente alcanza Nivel A. Todas las fuentes evaluadas están en Nivel B (RT 71.5, Al Jazeera 61.75, Al Mayadeen 71.45, Democracy Now 75.9, Africa News 74.15). Fuentes sin evaluación numérica reclasificadas conservadoramente a B. Selección sugerida por región con 6 zonas. Evaluación comparada con ejemplos numéricos. Revisión trimestral.

## 22. PLAN DE IMPLEMENTACIÓN

Ver documento completo: docs/PLAN_IMPLEMENTACION.md

Plan de implementación por prioridades con 4 fases y 5 sprints. Fase 0: Corrección de 23 inconsistencias documentales. Fase 1 (semanas 1-2): Seguridad (XSS, rate limiting), proxy endpoints, Prisma, SEO F1, i18n F1, clasificación de fuentes en UI. Fase 2 (semanas 3-6): Comparación de fuentes, autenticación, tiers, a11y, disclaimer. Fase 3 (semanas 7-12): Alertas, mobile-first, monetización, contenido SEO. Fase 4 (semanas 13-24): Multilingue completo, PWA, mapa, newsletter, API.

## 23. PLAN DE MIGRACIÓN

Ver documento completo: docs/PLAN_MIGRACION.md

22 migraciones técnicas en 5 fases. M1: Documentación (6 correcciones). M2: Estructura de código (separar tipos, config centralizada, normalizar regiones). M3: Base de datos (esquema Prisma, datos demo, autenticación). M4: Datos de fuentes (metadatos, evaluación, catálogo RSS). M5: API y seguridad (rutas protegidas, deploy). Duración estimada: 22 horas (~3 días). PRE-REQUISITO para toda implementación funcional.
