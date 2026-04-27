# PROPUESTAS DE MEJORA — Monitor Geopolítico — News Connect

## Versión: 1.0
## Fecha: 2026-04-28
## Estado: PARA EVALUACIÓN

---

## 1. ADVERTENCIAS CRÍTICAS

1.1 Seguridad XSS del Proxy: El content-proxy muestra HTML de fuentes externas. DEBE sanitizar eliminando scripts, event handlers on*, y javascript: URLs antes de mostrar. Vector de ataque real. Prioridad: URGENTE antes de cualquier lanzamiento público.

1.2 Sesgo del AI: La IA puede reproducir sesgos occidentales a pesar del system prompt. Necesario mecanismo de retroalimentación del usuario para calificar análisis y marcar sesgos. Sin esto, el proyecto predica justicia cognitiva pero no la practica.

1.3 Costos de IA: 1000 usuarios x 5 análisis/día = 22.5M tokens/día. Necesario rate limiting por IP y por tier ANTES de lanzar. Definir límites: gratuito 5/día, premium 50/día, profesional 200/día, institucional ilimitado.

---

## 2. FUNCIONALIDADES NUEVAS PROPUESTAS

2.1 Accesibilidad (a11y): Un proyecto sobre Justicia Cognitiva debe ser accesible. Contraste AA, navegación por teclado, lectores de pantalla, ARIA labels, textos alternativos. Incluir desde el diseño, no como afterthought.

2.2 Modo Offline / PWA: Usuarios en Sur Global tienen conectividad intermitente. Service Worker + localStorage para señales y análisis almacenados. Funcionalidad básica sin conexión.

2.3 Vista de Comparación de Fuentes (KILLER FEATURE): Seleccionar un evento y ver cómo lo cubren RT, Al Jazeera, BBC y TeleSUR simultáneamente, lado a lado, con los 5 filtros aplicados a cada versión. Visualiza Multipolaridad Epistémica y Confiabilidad Asimétrica de forma concreta. Nadie en el mercado ofrece esto.

2.4 Vista de Mapa Geográfico: Mapa interactivo con señales geolocalizadas, calor de conflicto, líneas de conexión interregional. Requiere coordenadas en señales (país, ciudad). Hace tangible lo que ahora es abstracto.

2.5 Sistema de Alertas Configurables: Por clasificador, región, nivel de amenaza/emancipación. Vía email, Telegram, push. Transforma el monitor de sitio que visitas a herramienta que te busca.

2.6 Historial Temporal de Señales: Línea temporal de cómo cambió la evaluación de amenaza/emancipación de un conflicto en el tiempo (semana, mes, año). Convierte monitor en inteligencia predictiva.

2.7 Exportar con Citabilidad Académica: Formato de cita automático (APA, Chicago, Harvard) con permalink permanente para cada análisis. Necesario para audiencia académica.

---

## 3. MEJORAS A LO EXISTENTE

3.1 Página de Transparencia Metodológica: No solo disclaimer. Página completa explicando: cómo funcionan los filtros, qué IA se usa, limitaciones, selección de fuentes, cómo reportar errores. Esto es E-E-A-T para Google y credibilidad para usuarios.

3.2 Glosario Interactivo de Términos Epistemológicos: Términos no traducibles necesitan definición accesible. Hover o click sobre "Óptica Sur Global" muestra definición en idioma del usuario. El término no se traduce pero sí se explica.

3.3 Versionado del Marco Epistemológico: Si la metodología evoluciona, los análisis antiguos quedan sin contexto. Versionar (v1.0, v1.1) y etiquetar cada análisis con la versión usada.

3.4 Dark Mode: Estándar de industria, reduce fatiga visual para analistas que monitorean durante horas. Con Tailwind es trivial.

3.5 Mobile-First: El Sur Global accede por móvil. Rediseñar pensando primero en móvil. El ProyectorWindow probablemente necesite rediseño para pantallas pequeñas.

3.6 Retroalimentación de Calidad del Análisis: Botón "¿Es justo este análisis?" que permite al usuario calificar y marcar posibles sesgos. Los datos alimentan mejora continua del modelo.

---

## 4. PRIORIZACIÓN SUGERIDA

Urgente (antes de lanzar):
- Sanitización XSS del proxy
- Rate limiting de IA
- Accesibilidad básica

Alto impacto (primeros 3 meses):
- Vista de Comparación de Fuentes (killer feature)
- Sistema de Alertas
- Mobile-first redesign

Medio impacto (meses 3-6):
- Modo Offline / PWA
- Vista de Mapa
- Dark Mode
- Glosario interactivo

Largo plazo (meses 6-12):
- Historial Temporal
- Citabilidad académica
- Versionado metodológico
- Retroalimentación de calidad

---

## 5. MEJORAS IMPLEMENTADAS (v0.9.0-meridian)

Las siguientes mejoras ya fueron implementadas en la sesión del 2026-04-28 y se encuentran activas en el código:

### 5.1 SignalOverlay — Rediseño completo del overlay de noticia ampliada
- **Orden de secciones**: ① Metadata (relevancia·nivel / verificado / fecha) → ② Imagen hero → ③ Título → ④ Panel de fuente (bandera·código país·nombre fuente·idioma badge·"Ir al artículo") → ⑤ Contenido completo → ⑥ Tags (región, clasificadores, acceso) → Advertencias nivel C/D → Análisis IA → Disclaimer
- **Panel de fuente destacado**: Fondo semitransparente (bg-white/0.02, border-white/0.04), bandera emoji + código país ISO de 3 letras, nombre de fuente en bold, badge de idioma en mayúsculas, botón "→ Ir al artículo" con color dinámico según nivel de fuente (verde=A, amarillo=B, naranja=C, rojo=D). Enlace abre signal.sourceUrl en nueva pestaña.
- **Botón X de cierre**: Estilo rojo (bg-red-500/20, hover bg-red-500/40, text-red-400), posición top-right absoluta con z-10.
- **Cierre al clic fuera**: El backdrop del overlay ejecuta onClose al hacer clic, con stopPropagation en la tarjeta interior.
- **Indicador de scroll**: Flecha verde animada (animate-bounce) con gradiente de desvanecimiento en el borde inferior del overlay. Aparece cuando hay contenido por debajo del viewport y desaparece al llegar al fondo. Implementado con useRef + useState + useEffect con listener de scroll pasivo.
- **Botones de compartir eliminados**: Removidos del overlay tanto del artículo como del análisis por decisión de diseño. (Tarea #22 en CONTEXTO.md: reubicar a SignalCard o vista dedicada si se reimplementan).
- **Eliminación de código muerto**: Imports de Copy, Share2, MessageCircle, Mail, Check removidos. Props userTier y UserTier eliminados.

### 5.2 SignalCard — Mejoras de footer y fuente
- **Footer reorganizado**: Orden: clasificadores temáticos → región → separador → fila de fuente con bandera + código país + nombre + badge de nivel con color.
- **sourceCountry compartido**: Mapa fuente→bandera+código extraído de SignalCard.tsx a signals.ts como export, reutilizado por SignalOverlay.

### 5.3 MetricsBar — Filtro de relevancia mejorado
- **Filtro exclusivo**: Un solo nivel de relevancia activo a la vez (no acumulativo).
- **Botón limpiar**: Añadido con color diferenciado para restablecer filtros.
- **Conteo desde allSignals**: Los contadores reflejan el total de señales disponibles, no solo las filtradas.

### 5.4 Datos y constantes compartidas
- **DISCLAIMER actualizado**: `"Monitor Geopolítico es una plataforma de análisis e investigación geopolítica. Los artículos y contenido original pertenecen a sus fuentes. El análisis geopolítico generado por el Monitor — Óptica Sur Global, con filtros analíticos y bidireccionalidad de relevancia — es contenido original del Monitor Geopolítico - Newsconnect"`. Sin prefijo "El", sin frase de compartir, "con" en vez de "5 filtros", marca "Newsconnect" al final.
- **sourceCountry**: Mapa con 30 fuentes mapeadas a bandera emoji + código país ISO, exportado desde signals.ts.

### 5.5 Nomenclatura
- "Señales" → "Señales Geopolíticas" en tabs de navegación, métricas y barra de búsqueda.

---

## 6. HISTORIAL DE CAMBIOS

| Fecha | Componente | Cambio |
|-------|-----------|--------|
| 2026-04-28 | SignalOverlay.tsx | Rediseño completo de overlay (orden, panel fuente, X roja, cierre exterior, scroll indicator) |
| 2026-04-28 | SignalCard.tsx | Footer reorganizado, import sourceCountry desde signals.ts |
| 2026-04-28 | signals.ts | sourceCountry extraído como export compartido, DISCLAIMER actualizado |
| 2026-04-28 | MetricsBar.tsx | Filtro de relevancia exclusivo, botón limpiar, conteo desde allSignals |
| 2026-04-28 | LatestSignals.tsx | Nombres actualizados a "Señales Geopolíticas" |
