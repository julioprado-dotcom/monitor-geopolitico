'use client';

import { useState, useCallback, useEffect } from 'react';
import { InputForm } from '@/components/verification/InputForm';
import { ScoreGauge } from '@/components/verification/ScoreGauge';
import { DimensionCard } from '@/components/verification/DimensionCard';
import { SourceCard } from '@/components/verification/SourceCard';
import { SourceSummary } from '@/components/verification/SourceSummary';
import { SilencedVoices } from '@/components/verification/SilencedVoices';
import { ProgressIndicator } from '@/components/verification/ProgressIndicator';
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
} from 'lucide-react';
import type {
  InputType,
  VerificationResult,
  AnalysisStage,
} from '@/lib/types';

export default function Home() {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [stage, setStage] = useState<AnalysisStage>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<any>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeSourceFilter, setActiveSourceFilter] = useState<string>('all');
  const [isDark, setIsDark] = useState(true);

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

  const handleSubmit = useCallback(
    async (inputType: InputType, content: string) => {
      setIsLoading(true);
      setResult(null);
      setStage('extracting');

      // Simulate stage progression for UX
      const stageTimer1 = setTimeout(() => setStage('searching'), 2000);
      const stageTimer2 = setTimeout(() => setStage('analyzing'), 6000);
      const stageTimer3 = setTimeout(() => setStage('generating'), 12000);

      try {
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputType, content }),
        });

        clearTimeout(stageTimer1);
        clearTimeout(stageTimer2);
        clearTimeout(stageTimer3);

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Error en la verificación');
        }

        const data: VerificationResult = await res.json();
        setResult(data);
        setStage('complete');

        // Refresh history
        fetchHistory();
      } catch (error) {
        console.error('Verification failed:', error);
        setStage('error');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleReset = () => {
    setResult(null);
    setStage('idle');
  };

  const filteredSources =
    activeSourceFilter === 'all'
      ? result?.sourcesFound || []
      : result?.sourcesFound.filter((s) => s.category === activeSourceFilter) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
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

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{isDark ? 'Claro' : 'Oscuro'}</span>
            </Button>

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

          {/* Progress Indicator */}
          {isLoading && <ProgressIndicator stage={stage} />}

          {/* Error state */}
          {stage === 'error' && !isLoading && (
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-alert/15 flex items-center justify-center mx-auto">
                <span className="text-3xl">❌</span>
              </div>
              <h2 className="text-xl font-bold">Error en la verificación</h2>
              <p className="text-muted-foreground">
                No se pudo completar el análisis. Por favor, intenta de nuevo.
              </p>
              <Button onClick={handleReset} variant="outline" className="gap-2 border-alert text-alert hover:bg-alert/10">
                <ArrowLeft className="w-4 h-4" />
                Volver a intentar
              </Button>
            </div>
          )}

          {/* Results */}
          {result && stage === 'complete' && (
            <div className="space-y-6">
              {/* Back button */}
              <Button
                onClick={handleReset}
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Nueva verificación
              </Button>

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

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeSourceFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveSourceFilter('all')}
                    className={activeSourceFilter === 'all' ? 'bg-neon text-deep hover:bg-neon/90' : ''}
                  >
                    Todas ({result.sourcesFound.length})
                  </Button>
                  {['colectivo_occidental', 'sur_global', 'independiente', 'academico', 'resistencia'].map(
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
                          {cat === 'colectivo_occidental'
                            ? '🏛️ Colectivo Occ.'
                            : cat === 'sur_global'
                            ? '🌎 Sur Global'
                            : cat === 'independiente'
                            ? '🔍 Independiente'
                            : cat === 'academico'
                            ? '🎓 Académico'
                            : '✊ Resistencia'}{' '}
                          ({count})
                        </Button>
                      );
                    }
                  )}
                </div>

                {/* Source cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredSources.map((source, idx) => (
                    <SourceCard key={idx} source={source} />
                  ))}
                </div>

                {filteredSources.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-6">
                    No se encontraron fuentes en esta categoría
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-neon" />
              <span className="text-xs text-muted-foreground">
                VeriNews — Verificación Crítico-Pluralista
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Visibiliza sesgos, omisiones y voces silenciadas por las narrativas hegemónicas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
