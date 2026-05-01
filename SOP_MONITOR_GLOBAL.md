# SOP: STANDARD OPERATING PROCEDURES — MONITOR GEOPOLÍTICO
(Manual de Instrucciones para el Agente de IA)

Al iniciar cualquier sesión de desarrollo en este proyecto, el agente DEBE asumir este rol y seguir estas reglas al pie de la letra.

## 1. IDENTIDAD DEL PROYECTO

- **Nombre:** Monitor Geopolítico (Ecosistema News Connect).
- **Arquitectura:** Meridian v2 (Next.js 16, React 19, App Router, Tailwind 4, shadcn/ui, Glassmorphism).
- **Lenguaje:** Todo el código, prompts, UI y documentación debe estar en español (excepto variables técnicas estándar).
- **Enfoque Epistemológico:** Óptica del Sur Global (Epistemologías de Boaventura de Sousa Santos). NO es un medio periodístico, es inteligencia de señales.
- **Repositorio:** julioprado-dotcom/monitor-geopolitico

## 2. ESTÉTICA Y UI/UX (Sistema Meridian)

- **Fondo Principal:** `#0A0F1C` (Dark mode estricto).
- **Color de Acento (Neón):** `#00E5A0`. Usar para botones principales, acentos y KPIs.
- **Textos Principales:** `#F1F5F9`. Textos secundarios: `text-slate-400` o `text-slate-500`.
- **Tipografía Títulos:** Space Grotesk.
- **Tipografía Datos/Código:** JetBrains Mono.
- **Efectos:** Uso de `.glass` (backdrop-blur), `animate-fade-in`, `animate-slide-in`, `scanline` (para LivePlayer), `neon-glow`. Cero efectos gratuitos.
- **Navegación:** El sistema usa "Sistema de Foco Dinámico". NUNCA usar ventanas emergentes (Modals/Overlays) que tapen la pantalla. El Panel Central muestra el resumen, y al hacer clic en una SignalCard, la pantalla se desliza hacia la derecha (`scrollIntoView`) para mostrar el Panel de Foco.
- **Tagline Obligatorio:** Debajo del logo principal debe decir: "Traduciendo señales en patrones de poder."

## 3. ARQUITECTURA DE DATOS (`src/data/signals.ts`)

- **Tipo de Clasificadores:** Son un arreglo dinámico (`classifiers: string[]`). Una señal puede tener de 2 a 4 clasificadores.
- **Los 8 Clasificadores Activos:** Conflicto, Economía, Diplomacia, Seguridad, Tecnología, Ecosistema, Energía, Derechos Humanos.
- **Bidireccionalidad de Relevancia:** CRÍTICA | ALTA | MEDIA | BAJA | INFORMATIVA. (Evalúa tanto Amenaza como Emancipación).
- **Fuentes (Espejo Sur):** ~77 fuentes prioritizando agencias del Sur Global (Xinhua, Telesur, Prensa Latina, TASS, Anadolu, etc.). CERO dependencia directa de CNN o medios de la UE como fuentes primarias.
- **Auditoría de Fuentes:** Niveles A (Referencial), B (Complementaria), C (Contrastiva), D (Vigilada).

## 4. EL CEREBRO DE IA (`src/lib/analysisPrompt.ts` y `/api/analyze/route.ts`)

- **Motor IA Exclusivo:** `z-ai-web-dev-sdk` (GLM-4 Plus). PROHIBIDO usar OpenAI, Anthropic o Google AI.
- **Estructura del Prompt:** 207 líneas organizadas en: Preambulo Filosófico, 5 Bases Semánticas, Óptica Sur Global, 5 Filtros Analíticos.
- **Formato del Análisis:** FLUJO NARRATIVO ORGÁNICO. PROHIBIDO usar subtítulos tipo "1. Contexto", "2. Intereses". El texto debe ser un briefing ejecutivo continuo que integre las 8 dimensiones de forma invisible al lector.
- **Tipos de Análisis:**
  - **Simple** (~500-800 tokens, sin subtítulos). Para relevancia BAJA/MEDIA/INFORMATIVA.
  - **En Profundidad** (~2000-3000 tokens, subtítulos descriptivos opcionales). Para relevancia ALTA/CRÍTICA.
- **Reglas de Estilo:** Cero disclaimers, cero "En conclusión", nombres concretos de países/actores, mínimo 50 años de profundidad histórica.

## 5. VISUALIZACIÓN DE DATOS (Panel de Contexto)

- **KPIs (Indicadores):** El panel superior debe mostrar tarjetas numéricas grandes (Ej. "Señales Activas", "Balance Amenazas vs Estabilidad", "Foco Regional"). Se calculan dinámicamente del array de señales filtradas.
- **Patrones Detectados:** Un cuadro con texto estático extraído de `src/lib/mockPatterns.ts`. Muestra escalamientos o congruencia inversa. NO se llama a la API de IA para generarse (para no saturar de tokens).

## 6. SEGURIDAD Y DEPLOY

- **Protect Endpoints:** Endpoints como `/api/seed` deben verificar `NODE_ENV`. Si es production, deben devolver 403 para evitar que se ejecuten scripts maliciosos desde fuera.
- **Null-Safety:** Usar siempre `|| []` u `|| {}` en las consultas Prisma o mapeo de arrays para evitar "Cannot read properties of undefined".
- **Named Exports:** Siempre `import { db } from "@/lib/db"`. Cero `export default` para módulos críticos de base de datos.

## 7. PROHIBICIONES ABSOLUTAS

- NUNCA intentar migrar código roto. Si un componente falla, se arregla en el lugar antes de seguir.
- NUNCA reescribir el `analysisPrompt.ts` con listas numeradas ("1. Contexto 2. Intereses"). Debe ser texto fluido continuo.
- NUNCA usar un Overlay/Modal que tape la pantalla. Usar siempre `scrollIntoView`.
- NUNCA instalar librerías de IA occidentales (OpenAI, Anthropic, Google Vertex).
- NUNCA hardcodear datos de medios o legisladores. Leer siempre desde `.json`.
- NUNCA usar la API del USGS para sismología (usar IRIS). Evitar MarineTraffic para AIS (usar OpenSky o redes descentralizadas).

## 8. PROYECTO FUTURO (NO TOCAR AÚN)

- **NEXUS RAW:** El panel OSINT con Mapas (Leaflet), Tráfico Aéreo (OpenSky) y Satélites (Sentinel Hub). Se implementará en una ruta independiente (`/app/osint/page.tsx`) en el futuro, NO mezclado con el dashboard de texto actual para no romper el rendimiento.
