import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { rateLimit } from '@/lib/rateLimit';
import { demoSignals, type Signal } from '@/data/signals';
import { COMPARISON_SYSTEM_PROMPT } from '@/lib/analysisPrompt';

/**
 * POST /api/compare
 * Vista de Comparación de Fuentes — MVP (PROPUESTA_COMPARACION_FUENTES.md Fase 1)
 * 
 * Body: { signalId: string } | { region: string, classifiers: string[] }
 * 
 * Busca señales relacionadas del mismo evento y genera análisis comparativo.
 */



interface CompareRequestBody {
  signalId?: string;
  region?: string;
  classifiers?: string[];
}

function findRelatedSignals(seedSignal: Signal): Signal[] {
  // Clustering básico: misma región + algún clasificador compartido + diferente fuente
  return demoSignals.filter((s) => {
    if (s.id === seedSignal.id) return false;
    if (s.source === seedSignal.source) return false;
    const sharedClassifiers = s.classifiers.some((c) => seedSignal.classifiers.includes(c));
    return sharedClassifiers || s.region === seedSignal.region;
  }).slice(0, 3);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rl = rateLimit(ip, 'compare');
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Límite de comparaciones alcanzado. Intenta más tarde o mejora tu plan.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      );
    }

    const body: CompareRequestBody = await request.json();
    let signalsToCompare: Signal[] = [];
    let eventTitle = '';

    if (body.signalId) {
      const seed = demoSignals.find((s) => s.id === body.signalId);
      if (!seed) {
        return NextResponse.json({ error: 'Señal no encontrada' }, { status: 404 });
      }
      const related = findRelatedSignals(seed);
      signalsToCompare = [seed, ...related];
      eventTitle = seed.title;
    } else if (body.region) {
      const filtered = demoSignals.filter((s) => {
        if (s.region !== body.region) return false;
        if (body.classifiers && body.classifiers.length > 0) {
          return s.classifiers.some((c) => body.classifiers!.includes(c));
        }
        return true;
      });
      signalsToCompare = filtered.slice(0, 4);
      eventTitle = `Eventos en ${body.region}${body.classifiers?.length ? ` — ${body.classifiers.join(', ')}` : ''}`;
    } else {
      return NextResponse.json(
        { error: 'Se requiere signalId o region' },
        { status: 400 }
      );
    }

    if (signalsToCompare.length < 2) {
      return NextResponse.json({
        eventId: body.signalId || 'manual',
        eventTitle,
        sources: signalsToCompare.map((s) => ({
          signalId: s.id,
          sourceName: s.source,
          sourceLevel: s.sourceLevel,
          language: s.language,
          title: s.title,
          excerpt: s.summary,
          relevance: s.relevance,
          region: s.region,
          classifiers: s.classifiers,
        })),
        metaAnalysis: null,
        note: 'No hay suficientes fuentes relacionadas para generar comparación. Se necesitan al menos 2 fuentes cubriendo el mismo evento.',
      });
    }

    // Build comparison prompt
    const sourcesText = signalsToCompare
      .map((s, i) => `FUENTE ${i + 1}: ${s.source} (Nivel ${s.sourceLevel}, ${s.language.toUpperCase()})
Título: ${s.title}
Región: ${s.region}
Clasificadores: ${s.classifiers.join(', ')}
Relevancia: ${s.relevance}
Contenido: ${s.fullContent || s.summary}`)
      .join('\n\n---\n\n');

    const userMessage = `Compara cómo estas ${signalsToCompare.length} fuentes cubren el MISMO evento:\n\nTítulo del evento: ${eventTitle}\n\n${sourcesText}\n\nGenera un análisis comparativo completo con:\n1. **Encuadre narrativo** de cada fuente\n2. **Convergencias** (hechos compartidos)\n3. **Divergencias** (contradicciones y diferencias de encuadre)\n4. **Omisiones cruzadas** (qué menciona cada fuente que las otras omiten)\n5. **Mapa de intereses geopolíticos** detrás de cada encuadre\n6. **Evaluación bidireccional** (amenaza y emancipación según cada fuente)\n7. **Síntesis del Sur Global** (qué perspectiva está ausente en TODAS las fuentes)`;

    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: COMPARISON_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const analysisText = completion.choices?.[0]?.message?.content;

    if (!analysisText) {
      return NextResponse.json(
        { error: 'El modelo no generó una respuesta comparativa' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      eventId: `evt_${Date.now()}`,
      eventTitle,
      eventDate: new Date().toISOString().split('T')[0],
      classifiers: [...new Set(signalsToCompare.flatMap((s) => s.classifiers))],
      region: signalsToCompare[0].region,
      sources: signalsToCompare.map((s) => ({
        signalId: s.id,
        sourceName: s.source,
        sourceLevel: s.sourceLevel,
        language: s.language,
        title: s.title,
        excerpt: s.summary,
        url: s.sourceUrl,
        relevance: s.relevance,
        region: s.region,
        classifiers: s.classifiers,
      })),
      metaAnalysis: analysisText,
      sourceCount: signalsToCompare.length,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error en comparación:', error);
    return NextResponse.json(
      { error: 'Error al generar la comparación', detail: error.message },
      { status: 500 }
    );
  }
}
