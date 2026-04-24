'use client';

import { useState, useCallback, useEffect } from 'react';
import { InputForm } from '@/components/verification/InputForm';
import { ScoreGauge } from '@/components/verification/ScoreGauge';
import { DimensionCard } from '@/components/verification/DimensionCard';
import { SourceCard } from '@/components/verification/SourceCard';
import { SourceSummary } from '@/components/verification/SourceSummary';
import { SilencedVoices } from '@/components/verification/SilencedVoices';
import { LiveLog } from '@/components/verification/LiveLog';
import { ShareResult } from '@/components/verification/ShareResult';
import { HistoryList } from '@/components/verification/HistoryList';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  History,
  ArrowLeft,
  BookOpen,
  Eye,
  Scale,
  FileText,
  Moon,
  Sun,
  ChevronDown,
  MapPin,
  Tag,
  Layers,
} from '@/lib/icons';
import type {
  InputType,
  VerificationResult,
  AnalysisStage,
  LogEntry,
  SourceCategory,
  GeopoliticalPerspective,
  SourceOrientation,
} from '@/lib/types';
import {
  SOURCE_CATEGORY_LABELS,
  SOURCE_CATEGORY_ICONS,
  GEOPOLITICAL_LABELS,
  ORIENTATION_LABELS,
} from '@/lib/types';

export default function Home() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [stage, setStage] = useState<AnalysisStage>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<any>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeSourceFilter, setActiveSourceFilter] = useState<string>('all');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDark, setIsDark] = useState(true);
  const [regionsOpen, setRegionsOpen] = useState(true);
  const [classifiersOpen, setClassifiersOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [activeGeopoliticalFilter, setActiveGeopoliticalFilter] = useState<string>('all');
  const [activeOrientationFilter, setActiveOrientationFilter] = useState<string>('all');

  // Initialize dark mode
  useEffect(() => {
    const saved = localStorage.getItem('verinews-theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('verinews-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('verinews-theme', 'light');
    }
  };

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history?limit=20');
      const data = await res.json();
      setHistory(data.verifications || []);
    } catch {
      // Ignore errors
    }
  };

  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (inputType: InputType, content: string) => {
      setIsLoading(true);
      setResult(null);
      setDebugInfo(null);
      setStage('extracting');

      // Add initial log entries so the LiveLog shows immediately
      const startTs = Date.now();
      const initialLogs: LogEntry[] = [
        {
          id: `start-${startTs}`,
          timestamp: startTs,
          stage: 'extracting',
          message: 'Iniciando verificación Crítico-Pluralista...',
          status: 'running',
        },
        {
          id: `input-${startTs}`,
          timestamp: startTs + 50,
          stage: 'extracting',
          message: inputType === 'url'
            ? `URL recibida: ${content.slice(0, 80)}${content.length > 80 ? '...' : ''}`
            : inputType === 'claim'
            ? `Afirmación recibida: ${content.split(' ').length} palabras`
            : `Texto recibido: ${content.split(' ').length} palabras`,
          detail: 'Conectando con el servidor de análisis...',
          status: 'running',
        },
      ];
      setLogs(initialLogs);

      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputType, content }),
        });

        // Handle non-SSE error responses (module-level failures, edge runtime errors)
        if (!res.ok) {
          const contentType = res.headers.get('content-type') || '';
          let errorMessage = `Error del servidor (${res.status})`;

          if (contentType.includes('application/json')) {
            try {
              const errData = await res.json();
              errorMessage = errData.error || errorMessage;
            } catch { /* use default */ }
          } else if (contentType.includes('text/plain')) {
            try {
              errorMessage = await res.text();
            } catch { /* use default */ }
          }

          throw new Error(errorMessage);
        }

        // Read SSE stream
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No se pudo leer la respuesta del servidor');

        const decoder = new TextDecoder();
        let buffer = '';
        let resultReceived = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process all complete SSE events (delimited by blank lines \n\n)
          // SSE format: "data: {...}\n\n" — we split by double newline to get events
          const eventParts = buffer.split('\n\n');
          // Keep the last (potentially incomplete) part in the buffer
          buffer = eventParts.pop() || '';

          for (const eventPart of eventParts) {
            // Extract all data lines from this event
            const dataLines: string[] = [];
            for (const line of eventPart.split('\n')) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                dataLines.push(trimmed.slice(6));
              }
            }

            if (dataLines.length === 0) continue;

            // Join multi-line data (SSE spec) — for us, always single line
            const jsonStr = dataLines.join('\n');

            try {
              const event = JSON.parse(jsonStr);

              if (event.type === 'log') {
                const entry: LogEntry = event.entry;
                setLogs((prev) => [...prev, entry]);
                setStage(entry.stage);
              } else if (event.type === 'result') {
                const data: VerificationResult = event.data;
                setResult(data);
                setStage('complete');
                resultReceived = true;
              } else if (event.type === 'error') {
                throw new Error(event.message || 'Error en la verificación');
              }
            } catch (parseError) {
              // Re-throw intentional errors (from 'error' event type)
              if (parseError instanceof Error && !parseError.message.includes('Unexpected')) {
                throw parseError;
              }
              // Log malformed JSON and continue
              console.warn('SSE parse warning:', parseError, 'Data:', jsonStr.slice(0, 100));
            }
          }
        }

        // If the stream ended but we never got a result, that's an error
        if (!resultReceived) {
          throw new Error('El servidor completó la respuesta sin enviar resultados');
        }

        // Refresh history
        fetchHistory();
      } catch (error) {
        console.error('Verification failed:', error);
        setStage('error');
        setLogs((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            timestamp: Date.now(),
            stage: 'error',
            message: error instanceof Error ? error.message : 'Error desconocido durante la verificación',
            detail: 'El servidor no pudo procesar la solicitud. Puede ser un problema de configuración (variables de entorno) o de conexión.',
            status: 'error',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleReset = () => {
    setResult(null);
    setStage('idle');
    setLogs([]);
    setDebugInfo(null);
  };

  const runDiagnostics = async () => {
    setDebugInfo('Ejecutando diagnóstico...');
    try {
      const res = await fetch('/api/debug');
      const data = await res.json();
      setDebugInfo(JSON.stringify(data, null, 2));
    } catch (err) {
      setDebugInfo(`Error al ejecutar diagnóstico: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const filteredSources = (() => {
    if (!result?.sourcesFound) return [];
    let sources = result.sourcesFound;

    // Filter by source category
    if (activeSourceFilter !== 'all') {
      sources = sources.filter((s) => s.category === activeSourceFilter);
    }
    // Filter by geopolitical perspective
    if (activeGeopoliticalFilter !== 'all') {
      sources = sources.filter((s) => s.geopoliticalPerspective === activeGeopoliticalFilter);
    }
    // Filter by orientation
    if (activeOrientationFilter !== 'all') {
      sources = sources.filter((s) => s.orientation === activeOrientationFilter);
    }

    return sources;
  })();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top bar — tagline */}
      <div className="bg-neon/10 border-b border-neon/20">
        <div className="max-w-7xl mx-auto px-4 py-1.5 text-center">
          <p className="text-xs text-neon font-medium tracking-wide">
            Visibiliza sesgos, omisiones y voces silenciadas por las narrativas hegemónicas
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon flex items-center justify-center">
              <Shield className="w-5 h-5 text-deep" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">VeriNews</h1>
              <p className="text-xs text-muted-foreground">
                Verificación Crítico-Pluralista
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme toggle — prominent */}
            <button
              type="button"
              onClick={toggleTheme}
              className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-neon/50"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #1e1b4b, #312e81)'
                  : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              }}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              <span
                className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center"
                style={{
                  transform: isDark ? 'translateX(0)' : 'translateX(28px)',
                }}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-700" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
              </span>
            </button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historial</span>
              {history.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5">
                  {history.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          {/* Hero / Input Section */}
          {!result && stage === 'idle' && (
            <div className="space-y-8">
              {/* Hero text */}
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge variant="outline" className="border-neon/50 text-neon text-xs">
                    Enfoque Crítico-Pluralista
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                  Desenmascara la
                  <span className="text-neon"> desinformación</span>
                </h1>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                  Verifica noticias con un análisis que no solo detecta datos falsos, sino que
                  visibiliza sesgos, omisiones y voces silenciadas por las narrativas hegemónicas.
                </p>
              </div>

              {/* Input Form */}
              <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
                <div className="bg-card border border-border/50 rounded-xl p-5 text-center space-y-2">
                  <Eye className="w-8 h-8 mx-auto text-neon" />
                  <h3 className="font-semibold text-sm">6 Dimensiones de Análisis</h3>
                  <p className="text-xs text-muted-foreground">
                    Credibilidad, coherencia, corroboración, sensacionalismo, veracidad y sesgo
                  </p>
                </div>
                <div className="bg-card border border-border/50 rounded-xl p-5 text-center space-y-2">
                  <Scale className="w-8 h-8 mx-auto text-analysis" />
                  <h3 className="font-semibold text-sm">Fuentes Diversas</h3>
                  <p className="text-xs text-muted-foreground">
                    Colectivo Occidental, Sur Global, independientes, académicos y resistencia
                  </p>
                </div>
                <div className="bg-card border border-border/50 rounded-xl p-5 text-center space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-trend" />
                  <h3 className="font-semibold text-sm">Voces Silenciadas</h3>
                  <p className="text-xs text-muted-foreground">
                    Detectamos qué perspectivas se omiten y qué contexto falta
                  </p>
                </div>
              </div>

              {/* History inline (when toggled) */}
              {showHistory && (
                <div className="max-w-3xl mx-auto">
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-neon" />
                      <h2 className="text-lg font-semibold">Historial de Verificaciones</h2>
                    </div>
                    <HistoryList
                      items={history}
                      onSelect={() => {}}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Log */}
          {isLoading && <LiveLog logs={logs} currentStage={stage} />}

          {/* Error state — always show LiveLog with error entry + action buttons */}
          {stage === 'error' && !isLoading && (
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Always show the LiveLog console in error state */}
              <LiveLog logs={logs} currentStage={stage} />
              
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold">Error en la verificación</h2>
                <p className="text-muted-foreground">
                  Revisa el registro arriba para ver dónde falló el análisis.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Button onClick={handleReset} variant="outline" className="gap-2 border-alert text-alert hover:bg-alert/10">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a intentar
                  </Button>
                  <Button onClick={runDiagnostics} variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    🔧 Diagnóstico del servidor
                  </Button>
                </div>

                {/* Debug info panel */}
                {debugInfo && (
                  <div className="mt-4 text-left">
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                        <span className="text-xs font-mono text-muted-foreground">Diagnóstico del servidor</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-muted-foreground"
                          onClick={() => navigator.clipboard.writeText(debugInfo)}
                        >
                          Copiar
                        </Button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-foreground/80 overflow-auto max-h-60 whitespace-pre-wrap">
                        {debugInfo}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {result && stage === 'complete' && (
            <div className="space-y-6">
              {/* Back button + Share */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Nueva verificación
                </Button>
                <ShareResult result={result} />
              </div>

              {/* Score + Summary */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                  <ScoreGauge
                    score={result.overallScore}
                    veracityLevel={result.veracityLevel}
                  />
                  <div className="flex-1 text-center md:text-left space-y-3">
                    <h2 className="text-xl md:text-2xl font-bold">
                      Resultado del Análisis
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.summary}
                    </p>
                    {result.keyClaims.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-foreground/70">
                          Afirmaciones clave verificadas:
                        </p>
                        {result.keyClaims.map((claim, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground flex gap-1.5">
                            <span className="text-neon shrink-0">•</span>
                            {claim}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 6 Dimensions Grid */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-neon" />
                  <h2 className="text-lg font-semibold">Análisis por Dimensiones</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <DimensionCard
                    dimensionKey="sourceCredibility"
                    dimension={result.sourceCredibility}
                  />
                  <DimensionCard
                    dimensionKey="internalCoherence"
                    dimension={result.internalCoherence}
                  />
                  <DimensionCard
                    dimensionKey="externalCorroboration"
                    dimension={result.externalCorroboration}
                  />
                  <DimensionCard
                    dimensionKey="sensationalism"
                    dimension={result.sensationalism}
                  />
                  <DimensionCard
                    dimensionKey="factualAccuracy"
                    dimension={result.factualAccuracy}
                  />
                  <DimensionCard
                    dimensionKey="biasManipulation"
                    dimension={result.biasManipulation}
                  />
                </div>
              </div>

              {/* Silenced Voices */}
              <SilencedVoices voices={result.silencedVoices} />

              {/* Sources Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-analysis" />
                  <h2 className="text-lg font-semibold">Fuentes Encontradas</h2>
                </div>

                {/* Source Summary */}
                <SourceSummary sources={result.sourcesFound} />

                {/* Collapsible: Categorías de Fuente */}
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors"
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-neon" />
                      <span className="font-medium text-sm">Categorías de Fuente</span>
                      {activeSourceFilter !== 'all' && (
                        <Badge variant="secondary" className="text-xs px-1.5">
                          1 activo
                        </Badge>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        categoriesOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {categoriesOpen && (
                    <div className="px-4 pb-3 pt-2 flex flex-wrap gap-2 border-t border-border/30">
                      <Button
                        variant={activeSourceFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveSourceFilter('all')}
                        className={activeSourceFilter === 'all' ? 'bg-neon text-deep hover:bg-neon/90' : ''}
                      >
                        Todas ({result.sourcesFound.length})
                      </Button>
                      {(['colectivo_occidental', 'sur_global', 'independiente', 'academico', 'resistencia'] as SourceCategory[]).map(
                        (cat) => {
                          const count = result.sourcesFound.filter(
                            (s) => s.category === cat
                          ).length;
                          if (count === 0) return null;
                          return (
                            <Button
                              key={cat}
                              variant={activeSourceFilter === cat ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setActiveSourceFilter(cat)}
                              className={
                                activeSourceFilter === cat
                                  ? 'bg-neon text-deep hover:bg-neon/90'
                                  : ''
                              }
                            >
                              {SOURCE_CATEGORY_ICONS[cat]} {SOURCE_CATEGORY_LABELS[cat]} ({count})
                            </Button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                {/* Collapsible: Perspectiva Geopolítica (Regiones) */}
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors"
                    onClick={() => setRegionsOpen(!regionsOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-analysis" />
                      <span className="font-medium text-sm">Regiones / Perspectiva Geopolítica</span>
                      {activeGeopoliticalFilter !== 'all' && (
                        <Badge variant="secondary" className="text-xs px-1.5">
                          1 activo
                        </Badge>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        regionsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {regionsOpen && (
                    <div className="px-4 pb-3 pt-2 flex flex-wrap gap-2 border-t border-border/30">
                      <Button
                        variant={activeGeopoliticalFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveGeopoliticalFilter('all')}
                        className={activeGeopoliticalFilter === 'all' ? 'bg-analysis text-white hover:bg-analysis/90' : ''}
                      >
                        Todas
                      </Button>
                      {(['alineado_otan', 'alineado_usa', 'alineado_ue', 'no_alineado', 'critico_orden_global', 'multipolar'] as GeopoliticalPerspective[]).map(
                        (persp) => {
                          const count = result.sourcesFound.filter(
                            (s) => s.geopoliticalPerspective === persp
                          ).length;
                          if (count === 0) return null;
                          return (
                            <Button
                              key={persp}
                              variant={activeGeopoliticalFilter === persp ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setActiveGeopoliticalFilter(persp)}
                              className={
                                activeGeopoliticalFilter === persp
                                  ? 'bg-analysis text-white hover:bg-analysis/90'
                                  : ''
                              }
                            >
                              {GEOPOLITICAL_LABELS[persp]} ({count})
                            </Button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                {/* Collapsible: Clasificadores (Orientación) */}
                <div className="border border-border/50 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors"
                    onClick={() => setClassifiersOpen(!classifiersOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-trend" />
                      <span className="font-medium text-sm">Clasificadores / Orientación</span>
                      {activeOrientationFilter !== 'all' && (
                        <Badge variant="secondary" className="text-xs px-1.5">
                          1 activo
                        </Badge>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        classifiersOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {classifiersOpen && (
                    <div className="px-4 pb-3 pt-2 flex flex-wrap gap-2 border-t border-border/30">
                      <Button
                        variant={activeOrientationFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveOrientationFilter('all')}
                        className={activeOrientationFilter === 'all' ? 'bg-trend text-white hover:bg-trend/90' : ''}
                      >
                        Todas
                      </Button>
                      {(['estatal', 'corporativo', 'comunitario', 'independiente', 'academico'] as SourceOrientation[]).map(
                        (orient) => {
                          const count = result.sourcesFound.filter(
                            (s) => s.orientation === orient
                          ).length;
                          if (count === 0) return null;
                          return (
                            <Button
                              key={orient}
                              variant={activeOrientationFilter === orient ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setActiveOrientationFilter(orient)}
                              className={
                                activeOrientationFilter === orient
                                  ? 'bg-trend text-white hover:bg-trend/90'
                                  : ''
                              }
                            >
                              {ORIENTATION_LABELS[orient]} ({count})
                            </Button>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>

                {/* Active filters summary */}
                {(activeSourceFilter !== 'all' || activeGeopoliticalFilter !== 'all' || activeOrientationFilter !== 'all') && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Mostrando {filteredSources.length} de {result.sourcesFound.length} fuentes</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-muted-foreground underline"
                      onClick={() => {
                        setActiveSourceFilter('all');
                        setActiveGeopoliticalFilter('all');
                        setActiveOrientationFilter('all');
                      }}
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}

                {/* Source cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredSources.map((source, idx) => (
                    <SourceCard key={idx} source={source} />
                  ))}
                </div>

                {filteredSources.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-6">
                    No se encontraron fuentes con los filtros seleccionados
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-neon" />
              <span className="text-xs text-muted-foreground font-medium">
                VeriNews — Verificación Crítico-Pluralista
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-lg">
              Análisis desde 6 dimensiones con fuentes del Colectivo Occidental, Sur Global, independientes, académicos y de resistencia.
              Detectamos lo que las narrativas hegemónicas omiten.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-border/30 text-center">
            <p className="text-[10px] text-muted-foreground/60">
              VeriNews no reemplaza el juicio crítico — lo amplifica. Las verificaciones son orientativas y deben complementarse con consulta directa a las fuentes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
