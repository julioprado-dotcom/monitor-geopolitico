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
