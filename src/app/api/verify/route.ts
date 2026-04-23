import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, webSearch } from '@/lib/zai';
import { db } from '@/lib/db';
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
- Colectivo Occidental: Medios alineados con la narrativa occidental (BBC, CNN, NYT, Le Monde, El País, Reuters, AP, AFP, etc.)
- Sur Global: Telesur, Prensa Latina, Xinhua, medios africanos, asiáticos, latinoamericanos
- Independiente: Periodismo de investigación, medios digitales autónomos
- Académico: Papers, universidades, centros de investigación
- Resistencia: Movimientos sociales, periodismo comunitario, pueblos originarios

ORIENTACIÓN DE FUENTES:
- Estatal: Financiado/controlado por un Estado
- Corporativo: Propiedad de corporaciones o grupos empresariales
- Comunitario: De/base en comunidades locales
- Independiente: Autónomo, sin afiliación corporativa o estatal
- Académico: Universidad o centro de investigación

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

export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json();
    const { inputType, content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'El contenido a verificar es obligatorio' },
        { status: 400 }
      );
    }

    // Step 1: For URL input, use web search to find the article content
    let extractedText = content;
    if (inputType === 'url') {
      // Search for the URL to get contextual snippets
      try {
        const urlSearchResults = await webSearch(content.trim(), 5);
        if (Array.isArray(urlSearchResults) && urlSearchResults.length > 0) {
          // Combine snippets as the extracted text
          const combinedSnippets = urlSearchResults
            .map((r: { name: string; snippet: string }) => `${r.name}: ${r.snippet}`)
            .join('\n\n');
          extractedText = combinedSnippets || content;
        }
      } catch {
        extractedText = content;
      }

      // Also use LLM to identify what the URL article is about based on search results
      try {
        const urlContextResponse = await chatCompletion([
          { role: 'system', content: 'Eres un asistente que reconstruye el contenido de un artículo a partir de resultados de búsqueda. Responde en español.' },
          {
            role: 'user',
            content: `A partir de los siguientes resultados de búsqueda sobre una URL, reconstruye el contenido principal del artículo original. URL: ${content}\n\nResultados:\n${extractedText.slice(0, 2000)}\n\nReconstruye el artículo:`,
          },
        ]);
        const reconstructed = urlContextResponse.choices[0]?.message?.content;
        if (reconstructed && reconstructed.length > 100) {
          extractedText = reconstructed;
        }
      } catch {
        // Keep whatever we have
      }
    }

    // Step 2: Extract key claims from the text
    const claimsResponse = await chatCompletion([
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Analiza el siguiente texto y extrae las 3-5 afirmaciones principales (claims) que se pueden verificar factualmente. Responde SOLO con un JSON array de strings, sin texto adicional:\n\n${extractedText.slice(0, 3000)}`,
      },
    ]);

    let keyClaims: string[] = [];
    try {
      const claimsText = claimsResponse.choices[0]?.message?.content || '[]';
      const cleaned = claimsText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      keyClaims = JSON.parse(cleaned);
      if (!Array.isArray(keyClaims)) keyClaims = [extractedText.slice(0, 200)];
    } catch {
      keyClaims = [extractedText.slice(0, 200)];
    }

    // Step 3: Search for diverse sources
    const searchQueries = keyClaims.slice(0, 3).map((claim) => claim.slice(0, 100));
    const allSearchResults: Array<{
      url: string;
      name: string;
      snippet: string;
      host_name: string;
    }> = [];

    // Search in parallel for speed
    const searchPromises = searchQueries.map(async (query) => {
      try {
        const results = await webSearch(query, 8);
        if (Array.isArray(results)) return results;
      } catch {
        // Continue
      }
      return [];
    });

    const searchResultsArrays = await Promise.all(searchPromises);
    for (const results of searchResultsArrays) {
      allSearchResults.push(...results);
    }

    // Also search for counter-narratives
    try {
      const counterQuery = `crítica versión alternativa ${keyClaims[0]?.slice(0, 80) || content.slice(0, 80)}`;
      const counterResults = await webSearch(counterQuery, 5);
      if (Array.isArray(counterResults)) {
        allSearchResults.push(...counterResults);
      }
    } catch {
      // Continue
    }

    // Deduplicate by URL
    const seenUrls = new Set<string>();
    const uniqueResults = allSearchResults.filter((r) => {
      if (seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    });

    // Step 4: Classify sources using LLM
    const sourcesFormatted = uniqueResults
      .slice(0, 15)
      .map(
        (s, i) =>
          `${i + 1}. Nombre: ${s.name}\n   URL: ${s.url}\n   Fragmento: ${s.snippet}\n   Host: ${s.host_name}`
      )
      .join('\n\n');

    let classifiedSources: SourceResult[] = [];

    if (uniqueResults.length > 0) {
      try {
        const classificationResponse = await chatCompletion([
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Clasifica cada una de las siguientes fuentes encontradas durante la verificación de esta noticia. Para cada fuente, determina:\n\n- category: una de [colectivo_occidental, sur_global, independiente, academico, resistencia]\n- orientation: una de [estatal, corporativo, comunitario, independiente, academico]\n- geopoliticalPerspective: una de [alineado_otan, alineado_usa, alineado_ue, no_alineado, critico_orden_global, multipolar]\n- relationToNews: una de [confirma, contradice, matiza, sin_relacion] basándote en el fragmento y la noticia analizada\n\nNoticia analizada: ${extractedText.slice(0, 1000)}\n\nFuentes:\n${sourcesFormatted}\n\nResponde SOLO con un JSON array donde cada elemento tenga: {index, category, orientation, geopoliticalPerspective, relationToNews}. Sin texto adicional.`,
          },
        ]);

        const classText = classificationResponse.choices[0]?.message?.content || '[]';
        const cleanedClass = classText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleanedClass);

        classifiedSources = uniqueResults.slice(0, 15).map((result, idx) => {
          const classification = parsed.find(
            (c: { index?: number }) => c.index === idx + 1
          ) || parsed[idx] || {};

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
      } catch {
        classifiedSources = uniqueResults.slice(0, 15).map((result) => ({
          name: result.name,
          url: result.url,
          snippet: result.snippet,
          category: 'independiente' as SourceCategory,
          orientation: 'independiente' as SourceOrientation,
          geopoliticalPerspective: 'no_alineado' as GeopoliticalPerspective,
          relationToNews: 'sin_relacion' as SourceRelation,
          hostName: result.host_name,
        }));
      }
    }

    // Step 5: Full analysis with LLM
    const sourcesSummary = classifiedSources.length > 0
      ? classifiedSources
          .map(
            (s) =>
              `- ${s.name} [${s.category}/${s.orientation}/${s.geopoliticalPerspective}]: ${s.relationToNews} - "${s.snippet.slice(0, 150)}"`
          )
          .join('\n')
      : 'No se encontraron fuentes adicionales mediante búsqueda web.';

    const analysisResponse = await chatCompletion([
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Realiza un análisis completo de verificación de la siguiente noticia con enfoque Crítico-Pluralista.

NOTICIA/AFIRMACIÓN A VERIFICAR:
${extractedText.slice(0, 3000)}

AFIRMACIONES CLAVE IDENTIFICADAS:
${keyClaims.map((c, i) => `${i + 1}. ${c}`).join('\n')}

FUENTES ENCONTRADAS (clasificadas):
${sourcesSummary}

INSTRUCCIONES:
1. Evalúa cada una de las 6 dimensiones con un score 0-100
2. Para cada dimensión, proporciona una descripción detallada del análisis y evidencia encontrada
3. Identifica las voces silenciadas o perspectivas omitidas
4. Calcula un score general de veracidad (0-100) ponderando la diversidad de fuentes
5. Genera un resumen ejecutivo

RESPONDE SOLO con un JSON con esta estructura exacta, sin texto adicional:
{
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
    ]);

    let analysisResult: VerificationResult;
    try {
      const analysisText = analysisResponse.choices[0]?.message?.content || '{}';
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
    } catch {
      // Fallback result
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
    }

    // Step 6: Save to database
    try {
      await db.verification.create({
        data: {
          inputType,
          inputContent: content.slice(0, 2000),
          extractedText: extractedText.slice(0, 3000),
          overallScore: analysisResult.overallScore,
          veracityLevel: analysisResult.veracityLevel,
          sourceCredibility: analysisResult.sourceCredibility.score,
          internalCoherence: analysisResult.internalCoherence.score,
          externalCorroboration: analysisResult.externalCorroboration.score,
          sensationalism: analysisResult.sensationalism.score,
          factualAccuracy: analysisResult.factualAccuracy.score,
          biasManipulation: analysisResult.biasManipulation.score,
          dimensionDetails: JSON.stringify({
            sourceCredibility: analysisResult.sourceCredibility,
            internalCoherence: analysisResult.internalCoherence,
            externalCorroboration: analysisResult.externalCorroboration,
            sensationalism: analysisResult.sensationalism,
            factualAccuracy: analysisResult.factualAccuracy,
            biasManipulation: analysisResult.biasManipulation,
          }),
          sourcesFound: JSON.stringify(analysisResult.sourcesFound),
          silencedVoices: JSON.stringify(analysisResult.silencedVoices),
          summary: analysisResult.summary,
        },
      });
    } catch {
      // Don't fail the request if DB save fails
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Error interno durante la verificación' },
      { status: 500 }
    );
  }
}
