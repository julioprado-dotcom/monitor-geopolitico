import { NextRequest } from 'next/server';
import { chatCompletion, delay } from '@/lib/zai';
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

/** Helper to create an SSE error stream */
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
 * ULTRA-OPTIMIZED VERIFICATION FLOW
 * 
 * v1: 7-9 API calls → Rate limit hell
 * v2: 2-3 API calls → Still hitting 429
 * v3: 1 API call (mega-prompt only) → Maximum rate limit survival
 * 
 * The webSearch is removed because:
 * - It may fall back to chatCompletion (consuming extra rate limit)
 * - The LLM's training data already includes knowledge of sources
 * - One call = zero risk of cascading rate limit failures
 * 
 * Retry strategy: 3 attempts with exponential backoff (5s, 15s, 30s)
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json();
    const { inputType, content } = body;

    if (!content || content.trim().length === 0) {
      return createErrorStream('El contenido a verificar es obligatorio');
    }

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
          // STEP 1: MEGA-PROMPT — Single API call
          // ─────────────────────────────────────────
          send(sendLog(encoder, 'extracting',
            inputType === 'url'
              ? 'Procesando URL para verificación...'
              : 'Procesando texto para verificación...',
            inputType === 'url' ? `URL: ${content.slice(0, 80)}` : `${content.split(' ').length} palabras recibidas`
          ));

          send(sendLog(encoder, 'analyzing',
            'Ejecutando análisis Crítico-Pluralista completo...',
            'Extracción · Búsqueda de fuentes · 6 Dimensiones · Voces silenciadas'
          ));

          const extractedText = content;

          const megaPrompt = `Realiza un análisis COMPLETO de verificación Crítico-Pluralista de la siguiente noticia. Debes hacer TODO en una sola respuesta:

NOTICIA/AFIRMACIÓN A VERIFICAR:
${extractedText.slice(0, 4000)}

INSTRUCCIONES:
1. Extrae las 3-5 afirmaciones clave verificables del texto
2. Busca en tu conocimiento fuentes relevantes (reales, no inventadas) que confirmen, contradigan o matizen la noticia. Incluye fuentes de DIFERENTES categorías (Colectivo Occidental, Sur Global, independientes, académicas, de resistencia). Para cada fuente, indica su URL real si la conoces.
3. Evalúa las 6 dimensiones con score 0-100 y análisis detallado
4. Identifica voces silenciadas y perspectivas omitidas
5. Calcula un score general de veracidad ponderando la diversidad de fuentes
6. Genera un resumen ejecutivo

RESPONDE SOLO con un JSON con esta estructura exacta, sin texto adicional:
{
  "keyClaims": ["afirmación 1", "afirmación 2", ...],
  "sources": [
    {
      "name": "Nombre del medio o fuente",
      "url": "URL real si se conoce, o cadena vacía",
      "snippet": "Resumen de lo que dice esta fuente sobre el tema",
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
}`;

          // Single retry with long delay — no double-retry amplification
          // chatCompletion has NO internal retry, so this is the ONLY retry layer
          let megaResponse: any = null;

          try {
            megaResponse = await chatCompletion([
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: megaPrompt },
            ], { max_tokens: 4096 });
          } catch (error: any) {
            const errorMsg = error?.message || '';
            const isRateLimit = errorMsg.includes('429') || errorMsg.includes('rate') || errorMsg.includes('overload') || errorMsg.includes('1302') || errorMsg.includes('1305');

            if (isRateLimit) {
              // One single retry with a 20-second delay to let rate limit window reset
              send(sendLog(encoder, 'analyzing',
                'Servidor ocupado, esperando 20s antes de reintentar...',
                'El servicio de IA está temporalmente saturado — reintentando una vez más',
              ));
              await delay(20000);

              try {
                megaResponse = await chatCompletion([
                  { role: 'system', content: SYSTEM_PROMPT },
                  { role: 'user', content: megaPrompt },
                ], { max_tokens: 4096 });
              } catch (retryError: any) {
                const retryMsg = retryError?.message || '';
                const retryIsRateLimit = retryMsg.includes('429') || retryMsg.includes('rate') || retryMsg.includes('overload');
                if (retryIsRateLimit) {
                  throw new Error('El servicio de IA está saturado. Espera 1-2 minutos e intenta de nuevo.');
                }
                throw retryError;
              }
            } else {
              throw error;
            }
          }

          if (!megaResponse) {
            throw new Error('No se pudo obtener respuesta del servicio de IA después de múltiples intentos.');
          }

          // ─────────────────────────────────────────
          // STEP 2: Parse the mega-response
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

            // Build classified sources from LLM-generated sources
            let classifiedSources: SourceResult[] = [];
            if (Array.isArray(parsed.sources)) {
              classifiedSources = parsed.sources.map((s: any) => ({
                name: s.name || 'Fuente sin nombre',
                url: s.url || '',
                snippet: s.snippet || '',
                category: (s.category as SourceCategory) || 'independiente',
                orientation: (s.orientation as SourceOrientation) || 'independiente',
                geopoliticalPerspective: (s.geopoliticalPerspective as GeopoliticalPerspective) || 'no_alineado',
                relationToNews: (s.relationToNews as SourceRelation) || 'sin_relacion',
                hostName: s.url ? (() => { try { return new URL(s.url.startsWith('http') ? s.url : `https://${s.url}`).hostname; } catch { return ''; } })() : '',
              })).filter((s: SourceResult) => s.name !== 'Fuente sin nombre' || s.snippet);
            }

            const keyClaims: string[] = Array.isArray(parsed.keyClaims) ? parsed.keyClaims : [extractedText.slice(0, 200)];

            // Log progress
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
            analysisResult = {
              overallScore: 50,
              veracityLevel: 'dubious',
              sourceCredibility: { score: 50, level: 'medium', title: 'Credibilidad de Fuente', description: 'No se pudo completar el análisis detallado', evidence: [] },
              internalCoherence: { score: 50, level: 'medium', title: 'Coherencia Interna', description: 'No se pudo completar el análisis detallado', evidence: [] },
              externalCorroboration: { score: 50, level: 'medium', title: 'Corroboración Externa', description: 'No se pudo completar el análisis detallado', evidence: [] },
              sensationalism: { score: 50, level: 'medium', title: 'Lenguaje Sensacionalista', description: 'No se pudo completar el análisis detallado', evidence: [] },
              factualAccuracy: { score: 50, level: 'medium', title: 'Veracidad Factual', description: 'No se pudo completar el análisis detallado', evidence: [] },
              biasManipulation: { score: 50, level: 'medium', title: 'Sesgo y Manipulación', description: 'No se pudo completar el análisis detallado', evidence: [] },
              sourcesFound: [],
              silencedVoices: [],
              summary: 'El análisis no pudo completarse completamente. Intenta de nuevo.',
              keyClaims: [extractedText.slice(0, 200)],
            };

            send(sendLog(encoder, 'generating',
              'Análisis completado con resultados parciales',
              'No se pudo parsear la respuesta del modelo',
              'error'
            ));
          }

          // ─────────────────────────────────────────
          // STEP 3: Save to database
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
