# POLÍTICA DE FUENTES Y PROPIEDAD INTELECTUAL — Monitor Geopolítico

## Versión: 1.0
## Fecha: 2026-04-28
## Estado: VIGENTE — De aplicación obligatoria

---

## 1. PRINCIPIO FUNDAMENTAL

El Monitor Geopolítico ANALIZA contenido ajeno y GENERA contenido propio. El usuario puede leer artículos ampliados dentro del Monitor, pero al compartir siempre se redirige a la fuente original. Nuestro producto es el análisis con Óptica Sur Global, no las noticias mismas.

Distinción clave entre VER y COMPARTIR:
- VER: El usuario puede leer el artículo ampliado dentro del Monitor (como Feedly o Google News)
- COMPARTIR artículo: Solo se comparte el enlace a la fuente original, nunca el texto completo
- COMPARTIR análisis: Se comparte nuestro análisis original con referencia a la fuente

---

## 2. REGLAS OBLIGATORIAS

### 2.1 Ver contenido dentro del Monitor

REGLA 1 — El usuario puede leer artículos ampliados dentro de la plataforma: El content-proxy permite visualizar el artículo completo dentro del Monitor, similar a cómo Feedly o Google News muestran artículos dentro de su interfaz. Esto mejora la experiencia del usuario y es práctica estándar en agregadores.

REGLA 2 — Siempre visible la atribución: Al ver un artículo ampliado, siempre se muestra: nombre de la fuente, enlace a la fuente original, fecha, autor, y clasificación de nivel de fuente (A/B/C/D).

### 2.2 Compartir artículo

REGLA 3 — Compartir artículo = encabezado + enlace a fuente original: La opción de compartir un artículo NUNCA incluye el texto del artículo. Solo comparte título, nombre de la fuente, y enlace directo al artículo en el medio original. Formato: "[Fuente]: [Título] → [URL original]"

REGLA 4 — Sin iframe ni embed de contenido compartido: El enlace compartido siempre lleva al sitio de la fuente, nunca a una versión cacheada del Monitor.

### 2.3 Compartir análisis

REGLA 5 — Compartir análisis = encabezado con enlace a fuente + nuestro análisis: La opción de compartir un análisis incluye: encabezado con nombre de fuente, título del artículo y enlace directo al artículo original, seguido del análisis generado por el Monitor. El análisis es contenido nuestro y puede compartirse.

REGLA 6 — Todo análisis compartido referencia la fuente: Formato obligatorio al compartir análisis: "Análisis del Monitor Geopolítico sobre: [Fuente] — [Título] → [URL original]" seguido del texto del análisis.

### 2.4 Almacenamiento de análisis

REGLA 7 — Los análisis NUNCA se eliminan de la plataforma: Los análisis son el producto principal del Monitor. Cada análisis pesa ~2-5KB (1000 análisis = ~5MB), el almacenamiento es trivial incluso a gran escala. Todos los análisis se conservan permanentemente a nivel de plataforma para tendencias, comparativas, señales tempranas, reportes automatizados y mejora del modelo analítico.

REGLA 8 — El acceso al historial sí es diferenciado por tier: Lo que varía es el acceso del usuario, no el almacenamiento. Tier Gratuito: acceso a últimos 30 días de sus análisis personales. Los análisis más antiguos siguen existiendo a nivel de plataforma (anónimos y agregados) pero el usuario no puede buscarlos individualmente. Tier Premium: 1 año de historial personal con búsqueda. Tier Profesional: historial ilimitado con búsqueda avanzada. Tier Institucional: historial ilimitado + acceso a datos agregados + exportable.

REGLA 9 — Los datos de plataforma siempre están disponibles: Tendencias, comparativas y reportes usan TODOS los análisis acumulados. Un usuario gratuito no pierde el valor de la inteligencia colectiva, solo pierde acceso a su historial personal detallado más allá de 30 días.

### 2.5 Compartir análisis por nivel de usuario

REGLA 10 — Todos los niveles pueden compartir análisis: Compartir el análisis es marketing orgánico gratuito. Cada análisis compartido lleva la marca del Monitor a donde no llegamos. Restringirlo iría contra Justicia Cognitiva.

Diferenciación por nivel:

Tier Gratuito: Compartir análisis con branding del Monitor. Formato texto plano. Destino: copiar al portapapeles. Footer automático: "Análisis por Monitor Geopolítico — monitor-geopolitico.com"

Tier Premium: Compartir análisis sin branding forzado. Formato texto + imagen card profesional. Destino: redes sociales, email. Sin footer automático.

Tier Profesional: Todo lo anterior + elegir qué secciones del análisis incluir + formato PDF.

Tier Institucional: Todo lo anterior + branding personalizado de la institución + API de compartir.

---

## 3. DISCLAIMER LEGAL

Este disclaimer debe aparecer en el footer de cada página del Monitor y en cada análisis compartido desde el tier gratuito:

DISCLAIMER DEL MONITOR GEOPOLÍTICO — NEWS CONNECT

El Monitor Geopolítico es una plataforma de análisis e investigación geopolítica. No es un medio de comunicación.

1. PROPIEDAD: Los artículos y contenido original pertenecen a sus fuentes. Los mostramos con atribución completa y enlaces directos al contenido original. Al compartir, siempre se redirige a la fuente.

2. ANÁLISIS ORIGINAL: El análisis geopolítico generado por el Monitor — Óptica Sur Global, 5 filtros analíticos, bidireccionalidad de relevancia, cadenas causales, implicaciones prospectivas — es contenido original del Monitor Geopolítico.

3. REDIRECCIÓN: Compartir un artículo lleva siempre a la fuente original. Compartir un análisis incluye referencia y enlace a la fuente.

4. INDEPENDENCIA: El análisis del Monitor no representa la posición de las fuentes citadas. Refleja su propio marco epistemológico basado en las Epistemologías del Sur.

5. CONTACTO: Si representa una fuente y desea modificaciones, contacte: contacto@monitor-geopolitico.com

---

## 4. IMPLEMENTACIÓN TÉCNICA

### 4.1 Content-proxy — Dos modos

Modo visualización (dentro del Monitor):
El content-proxy devuelve el artículo ampliado para visualización interna. El usuario lee el artículo completo dentro del Monitor con atribución visible y botón "Ir a fuente original".

Modo compartir (fuera del Monitor):
La función de compartir NUNCA usa el HTML ampliado. Siempre genera texto con enlace a la fuente original.

Estructura de respuesta del content-proxy:

{
  url: "URL original",
  sourceName: "RT",
  sourceUrl: "https://rt.com",
  sourceLevel: "A",
  title: "Título del artículo",
  author: "Autor",
  publishedAt: "2026-04-28T10:00:00Z",
  excerpt: "Primeros 300 caracteres para preview en tarjetas",
  fullContent: "Contenido completo para visualización dentro del Monitor",
  image: "URL de imagen",
  shareArticle: "RT: Título del artículo → https://rt.com/articulo",
  shareAnalysis: "📊 Análisis del Monitor Geopolítico\nFuente: RT — Título\n→ https://rt.com/articulo",
  analysisUrl: "/api/analyze?url=URLoriginal",
  disclaimer: "Contenido original de RT. Análisis por Monitor Geopolítico.",
  fetchedAt: "2026-04-28T12:00:00Z"
}

### 4.2 Funciones de compartir

Compartir artículo — Solo título + enlace a fuente:

function shareArticle(signal) {
  const text = signal.sourceName + ': ' + signal.title + ' → ' + signal.url;
  navigator.clipboard.writeText(text);
  // NUNCA incluye el texto del artículo
}

Compartir análisis — Encabezado con enlace + nuestro análisis:

function shareAnalysis(signal, analysis, userTier) {
  const header = '📊 Análisis del Monitor Geopolítico\nFuente: ' + signal.sourceName + ' — ' + signal.title + '\n→ ' + signal.url + '\n\n';
  const body = formatAnalysis(analysis, userTier);
  const footer = userTier === 'free' ? '\n\nAnálisis por Monitor Geopolítico — monitor-geopolitico.com' : '';
  return header + body + footer;
}

### 4.3 Almacenamiento de análisis

Modelo de datos:

model Analysis {
  id          String   @id @default(cuid())
  signalId    String   @unique
  sourceUrl   String
  sourceName  String
  title       String
  content     String   // JSON con todas las secciones del análisis
  filters     String   // Los 5 filtros aplicados
  relevance   String   // Evaluación bidireccional
  createdAt   DateTime @default(now())
  accessExpiresAt DateTime // Cuándo expira el acceso del usuario (no el almacenamiento)
  userId      String?  // null = análisis público/anónimo
}

Nota importante: accessExpiresAt controla cuándo un usuario gratuito pierde acceso a este análisis individual. El registro NUNCA se elimina de la base de datos. Solo se marca como expirado para usuarios gratuitos, pero permanece disponible para tendencias, reportes y usuarios premium.

---

## 5. PLANTILLAS DE COMUNICACIÓN

### 5.1 Respuesta a reclamación de fuente

Estimado/a [Nombre],

Gracias por contactar al Monitor Geopolítico. Respetamos el derecho de propiedad intelectual de todas las fuentes.

Nuestra plataforma:
- Muestra artículos con atribución completa y enlaces directos al contenido original
- Al compartir, redirige siempre a su sitio web
- Nuestro producto es el análisis geopolítico independiente, no la reproducción de contenido
- Cada enlace compartido genera tráfico directo a su publicación

Si desea que ajustemos cómo referenciamos su publicación, lo haremos de inmediato.

Atentamente,
Equipo del Monitor Geopolítico

### 5.2 Solicitud de colaboración a fuente

Estimado/a [Nombre],

Desde el Monitor Geopolítico — News Connect, incluimos enlaces a [Fuente] porque valoramos su perspectiva como fuente esencial para el análisis geopolítico desde el Sur Global.

Nuestros usuarios son dirigidos a su sitio web para leer el contenido completo. Nos gustaría explorar colaboración: intercambio de enlaces, acceso anticipado para análisis, co-publicación de análisis especiales.

Atentamente,
Equipo del Monitor Geopolítico

---

## 6. CHECKLIST DE CUMPLIMIENTO

Antes de cada release, verificar:

- Los artículos pueden verse ampliados dentro del Monitor con atribución visible
- Compartir artículo solo incluye título + enlace a fuente original
- Compartir análisis incluye encabezado con enlace a fuente + nuestro análisis
- Los análisis se almacenan permanentemente (nunca se eliminan)
- El acceso al historial se diferencia por tier (30 días / 1 año / ilimitado / ilimitado+exportable)
- El disclaimer aparece en el footer de cada página
- El disclaimer aparece en análisis compartidos del tier gratuito
- Las funciones de compartir NO incluyen texto completo del artículo
- Los enlaces compartidos dirigen a la fuente original

---

## 7. ALINEACIÓN EPISTEMOLÓGICA

Justicia Cognitiva: Al dirigir tráfico a las fuentes al compartir, amplificamos económicamente a los medios del Sur Global. No los desplazamos.

Soberanía Cognitiva: Cada fuente mantiene control sobre cómo se accede a su contenido desde fuera del Monitor. Dentro del Monitor, el usuario ejerce su soberanía individual de lectura.

Hermenéutica Crítica: Nuestro análisis es interpretación, no apropiación. Compartir el análisis con referencia a la fuente es la práctica hermenéutica correcta.

Pragmatismo Emancipador: Cada enlace compartido que va a la fuente original es tráfico y visibilidad para medios que necesitan amplificación. Esto es pragmatismo emancipador real.
