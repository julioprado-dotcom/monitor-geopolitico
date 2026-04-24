import { NextRequest } from 'next/server';
import { chatCompletion, webSearch, delay } from '@/lib/zai';
import { db } from '@/lib/db';

const encoder = new TextEncoder();
import type {
  VerificationRequest,
  VerificationResult,
  VeracityLevel,
  SourceResult,
  SourceCategory,
  SourceOrientation,
  GeopoliticalPerspective,
  SourceRelation,
  DimensionDetail,
  SilencedVoice,
  AnalysisStage,
} from '@/lib/types';

function getVeracityLevel(score: number): VeracityLevel {
  if (score >= 80) return 'verified';
  if (score >= 50) return 'dubious';
  return 'false';
}

function getDimensionLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

const SYSTEM_PROMPT = `Eres un analista de verificación de noticias con un enfoque Crítico-Pluralista. Tu misión es analizar noticias y afirmaciones detectando no solo informaciones falsas, sino también sesgos, omisiones, y marcos narrativos que distorsionan la realidad.

PRINCIPIOS FUNDAMENTALES:
1. Los medios hegemónicos del Colectivo Occidental NO son neutrales - su pretendida "objetividad" es una posición ideológica
2. Las agencias fact-checker mainstream reproducen sesgos que dicen combatir
3. El Sur Global es sistemáticamente silenciado o distorsionado por narrativas dominantes
4. La verificación ecuanime requiere buscar deliberadamente en fuentes diversas
5. No basta con detectar lo que se dice - es CRUCIAL detectar lo que se CALLA

CATEGORÍAS DE FUENTES (debes clasificar cada fuente encontrada):
- colectivo_occidental: Medios alineados con la narrativa occidental (BBC, CNN, NYT, Le Monde, El País, Reuters, AP, AFP, etc.)
- sur_global: Telesur, Prensa Latina, Xinhua, medios africanos, asiáticos, latinoamericanos
- independiente: Periodismo de investigación, medios digitales autónomos
- academico: Papers, universidades, centros de investigación
- resistencia: Movimientos sociales, periodismo comunitario, pueblos originarios

ORIENTACIÓN DE FUENTES:
- estatal: Financiado/controlado por un Estado
- corporativo: Propiedad de corporaciones o grupos empresariales
- comunitario: De/base en comunidades locales
- independiente: Autónomo, sin afiliación corporativa o estatal
- academico: Universidad o centro de investigación

PERSPECTIVA GEOPOLÍTICA:
- alineado_otan: Alineado con la OTAN
- alineado_usa: Alineado con Estados Unidos
- alineado_ue: Alineado con la Unión Europea
- no_alineado: No alineado con bloques de poder
- critico_orden_global: Crítico del orden geopolítico imperante
- multipolar: Promueve un orden multipolar

DIMENSIONES DE ANÁLISIS (califica 0-100):

1. CREDIBILIDAD DE FUENTE: ¿La fuente original es conocida, registrada, transparente? ¿Tiene historia de fiabilidad o de desinformación?

2. COHERENCIA INTERNA: ¿El texto se contradice? ¿Hay inconsistencias lógicas? ¿Los datos presentados son coherentes entre sí?

3. CORROBORACIÓN EXTERNA: ¿Otras fuentes confirman la misma información? ¿Cuántas fuentes diversas la corroboran? ¿Hay contradicciones entre fuentes?

4. LENGUAJE SENSACIONALISTA: ¿Uso de clickbait, emociones extremas, urgencia artificial? ¿Títulos engañosos? ¿Lenguaje que busca manipular emocionalmente?

5. VERACIDAD FACTUAL: ¿Los datos, cifras y hechos mencionados son comprobablemente ciertos? ¿Hay errores fácticos demostrables?

6. SESGO/MANIPULACIÓN: ¿Hay sesgo ideológico, omisiones selectivas, estadísticas engañosas? ¿Se deshumaniza al "otro"? ¿Se omite contexto histórico relevante? ¿Se silencian voces?

IMPORTANTE: El score de veracidad general debe ponderar especialmente la diversidad de fuentes que corroboran. Una noticia confirmada SOLO por fuentes del Colectivo Occidental no merece el mismo score que una confirmada por fuentes de categorías diversas.

RESPONDE SIEMPRE EN ESPAÑOL.`;

/** Helper to send an SSE log event */
function sendLog(
  encoder: TextEncoder,
  stage: AnalysisStage,
  message: string,
  detail?: string,
  status: 'running' | 'done' | 'error' = 'running'
): string {
  const data = JSON.stringify({
    type: 'log',
    entry: {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      stage,
      message,
      detail,
      status,
    },
  });
  return `data: ${data}\n\n`;
}

/** Helper to create an SSE error stream (used when errors happen before the main stream starts) */
function createErrorStream(errorMessage: string, detail?: string) {
  const errorLog = sendLog(encoder, 'error', errorMessage, detail, 'error');
  const errorEvent = `data: ${JSON.stringify({ type: 'error', message: errorMessage })}\n\n`;
  const fullStream = errorLog + errorEvent;

  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(fullStream));
        controller.close();
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    }
  );
}

/**
 * OPTIMIZED VERIFICATION FLOW
 * 
 * Before: 7-9 API calls (3 searches, 3 chat completions, 1 counter-search)
 * Now:    2-3 API calls (1 search + 1-2 chat completions)
 * 
 * Strategy: Consolidate all analysis into a single mega-prompt that:
 * 1. Extracts claims
 * 2. Classifies sources
 * 3. Performs 6-dimension analysis
 * 4. Identifies silenced voices
 * All in one API call.
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json();
    const { inputType, content } = body;

    if (!content || content.trim().length === 0) {
      return createErrorStream('El contenido a verificar es obligatorio');
    }

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        let closed = false;

        const send = (text: string) => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(text));
          } catch {
            closed = true;
          }
        };

        try {
          // ─────────────────────────────────────────
          // STEP 1: Search for sources (SINGLE search)
          // ─────────────────────────────────────────
          send(sendLog(encoder, 'extracting',
            inputType === 'url'
              ? 'Procesando URL y buscando fuentes...'
              : 'Procesando texto y buscando fuentes...',
            inputType === 'url' ? `URL: ${content.slice(0, 80)}` : `${content.split(' ').length} palabras recibidas`
          ));

          let searchResultsText = '';
          const allSearchResults: Array<{
            url: string;
            name: string;
            snippet: string;
            host_name: string;
          }> = [];

          // Single comprehensive search combining the main topic + counter-narratives
          try {
            const searchQuery = inputType === 'url'
              ? content.trim()
              : content.slice(0, 150).trim();

            const results = await webSearch(searchQuery, 10);
            if (Array.isArray(results) && results.length > 0) {
              allSearchResults.push(...results);
              searchResultsText = results
                .map((r: { name: string; snippet: string; url: string; host_name: string }, i: number) =>
                  `${i + 1}. ${r.name} (${r.host_name})\n   URL: ${r.url}\n   Fragmento: ${r.snippet}`
                )
                .join('\n\n');

              send(sendLog(encoder, 'extracting',
                `${results.length} fuentes encontradas`,
                'Búsqueda web completada',
                'done'
              ));
            }
          } catch {
            send(sendLog(encoder, 'extracting',
              'Búsqueda web no disponible, continuando con análisis del texto',
              undefined, 'error'
            ));
          }

          // ─────────────────────────────────────────
          // STEP 2: MEGA-PROMPT — All analysis in ONE call
          // ─────────────────────────────────────────
          send(sendLog(encoder, 'analyzing',
            'Ejecutando análisis Crítico-Pluralista completo...',
            'Extracción · Clasificación · 6 Dimensiones · Voces silenciadas'
          ));

          // Add a small delay to avoid hitting rate limit from the search call
          await delay(1000);

          const extractedText = content;

          const sourcesSection = searchResultsText
            ? `FUENTES ENCONTRADAS MEDIANTE BÚSQUEDA WEB:\n${searchResultsText}`
            : 'No se encontraron fuentes adicionales mediante búsqueda web. Analiza basándote en tu conocimiento.';

          const megaResponse = await chatCompletion([
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Realiza un análisis COMPLETO de verificación Crítico-Pluralista de la siguiente noticia. Debes hacer TODO en una sola respuesta:

NOTICIA/AFIRMACIÓN A VERIFICAR:
${extractedText.slice(0, 4000)}

${sourcesSection}

INSTRUCCIONES:
1. Extrae las 3-5 afirmaciones clave verificables
2. Clasifica CADA fuente encontrada por categoría, orientación y perspectiva geopolítica
3. Evalúa las 6 dimensiones con score 0-100 y análisis detallado
4. Identifica voces silenciadas y perspectivas omitidas
5. Calcula un score general de veracidad ponderando la diversidad de fuentes
6. Genera un resumen ejecutivo

RESPONDE SOLO con un JSON con esta estructura exacta, sin texto adicional:
{
  "keyClaims": ["afirmación 1", "afirmación 2", ...],
  "sources": [
    {
      "index": 1,
      "category": "colectivo_occidental|sur_global|independiente|academico|resistencia",
      "orientation": "estatal|corporativo|comunitario|independiente|academico",
      "geopoliticalPerspective": "alineado_otan|alineado_usa|alineado_ue|no_alineado|critico_orden_global|multipolar",
      "relationToNews": "confirma|contradice|matiza|sin_relacion"
    }
  ],
  "overallScore": <número 0-100>,
  "sourceCredibility": {"score": <0-100>, "title": "Credibilidad de Fuente", "description": "<análisis detallado>", "evidence": ["<evidencia1>", "<evidencia2>"]},
  "internalCoherence": {"score": <0-100>, "title": "Coherencia Interna", "description": "<análisis detallado>", "evidence": ["<evidencia1>", "<evidencia2>"]},
  "externalCorroboration": {"score": <0-100>, "title": "Corroboración Externa", "description": "<análisis detallado>", "evidence": ["<evidencia1>", "<evidencia2>"]},
  "sensationalism": {"score": <0-100>, "title": "Lenguaje Sensacionalista", "description": "<análisis detallado>", "evidence": ["<evidencia1>", "<evidencia2>"]},
  "factualAccuracy": {"score": <0-100>, "title": "Veracidad Factual", "description": "<análisis detallado>", "evidence": ["<evidencia1>", "<evidencia2>"]},
  "biasManipulation": {"score": <0-100>, "title": "Sesgo y Manipulación", "description": "<análisis detallado>", "evidence": ["<evidencia1>", "<evidencia2>"]},
  "silencedVoices": [{"perspective": "<quién>", "description": "<qué perspectiva falta>", "context": "<por qué es relevante>"}],
  "summary": "<resumen ejecutivo de 3-5 oraciones>"
}`,
            },
          ], { max_tokens: 4096 });

          // ─────────────────────────────────────────
          // STEP 3: Parse the mega-response
          // ─────────────────────────────────────────
          let analysisResult: VerificationResult;

          try {
            const analysisText = megaResponse.choices[0]?.message?.content || '{}';
            const cleanedAnalysis = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleanedAnalysis);

            const overallScore = parsed.overallScore || 50;
            const veracityLevel = getVeracityLevel(overallScore);

            const makeDimension = (
              raw: {
                score?: number;
                title?: string;
                description?: string;
                evidence?: string[];
              },
              defaultTitle: string
            ): DimensionDetail => ({
              score: raw.score ?? 50,
              level: getDimensionLevel(raw.score ?? 50),
              title: raw.title || defaultTitle,
              description: raw.description || 'Sin análisis disponible',
              evidence: raw.evidence || [],
            });

            // Build classified sources from search results + LLM classification
            let classifiedSources: SourceResult[] = [];
            if (allSearchResults.length > 0 && Array.isArray(parsed.sources)) {
              classifiedSources = allSearchResults.slice(0, 15).map((result, idx) => {
                const classification = parsed.sources.find(
                  (c: { index?: number }) => c.index === idx + 1
                ) || parsed.sources[idx] || {};

                return {
                  name: result.name,
                  url: result.url,
                  snippet: result.snippet,
                  category: (classification.category as SourceCategory) || 'independiente',
                  orientation: (classification.orientation as SourceOrientation) || 'independiente',
                  geopoliticalPerspective:
                    (classification.geopoliticalPerspective as GeopoliticalPerspective) || 'no_alineado',
                  relationToNews: (classification.relationToNews as SourceRelation) || 'sin_relacion',
                  hostName: result.host_name,
                };
              });
            }

            const keyClaims: string[] = Array.isArray(parsed.keyClaims) ? parsed.keyClaims : [extractedText.slice(0, 200)];

            // Log intermediate progress
            send(sendLog(encoder, 'analyzing',
              `${keyClaims.length} afirmaciones clave identificadas`,
              keyClaims.map((c: string, i: number) => `${i + 1}. ${c.slice(0, 60)}...`).join('\n'),
              'done'
            ));

            send(sendLog(encoder, 'classifying',
              `${classifiedSources.length} fuentes clasificadas`,
              undefined, 'done'
            ));

            analysisResult = {
              overallScore,
              veracityLevel,
              sourceCredibility: makeDimension(parsed.sourceCredibility, 'Credibilidad de Fuente'),
              internalCoherence: makeDimension(parsed.internalCoherence, 'Coherencia Interna'),
              externalCorroboration: makeDimension(parsed.externalCorroboration, 'Corroboración Externa'),
              sensationalism: makeDimension(parsed.sensationalism, 'Lenguaje Sensacionalista'),
              factualAccuracy: makeDimension(parsed.factualAccuracy, 'Veracidad Factual'),
              biasManipulation: makeDimension(parsed.biasManipulation, 'Sesgo y Manipulación'),
              sourcesFound: classifiedSources,
              silencedVoices: (parsed.silencedVoices as SilencedVoice[]) || [],
              summary: parsed.summary || 'Análisis no disponible',
              keyClaims,
            };

            send(sendLog(encoder, 'generating',
              `Análisis completado — Score: ${overallScore}/100 (${veracityLevel})`,
              `Voces silenciadas: ${analysisResult.silencedVoices.length} | Fuentes: ${classifiedSources.length}`,
              'done'
            ));
          } catch (parseError) {
            console.error('Parse error:', parseError);
            // Fallback result
            const keyClaims = [extractedText.slice(0, 200)];
            const classifiedSources = allSearchResults.slice(0, 15).map((result) => ({
              name: result.name,
              url: result.url,
              snippet: result.snippet,
              category: 'independiente' as SourceCategory,
              orientation: 'independiente' as SourceOrientation,
              geopoliticalPerspective: 'no_alineado' as GeopoliticalPerspective,
              relationToNews: 'sin_relacion' as SourceRelation,
              hostName: result.host_name,
            }));

            analysisResult = {
              overallScore: 50,
              veracityLevel: 'dubious',
              sourceCredibility: { score: 50, level: 'medium', title: 'Credibilidad de Fuente', description: 'No se pudo completar el análisis detallado', evidence: [] },
              internalCoherence: { score: 50, level: 'medium', title: 'Coherencia Interna', description: 'No se pudo completar el análisis detallado', evidence: [] },
              externalCorroboration: { score: 50, level: 'medium', title: 'Corroboración Externa', description: 'No se pudo completar el análisis detallado', evidence: [] },
              sensationalism: { score: 50, level: 'medium', title: 'Lenguaje Sensacionalista', description: 'No se pudo completar el análisis detallado', evidence: [] },
              factualAccuracy: { score: 50, level: 'medium', title: 'Veracidad Factual', description: 'No se pudo completar el análisis detallado', evidence: [] },
              biasManipulation: { score: 50, level: 'medium', title: 'Sesgo y Manipulación', description: 'No se pudo completar el análisis detallado', evidence: [] },
              sourcesFound: classifiedSources,
              silencedVoices: [],
              summary: 'El análisis no pudo completarse completamente. Intenta de nuevo.',
              keyClaims,
            };

            send(sendLog(encoder, 'generating',
              'Análisis completado con resultados parciales',
              'No se pudo parsear la respuesta del modelo',
              'error'
            ));
          }

          // ─────────────────────────────────────────
          // STEP 4: Save to database
          // ─────────────────────────────────────────
          send(sendLog(encoder, 'saving',
            'Guardando resultados en la base de datos...'
          ));

          try {
            const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            await db.execute({
              sql: `INSERT INTO Verification (id, inputType, inputContent, extractedText, overallScore, veracityLevel,
                    sourceCredibility, internalCoherence, externalCorroboration, sensationalism,
                    factualAccuracy, biasManipulation, dimensionDetails, sourcesFound, silencedVoices, summary)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [
                id,
                inputType,
                content.slice(0, 2000),
                extractedText.slice(0, 3000),
                analysisResult.overallScore,
                analysisResult.veracityLevel,
                analysisResult.sourceCredibility.score,
                analysisResult.internalCoherence.score,
                analysisResult.externalCorroboration.score,
                analysisResult.sensationalism.score,
                analysisResult.factualAccuracy.score,
                analysisResult.biasManipulation.score,
                JSON.stringify({
                  sourceCredibility: analysisResult.sourceCredibility,
                  internalCoherence: analysisResult.internalCoherence,
                  externalCorroboration: analysisResult.externalCorroboration,
                  sensationalism: analysisResult.sensationalism,
                  factualAccuracy: analysisResult.factualAccuracy,
                  biasManipulation: analysisResult.biasManipulation,
                }),
                JSON.stringify(analysisResult.sourcesFound),
                JSON.stringify(analysisResult.silencedVoices),
                analysisResult.summary,
              ],
            });
            send(sendLog(encoder, 'saving',
              'Resultados guardados correctamente',
              undefined, 'done'
            ));
          } catch {
            send(sendLog(encoder, 'saving',
              'No se pudo guardar en la base de datos (resultados mostrados de todos modos)',
              undefined, 'error'
            ));
          }

          // ─────────────────────────────────────────
          // FINAL: Send the result
          // ─────────────────────────────────────────
          const resultData = JSON.stringify({ type: 'result', data: analysisResult });
          send(`data: ${resultData}\n\n`);

          if (!closed) {
            closed = true;
            controller.close();
          }
        } catch (error) {
          console.error('Verification error:', error);
          const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
          send(sendLog(encoder, 'error',
            `Error durante la verificación: ${errorMsg}`,
            undefined, 'error'
          ));
          const errorData = JSON.stringify({ type: 'error', message: errorMsg });
          send(`data: ${errorData}\n\n`);
          if (!closed) {
            closed = true;
            controller.close();
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('Verification route error:', error);
    const msg = error instanceof Error ? error.message : 'Error interno durante la verificación';
    return createErrorStream(`Error del servidor: ${msg}`, 'Revisa las variables de entorno y la conexión a la base de datos');
  }
}
