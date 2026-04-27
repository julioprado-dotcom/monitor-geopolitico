# Monitor Geopolitico — News Connect

**Inteligencia geopolitica de acceso libre desde la perspectiva del Sur Global.**

Plataforma de monitoreo geopolitico en tiempo real que clasifica senales y eventos internacionales con analisis IA, presentando informacion desde una optica multipolar y del Sur Global. Interfaz tipo centro de operaciones con glassmorphism Meridian, reproductor de TV en vivo, y clasificacion automatica de fuentes.

![Version](https://img.shields.io/badge/version-0.9.0--meridian-%2300E5A0)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Bun](https://img.shields.io/badge/runtime-Bun-f9f1e1)
![License](https://img.shields.io/badge/license-Private-red)

---

## Capturas

> Interfaz principal con sidebar de filtros, grilla de senales, reproductor en vivo y panel de senales recientes.

---

## Caracteristicas Principales

- **Panel de Senales Geopoliticas**: Tarjetas interactivas con clasificacion por region, relevancia y tipo de fuente
- **Sidebar de Filtros (MGSidebar)**: Navegacion por regiones (America Latina, Asia-Pacifico, Europa, Africa, Medio Oriente, Eurasia) y clasificadores tematicos
- **Reproductor de TV en Vivo (LivePlayer)**: Canales de noticias internacionales con HLS streaming y proyector flotante
- **Proyector Flotante (FloatingProjector)**: Ventana PIP arrastrable para ver TV mientras se navegan las senales
- **Signal Overlay**: Detalle expandido de cada senal con contexto, fuentes y analisis IA
- **Buscador (SearchBar)**: Filtrado en tiempo real por titulo, resumen, fuente o ID
- **Clasificador de Fuentes (SourceClassifier)**: Categorizacion automatica de medios (agencias, think tanks, medios estatales, independientes)
- **Senales Recientes (LatestSignals)**: Timeline de las ultimas senales detectadas
- **Barra de Metricas (MetricsBar)**: Contadores por nivel de relevancia con filtros rapidos
- **Diseno Meridian**: Glassmorphism oscuro con acentos esmeralda (#00E5A0), tipografia Space Grotesk + JetBrains Mono
- **Responsive**: Layout adaptativo con sidebar offcanvas en movil y tabs de navegacion

## Arquitectura

```
src/
  app/
    page.tsx              # Dashboard principal
    layout.tsx            # Layout raiz con fuentes y metadata
    globals.css           # Estilos globales Meridian
    api/
      analyze/route.ts    # Analisis IA de senales (GLM-4)
      hls-proxy/route.ts  # Proxy para streams HLS
      youtube-live/route.ts # Canales YouTube Live
      route.ts            # API raiz
  components/
    MGSidebar.tsx         # Sidebar de filtros por region y clasificador
    SignalOverlay.tsx     # Overlay expandido de senal
    SignalCard.tsx        # Tarjeta de senal geopolitica
    MetricsBar.tsx        # Barra de metricas y filtros rapidos
    LivePlayer.tsx        # Reproductor de TV en vivo
    HLSPlayer.tsx         # Reproductor HLS con hls.js
    SearchBar.tsx         # Buscador de senales
    SourceClassifier.tsx  # Clasificador de fuentes
    FloatingProjector.tsx # Proyector flotante arrastrable
    ProyectorWindow.tsx   # Ventana del proyector
    LatestSignals.tsx     # Senales recientes
    ui/                   # Componentes shadcn/ui
  data/
    signals.ts            # Datos de demo de senales geopoliticas
    channels.ts           # Canales de TV disponibles
  hooks/                  # Custom hooks
  lib/                    # Utilidades y configuracion
public/
  signals/                # Imagenes de senales
  og-image.png            # Imagen Open Graph
  favicon.png             # Favicon
  logo.svg                # Logo SVG
docs/                     # Documentacion del proyecto
  Marco_Conceptual.pdf
  Arquitectura_Tecnica.pdf
  Historial_Desarrollo.pdf
```

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Runtime | Bun |
| Lenguaje | TypeScript |
| UI | React 19 + shadcn/ui + Radix |
| Estilos | Tailwind CSS 4 |
| Streaming HLS | hls.js |
| Animaciones | Framer Motion |
| Iconos | Lucide React |
| Graficos | Recharts |
| Estado | Zustand |
| IA | z-ai-web-dev-sdk (GLM-4) |

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/julioprado-dotcom/monitor-geopolitico.git
cd monitor-geopolitico

# Instalar dependencias
bun install

# Iniciar en modo desarrollo
bun dev
```

La aplicacion estara disponible en `http://localhost:3000`.

## Scripts Disponibles

| Comando | Descripcion |
|---------|-------------|
| `bun dev` | Servidor de desarrollo en puerto 3000 |
| `bun build` | Build de produccion |
| `bun start` | Servidor de produccion |
| `bun lint` | Linting con ESLint |

## Documentacion

La documentacion completa del proyecto se encuentra en la carpeta `docs/`:

- **[Marco Conceptual](docs/Marco_Conceptual.pdf)**: Fundamentos teoricos y conceptuales del Monitor Geopolitico
- **[Arquitectura Tecnica](docs/Arquitectura_Tecnica.pdf)**: Diseno tecnico definitivo de la plataforma
- **[Historial de Desarrollo](docs/Historial_Desarrollo.pdf)**: Registro cronologico del desarrollo del proyecto

## Perspectiva del Sur Global

Este proyecto se construye desde la perspectiva del Sur Global, priorizando:

- Fuentes y analisis desde Latinoamerica, Africa, Asia y Medio Oriente
- Clasificacion multipolar de eventos internacionales
- Acceso libre y codigo abierto
- Representacion de voces tradicionalmente marginadas en el discurso geopolitico global

## Licencia

Privado — Todos los derechos reservados.

---

**News Connect** · Monitor Geopolitico v0.9.0-meridian
