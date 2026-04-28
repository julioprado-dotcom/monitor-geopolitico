import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { rateLimit } from '@/lib/rateLimit';
import { ANALYSIS_SYSTEM_PROMPT } from '@/lib/analysisPrompt';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting — PROPUESTAS_MEJORA.md §1.3
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rl = rateLimit(ip, 'analyze');
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Límite de análisis alcanzado. Intenta más tarde o mejora tu plan.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const body = await request.json();
    const { title, summary, fullContent, region, classifiers, relevance, language, source } = body;

    if (!title || !summary) {
      return NextResponse.json(
        { error: 'Se requiere título y resumen de la señal' },
        { status: 400 }
      );
    }

    const classifierList = classifiers?.join(', ') || 'N/A';
    const userMessage = `Analiza el siguiente evento geopolítico aplicando la ÓPTICA SUR GLOBAL (fundamentada en los Parámetros Cognitivos y las Epistemologías del Sur) y la BIDIRECCIONALIDAD de la Relevancia (amenaza + emancipación):

**Señal**: ${title}
**Clasificadores**: ${classifierList}
**Relevancia**: ${relevance} (recuerda: evalúa tanto la dimensión de amenaza como la de emancipación)
**Región**: ${region}
**Fuente**: ${source}
**Idioma del análisis**: ${language === 'es' ? 'Español' : language === 'en' ? 'English' : language === 'pt' ? 'Português' : language === 'zh' ? '中文' : language === 'ar' ? 'العربية' : 'Español'}

**Resumen**: ${summary}

**Contenido completo**: ${fullContent || summary}

Genera un análisis completo siguiendo las 8 secciones definidas en tus instrucciones. Asegúrate de:
1. Aplicar el alcance semántico ampliado de cada clasificador desde la óptica Sur Global.
2. Identificar explícitamente las dimensiones de amenaza Y de emancipación.
3. Explorar las conexiones transversales entre los clasificadores asignados (${classifierList}).
4. Visibilizar voces, resistencias y procesos del Sur Global que los análisis convencionales omiten.
5. Aplicar los cinco filtros analíticos: CONGRUENCIA INVERSA (detectar doble moral), COHERENCIA HISTÓRICA (conectar con raíces coloniales/neocoloniales), INTEGRIDAD EPISTÉMICA (criticar también opresión desde el Sur), CONFIABILIDAD ASIMÉTRICA (auditar sesgo de fuentes), y FLEXIBILIDAD PRAGMÁTICA (reconocer complejidad de alianzas).
6. Fundamentar el análisis en las bases semánticas: Ecología de Saberes, Economía Política Crítica, Materialismo Histórico, Pensamiento Decolonial y Panafricanismo, y Geopolítica Crítica Periférica.`;

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const analysisText = completion.choices?.[0]?.message?.content;

    if (!analysisText) {
      return NextResponse.json(
        { error: 'El modelo no generó una respuesta' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analysis: analysisText,
      signalId: body.id,
      model: completion.model || 'unknown',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error en análisis IA:', error);
    return NextResponse.json(
      { error: 'Error al generar el análisis', detail: error.message },
      { status: 500 }
    );
  }
}
