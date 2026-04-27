# PROPUESTA — Vista de Comparación de Fuentes

## Proyecto: Monitor Geopolítico — News Connect
## Versión: 1.0
## Fecha: 2026-04-28
## Estado: PROPUESTA PARA IMPLEMENTACIÓN PRIORITARIA

---

## 1. CONCEPTO

La Vista de Comparación de Fuentes permite seleccionar un evento y ver cómo lo cubren múltiples fuentes internacionales simultáneamente, lado a lado, con los 5 filtros analíticos aplicados a cada versión y un meta-análisis que revela convergencias, divergencias y los intereses de poder detrás de cada narrativa.

Esto NO es un agregador que pone artículos uno al lado del otro. Es una herramienta de análisis que descompone las diferencias entre fuentes, expresa los sesgos de poder, y permite al usuario ver cómo un mismo hecho se transforma según quién lo cuenta.

Analogía: Si Google News es un índice de biblioteca, nuestra Vista de Comparación es un seminario crítico donde 4 expertos debaten el mismo tema y un moderador señala las contradicciones.

---

## 2. PROBLEMA QUE RESUELVE

Un mismo evento — por ejemplo, un ataque militar en Gaza — se cubre de formas radicalmente distintas:

RT: "Agresión israelí contra civiles palestinos"
Al Jazeera: "Ataque israelí mata a 15 civiles en Gaza"
BBC: "Israel carry out strike in Gaza amid escalating tensions"
France 24: "Frappe israélienne à Gaza dans un contexte d'escalade"

Las 4 cubren el mismo evento. Las 4 seleccionan palabras distintas. Las 4 omiten información diferente. Las 4 encuadran el hecho de manera que revela su posición.

El lector individual no tiene forma de comparar sistemáticamente. Lee una fuente, tal vez dos, y forma opinión con información incompleta. La Vista de Comparación resuelve esto haciendo visible lo invisible: el encuadre, la omisión, la selección léxica, y los intereses detrás de cada versión.

---

## 3. CÓMO FUNCIONA — FLUJO DEL USUARIO

### 3.1 Activación

El usuario puede activar la comparación de 3 formas:

Forma A — Desde una señal individual: El usuario ve una señal en el dashboard y hace clic en "Comparar fuentes". El sistema busca automáticamente otras señales sobre el mismo evento en otras fuentes.

Forma B — Desde el clasificador: El usuario selecciona un clasificador (ej: Conflicto) y una región (ej: Medio Oriente) y ve los eventos del día. Cada evento tiene un badge "3 fuentes" o "5 fuentes" indicando cuántas fuentes lo cubren. Clic en el evento abre la comparación.

Forma C — Búsqueda directa: El usuario describe un evento ("atentado Damasco hoy") y el sistema busca señales coincidentes en todas las fuentes y genera la comparación.

### 3.2 Pantalla de Comparación

La pantalla tiene 4 zonas:

ZONA 1 — Encabezado del evento (arriba):
Título generado por IA que sintetiza el evento: "Ataque militar en Gaza — 28 de abril 2026"
Subtítulo сon cantidad de fuentes: "Cobertura de 4 fuentes: RT, Al Jazeera, BBC, France 24"
Tags de clasificadores y región
Indicador de nivel de amenaza/emancipación promedio

ZONA 2 — Columnas de fuentes (centro, scroll horizontal):
Cada fuente ocupa una columna vertical con:

ENCABEZADO DE COLUMNA:
Logo de la fuente + nombre
Badge de idioma original ("Русский" para RT, "English" para BBC)
Nivel de fuente (A/B/C/D)
Enlace "Leer en fuente original"

CUERPO DE COLUMNA:
Titular de la fuente (en idioma original si el usuario elige ver originales, o traducido)
Extracto de 300 caracteres
Ver artículo ampliado (dentro del Monitor)

ANÁLISIS IA (expandible):
1. Clasificación primaria y secundaria
2. Encuadre narrativo (cómo la fuente encuadra el evento)
3. Selección léxica destacada (palabras clave que revelan posición)
4. Omisiones detectadas (qué información relevante no menciona)
5. Evaluación con los 5 filtros:
   - Congruencia Inversa: ¿Coincide con la narrativa hegemónica o la cuestiona?
   - Coherencia Histórica: ¿Es consistente con antecedentes verificables?
   - Integridad Epistémica: ¿Reconoce otras perspectivas o las ignora?
   - Confiabilidad Asimétrica: ¿Qué intereses institucionales o geopolíticos influyen?
   - Flexibilidad Pragmática: ¿Qué acción o inacción justifica este encuadre?

ZONA 3 — Meta-análisis (abajo, ancho completo):
Análisis transversal generado por IA que compara las fuentes:

CONVERGENCIAS: Datos o afirmaciones que todas las fuentes comparten (probablemente hechos verificables).

DIVERGENCIAS: Afirmaciones que contradicen entre fuentes (probablemente sesgo narrativo). Se destacan visualmente con color.

OMISIONES CRUZADAS: Qué menciona cada fuente que las otras omiten. Ejemplo: "RT menciona víctimas civiles (omitted by BBC). BBC menciona contexto de ataques previos (omitted by RT)."

MAPA DE INTERESES: Análisis de qué intereses geopolíticos se alinean con cada encuadre. Ejemplo: "El encuadre de RT cuestiona la legitimidad de la operación israelí, alineado con la posición rusa en ONU. El encuadre de BBC contextualiza la operación como respuesta, alineado con la posición occidental."

EVALUACIÓN BIDIRECCIONAL COMPARADA:
Tabla que muestra amenaza y emancipación según cada fuente:
- RT: Amenaza alta (escala militar), Emancipación baja (poco margen de acción)
- Al Jazeera: Amenaza alta (crisis humanitaria), Emancipación media (solidaridad internacional)
- BBC: Amenaza media (tensión regional), Emancipación baja (enfoque diplomático)
- France 24: Amenaza media (escalada), Emancipación media (presión diplomática europea)

SÍNTESIS DEL SUR GLOBAL: Evaluación desde la Óptica Sur Global que va más allá de las fuentes individuales y pregunta: ¿Cómo afecta esto al Sur Global? ¿Qué perspectiva está ausente en TODAS las fuentes? ¿Qué voces no están siendo escuchadas?

ZONA 4 — Acciones (barra inferior):
- Compartir comparación (genera imagen card con las 4 columnas resumidas)
- Exportar como PDF (para uso académico)
- Generar cita académica (APA, Chicago, Harvard)
- Volver al dashboard

---

## 4. ARQUITECTURA TÉCNICA

### 4.1 Identificación de eventos (Clustering)

El problema central es: ¿cómo sabemos que 4 artículos tratan del mismo evento?

Mетодо 1 — Similitud semántica (principal):
Cada señal nueva se compara contra señales existentes de las últimas 24-48 horas usando el modelo de IA. Se envían pares de titulares + extractos y se pregunta: "¿Estos dos artículos tratan del mismo evento específico?" Esto genera clusters de señales sobre el mismo evento.

Método 2 — Entidades compartidas (secundario):
Se extraen entidades nombradas (país, ciudad, personas, organizaciones) de cada señal. Señales que comparten 2+ entidades clave en la misma ventana temporal se agrupan como candidatos.

Método 3 — Ventana temporal:
Solo se comparan señales dentro de una ventana de 24-48 horas. Un artículo de hoy y uno de hace una semana probablemente no cubren el mismo evento específico, aunque traten el mismo conflicto.

Implementación:
- Al llegar una señal nueva, se ejecuta clustering automático
- Si la señal coincide con un cluster existente, se agrega al cluster
- Si no coincide, se crea un cluster nuevo
- Cada cluster tiene un eventId único, título generado por IA, y lista de señales agrupadas
- Los clusters se almacenan para búsqueda y comparación

### 4.2 Endpoint de comparación

/api/compare/route.ts

POST /api/compare

Body (desde una señal):
{
  signalId: "abc123",     // Señal semilla
  maxSources: 4,          // Máximo fuentes a comparar
  includeAnalysis: true   // Incluir análisis por fuente
}

Body (desde búsqueda):
{
  query: "atentado Damasco",  // Búsqueda libre
  timeframe: 24,              // Horas hacia atrás
  maxSources: 4
}

Body (desde cluster existente):
{
  eventId: "evt_456",     // ID del cluster
  includeAnalysis: true
}

Respuesta:
{
  eventId: "evt_456",
  eventTitle: "Ataque militar en Gaza — 28 abril 2026",
  eventDate: "2026-04-28",
  classifiers: ["Conflicto", "Derechos Humanos"],
  region: "MEDIO_ORIENTE",
  sources: [
    {
      signalId: "sig_001",
      sourceName: "RT",
      sourceLevel: "A",
      language: "ru",
      title: "Título original",
      titleTranslated: "Título traducido",
      excerpt: "Extracto 300 chars",
      url: "https://rt.com/...",
      analysis: {
        framing: "Encuadre narrativo...",
        lexicalSelection: ["agresión", "civiles", "víctimas"],
        omissions: ["No menciona ataques previos", "No menciona contexto de Hamás"],
        filters: {
          congruenciaInversa: { score: 0.8, reason: "..." },
          coherenciaHistorica: { score: 0.6, reason: "..." },
          integridadEpistemica: { score: 0.4, reason: "..." },
          confiabilidadAsimetrica: { score: 0.7, reason: "..." },
          flexibilidadPragmatica: { score: 0.5, reason: "..." }
        },
        relevance: { threat: 0.9, emancipation: 0.3 }
      }
    },
    // ... más fuentes
  ],
  metaAnalysis: {
    convergences: ["Todas confirman el ataque", "Todas mencionan víctimas"],
    divergences: ["RT lo califica de agresión, BBC de strike", "Al Jazeera menciona niños, BBC no"],
    crossOmissions: {
      rt_mentions_others_omit: ["Víctimas civiles detalladas"],
      aljazeera_mentions_others_omit: ["Crisis humanitaria previa"],
      bbc_mentions_others_omit: ["Contexto de ataques previos de Hamás"],
      france24_mentions_others_omit: ["Posición de la UE"]
    },
    interestMap: "Análisis de intereses geopolíticos...",
    comparativeRelevance: {
      rt: { threat: 0.9, emancipation: 0.3 },
      aljazeera: { threat: 0.9, emancipation: 0.6 },
      bbc: { threat: 0.6, emancipation: 0.2 },
      france24: { threat: 0.6, emancipation: 0.5 }
    },
    southGlobalSynthesis: "Evaluación desde la Óptica Sur Global..."
  },
  shareCard: "URL de imagen generada para compartir",
  citationAPA: "Cita en formato APA...",
  createdAt: "2026-04-28T12:00:00Z"
}

### 4.3 Компонентes de UI

SourceComparisonView.tsx — Компонент principal que orquesta la vista completa. Layout responsive: columnas en desktop, tabs en móvil.

SourceColumn.tsx — Columna individual de cada fuente. Muestra titular, extracto, análisis expandible, filtros сon score visual, evaluación amenaza/emancipación.

MetaAnalysisPanel.tsx — Panel inferior сon convergencias, divergencias, omisiones cruzadas, mapa de intereses, y síntesis del Sur Global. Tabs para cada sección.

ComparisonHeader.tsx — Encabezado сon título del evento, fuentes incluidas, clasificadores, región.

RelevanceComparisonChart.tsx — Gráfico comparativo de amenaza/emancipación por fuente. Barras horizontales lado a lado.

FilterComparisonRadar.tsx — Gráfico radar que compara los 5 filtros entre fuentes. Visualiza de un vistazo dónde difieren las evaluaciones.

### 4.4 Prompt de IA para la comparación

El system prompt para la comparación es diferente del análisis individual. Debe:

1. Recibir TODAS las señales del cluster simultáneamente
2. Analizar cada fuente individualmente сon los 5 filtros
3. Generar el meta-análisis transversal
4. Identificar convergencias y divergencias específicas
5. Detectar omisiones cruzadas
6. Mapear intereses geopolíticos
7. Producir la síntesis del Sur Global

El prompt debe ser explícito: "Estás analizando cómo DIFERENTES fuentes cubren el MISMO evento. Tu trabajo no es juzgar quién tiene razón sino hacer visible CÓMO y POR QUÉ difieren las narrativas."

---

## 5. DISEÑO VISUAL

### 5.1 Layout Desktop (3+ columnas)

La vista usa un grid de columnas, una por fuente, сon el meta-análisis debajo. Las columnas se pueden reordenar arrastrando. Se puede ocultar/mostrar columnas. El scroll horizontal permite comparar más de 4 fuentes.

Colores por fuente (consistentes en toda la plataforma):
- RT: Verde (#4CAF50)
- Al Jazeera: Naranja (#FF9800)
- BBC: Rojo (#F44336)
- France 24: Azul (#2196F3)
- TeleSUR: Amarillo (#FFC107)
- CGTN: Dorado (#D4AF37)
- DW: Gris oscuro (#424242)
- TRT World: Turquesa (#009688)

### 5.2 Layout Mobile (tabs)

En móvil, las columnas se convierten en tabs horizontales сon el nombre de cada fuente. El meta-análisis es un tab adicional "Comparación". Swipe entre tabs.

### 5.3 Elementos visuales clave

Badge de idioma: Pequeño chip сon código ISO y nombre del idioma original ("RU - Русский"). Clic para ver original vs traducción.

Score de filtros: Barras horizontales сon gradiente de color (rojo=0, verde=1) para cada filtro. Permite comparación visual instantánea entre fuentes.

Divergencias resaltadas: Las afirmaciones que contradicen entre fuentes se destacan сon borde rojo e icono de alerta. Clic para ver las dos versiones.

Omisiones: Las omisiones de cada fuente se muestran como lista сon icono de ojo tachado. Clic para ver qué fuente SÍ lo menciona.

Mapa de intereses: Visualización tipo red/conexión que muestra la relación entre cada encuadre y los intereses geopolíticos detectados.

Gráfico radar: Los 5 filtros como ejes del radar, una línea por fuente. Superposición inmediata de diferencias.

---

## 6. COMPARTIR Y DIFUSIÓN

### 6.1 Card de comparación (imagen generada)

Al compartir, se genera una imagen card сon:
- Título del evento
- Logos de las fuentes incluidas
- 2-3 divergencias clave en bullet points
- Gráfico mini-radar de filtros
- Logo del Monitor Geopolítico
- "monitor-geopolitico.com"

Formato: 1200x630px (optimizado para Twitter/LinkedIn). Generado server-side сon canvas o biblioteca de generación de imágenes.

### 6.2 Compartir análisis

El texto de compartir incluye:
- Encabezado сon evento y fuentes
- 3 divergencias principales
- Síntesis del Sur Global (1-2 oraciones)
- Enlace a la comparación completa en el Monitor
- Footer según tier (branding en gratuito, sin branding en premium+)

---

## 7. CONSUMO DE RECURSOS

### 7.1 Tokens de IA por comparación

Análisis individual por fuente: ~4500 tokens x 4 fuentes = 18,000 tokens
Meta-análisis transversal: ~6,000 tokens
Clustering (si es primera vez): ~2,000 tokens
Traducciones (si aplica): ~3,500 tokens x N idiomas

Total por comparación: ~26,000-40,000 tokens

### 7.2 Estrategia de optimización

- Solo generar meta-análisis cuando el usuario lo solicite (lazy)
- Cache de comparaciones completas (si las fuentes no cambiaron)
- Máximo 4 fuentes por comparación por defecto (ampliable a 6 en premium)
- Análisis individuales se reutilizan si ya existían (no se re-generan)
- El clustering se ejecuta en background al llegar señales, no al comparar

### 7.3 Rate limiting

Tier Gratuito: 2 comparaciones/día
Tier Premium: 10 comparaciones/día
Tier Profesional: 50 comparaciones/día
Tier Institucional: Ilimitado

---

## 8. FASES DE IMPLEMENTACIÓN

### Fase 1 — MVP (semana 1-2)

1. Crear modelo de datos EventCluster (eventId, señales agrupadas, título)
2. Implementar clustering básico: señales con misma región + clasificador + ventana 24h se agrupan
3. Crear endpoint /api/compare сon análisis individual por fuente
4. Crear componente SourceColumn сon titular, extracto, análisis básico
5. Crear vista сon 2-4 columnas side by side
6. Sin meta-análisis todavía — solo comparación visual manual

Resultado: El usuario puede ver 4 fuentes lado a lado сon sus análisis. El "wow" inicial viene de la yuxtaposición visual.

### Fase 2 — Meta-análisis (semana 3-4)

1. Implementar prompt de IA para meta-análisis transversal
2. Crear MetaAnalysisPanel сon convergencias, divergencias, omisiones
3. Implementar mapa de intereses
4. Crear gráfico radar de filtros comparado
5. Implementar evaluación bidireccional comparada
6. Agregar síntesis del Sur Global

Resultado: La comparación ya no es solo visual — el AI analiza las diferencias. Este es el momento donde el feature pasa de "interesante" a "indispensable".

### Fase 3 — Clustering inteligente (semana 5-6)

1. Reemplazar clustering básico сon clustering semántico vía IA
2. Implementar detección de entidades nombradas
3. Agregar badges "3 fuentes" / "5 fuentes" en el dashboard
4. Botón "Comparar fuentes" en cada señal
5. Búsqueda directa de eventos para comparación

Resultado: El clustering es automático e inteligente. El usuario descubre comparaciones sin buscarlas.

### Fase 4 — Compartir y difusión (semana 7-8)

1. Generación de imagen card para compartir
2. Exportar comparación como PDF
3. Cita académica automática
4. Integración сon redes sociales
5. Tracking de comparaciones compartidas (métricas)

Resultado: Cada comparación compartida es marketing orgánico. El formato visual hace que se comparta.

---

## 9. MODELO DE DATOS

### 9.1 EventCluster

model EventCluster {
  id          String   @id @default(cuid())
  title       String   // Título generado por IA
  region      String   // Región del evento
  classifiers String[] // Clasificadores aplicados
  signalIds   String[] // IDs de señales agrupadas
  sourceNames String[] // Nombres de fuentes incluidas
  eventDate   DateTime // Fecha del evento
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

### 9.2 Comparison

model Comparison {
  id             String   @id @default(cuid())
  eventId        String   // Referencia al cluster
  sources        Json     // Array de análisis por fuente
  metaAnalysis   Json     // Meta-análisis completo
  shareCount     Int      @default(0)
  viewCount      Int      @default(0)
  createdAt      DateTime @default(now())
  userId         String?  // Usuario que la generó
}

---

## 10. ALINEACIÓN EPISTEMOLÓGICA

La Vista de Comparación es la materialización más concreta de los principios del proyecto:

Multipolaridad Epistémica: No privilegia una fuente sobre otra. Las presenta todas y permite al usuario comparar. La pluralidad es visual y tangible.

Justicia Cognitiva: Las fuentes del Sur (RT, TeleSUR, Al Jazeera, CGTN) se muestran сon la misma dignidad analítica que las del Norte (BBC, France 24, DW). No hay jerarquía implícita.

Soberanía Cognitiva: El usuario no recibe una narrativa prefabricada. Recibe herramientas para construir su propia comprensión comparando. La soberanía está en el usuario, no en el algoritmo.

Hermenéutica Crítica: El meta-análisis revela lo oculto: omisiones, encuadres, intereses. No se limita a describir — desvela las relaciones de poder detrás de cada narrativa.

Pragmatismo Emancipador: Al hacer visibles las omisiones de cada fuente, el usuario puede buscar la información que le ocultan. Al mapear intereses, puede evaluar quién se beneficia de su ignorancia. Esto es pragmatismo emancipador en acción.

La Síntesis del Sur Global es el momento más poderoso: después de comparar fuentes, el AI pregunta qué perspectiva está AUSENTE en todas. Porque incluso la comparación de 4 fuentes puede dejar fuera la voz más importante: la del propio Sur.
