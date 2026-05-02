'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Radar, Menu, Radio, Brain, GitBranch, BookOpen, User, ChevronRight, ExternalLink } from 'lucide-react';
import { demoSignals, type Relevance, type Region, type Signal, relevanceColors } from '@/data/signals';
import { demoAnalysis, type Analysis } from '@/data/analysis';
import { demoThreads, type Thread, type ThreadStatus, type ThreadSignal } from '@/data/threads';
import { type TVChannel } from '@/data/channels';

import SignalCard from '@/components/SignalCard';
import AnalysisCard from '@/components/AnalysisCard';
import SearchBar from '@/components/SearchBar';
import ThreadCard from '@/components/Explorer/ThreadCard';
import ThreadDetail from '@/components/Explorer/ThreadDetail';
import KpiDashboard from '@/components/KpiDashboard';
import PatternList from '@/components/PatternList';
import AnalysisPipeline from '@/components/AnalysisPipeline';
import { useMounted } from '@/hooks/useMounted';

// Lazy: react-markdown solo se carga cuando se genera análisis IA
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

// Lazy imports: componentes secundarios no críticos para carga inicial
const MGSidebar = dynamic(() => import('@/components/MGSidebar'), { loading: () => <MGSidebarFallback /> });
const LatestSignals = dynamic(() => import('@/components/LatestSignals'));
const SourceClassifier = dynamic(() => import('@/components/SourceClassifier'));

// ── Dynamic imports: solo se cargan cuando se necesitan (cero impacto en carga inicial) ──
const GeoMap = dynamic(() => import('@/components/GeoMap'), { ssr: false });
const FloatingProjector = dynamic(() => import('@/components/FloatingProjector'), { ssr: false });
const SourceComparisonView = dynamic(() => import('@/components/SourceComparisonView'), { ssr: false });
// LivePlayer: carga diferida — se renderiza DESPUÉS de las tarjetas de señales
const LivePlayer = dynamic(() => import('@/components/LivePlayer'), {
  ssr: false,
  loading: () => (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-border-subtle flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#00E5A0]/30 animate-pulse" />
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">Monitor en Vivo</span>
      </div>
      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-[#00E5A0]/20 border-t-[#00E5A0]/40 rounded-full animate-spin" />
          <span className="text-[8px] text-text-faint font-[family-name:var(--font-jetbrains-mono)]">Cargando reproductor...</span>
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
  const [followedThreads, setFollowedThreads] = useState<Set<string>>(new Set());
  const [threadFilter, setThreadFilter] = useState<ThreadStatus | 'SEGUIDOS' | null>(null);
  const mounted = useMounted();

  // ── NEW: Accordion state for Contexto panel ──
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);
  const [expandedAnalysisId, setExpandedAnalysisId] = useState<string | null>(null);

  // ── NEW: Selected thread for Foco panel ──
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);

  // ── Estados para Análisis en Panel de Foco ──
  const [analysisFullContent, setAnalysisFullContent] = useState<string | null>(null);
  const [analysisAiResults, setAnalysisAiResults] = useState<Map<string, string>>(() => new Map());
  const [analysisAiAnalyzingId, setAnalysisAiAnalyzingId] = useState<string | null>(null);
  const [analysisAiStartTime, setAnalysisAiStartTime] = useState(0);
  const [analysisAiError, setAnalysisAiError] = useState<string | null>(null);
  const analysisAbortRef = useRef<AbortController | null>(null);

  // ── Grab-to-scroll state ──
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

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

  const filteredAnalysis = useMemo(() => {
    return demoAnalysis.filter((a) => {
      if (selectedRegion && a.region !== selectedRegion) return false;
      if (selectedClassifier && !a.tags.includes(selectedClassifier)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [selectedRegion, selectedClassifier, searchQuery]);

  const filteredThreads = useMemo(() => {
    let threads = demoThreads;
    if (threadFilter === 'SEGUIDOS') {
      threads = threads.filter((t) => followedThreads.has(t.id));
    } else if (threadFilter) {
      threads = threads.filter((t) => t.status === threadFilter);
    }
    if (selectedRegion) {
      threads = threads.filter((t) => t.regions.includes(selectedRegion));
    }
    if (selectedClassifier) {
      threads = threads.filter((t) => t.tags.some((tag) => tag.toLowerCase().includes(selectedClassifier.toLowerCase())));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      threads = threads.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        t.signals.some((s) => s.title.toLowerCase().includes(q) || s.source.toLowerCase().includes(q)) ||
        t.fullContent.toLowerCase().includes(q)
      );
    }
    return threads;
  }, [threadFilter, followedThreads, selectedRegion, selectedClassifier, searchQuery]);

  // ── Análisis IA PERSISTENTE (no se pierde al navegar) ──
  const [signalAiResults, setSignalAiResults] = useState<Map<string, string>>(() => new Map());
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisStartTime, setAnalysisStartTime] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchAnalysis = useCallback(async (signal: Signal) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAnalyzingId(signal.id);
    setAnalysisError(null);
    setAnalysisStartTime(Date.now());

    try {
      const payload = {
        id: signal.id,
        title: signal.title,
        summary: signal.summary,
        fullContent: signal.fullContent,
        region: signal.region,
        classifiers: signal.classifiers,
        relevance: signal.relevance,
        language: signal.language,
        source: signal.source,
      };
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      // Verificar status HTTP ANTES de intentar parsear JSON
      if (!res.ok) {
        if (res.status === 429) throw new Error('Límite diario de análisis alcanzado. Intenta más tarde.');
        // Intentar leer como JSON primero, si falla leer como texto
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          throw new Error(data.error || 'Error al generar el análisis');
        }
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text.slice(0, 120)}`);
      }

      // Leer como texto primero para evitar JSON.parse errors silenciosos
      const raw = await res.text();
      let data: { analysis?: string; error?: string };
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error('La respuesta del servidor no es válida. Intenta de nuevo.');
      }

      if (data.error) {
        throw new Error(data.error);
      }
      if (!data.analysis) {
        throw new Error('El análisis no se generó correctamente. Intenta de nuevo.');
      }
      // Guardar resultado PERSISTENTE — no se pierde al navegar
      setSignalAiResults(prev => new Map(prev).set(signal.id, data.analysis!));
    } catch (err: any) {
      if (err.name !== 'AbortError') setAnalysisError(err.message || 'Error de conexión');
    } finally {
      setAnalyzingId(null);
    }
  }, []);

  // ── ACCORDION: Toggle expand signal in Contexto ──
  const handleToggleExpandSignal = useCallback((signal: Signal) => {
    setExpandedSignalId((prev) => (prev === signal.id ? null : signal.id));
  }, []);

  // ── ACCORDION: Toggle expand analysis in Contexto ──
  const handleToggleExpandAnalysis = useCallback((analysis: Analysis) => {
    setExpandedAnalysisId((prev) => (prev === analysis.id ? null : analysis.id));
  }, []);

  // ── Helper: scroll horizontal container to Foco panel ──
  const scrollToFoco = useCallback((sectionId?: string) => {
    const container = scrollContainerRef.current;
    const focoPanel = document.getElementById('foco-panel');
    if (!container || !focoPanel) return;
    // Scroll horizontal container to show foco panel
    const targetScrollLeft = focoPanel.offsetLeft;
    container.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    // After horizontal scroll, scroll vertically to the specific section
    if (sectionId) {
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    }
  }, []);

  // ── Helper: scroll horizontal container back to Contexto ──
  const scrollToContexto = useCallback(() => {
    const container = scrollContainerRef.current;
    const contextoPanel = document.getElementById('panel-contexto');
    if (!container || !contextoPanel) return;
    container.scrollTo({ left: 0, behavior: 'smooth' });
  }, []);

  // ── READ FULL: Signal → Foco panel ──
  const handleReadFullSignal = useCallback((signal: Signal) => {
    setSelectedSignal(signal);
    // Do NOT clear selectedAnalysis or selectedThread — multi-slot Foco
    setAnalysisError(null);
    abortRef.current?.abort();
    // Smart scroll: scroll to the signal section in foco
    setTimeout(() => scrollToFoco('foco-signal'), 50);
  }, [scrollToFoco]);

  // ── READ FULL: Analysis → Foco panel (FIX: use scrollToFoco) ──
  const handleReadFullAnalysis = useCallback((analysisItem: Analysis) => {
    setSelectedAnalysis(analysisItem);
    // Do NOT clear selectedSignal or selectedThread — multi-slot Foco
    setAnalysisFullContent(null);
    setAnalysisAiError(null);
    analysisAbortRef.current?.abort();
    // Smart scroll: ensure horizontal scroll to Foco, then vertical to analysis
    setTimeout(() => scrollToFoco('foco-analysis'), 50);
  }, [scrollToFoco]);

  // ── Thread selection → Foco panel (FIX: use scrollToFoco) ──
  const handleSelectThread = useCallback((thread: Thread) => {
    setSelectedThread(thread);
    // Do NOT clear signal/analysis — multi-slot Foco
    // Smart scroll: ensure horizontal scroll to Foco, then vertical to thread
    setTimeout(() => scrollToFoco('foco-thread'), 50);
  }, [scrollToFoco]);

  // ── Click en señal desde Hilos: convierte ThreadSignal → Signal y abre en Foco ──
  const handleThreadSignalClick = useCallback((ts: ThreadSignal, region: Region) => {
    const signal: Signal = {
      id: ts.id,
      title: ts.title,
      summary: ts.summary,
      fullContent: ts.summary,
      region,
      classifiers: ts.tags,
      relevance: ts.relevance as Relevance,
      source: ts.source,
      sourceUrl: ts.sourceUrl || '',
      language: 'es',
      timestamp: ts.timestamp,
      verified: ts.sourceLevel === 'A',
      sourceLevel: ts.sourceLevel as Signal['sourceLevel'],
      accessLevel: 'ABIERTO',
    };
    handleReadFullSignal(signal);
  }, [handleReadFullSignal]);

  // ── GeoMap signal select → also uses readFull pattern ──
  const handleMapSelectSignal = useCallback((signal: Signal) => {
    handleReadFullSignal(signal);
  }, [handleReadFullSignal]);

  // ── Navigate relation within thread (FIX: scroll horizontal first) ──
  const handleNavigateThreadRelation = useCallback((threadId: string) => {
    const t = demoThreads.find((th) => th.id === threadId);
    if (t) {
      setSelectedThread(t);
      setTimeout(() => scrollToFoco('foco-thread'), 50);
    }
  }, [scrollToFoco]);

  // ── "← Volver" from Foco sections ──
  const handleBackToContexto = useCallback(() => {
    scrollToContexto();
  }, []);

  // ── Close Foco Signal section (NO borra análisis IA persistente) ──
  const handleCloseFocoSignal = useCallback(() => {
    setSelectedSignal(null);
    setAnalysisError(null);
    abortRef.current?.abort();
    handleBackToContexto();
  }, [handleBackToContexto]);

  // ── Close Foco Analysis section (NO borra análisis IA persistente) ──
  const handleCloseFocoAnalysis = useCallback(() => {
    setSelectedAnalysis(null);
    setAnalysisFullContent(null);
    setAnalysisAiError(null);
    analysisAbortRef.current?.abort();
    handleBackToContexto();
  }, [handleBackToContexto]);

  // ── Close Foco Thread section ──
  const handleCloseFocoThread = useCallback(() => {
    setSelectedThread(null);
    handleBackToContexto();
  }, [handleBackToContexto]);

  // ── Señales relacionadas al análisis seleccionado ──
  const relatedAnalysisSignals = useMemo(() => {
    if (!selectedAnalysis) return [];
    return demoSignals
      .map((signal) => {
        let score = 0;
        if (signal.region === selectedAnalysis.region) score += 2;
        const sharedTags = signal.classifiers.filter((c) =>
          selectedAnalysis.tags.some((t) => t.toLowerCase() === c.toLowerCase())
        );
        score += sharedTags.length * 3;
        return { signal, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [selectedAnalysis]);

  // ── Lazy load fullContent del análisis ──
  useEffect(() => {
    if (!selectedAnalysis) return;
    setAnalysisFullContent(null);
    import('@/data/analysisContent').then(({ analysisFullContent: contents }) => {
      const content = contents[selectedAnalysis.id];
      setAnalysisFullContent(content || selectedAnalysis.summary);
    });
  }, [selectedAnalysis]);

  // ── document.title dinámico para análisis ──
  useEffect(() => {
    if (!selectedAnalysis) return;
    const prev = document.title;
    document.title = `${selectedAnalysis.title} — Monitor Geopolítico`;
    return () => { document.title = prev; };
  }, [selectedAnalysis?.title]);

  // ── Fetch AI analysis para artículos de análisis ──
  const fetchAnalysisAi = useCallback(async () => {
    if (!selectedAnalysis) return;
    analysisAbortRef.current?.abort();
    const controller = new AbortController();
    analysisAbortRef.current = controller;

    setAnalysisAiAnalyzingId(selectedAnalysis.id);
    setAnalysisAiError(null);
    setAnalysisAiStartTime(Date.now());

    try {
      const payload = {
        id: selectedAnalysis.id,
        title: selectedAnalysis.title,
        summary: selectedAnalysis.summary,
        fullContent: analysisFullContent || selectedAnalysis.summary,
        region: selectedAnalysis.region,
        classifiers: selectedAnalysis.tags,
        source: selectedAnalysis.author,
        sourceUrl: '',
        language: 'es',
        timestamp: selectedAnalysis.timestamp,
        relevance: 'MEDIA',
        verified: true,
        sourceLevel: 'A',
        accessLevel: 'ABIERTO',
      };
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error('Límite diario de análisis alcanzado. Intenta más tarde.');
        const data = await res.json();
        throw new Error(data.error || 'Error al generar el análisis');
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.analysis) throw new Error('El análisis no se generó correctamente.');
      // Guardar resultado PERSISTENTE — no se pierde al navegar
      setAnalysisAiResults(prev => new Map(prev).set(selectedAnalysis.id, data.analysis!));
    } catch (err: any) {
      if (err.name !== 'AbortError') setAnalysisAiError(err.message || 'Error de conexión');
    } finally {
      setAnalysisAiAnalyzingId(null);
    }
  }, [selectedAnalysis, analysisFullContent]);

  // ── Cleanup abort refs ──
  useEffect(() => { return () => { abortRef.current?.abort(); analysisAbortRef.current?.abort(); }; }, []);

  // ── Grab-to-scroll handlers ──
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Don't start drag on interactive elements
    if (e.target.closest('button, a, input, select, textarea, [role="button"], [data-no-drag]')) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    setDragStartX(e.pageX - container.offsetLeft);
    setDragScrollLeft(container.scrollLeft);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    container.scrollLeft = dragScrollLeft - walk;
  }, [isDragging, dragStartX, dragScrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ── Collapsible intelligence section (KPIs + Patterns + Map) ──
  const [intelSectionOpen, setIntelSectionOpen] = useState(false);

  // ── Determine if Foco panel has content ──
  const hasFocoContent = selectedSignal || selectedAnalysis || selectedThread;

  // ── Derivar: ID de señal actualmente analizando + resultado del mapa ──
  const currentSignalAnalysis = selectedSignal ? signalAiResults.get(selectedSignal.id) ?? null : null;
  const isAnalyzingSignal = analyzingId !== null && selectedSignal?.id === analyzingId;
  const currentAnalysisAiResult = selectedAnalysis ? analysisAiResults.get(selectedAnalysis.id) ?? null : null;
  const isAnalyzingArticle = analysisAiAnalyzingId !== null && selectedAnalysis?.id === analysisAiAnalyzingId;

  // ── Dismiss handlers: descartar análisis IA persistente ──
  const handleDismissSignalAi = useCallback((signalId: string) => {
    setSignalAiResults(prev => {
      const next = new Map(prev);
      next.delete(signalId);
      return next;
    });
  }, []);
  const handleDismissAnalysisAi = useCallback((analysisId: string) => {
    setAnalysisAiResults(prev => {
      const next = new Map(prev);
      next.delete(analysisId);
      return next;
    });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#0A0F1C] text-[#F1F5F9] overflow-hidden">
      {/* HEADER */}
      <header className="w-full glass-strong border-b border-border-subtle sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-2">
            {/* Hamburger — solo visible en < lg */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-border-default text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
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
              Inteligencia geopolítica de acceso libre · <span className="text-[#00E5A0]/50">Meridian</span> <span className="text-text-faint">v1.0.0</span>
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
        className={`fixed top-0 left-0 z-40 h-full w-[260px] transform transition-transform duration-200 ease-out lg:hidden overflow-y-auto glass-subtle border-r border-border-subtle ${
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
            activeTab={contentTab}
          />
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — desktop only (mobile usa offcanvas) */}
        <div className="hidden lg:block w-[200px] shrink-0 overflow-y-auto border-r border-border-subtle p-2">
          <MGSidebar selectedRegion={selectedRegion} selectedClassifier={selectedClassifier} onRegionSelect={setSelectedRegion} onClassifierSelect={setSelectedClassifier} activeTab={contentTab} />
        </div>

        {/* ── CONTENT COLUMN: Zone Nav Bar + Scroll Container (vertical stack) ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── ZONE NAV BAR — indicador Contexto / Foco ── */}
        <div className="shrink-0 px-3 sm:px-6 py-1.5 flex items-center justify-between border-b border-white/[0.04]" data-no-drag>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToContexto}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] transition-all duration-150 border ${!hasFocoContent ? 'text-[#00E5A0]/70 bg-[#00E5A0]/8 border-[#00E5A0]/15' : 'text-text-faint border-white/[0.04] hover:text-white/45 hover:border-border-default'}`}
            >
              <Radio className="w-3 h-3" />
              Contexto
            </button>
            <span className="text-white/10 text-[10px]">→</span>
            <button
              onClick={() => scrollToFoco()}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] transition-all duration-150 border ${hasFocoContent ? 'text-[#D4A017]/70 bg-[#D4A017]/8 border-[#D4A017]/15' : 'text-text-faint border-white/[0.03] cursor-default'}`}
              disabled={!hasFocoContent}
            >
              <BookOpen className="w-3 h-3" />
              Foco
              {hasFocoContent && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#D4A017] animate-pulse" />
              )}
            </button>
          </div>
          {/* Quick count indicators */}
          <div className="hidden sm:flex items-center gap-4 text-[9px] font-[family-name:var(--font-jetbrains-mono)]">
            <span className="text-text-faint">{filteredSignals.length} señales</span>
            <span className="text-text-faint">{filteredAnalysis.length} análisis</span>
            <span className="text-text-faint">{filteredThreads.length} hilos</span>
          </div>
        </div>

        {/* Horizontal scroll container — GRAB TO SCROLL */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 flex flex-row overflow-x-auto snap-x snap-mandatory select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Panel 1: Contexto (current dashboard) */}
          <section id="panel-contexto" className="min-w-full snap-start overflow-y-auto">
            <div className="max-w-screen-2xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-5">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 h-full">

                {/* Center column */}
                <div className={`flex flex-col gap-3 sm:gap-4 min-w-0 ${mobileTab === 'tv' ? 'hidden lg:flex' : 'flex'}`}>

            {/* 1. Buscador — acceso inmediato */}
            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            {/* 2. Pestañas */}
            <div className="flex gap-1 p-1 rounded-xl bg-[#111827]/90 border border-border-subtle" data-no-drag>
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

            {/* 4. Tarjetas — Señales Geopolíticas (accordion) */}
            {contentTab === 'signals' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-auto" data-no-drag>
                  {filteredSignals.map((signal) => (
                    <SignalCard
                      key={signal.id}
                      signal={signal}
                      onRegionClick={setSelectedRegion}
                      onClassifierClick={setSelectedClassifier}
                      isExpanded={expandedSignalId === signal.id}
                      onToggleExpand={handleToggleExpandSignal}
                      onReadFull={handleReadFullSignal}
                      hasAiAnalysis={signalAiResults.has(signal.id)}
                    />
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
                      <Radar className="w-8 h-8 text-text-faint" />
                    </div>
                    <p className="text-sm text-text-faint font-[family-name:var(--font-space-grotesk)]">No se encontraron señales con los filtros actuales</p>
                  </div>
                )}
              </>
            )}

            {/* 4. Tarjetas — Análisis (accordion) */}
            {contentTab === 'analysis' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-auto" data-no-drag>
                  {filteredAnalysis.map((a) => (
                    <AnalysisCard
                      key={a.id}
                      analysis={a}
                      isExpanded={expandedAnalysisId === a.id}
                      onToggleExpand={handleToggleExpandAnalysis}
                      onReadFull={handleReadFullAnalysis}
                      hasAiAnalysis={analysisAiResults.has(a.id)}
                    />
                  ))}
                </div>
                {filteredAnalysis.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-8 h-8 text-[#D4A017]/20" />
                    </div>
                    <p className="text-sm text-text-faint font-[family-name:var(--font-space-grotesk)]">No se encontraron análisis con los filtros actuales</p>
                  </div>
                )}
              </>
            )}

            {/* 4. Explorador Geopolítico — threads always go to Foco */}
            {contentTab === 'explorer' && (
              <>
                {/* Filtros rápidos — grid sin scroll */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 overflow-hidden" data-no-drag>
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
                          isActive ? 'shadow-sm' : 'text-white/35 hover:text-white/55 border-white/[0.04] hover:border-border-default'
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

                {/* Thread list — clicking any thread goes to Foco */}
                <div className="flex flex-col gap-3" data-no-drag>
                  {filteredThreads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      isFollowed={followedThreads.has(thread.id)}
                      onToggleFollow={toggleFollowThread}
                      onSelectThread={handleSelectThread}
                      onSignalClick={handleThreadSignalClick}
                    />
                  ))}
                  {filteredThreads.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4 border border-border-subtle">
                        <GitBranch className="w-8 h-8 text-[#38BDF8]/20" />
                      </div>
                      <p className="text-sm text-text-faint font-[family-name:var(--font-space-grotesk)]">No hay hilos con los filtros actuales</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── SECCIÓN INTELIGENCIA: KPIs + Patrones + Mapa (colapsable) ── */}
            <div data-no-drag>
              <button
                onClick={() => setIntelSectionOpen(!intelSectionOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl glass border border-border-subtle hover:border-white/[0.10] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Radar className="w-3.5 h-3.5 text-[#00E5A0]/50" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">Inteligencia Visual</span>
                  <span className="text-[9px] text-text-faint font-[family-name:var(--font-jetbrains-mono)]">KPIs · Patrones · Mapa</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-text-faint transition-transform duration-200 ${intelSectionOpen ? 'rotate-90' : ''}`} />
              </button>

              {intelSectionOpen && (
                <div className="flex flex-col gap-3 mt-3 animate-collapse-reveal">
                  <KpiDashboard signals={filteredSignals} />
                  <div className="border-l-2 border-[#00E5A0] pl-4 glass p-4 rounded-lg">
                    <h3 className="text-[9px] sm:text-[10px] font-bold text-[#00E5A0] mb-2 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">Patrones Detectados (24h)</h3>
                    <PatternList />
                  </div>
                  <GeoMap
                    signals={filteredSignals}
                    allSignals={demoSignals}
                    filteredCount={filteredSignals.length}
                    selectedRelevances={selectedRelevances}
                    onSelectSignal={handleMapSelectSignal}
                    onToggleRelevance={toggleRelevance}
                    onClearRelevance={() => setSelectedRelevances(new Set())}
                    analyzedSignalIds={signalAiResults}
                  />
                </div>
              )}
            </div>
          </div>

                {/* Right column — desktop always visible, mobile only on TV tab */}
                <div className={`flex-col gap-3 ${mobileTab !== 'tv' ? 'hidden lg:flex' : 'flex lg:flex'}`}>
                  <LivePlayer onOpenFloating={(ch) => setFloatingChannel(ch)} />
                  {/* LatestSignals + SourceClassifier solo en desktop o en TV tab con espacio */}
                  <div className="hidden lg:flex flex-col gap-3">
                    <LatestSignals onSignalClick={handleReadFullSignal} />
                    <SourceClassifier />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Panel 2: Foco — MULTI-SLOT */}
          <section id="foco-panel" className="min-w-full snap-start overflow-y-auto bg-[#0A0F1C]" style={{ padding: '2rem' }}>
            {!hasFocoContent ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-border-subtle mb-6">
                  <Radar className="w-10 h-10 text-white/10" />
                </div>
                <p className="text-sm text-text-faint font-[family-name:var(--font-space-grotesk)]">Selecciona una señal, análisis o hilo para ver el contenido detallado.</p>
                <button
                  onClick={handleBackToContexto}
                  className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-border-subtle text-white/35 hover:text-white/55 hover:bg-white/[0.06] transition-colors text-xs font-bold font-[family-name:var(--font-space-grotesk)]"
                >
                  ← Volver al panel
                </button>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto flex flex-col gap-0">
                {/* ═══ FOCO SEÑAL ═══ */}
                {selectedSignal && (
                  <div id="foco-signal" className="pb-2">
                    {/* Botón de Volver */}
                    <button
                      onClick={handleCloseFocoSignal}
                      className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm"
                    >
                      ← Volver al panel
                    </button>

                    {/* Section header */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]" style={{ backgroundColor: '#00E5A015', color: '#00E5A0', border: '1px solid #00E5A025' }}>
                        Señal
                      </span>
                    </div>

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

                    {/* Contenido Completo */}
                    <div className="mb-4 text-slate-300 leading-relaxed whitespace-pre-line border-l-2 border-slate-700 pl-4">
                      {selectedSignal.fullContent || selectedSignal.summary}
                    </div>

                    {/* Enlace al artículo original */}
                    {selectedSignal.sourceUrl && (
                      <a
                        href={selectedSignal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/[0.03] border border-border-default text-white/40 hover:text-white/60 hover:bg-white/[0.06] rounded-xl transition-colors text-xs font-bold font-[family-name:var(--font-space-grotesk)]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ir al artículo original
                      </a>
                    )}

                    {/* Botón de comparar fuentes — solo si la señal existe en demoSignals */}
                    {demoSignals.some((s) => s.id === selectedSignal.id) && (
                    <div className="mb-6">
                      <button
                        onClick={() => setComparisonSignal(selectedSignal)}
                        aria-label={`Comparar cobertura de ${selectedSignal.title} con otras fuentes`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white/[0.03] border border-border-subtle text-white/50 hover:text-white/70 hover:bg-white/[0.06] rounded-xl transition-colors text-xs font-bold font-[family-name:var(--font-space-grotesk)]"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><path d="M11 18H8a2 2 0 0 1-2-2V9"/></svg>
                        Comparar fuentes de esta señal
                      </button>
                    </div>
                    )}

                    {/* Botón de IA + Análisis (PERSISTENTE — no se pierde al navegar) */}
                    <div className="mb-8" aria-live="polite" aria-atomic="true">
                      {!currentSignalAnalysis && !isAnalyzingSignal && !analysisError && (
                        <button
                          onClick={() => selectedSignal && fetchAnalysis(selectedSignal)}
                          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#00E5A0]/10 border border-[#00E5A0]/20 text-[#00E5A0] rounded-xl hover:bg-[#00E5A0]/20 transition-colors font-bold font-[family-name:var(--font-space-grotesk)]"
                        >
                          <Brain className="w-4 h-4" />
                          Analizar con IA desde el Sur Global
                        </button>
                      )}

                      {isAnalyzingSignal && (
                        <AnalysisPipeline variant="signal" startTime={analysisStartTime} />
                      )}

                      {analysisError && !isAnalyzingSignal && (
                        <div className="glass rounded-xl p-4 flex flex-col items-center gap-3" role="alert">
                          <p className="text-sm text-red-400 font-[family-name:var(--font-space-grotesk)]">{analysisError}</p>
                          <button
                            onClick={() => selectedSignal && fetchAnalysis(selectedSignal)}
                            className="px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors font-[family-name:var(--font-jetbrains-mono)]"
                          >
                            Reintentar
                          </button>
                        </div>
                      )}

                      {currentSignalAnalysis && !isAnalyzingSignal && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-[#00E5A0]" />
                              <span className="text-sm font-bold text-[#00E5A0]/80 font-[family-name:var(--font-space-grotesk)]">Análisis IA — Perspectiva Sur Global</span>
                            </div>
                            <button
                              onClick={() => selectedSignal && handleDismissSignalAi(selectedSignal.id)}
                              className="px-2 py-1 rounded-lg bg-white/[0.03] border border-border-subtle text-white/30 hover:text-red-400 hover:border-red-500/20 transition-colors text-[9px] font-bold font-[family-name:var(--font-jetbrains-mono)]"
                              title="Descartar análisis"
                            >
                              Descartar
                            </button>
                          </div>
                          <div className="glass rounded-xl p-4 prose-invert">
                            <ReactMarkdown
                              components={{
                                h3: ({ children }) => (
                                  <h3 className="text-xs font-bold text-[#00E5A0]/70 uppercase tracking-wider mb-2 mt-4 first:mt-0 font-[family-name:var(--font-jetbrains-mono)]">{children}</h3>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-xs font-bold text-[#00E5A0]/70 uppercase tracking-wider mb-2 mt-4 first:mt-0 font-[family-name:var(--font-jetbrains-mono)]">{children}</h2>
                                ),
                                strong: ({ children }) => (
                                  <strong className="text-white/90 font-bold">{children}</strong>
                                ),
                                p: ({ children }) => (
                                  <p className="text-sm text-white/65 leading-relaxed mb-3 last:mb-0 font-[family-name:var(--font-space-grotesk)]">{children}</p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="text-sm text-white/65 leading-relaxed mb-3 pl-4 list-disc font-[family-name:var(--font-space-grotesk)]">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="text-sm text-white/65 leading-relaxed mb-3 pl-4 list-decimal font-[family-name:var(--font-space-grotesk)]">{children}</ol>
                                ),
                                li: ({ children }) => (
                                  <li className="mb-1">{children}</li>
                                ),
                              }}
                            >
                              {currentSignalAnalysis}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    {(selectedAnalysis || selectedThread) && (
                      <div className="border-t border-border-subtle my-8" />
                    )}
                  </div>
                )}

                {/* ═══ FOCO ANÁLISIS ═══ */}
                {selectedAnalysis && (
                  <div id="foco-analysis" className="pb-2">
                    {/* ← Volver */}
                    <button
                      onClick={handleCloseFocoAnalysis}
                      className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm"
                    >
                      ← Volver al panel
                    </button>

                    {/* Section header */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]"
                        style={{ backgroundColor: '#D4A01720', color: '#D4A017', border: '1px solid #D4A01730' }}
                      >
                        Análisis
                      </span>
                    </div>

                    {/* Badge + readTime + date */}
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      <span className="flex items-center gap-1 text-[10px] text-white/35 font-[family-name:var(--font-jetbrains-mono)]">
                        <BookOpen className="w-3.5 h-3.5" />
                        {selectedAnalysis.readTime} min lectura
                      </span>
                      <span className="text-[10px] text-text-faint ml-auto font-[family-name:var(--font-jetbrains-mono)]">
                        {mounted ? new Date(selectedAnalysis.timestamp).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' }) : selectedAnalysis.id}
                      </span>
                    </div>

                    {/* Hero image */}
                    {selectedAnalysis.image && (
                      <div className="relative w-full h-48 overflow-hidden rounded-xl mb-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedAnalysis.image} alt={selectedAnalysis.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] to-transparent" />
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-3 font-[family-name:var(--font-space-grotesk)]">
                      {selectedAnalysis.title}
                    </h2>

                    {/* Author + region */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-4 flex-wrap" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <User className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-xs font-bold text-white/70 font-[family-name:var(--font-space-grotesk)]">{selectedAnalysis.author}</span>
                        {selectedAnalysis.authorRole && (<>
                          <span className="text-white/10 text-xs">·</span>
                          <span className="text-[10px] text-white/35 font-[family-name:var(--font-jetbrains-mono)]">{selectedAnalysis.authorRole}</span>
                        </>)}
                      </div>
                      <span className="text-white/10 text-xs">·</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]" style={{ backgroundColor: '#D4A01712', color: '#D4A01770' }}>{selectedAnalysis.region}</span>
                    </div>

                    {/* Full content — lazy loaded */}
                    <div className="mb-4">
                      {!analysisFullContent ? (
                        <div className="flex items-center gap-2 py-4">
                          <div className="w-4 h-4 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
                          <span className="text-xs text-white/30 font-[family-name:var(--font-jetbrains-mono)]">Cargando contenido...</span>
                        </div>
                      ) : (
                        analysisFullContent.split('\n\n').map((paragraph, i) => (
                          <p key={i} className="text-sm text-white/70 leading-relaxed mb-3 last:mb-0 font-[family-name:var(--font-space-grotesk)]">{paragraph}</p>
                        ))
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      {selectedAnalysis.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold font-[family-name:var(--font-jetbrains-mono)]" style={{ backgroundColor: '#D4A01712', color: '#D4A01770' }}>{tag}</span>
                      ))}
                    </div>

                    {/* Related signals */}
                    {relatedAnalysisSignals.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2.5">
                          <Radio className="w-3.5 h-3.5 text-[#00E5A0]/60" />
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]">Señales relacionadas ({relatedAnalysisSignals.length})</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {relatedAnalysisSignals.map(({ signal }) => (
                            <button
                              key={signal.id}
                              onClick={() => handleReadFullSignal(signal)}
                              className="text-left flex items-start gap-2.5 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.1] transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-bold text-white/60 leading-snug font-[family-name:var(--font-space-grotesk)] line-clamp-2">{signal.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] text-text-faint font-[family-name:var(--font-jetbrains-mono)]">{signal.source}</span>
                                  <span className="text-white/10 text-[9px]">·</span>
                                  <span className="text-[9px] text-text-faint font-[family-name:var(--font-jetbrains-mono)]">{signal.region}</span>
                                </div>
                              </div>
                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold font-[family-name:var(--font-jetbrains-mono)]" style={{ backgroundColor: `${relevanceColors[signal.relevance]}18`, color: relevanceColors[signal.relevance] }}>{signal.relevance}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="w-full h-px bg-white/[0.06] mb-6" />

                    {/* AI Analysis (PERSISTENTE — no se pierde al navegar) */}
                    <div className="mb-8" aria-live="polite" aria-atomic="true">
                      {!currentAnalysisAiResult && !isAnalyzingArticle && !analysisAiError && (
                        <button
                          onClick={fetchAnalysisAi}
                          disabled={!analysisFullContent}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors duration-150 font-[family-name:var(--font-space-grotesk)] ${analysisFullContent ? 'bg-[#D4A017]/10 border border-[#D4A017]/20 text-[#D4A017] hover:bg-[#D4A017]/20' : 'bg-white/[0.03] border border-border-subtle text-text-faint cursor-not-allowed'}`}
                        >
                          <Brain className={`w-4 h-4 ${!analysisFullContent ? 'animate-pulse' : ''}`} />
                          <span className="text-sm font-bold">{analysisFullContent ? 'Análisis IA — Perspectiva Sur Global' : 'Cargando contenido...'}</span>
                        </button>
                      )}
                      {isAnalyzingArticle && (
                        <AnalysisPipeline variant="analysis" startTime={analysisAiStartTime} />
                      )}
                      {analysisAiError && !isAnalyzingArticle && (
                        <div className="glass rounded-xl p-4 flex flex-col items-center gap-3" role="alert">
                          <p className="text-sm text-red-400 font-[family-name:var(--font-space-grotesk)]">{analysisAiError}</p>
                          <button onClick={fetchAnalysisAi} className="px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors font-[family-name:var(--font-jetbrains-mono)]">Reintentar</button>
                        </div>
                      )}
                      {currentAnalysisAiResult && !isAnalyzingArticle && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4 text-[#D4A017]" />
                              <span className="text-sm font-bold text-[#D4A017]/80 font-[family-name:var(--font-space-grotesk)]">Análisis IA — Perspectiva Sur Global</span>
                            </div>
                            <button
                              onClick={() => selectedAnalysis && handleDismissAnalysisAi(selectedAnalysis.id)}
                              className="px-2 py-1 rounded-lg bg-white/[0.03] border border-border-subtle text-white/30 hover:text-red-400 hover:border-red-500/20 transition-colors text-[9px] font-bold font-[family-name:var(--font-jetbrains-mono)]"
                              title="Descartar análisis"
                            >
                              Descartar
                            </button>
                          </div>
                          <div className="glass rounded-xl p-4 prose-invert">
                            <ReactMarkdown
                              components={{
                                h3: ({ children }) => <h3 className="text-xs font-bold text-[#D4A017]/70 uppercase tracking-wider mb-2 mt-4 first:mt-0 font-[family-name:var(--font-jetbrains-mono)]">{children}</h3>,
                                h2: ({ children }) => <h2 className="text-xs font-bold text-[#D4A017]/70 uppercase tracking-wider mb-2 mt-4 first:mt-0 font-[family-name:var(--font-jetbrains-mono)]">{children}</h2>,
                                strong: ({ children }) => <strong className="text-white/90 font-bold">{children}</strong>,
                                p: ({ children }) => <p className="text-sm text-white/65 leading-relaxed mb-3 last:mb-0 font-[family-name:var(--font-space-grotesk)]">{children}</p>,
                                ul: ({ children }) => <ul className="text-sm text-white/65 leading-relaxed mb-3 pl-4 list-disc font-[family-name:var(--font-space-grotesk)]">{children}</ul>,
                                ol: ({ children }) => <ol className="text-sm text-white/65 leading-relaxed mb-3 pl-4 list-decimal font-[family-name:var(--font-space-grotesk)]">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                              }}
                            >{currentAnalysisAiResult}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Disclaimer */}
                    <div className="border-t border-border-subtle pt-3">
                      <p className="text-[9px] text-text-faint leading-relaxed font-[family-name:var(--font-jetbrains-mono)]">
                        Los análisis publicados en esta sección reflejan la perspectiva editorial de Óptica Sur Global. Las fuentes citadas son verificables y públicas.
                      </p>
                    </div>

                    {/* Divider */}
                    {selectedThread && (
                      <div className="border-t border-border-subtle my-8" />
                    )}
                  </div>
                )}

                {/* ═══ FOCO HILO ═══ */}
                {selectedThread && (
                  <div id="foco-thread" className="pb-2">
                    <ThreadDetail
                      thread={selectedThread}
                      isFollowed={followedThreads.has(selectedThread.id)}
                      onToggleFollow={toggleFollowThread}
                      onClose={handleCloseFocoThread}
                      onNavigateRelation={handleNavigateThreadRelation}
                      onSignalClick={handleThreadSignalClick}
                    />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
        </div>{/* ── closes CONTENT COLUMN wrapper ── */}
      </div>

      {/* FLOATING PROJECTOR */}
      {floatingChannel && (
        <FloatingProjector
          channel={floatingChannel}
          onClose={() => setFloatingChannel(null)}
          onMinimize={() => setFloatingChannel(null)}
        />
      )}

      {/* SOURCE COMPARISON VIEW */}
      {comparisonSignal && (
        <SourceComparisonView
          seedSignal={comparisonSignal}
          onClose={() => setComparisonSignal(null)}
        />
      )}

      {/* FOOTER */}
      <footer className="w-full glass-strong border-t border-border-subtle">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] text-text-faint tracking-wider font-[family-name:var(--font-jetbrains-mono)]">
            Acceso libre · Código abierto · Datos públicos
          </span>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/julioprado-dotcom/monitor-geopolitico"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-text-faint hover:text-white/50 transition-colors font-[family-name:var(--font-jetbrains-mono)]"
            >
              GitHub
            </a>
            <span className="text-[9px] text-[#00E5A0]/30 font-[family-name:var(--font-jetbrains-mono)]">
              v1.0.0-meridian
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
