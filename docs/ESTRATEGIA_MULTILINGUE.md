# ESTRATEGIA MULTILINGUE — Monitor Geopolítico — News Connect

## Versión: 1.0
## Fecha: 2026-04-28
## Estado: PENDIENTE DE IMPLEMENTACIÓN

---

## 1. PRINCIPIO FUNDAMENTAL

El Monitor Geopolítico es multilingue por naturaleza: sus fuentes producen contenido en español, inglés, ruso, francés, árabe, portugués, chino y otros idiomas. La plataforma debe respetar el idioma original de las fuentes mientras ofrece traducción completa a cualquier idioma seleccionado por el usuario.

Comportamiento por defecto: La interfaz se presenta en español. El contenido llega en su idioma original (una señal de RT puede estar en ruso, una de Al Jazeera en inglés, una de France 24 en francés). Los análisis generados por la IA se producen en el idioma del usuario (español por defecto). Cada señal muestra un badge con su idioma original.

Comportamiento al cambiar idioma: Al seleccionar otro idioma, se traduce TODO — interfaz, señales, artículos, análisis. No solo los títulos sino el contenido completo. Se mantiene un badge indicando el idioma original ("Traducido del ruso").

---

## 2. IDIOMAS DEL PROYECTO

### 2.1 Idiomas de la interfaz (UI)

Idiomas soportados para la interfaz, navegación, botones y labels:

1. Español (es) — Idioma por defecto
2. English (en)
3. Português (pt)
4. Français (fr)
5. العربية (ar) — Árabe (soporte RTL requerido)
6. 中文 (zh) — Chino simplificado

Implementación: Diccionarios JSON en /app/dictionaries/{lang}.json con todas las cadenas de la interfaz. Cargados según la preferencia del usuario.

### 2.2 Idiomas de las fuentes (contenido)

Los 15 canales y sus idiomas originales:

RT: ruso (ru), español (es), inglés (en)
Al Jazeera: inglés (en), árabe (ar)
CGTN: inglés (en), chino (zh)
TeleSUR: español (es)
France 24: francés (fr), español (es), inglés (en)
DW: alemán (de), español (es), inglés (en)
TRT World: inglés (en)
Press TV: inglés (en)
CCTV: chino (zh), inglés (en)

El RSS proxy ya maneja múltiples idiomas con el parámetro lang. Las señales deben registrarse con su idioma original en el campo language (ISO code).

---

## 3. ARQUITECTURA DE TRADUCCIÓN

### 3.1 Dos capas

Capa 1 — UI (interfaz estática):
Texto de botones, labels, navegación, títulos de secciones, mensajes de error. Traducido con diccionarios JSON estáticos. No requiere IA. Cambio instantáneo al seleccionar idioma.

Capa 2 — Contenido (dinámico):
Señales, artículos, análisis, descripciones, extractos. Traducido con IA en tiempo real. Requiere llamada al modelo. Puede tener latencia de 1-3 segundos.

### 3.2 Flujo de traducción de contenido

Paso 1: Detectar idioma original — Cada señal ya tiene campo language (ISO code) registrado al ser creada.

Paso 2: Comparar con idioma del usuario — Si language == userLang, mostrar directamente sin traducción. Si language != userLang, enviar a traducción.

Paso 3: Traducción por IA — El texto se envía a /api/translate con: texto original, idioma origen, idioma destino. La IA traduce preservando contexto geopolítico, nombres propios, y terminología del marco epistemológico.

Paso 4: Cache de traducción — La traducción se cachea con clave: hash(texto + idioma_origen + idioma_destino). Si la misma señal ya fue traducida a ese idioma, se sirve desde cache. El cache vive en el navegador (localStorage) con expiración de 1 hora.

Paso 5: Badge de idioma — Toda señal traducida muestra: "Traducido del [idioma original]" o "Original: [idioma]". Las señales en idioma original del usuario no muestran badge.

### 3.3 Traducción del análisis IA

El análisis generado por /api/analyze/route.ts ya se produce en el idioma del usuario (se incluye en el system prompt). Al cambiar idioma, los análisis existentes se re-generan en el nuevo idioma, o se traducen los ya almacenados.

Recomendación: Almacenar cada análisis en el idioma en que fue generado. Si el usuario cambia idioma, traducir los existentes en vez de re-generar (más rápido y económico). Solo re-generar si el usuario lo solicita explícitamente.

---

## 4. ENDPOINT DE TRADUCCIÓN

### 4.1 /api/translate/route.ts

POST /api/translate

Body:
{
  text: string,          // Texto a traducir (máximo 5000 caracteres)
  from: string,          // Código ISO idioma origen (ej: "ru")
  to: string,            // Código ISO idioma destino (ej: "es")
  context: string,       // Contexto: "signal" | "article" | "analysis" | "ui"
  preserveTerms: string[] // Términos a no traducir (ej: "Óptica Sur Global", "BRICS")
}

Respuesta:
{
  translated: string,    // Texto traducido
  from: string,          // Idioma origen confirmado
  to: string,            // Idioma destino
  confidence: number,    // 0-1, confianza de la traducción
  cached: boolean        // Si vino de cache servidor
}

### 4.2 Términos preservados

Lista de términos que NO se traducen nunca porque son parte del marco epistemológico del proyecto:

- Óptica Sur Global
- Epistemologías del Sur
- Congruencia Inversa
- Coherencia Histórica
- Integridad Epistémica
- Confiabilidad Asimétrica
- Flexibilidad Pragmática
- Multipolaridad Epistémica
- Justicia Cognitiva
- Soberanía Cognitiva
- Hermenéutica Crítica
- Pragmatismo Emancipador
- Bidireccionalidad de la Relevancia
- Monitor Geopolítico
- BRICS
- CELAC
- UNASUR
- Mercosur

Estos términos se mantienen en español siempre, aunque la interfaz esté en otro idioma. Son nombres propios del marco conceptual.

### 4.3 Consideraciones de recursos

Cada traducción consume tokens de IA. Estimación:
- Señal (extracto 300 chars): ~100 tokens entrada + ~150 tokens salida = ~250 tokens
- Artículo ampliado (5000 chars): ~1500 tokens entrada + ~2000 tokens salida = ~3500 tokens
- Análisis completo: ~2000 tokens entrada + ~2500 tokens salida = ~4500 tokens

Estrategia para minimizar consumo:
- Solo traducir lo que el usuario ve (lazy translation)
- Cache agresivo en navegador (localStorage, 1 hora)
- Cache en servidor (Map en memoria, 5 minutos, máximo 100 entradas)
- No traducir señales que ya están en el idioma del usuario
- No traducir automáticamente al cargar la página — traducir al expandir/seleccionar
- Badge "Ver en [idioma]" que el usuario debe clickear para traducir

---

## 5. IMPLEMENTACIÓN EN LA UI

### 5.1 Selector de idioma

Ubicación: Barra superior, junto al logo del Monitor. Formato: Dropdown con bandera + nombre de idioma. Guarda preferencia en localStorage y cookie. Al cambiar: traduce interfaz instantáneamente, marca contenido visible como "pendiente de traducción", traduce progresivamente.

### 5.2 Comportamiento por defecto (español)

Al iniciar sesión en español:
- Interfaz en español
- Señales en idioma original con badge de idioma
- Análisis generados en español
- Artículos en idioma original con badge "Ver en español"
- Si la señal ya está en español, sin badge

### 5.3 Comportamiento al cambiar idioma

Al seleccionar inglés por ejemplo:
- Interfaz cambia a inglés (instantáneo, desde diccionario)
- Señales se marcan como "Translating..." brevemente
- Se traducen progresivamente (las visibles primero)
- Badge cambia a "Translated from [idioma original]"
- Nuevos análisis se generan en inglés
- Análisis existentes se traducen (no se re-generan)

### 5.4 Soporte RTL para árabe

Cuando el idioma seleccionado es árabe:
- Dirección del texto cambia a right-to-left
- Layout del dashboard se invierte (sidebar a la derecha)
- Los badges de idioma se ajustan
- Las señales en árabe se muestran en RTL, las traducidas en LTR según idioma destino

---

## 6. ESTRUCTURA DE ARCHIVOS

### 6.1 Diccionarios de UI

/app/dictionaries/es.json — Español (referencia, siempre completo)
/app/dictionaries/en.json — English
/app/dictionaries/pt.json — Português
/app/dictionaries/fr.json — Français
/app/dictionaries/ar.json — العربية
/app/dictionaries/zh.json — 中文

Cada diccionario contiene TODAS las cadenas de la interfaz: títulos de secciones, labels de clasificadores, labels de regiones, labels de filtros, textos de botones, mensajes de error, textos del disclaimer, tooltips.

### 6.2 Endpoint de traducción

/app/api/translate/route.ts — POST endpoint que recibe texto + idiomas + contexto + términos a preservar. Usa z-ai-web-dev-sdk para traducción. Cache en memoria.

### 6.3 Hook de traducción

/lib/useTranslation.ts — Hook React que: detecta idioma del usuario desde localStorage o navegador, proporciona función t() para cadenas de UI, proporciona función translateContent() para contenido dinámico, maneja cache de traducciones en localStorage.

### 6.4 Tipos de idioma

/types/language.ts:
- LanguageCode: tipo union con todos los códigos ISO soportados
- TranslatableContent: interfaz para contenido traducible con idioma original y traducciones cacheadas
- TranslationResult: resultado de traducción con metadata

---

## 7. FASES DE IMPLEMENTACIÓN

### Fase 1 — UI multilingue (semana 1-2) — Costo: $0

1. Crear diccionario es.json completo con todas las cadenas
2. Crear hook useTranslation con soporte es/en
3. Reemplazar todas las cadenas hardcodeadas con t()
4. Crear selector de idioma en la barra superior
5. Agregar en.json
6. Probar cambio de idioma es↔en

### Fase 2 — Traducción de contenido (semana 3-4) — Costo: tokens IA

1. Crear /api/translate/route.ts
2. Implementar traducción con z-ai-web-dev-sdk
3. Agregar campo language a señales (si no existe)
4. Implementar badges de idioma en SignalCard
5. Implementar traducción al expandir señal
6. Cache en navegador (localStorage)
7. Probar traducción de señales ruso→español, inglés→español

### Fase 3 — Más idiomas (semana 5-6) — Costo: $0 + tokens IA

1. Agregar pt.json, fr.json
2. Probar es↔pt↔fr↔en
3. Agregar ar.json con soporte RTL
4. Agregar zh.json
5. Probar árabe (RTL) y chino

### Fase 4 — Optimización (semana 7-8) — Costo: $0

1. Cache en servidor (Map con límite)
2. Traducción lazy (solo al expandir/seleccionar)
3. Prefetch de traducciones para señales visibles
4. Métricas de uso de traducción por idioma
5. Optimizar prompts de traducción para reducir tokens

---

## 8. ALINEACIÓN EPISTEMOLÓGICA

Multipolaridad Epistémica: El contenido se muestra primero en su idioma original. No se impone un idioma dominante. La traducción es una opción, no una imposición.

Justicia Cognitiva: Las fuentes en idiomas no hegemónicos (ruso, árabe, chino, portugués) son accesibles para hispanohablantes sin perder su identidad lingüística original. El badge de idioma original preserva la procedencia.

Soberanía Cognitiva: El usuario elige en qué idioma consumir el contenido. No es el algoritmo quien decide traducir — es el usuario quien activa la traducción.

Hermenéutica Crítica: La traducción no es neutral. Por eso se preserva siempre el idioma original como referencia. El usuario puede comparar original y traducción. Los términos del marco epistemológico no se traducen — son conceptos propios.

Pragmatismo Emancipador: La traducción hace accesible el conocimiento en idiomas que el usuario no domina. Esto es pragmatismo emancipador real: derriba barreras lingüísticas que concentran el conocimiento en idiomas hegemónicos.
