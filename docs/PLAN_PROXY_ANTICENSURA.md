# PLAN DE IMPLEMENTACIÓN — Proxy de Acceso Libre (Anti-Censura)

## Proyecto: Monitor Geopolítico — News Connect
## Versión del plan: 1.0
## Fecha: 2026-04-28
## Estado: PARCIALMENTE IMPLEMENTADO (content-proxy existe, image-proxy y rss-proxy pendientes)

---

## 1. PROBLEMA

Varias fuentes del proyecto están bloqueadas en múltiples regiones, especialmente en la Unión Europea. El caso más crítico es RT (Russia Today), sancionado por la UE desde marzo de 2022, donde tanto el stream de video como el portal web (rt.com) son inaccesibles. Otros canales como Press TV (Irán) y TeleSUR enfrentan restricciones similares en distintas jurisdicciones.

Impacto directo en los principios del proyecto:

- Viola la Soberanía Cognitiva: Un tercero decide qué puede consultar el usuario
- Viola la Justicia Cognitiva: Se elimina la equidad entre fuentes del Norte y Sur
- Viola la Multipolaridad Epistémica: Se reduce la pluralidad de perspectivas disponibles
- Contradice la Óptica Sur Global: Se refuerza el monopolio del Norte como árbitro de la información

El usuario europeo que intenta acceder a RT desde nuestra plataforma ve un error. Esto convierte al Monitor en un instrumento que reproduce la misma censura que pretende superar.

---

## 2. SOLUCIÓN: ARQUITECTURA DE PROXY

Principio rector: Pasarela, no bodega. El servidor solo TRANSMITE el contenido, nunca lo ALMACENA. El navegador del usuario cachea con HTTP headers estándar.

Flujo de acceso sin proxy:
Usuario en Europa → ISP bloquea → Error → No puede acceder a RT

Flujo con proxy:
Usuario en Europa → Nuestro servidor (región no bloqueada) → Contenido de RT → Devuelve al usuario → Acceso exitoso

El navegador del usuario nunca conecta directamente con la fuente bloqueada. Solo ve nuestro dominio. El servidor sí puede acceder porque probablemente no está en una región con censura.

---

## 3. COMPONENTES A IMPLEMENTAR

### 3.1 Content Proxy (/api/content-proxy/route.ts)

Función: Proxy de artículos y portales web bloqueados.

Endpoint: GET /api/content-proxy?url=<encoded_url>&format=<json|html>

Parámetros:
- url (requerido): URL codificada del contenido a obtener
- format (opcional, default json): json devuelve metadata estructurada, html devuelve página reescrita

Formato JSON devuelve: url, title, description, author, publishedAt, image, content (máximo 3000 chars), fetchedAt

Formato HTML devuelve: Página reescrita con URLs de links e imágenes pasando por nuestros proxies

Seguridad:
- Whitlist de dominios permitidos (solo fuentes del proyecto)
- Timeout de 12 segundos
- Rechazar URLs que no pertenezcan a dominios permitidos

Uso de memoria: Cero almacenamiento persistente. El HTML se procesa y descarta. El garbage collector lo limpia automáticamente.

---

### 3.2 Image Proxy (/api/image-proxy/route.ts)

Función: Stream directo de imágenes desde fuentes bloqueadas.

Endpoint: GET /api/image-proxy?url=<encoded_url>

Principio: Pipe directo de fetch a response. El body del fetch se transmite directamente como body de la respuesta. No se crea Buffer en memoria.

Seguridad: Whitelist de dominios (incluye subdominios de CDN como img.rt.com, cdn.rt.com)

Uso de memoria: Mínimo. Stream directo, sin Buffer. El navegador cachea por 1 hora.

---

### 3.3 RSS Proxy (/api/rss-proxy/route.ts)

Función: Feeds RSS de fuentes bloqueadas con parseo en vuelo.

Endpoint: GET /api/rss-proxy?source=<fuente>&lang=<idioma>

Parámetros:
- source (requerido): Identificador de la fuente (rt, aljazeera, telesur, france24, dw)
- lang (opcional, default es): Idioma del feed

Devuelve: JSON con source, language, itemCount, fetchedAt, items[] (máximo 15 items)

Cada item incluye: title, link, description (máximo 300 chars), pubDate, image, proxyUrl (URL ya preparada para el content-proxy)

Uso de memoria: Cero. El XML se parsea en vuelo, se generan los items como JSON, y el XML se descarta.

---

### 3.4 HLS Proxy (ya existente, necesita verificación)

Función: Proxy de streams de video HLS para canales de TV en vivo.

Endpoint: GET /api/hls-proxy (ya existe en src/app/api/hls-proxy/route.ts)

Acción requerida: Verificar que el proxy existente funciona correctamente con streams de RT y otros canales bloqueados. Si tiene cache en memoria, evaluar si es necesario o si se puede eliminar.

---

## 4. DOMINIOS PERMITIDOS (Whitelist)

Solo se permite proxy de estas fuentes, alineadas con los 14 canales del proyecto:

Fuentes principales:
- rt.com (incluye rtd.rt.com, img.rt.com, cdn.rt.com)
- aljazeera.com
- telesurtv.net
- cctv.com (incluye cgtn.com)
- france24.com
- dw.com
- presstv.ir
- trtworld.com

No se permite proxy de dominios no relacionados con el proyecto. Esto evita abuso y limita responsabilidad.

---

## 5. CONSUMO DE RECURSOS

Principio: Cero almacenamiento servidor. Cache solo en navegador del usuario.

Memoria RAM por request:
- Content proxy: ~50-200KB temporalmente (HTML se descarta después de extraer metadata)
- Image proxy: ~0KB (stream directo, sin Buffer)
- RSS proxy: ~20-50KB temporalmente (XML se descarta después de parsear)

Sin cache en servidor: No hay Map, no hay objetos crecientes, no hay fuga de memoria.

Cache HTTP en navegador:
- Artículos: 5 minutos (Cache-Control: public, max-age=300)
- Imágenes: 1 hora (Cache-Control: public, max-age=3600)
- RSS: 2 minutos (Cache-Control: public, max-age=120)

Ancho de banda: Solo se transmite lo que el usuario solicita. No hay prefetch ni descargas anticipadas.

Timeouts: Content proxy 12s, Image proxy 8s, RSS proxy 10s. Si la fuente no responde, se devuelve error 502 sin consumir más recursos.

---

## 6. CONSIDERACIONES LEGALES

El proyecto es un monitor de análisis geopolítico, no un portal de noticias. El acceso a fuentes sancionadas se justifica bajo:

- Fines de investigación y análisis académico
- Periodismo de investigación geopolítica
- Análisis crítico con bidireccionalidad (amenaza y emancipación)
- La plataforma no reproduce contenido, lo analiza con filtros propios

Acción requerida: Incluir disclaimer legal visible en la plataforma que indique: "Este contenido se presenta con fines exclusivos de análisis geopolítico e investigación bajo los principios de Justicia Cognitiva y Soberanía Cognitiva. El Monitor Geopolítico no se hace responsable del contenido de fuentes externas."

---

## 7. PRECONDICIÓN CRÍTICA

Antes de implementar, VERIFICAR que el servidor Z.ai puede acceder a RT y otras fuentes bloqueadas. Si el servidor está en una región donde RT también está bloqueado, el proxy no funcionará y necesitaremos un enfoque alternativo (proxy upstream intermedio o tunnel).

Comandos de verificación:
curl -s -o /dev/null -w "%{http_code}" https://rt.com
curl -s -o /dev/null -w "%{http_code}" https://rtd.rt.com

Si devuelve 200 o 301: El proxy funcionará. Proceder con implementación.
Si devuelve 000 o 403: El servidor no puede acceder. Necesitar proxy upstream.

---

## 8. PLAN DE IMPLEMENTACIÓN

Fase 1 — Verificación (5 minutos)
- Verificar acceso del servidor a RT y otras fuentes
- Leer el proxy HLS existente para entender el estado actual
- Leer channels.ts para mapear canales a dominios

Fase 2 — Creación de endpoints (15 minutos)
- Crear src/app/api/image-proxy/route.ts
- Crear src/app/api/rss-proxy/route.ts
- content-proxy ya existe en src/app/api/content-proxy/route.ts, requiere sanitización XSS
- Verificar que compilan sin errores

Fase 3 — Verificación del HLS Proxy (5 minutos)
- Leer el proxy HLS existente
- Verificar que funciona con streams de RT
- Evaluar si necesita modificaciones

Fase 4 — Pruebas (10 minutos)
- Probar RSS proxy: curl http://localhost:3000/api/rss-proxy?source=rt&lang=es
- Probar content proxy: curl http://localhost:3000/api/content-proxy?url=https://rt.com
- Probar image proxy con una imagen de RT
- Verificar que los errores se manejan correctamente

Fase 5 — Integración con la UI (pendiente de diseño)
- Agregar botón o indicador de acceso libre en SignalCard
- Integrar RSS proxy como fuente de señales automatizadas
- Mostrar artículos proxificados en el dashboard
- Agregar disclaimer legal

---

## 9. TAREAS PENDIENTES

Inmediatas (este sprint):
1. Verificar acceso del servidor a RT (precondición)
2. Implementar content-proxy/route.ts
3. Implementar image-proxy/route.ts
4. Implementar rss-proxy/route.ts
5. Verificar hls-proxy existente
6. Probar los tres endpoints

Siguientes (próximo sprint):
7. Diseñar integración en la UI (componente de artículo proxificado)
8. Integrar RSS proxy como fuente de señales
9. Agregar disclaimer legal
10. Agregar indicador visual de fuente bloqueada/desbloqueada
11. Documentar en Arquitectura Técnica actualizada

Futuras:
12. Evaluar necesidad de proxy upstream si el servidor no puede acceder a RT
13. Implementar rotación de mirrors para streams HLS
14. Agregar más fuentes RSS al feed
15. Sistema de detección automática de bloqueos por región

---

## 10. CÓDIGO DE REFERENCIA

Los tres archivos de código están documentados en el historial de esta sesión. Resumen de la estructura:

content-proxy/route.ts (~80 líneas): Whitelist de dominios, extracción mínima de metadata (title, desc, author, date, image, content 3000 chars max), reescritura de URLs en formato HTML, timeout 12s, zero storage.

image-proxy/route.ts (~40 líneas): Stream directo fetch→response sin Buffer, whitelist de dominios incluyendo CDN subdominios, timeout 8s, zero storage.

rss-proxy/route.ts (~70 líneas): Mapa de feeds RSS por fuente e idioma, parseo en vuelo máximo 15 items, cada item con proxyUrl para content-proxy, timeout 10s, zero storage.
