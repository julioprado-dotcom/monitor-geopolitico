'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Radar, Menu, Tv, Radio, Brain, GitBranch } from 'lucide-react';
import { demoSignals, type Relevance, type Region, type Signal, relevanceColors } from '@/data/signals';
import { demoAnalysis, type Analysis } from '@/data/analysis';
import { demoThreads, type Thread, type ThreadStatus } from '@/data/threads';
import { type TVChannel } from '@/data/channels';
import MetricsBar from '@/components/MetricsBar';
import SignalCard from '@/components/SignalCard';
import AnalysisCard from '@/components/AnalysisCard';
import SearchBar from '@/components/SearchBar';
import ThreadCard from '@/components/Explorer/ThreadCard';
import ThreadDetail from '@/components/Explorer/ThreadDetail';
import KpiDashboard from '@/components/KpiDashboard';
import PatternList from '@/components/PatternList';

// Lazy imports: componentes secundarios no críticos para carga inicial
const MGSidebar = dynamic(() => import('@/components/MGSidebar'), { loading: () => <MGSidebarFallback /> });
const LatestSignals = dynamic(() => import('@/components/LatestSignals'));
const SourceClassifier = dynamic(() => import('@/components/SourceClassifier'));

// ── Dynamic imports: solo se cargan cuando se necesitan (cero impacto en carga inicial) ──
const AnalysisOverlay = dynamic(() => import('@/components/AnalysisOverlay'), { ssr: false });
const FloatingProjector = dynamic(() => import('@/components/FloatingProjector'), { ssr: false });
const SourceComparisonView = dynamic(() => import('@/components/SourceComparisonView'), { ssr: false });
// LivePlayer: carga diferida — se renderiza DESPUÉS de las tarjetas de señales
const LivePlayer = dynamic(() => import('@/components/LivePlayer'), {
  ssr: false,
  loading: () => (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00E5A0]/30 animate-pulse" />
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">Monitor en Vivo</span>
      </div>
      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-[#00E5A0]/20 border-t-[#00E5A0]/40 rounded-full animate-spin" />
          <span className="text-[8px] text-white/20 font-[family-name:var(--font-jetbrains-mono)]">Cargando reproductor...</span>
        </div>
      </div>
    </div>
  ),
});
// Lazy: sidebar skeleton (no renderiza nada hasta que cargue)
const MGSidebarFallback = () => (
  <div className="flex flex-col gap-2 p-2">
    {['Regiones', 'Clasificadores'].map((label) => (
      <div key={label}>
        <div className="h-3 w-16 rounded bg-white/[0.04] mb-2" />
        <div className="flex flex-col gap-1.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-2 rounded bg-white/[0.03]" style={{ width: `${50 + i * 10}%` }} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

type ContentTab = 'signals' | 'analysis' | 'explorer';
type MobileTab = ContentTab | 'tv';

const CONTENT_TABS: { id: ContentTab; label: string; icon: typeof Radio; color: string }[] = [
  { id: 'signals', label: 'Señales Geopolíticas', icon: Radio, color: '#00E5A0' },
  { id: 'analysis', label: 'Análisis', icon: Brain, color: '#D4A017' },
  { id: 'explorer', label: 'Hilos Geopolíticos', icon: GitBranch, color: '#38BDF8' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedClassifier, setSelectedClassifier] = useState<string | null>(null);
  const [selectedRelevances, setSelectedRelevances] = useState<Set<Relevance>>(new Set());
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [floatingChannel, setFloatingChannel] = useState<TVChannel | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contentTab, setContentTab] = useState<ContentTab>('signals');
  const [mobileTab, setMobileTab] = useState<MobileTab>('signals');
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [comparisonSignal, setComparisonSignal] = useState<Signal | null>(null);
  const [expandedThread, setExpandedThread] = useState<Thread | null>(null);
  const [followedThreads, setFollowedThreads] = useState<Set<string>>(new Set());
  const [threadFilter, setThreadFilter] = useState<ThreadStatus | 'SEGUIDOS' | null>(null);

  const filteredSignals = useMemo(() => {
    return demoSignals.filter((s) => {
      if (selectedRegion && s.region !== selectedRegion) return false;
      if (selectedClassifier && !s.classifiers.includes(selectedClassifier)) return false;
      if (selectedRelevances.size > 0 && !selectedRelevances.has(s.relevance)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q) || s.source.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [selectedRegion, selectedClassifier, selectedRelevances, searchQuery]);

  const toggleRelevance = (sev: Relevance) => {
    if (selectedRelevances.has(sev)) {
      setSelectedRelevances(new Set());
    } else {
      setSelectedRelevances(new Set([sev]));
    }
  };

  const handleRegionSelect = useCallback((r: Region | null) => {
    setSelectedRegion(r);
    setSidebarOpen(false); // Cerrar sidebar en mobile al seleccionar
  }, []);

  const handleClassifierSelect = useCallback((c: string | null) => {
    setSelectedClassifier(c);
    setSidebarOpen(false);
  }, []);

  const toggleFollowThread = (id: string) => {
    setFollowedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredThreads = useMemo(() => {
    let threads = demoThreads;
    if (threadFilter === 'SEGUIDOS') {
      threads = threads.filter((t) => followedThreads.has(t.id));
    } else if (threadFilter) {
      threads = threads.filter((t) => t.status === threadFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      threads = threads.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.signals.some((s) => s.title.toLowerCase().includes(q) || s.source.toLowerCase().includes(q))
      );
    }
    return threads;
  }, [threadFilter, followedThreads, searchQuery]);

  // ── Sistema de Foco Dinámico: navegación por deslizamiento horizontal ──
  const handleSelectSignal = (signal: Signal) => {
    setSelectedSignal(signal);
    const focoPanel = document.getElementById('foco-panel');
    if (focoPanel) {
      focoPanel.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#0A0F1C] text-[#F1F5F9] overflow-hidden">
      {/* HEADER */}
      <header className="w-full glass-strong border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-2">
            {/* Hamburger — solo visible en < lg */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
              aria-label="Abrir filtros"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-[#00E5A0]/8 border border-[#00E5A0]/15 neon-glow">
              <Radar className="w-10 h-10 sm:w-12 sm:h-12 text-[#00E5A0]" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-bold text-white/30 tracking-[0.25em] uppercase font-[family-name:var(--font-jetbrains-mono)]">NEWS CONNECT</span>
            </div>
          </div>

          {/* Center: title */}
          <div className="flex-1 text-center min-w-0">
            <h1 className="text-base sm:text-2xl font-bold text-white tracking-tight font-[family-name:var(--font-space-grotesk)] truncate">Monitor Geopolítico</h1>
            <span className="text-slate-500 text-xs hidden sm:block">Traduciendo señales en patrones de poder.</span>
            <p className="text-[9px] sm:text-[11px] text-white/40 mt-0.5 font-[family-name:var(--font-space-grotesk)] hidden sm:block">
              Inteligencia geopolítica de acceso libre · <span className="text-[#00E5A0]/50">Meridian</span> <span className="text-white/25">v0.9.0</span>
            </p>
          </div>

          {/* Right: status badge */}
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl glass border border-[#00E5A0]/15 shrink-0">
            <span className="h-2 w-2 rounded-full bg-[#00E5A0] animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-bold text-[#00E5A0]/70 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">En línea</span>
          </div>
        </div>

      </header>

      {/* ── SIDEBAR OFFCANVAS (mobile) + OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 animate-fade-in lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-[260px] transform transition-transform duration-200 ease-out lg:hidden overflow-y-auto bg-[#0A0F1C]/95 backdrop-blur-sm border-r border-white/[0.06] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ willChange: 'transform' }}
      >
        <div className="p-3 pt-16">
          <MGSidebar
            selectedRegion={selectedRegion}
            selectedClassifier={selectedClassifier}
            onRegionSelect={handleRegionSelect}
            onClassifierSelect={handleClassifierSelect}
          />
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — desktop only (mobile usa offcanvas) */}
        <div className="hidden lg:block w-[200px] shrink-0 overflow-y-auto border-r border-white/[0.06] p-2">
          <MGSidebar selectedRegion={selectedRegion} selectedClassifier={selectedClassifier} onRegionSelect={setSelectedRegion} onClassifierSelect={setSelectedClassifier} />
        </div>

        {/* Horizontal scroll container */}
        <div className="flex-1 flex flex-row overflow-x-auto snap-x snap-mandatory" style={{ scrollBehavior: 'smooth' }}>
          {/* Panel 1: Contexto (current dashboard) */}
          <section id="panel-contexto" className="min-w-full snap-start overflow-y-auto">
            <div className="max-w-screen-2xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-5">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 h-full">

                {/* Center column */}
                <div className={`flex flex-col gap-3 sm:gap-4 min-w-0 ${mobileTab === 'tv' ? 'hidden lg:flex' : 'flex'}`}>
            {/* 0. Inteligencia Visual: KPIs + Patrones */}
            <KpiDashboard signals={filteredSignals} />
            <div className="border-l-2 border-[#00E5A0] pl-4 glass p-4 rounded-lg">
              <h3 className="text-[9px] sm:text-[10px] font-bold text-[#00E5A0] mb-2 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">Patrones Detectados (24h)</h3>
              <PatternList />
            </div>

            {/* 1. Barras de señales (MetricsBar) */}
            <MetricsBar allSignals={demoSignals} filteredCount={filteredSignals.length} selectedRelevances={selectedRelevances} onToggleRelevance={toggleRelevance} onClearRelevance={() => setSelectedRelevances(new Set())} />

            {/* 2. Buscador */}
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            {/* 3. Pestañas */}
            <div className="flex gap-1 p-1 rounded-xl bg-[#111827]/90 border border-white/[0.06]">
              {CONTENT_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = contentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setContentTab(tab.id); if (mobileTab !== 'tv') setMobileTab(tab.id); }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] transition-all duration-150 ${
                      isActive ? 'shadow-sm' : 'text-white/35 hover:text-white/55 hover:bg-white/[0.03]'
                    }`}
                    style={isActive ? { color: tab.color, backgroundColor: `${tab.color}12`, boxShadow: `0 0 12px ${tab.color}10` } : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* 4. Tarjetas — Señales Geopolíticas */}
            {contentTab === 'signals' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-auto">
                  {filteredSignals.map((signal) => (
                    <SignalCard key={signal.id} signal={signal} onRegionClick={setSelectedRegion} onClassifierClick={setSelectedClassifier} onSignalClick={handleSelectSignal} />
                  ))}
                  {filteredSignals.length > 0 && (
                    <div className="sm:col-span-2 flex justify-center">
                      <button
                        onClick={() => { if (filteredSignals.length >= 2) setComparisonSignal(filteredSignals[0]); }}
                        className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E5A0]/5 border border-[#00E5A0]/15 text-[#00E5A0]/60 hover:bg-[#00E5A0]/10 hover:text-[#00E5A0]/80 transition-colors text-[11px] font-bold font-[family-name:var(--font-space-grotesk)]"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>
                        Comparar fuentes ({filteredSignals.length} señales geopolíticas)
                      </button>
                    </div>
                  )}
                </div>
                {filteredSignals.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Radar className="w-8 h-8 text-white/15" />
                    </div>
                    <p className="text-sm text-white/25 font-[family-name:var(--font-space-grotesk)]">No se encontraron señales con los filtros actuales</p>
                  </div>
                )}
              </>
            )}

            {/* 4. Tarjetas — Análisis */}
            {contentTab === 'analysis' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-auto">
                {demoAnalysis.map((analysis) => (
                  <AnalysisCard key={analysis.id} analysis={analysis} onClick={setSelectedAnalysis} />
                ))}
              </div>
            )}

            {/* 4. Explorador Geopolítico */}
            {contentTab === 'explorer' && (
              <>
                {/* Filtros rápidos — grid sin scroll */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 overflow-hidden">
                  {([
                    { id: null as ThreadStatus | 'SEGUIDOS' | null, label: 'Todos', color: '#64748B' },
                    { id: 'EN_VIVO' as ThreadStatus, label: 'En Vivo', color: '#EF4444' },
                    { id: 'EVOLUCION' as ThreadStatus, label: 'Evolución', color: '#F59E0B' },
                    { id: 'RESUELTO' as ThreadStatus, label: 'Resueltos', color: '#00E5A0' },
                    { id: 'DORMANTE' as ThreadStatus, label: 'Dormantes', color: '#64748B' },
                    { id: 'SEGUIDOS' as const, label: 'Seguidos', color: '#38BDF8' },
                  ]).map((f) => {
                    const isActive = threadFilter === f.id;
                    const count = f.id === 'SEGUIDOS'
                      ? followedThreads.size
                      : f.id === null
                        ? demoThreads.length
                        : demoThreads.filter((t) => t.status === f.id).length;
                    return (
                      <button
                        key={f.label}
                        onClick={() => setThreadFilter(isActive ? null : f.id)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] transition-all duration-150 border ${
                          isActive ? 'shadow-sm' : 'text-white/35 hover:text-white/55 border-white/[0.04] hover:border-white/[0.08]'
                        }`}
                        style={isActive ? { color: f.color, backgroundColor: `${f.color}12`, borderColor: `${f.color}30` } : undefined}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${f.id === 'EN_VIVO' && isActive ? 'animate-pulse' : ''}`} style={{ backgroundColor: f.color }} />
                        {f.label}
                        <span className="opacity-50">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Vista: hilo expandido o lista de hilos */}
                {expandedThread ? (
                  <ThreadDetail
                    thread={expandedThread}
                    isFollowed={followedThreads.has(expandedThread.id)}
                    onToggleFollow={toggleFollowThread}
                    onClose={() => setExpandedThread(null)}
                    onNavigateRelation={(threadId) => {
                      const t = demoThreads.find((th) => th.id === threadId);
                      if (t) setExpandedThread(t);
                    }}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {filteredThreads.map((thread) => (
                      <ThreadCard
                        key={thread.id}
                        thread={thread}
                        isFollowed={followedThreads.has(thread.id)}
                        onToggleFollow={toggleFollowThread}
                        onExpand={setExpandedThread}
                      />
                    ))}
                    {filteredThreads.length === 0 && (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4 border border-white/[0.06]">
                          <GitBranch className="w-8 h-8 text-[#38BDF8]/20" />
                        </div>
                        <p className="text-sm text-white/25 font-[family-name:var(--font-space-grotesk)]">No hay hilos con los filtros actuales</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

                {/* Right column — desktop always visible, mobile only on TV tab */}
                <div className={`flex-col gap-3 ${mobileTab !== 'tv' ? 'hidden lg:flex' : 'flex lg:flex'}`}>
                  <LivePlayer onOpenFloating={(ch) => setFloatingChannel(ch)} />
                  {/* LatestSignals + SourceClassifier solo en desktop o en TV tab con espacio */}
                  <div className="hidden lg:flex flex-col gap-3">
                    <LatestSignals onSignalClick={setSelectedSignal} />
                    <SourceClassifier />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Panel 2: Foco */}
          <section id="foco-panel" className="min-w-full snap-start overflow-y-auto bg-[#0A0F1C]" style={{ padding: '2rem' }}>
            {!selectedSignal ? (
              <p className="text-slate-500">Selecciona una señal para ver el análisis detallado.</p>
            ) : (
              <div className="max-w-3xl mx-auto">
                {/* Botón de Volver */}
                <button
                  onClick={() => {
                    document.getElementById('panel-contexto')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm"
                >
                  ← Volver al panel
                </button>

                {/* Cabecera de la Señal */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                    <span className={`px-2 py-0.5 rounded font-bold`} style={{ backgroundColor: `${relevanceColors[selectedSignal.relevance]}22`, color: relevanceColors[selectedSignal.relevance] }}>
                      {selectedSignal.relevance}
                    </span>
                    <span>{selectedSignal.source}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'Space Grotesk' }}>
                    {selectedSignal.title}
                  </h2>
                  <p className="text-slate-300 text-lg leading-relaxed">
                    {selectedSignal.summary}
                  </p>
                </div>

                {/* Contenido Completo — usa fullContent si existe, sino muestra summary como cuerpo */}
                <div className="mb-8 text-slate-300 leading-relaxed whitespace-pre-line border-l-2 border-slate-700 pl-4">
                  {selectedSignal.fullContent || selectedSignal.summary}
                </div>

                {/* Botón de IA */}
                <button className="w-full py-3 px-6 bg-[#00E5A0] text-[#0A0F1C] font-bold rounded-lg hover:opacity-90 transition-opacity" style={{ fontFamily: 'Space Grotesk' }}>
                  Analizar con IA desde el Sur Global
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* FLOATING PROJECTOR */}
      {floatingChannel && (
        <FloatingProjector
          channel={floatingChannel}
          onClose={() => setFloatingChannel(null)}
          onMinimize={() => setFloatingChannel(null)}
        />
      )}

      {/* SIGNAL OVERLAY — desactivado: el Panel de Foco reemplaza esta funcionalidad */}

      {/* ANALYSIS OVERLAY */}
      {selectedAnalysis && (
        <AnalysisOverlay analysis={selectedAnalysis} onClose={() => setSelectedAnalysis(null)} />
      )}

      {/* SOURCE COMPARISON VIEW */}
      {comparisonSignal && (
        <SourceComparisonView
          seedSignal={comparisonSignal}
          onClose={() => setComparisonSignal(null)}
        />
      )}

      {/* FOOTER */}
      <footer className="w-full glass-strong border-t border-white/[0.06]">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] text-white/25 tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
            Acceso libre · Código abierto · Datos públicos
          </span>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/julioprado-dotcom/monitor-geopolitico"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-white/25 hover:text-white/50 transition-colors font-[family-name:var(--font-jetbrains-mono)]"
            >
              GitHub
            </a>
            <span className="text-[9px] text-[#00E5A0]/30 font-[family-name:var(--font-jetbrains-mono)]">
              v0.9.0-meridian
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
