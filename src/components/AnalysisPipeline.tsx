'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Globe, ShieldCheck, GitBranch, Zap, Check, GitCompareArrows } from 'lucide-react';

interface PipelinePhase {
  id: string;
  label: string;
  sublabel: string;
  icon: typeof Brain;
  color: string;
  duration: number;
}

const PIPELINES: Record<string, PipelinePhase[]> = {
  signal: [
    { id: 'classify', label: 'Clasificación temática', sublabel: 'Identificando ejes y actores clave', icon: GitBranch, color: '#00E5A0', duration: 2500 },
    { id: 'context', label: 'Contexto geopolítico', sublabel: 'Cruzando fuentes regionales', icon: Globe, color: '#38BDF8', duration: 3500 },
    { id: 'verify', label: 'Verificación cruzada', sublabel: 'Validando con múltiples fuentes', icon: ShieldCheck, color: '#F59E0B', duration: 4500 },
    { id: 'analyze', label: 'Análisis desde el Sur Global', sublabel: 'Generando perspectiva crítica', icon: Brain, color: '#D4A017', duration: 6000 },
  ],
  analysis: [
    { id: 'read', label: 'Lectura profunda', sublabel: 'Analizando contenido completo del artículo', icon: Globe, color: '#D4A017', duration: 2000 },
    { id: 'extract', label: 'Extracción de señales', sublabel: 'Identificando patrones y actores clave', icon: GitBranch, color: '#F59E0B', duration: 3500 },
    { id: 'contextualize', label: 'Contextualización', sublabel: 'Cruzando con contexto geopolítico regional', icon: Globe, color: '#38BDF8', duration: 5000 },
    { id: 'synthesize', label: 'Síntesis crítica', sublabel: 'Generando análisis desde el Sur Global', icon: Brain, color: '#D4A017', duration: 7000 },
  ],
  comparison: [
    { id: 'search', label: 'Búsqueda de fuentes', sublabel: 'Buscando fuentes relacionadas al evento', icon: Globe, color: '#00E5A0', duration: 2000 },
    { id: 'extract', label: 'Extracción de cobertura', sublabel: 'Extrayendo encuadres narrativos de cada fuente', icon: GitBranch, color: '#38BDF8', duration: 4000 },
    { id: 'compare', label: 'Análisis comparativo', sublabel: 'Comparando convergencias y divergencias', icon: GitCompareArrows, color: '#F59E0B', duration: 7000 },
    { id: 'synthesize', label: 'Síntesis del Sur Global', sublabel: 'Generando perspectiva crítica desde el Sur', icon: Brain, color: '#D4A017', duration: 10000 },
  ],
};

interface AnalysisPipelineProps {
  variant?: 'signal' | 'analysis' | 'comparison';
  startTime?: number;
}

export default function AnalysisPipeline({ variant = 'signal', startTime }: AnalysisPipelineProps) {
  const phases = PIPELINES[variant] || PIPELINES.signal;
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<Set<string>>(new Set());
  const [elapsedStr, setElapsedStr] = useState('0s');
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const accent = variant === 'signal' ? '#00E5A0' : '#D4A017';

  // Inject keyframes once into document head
  useEffect(() => {
    if (styleRef.current) return;
    const id = 'analysis-pipeline-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes pipelineProgress {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      @keyframes pipelineScan {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
      }
      @keyframes pipelineScanDot {
        0% { left: 0%; opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { left: 100%; opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    styleRef.current = style;
    return () => {
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
      }
      styleRef.current = null;
    };
  }, []);

  // Phase progression timer
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    phases.forEach((phase, i) => {
      const completeTimer = setTimeout(() => {
        setCompletedPhases((prev) => new Set([...prev, phase.id]));
      }, phase.duration);
      if (i < phases.length - 1) {
        const nextTimer = setTimeout(() => {
          setActivePhaseIndex(i + 1);
        }, phase.duration + 200);
        timers.push(nextTimer);
      }
      timers.push(completeTimer);
    });
    return () => timers.forEach(clearTimeout);
  }, [phases]);

  // Elapsed time counter
  useEffect(() => {
    const base = startTime || Date.now();
    const interval = setInterval(() => {
      const sec = Math.floor((Date.now() - base) / 1000);
      setElapsedStr(sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="glass rounded-xl overflow-hidden" role="status" aria-label="Análisis en progreso">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="w-4 h-4" style={{ color: accent }} />
            <div className="absolute inset-0 animate-ping opacity-30">
              <Brain className="w-4 h-4" style={{ color: accent }} />
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: `${accent}99`, fontFamily: 'var(--font-jetbrains-mono)' }}>
            {variant === 'comparison' ? 'Comparación en progreso' : 'Análisis en progreso'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-white/25 tabular-nums">{elapsedStr}</span>
      </div>

      {/* Phase list */}
      <div className="px-4 py-3 flex flex-col gap-0.5">
        {phases.map((phase, i) => {
          const isActive = i === activePhaseIndex;
          const isDone = completedPhases.has(phase.id);

          return (
            <div
              key={phase.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-500 ${
                isActive ? 'bg-white/[0.03]' : isDone ? 'opacity-50' : 'opacity-25'
              }`}
            >
              {/* Icon */}
              <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
                {isDone ? (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${phase.color}15`, border: `1px solid ${phase.color}25` }}>
                    <Check className="w-3.5 h-3.5" style={{ color: phase.color }} />
                  </div>
                ) : (
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-500 ${
                      isActive ? '' : 'bg-white/[0.03] border border-white/[0.06]'
                    }`}
                    style={isActive ? { backgroundColor: `${phase.color}12`, border: `1px solid ${phase.color}30` } : undefined}
                  >
                    <phase.icon
                      className={`w-3.5 h-3.5 transition-colors duration-500 ${isActive ? 'animate-pulse' : ''}`}
                      style={{ color: isActive ? phase.color : 'rgba(255,255,255,0.15)' }}
                    />
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold transition-colors duration-500 ${isDone ? 'line-through' : ''}`}
                    style={{
                      color: isDone ? `${phase.color}60` : isActive ? phase.color : 'rgba(255,255,255,0.25)',
                      fontFamily: 'var(--font-space-grotesk)',
                    }}
                  >
                    {phase.label}
                  </span>
                  {isActive && (
                    <span className="inline-flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 animate-pulse" style={{ color: accent }} />
                      <span className="text-[9px] uppercase tracking-wider font-mono animate-pulse" style={{ color: `${accent}60` }}>procesando</span>
                    </span>
                  )}
                  {isDone && (
                    <span className="text-[9px] uppercase tracking-wider font-mono" style={{ color: `${phase.color}40` }}>listo</span>
                  )}
                </div>
                {isActive && (
                  <p className="text-[10px] mt-0.5 transition-all duration-500" style={{ color: 'rgba(255,255,255,0.30)', fontFamily: 'var(--font-space-grotesk)' }}>
                    {phase.sublabel}
                  </p>
                )}
              </div>

              {/* Active progress bar */}
              {isActive && (
                <div className="w-12 h-1 rounded-full overflow-hidden bg-white/[0.06] shrink-0">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: phase.color,
                      width: '100%',
                      animation: 'pipelineProgress 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom: animated scan line + text */}
      <div className="px-4 py-2.5 border-t border-white/[0.04] flex items-center gap-2 overflow-hidden">
        <div className="relative h-1 flex-1 rounded-full bg-white/[0.03] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              backgroundColor: accent,
              opacity: 0.2,
              width: '100%',
              animation: 'pipelineScan 2s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              backgroundColor: accent,
              boxShadow: `0 0 8px ${accent}80`,
              animation: 'pipelineScanDot 2s ease-in-out infinite',
            }}
          />
        </div>
        <span className="text-[9px] font-mono whitespace-nowrap" style={{ color: `${accent}40` }}>
          Procesando con IA del Sur Global
        </span>
      </div>
    </div>
  );
}
