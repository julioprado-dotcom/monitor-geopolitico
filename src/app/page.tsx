'use client';

import { useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Radar, Menu, Tv, Radio } from 'lucide-react';
import { demoSignals, type Relevance, type Region, type Signal } from '@/data/signals';
import { type TVChannel } from '@/data/channels';
import MetricsBar from '@/components/MetricsBar';
import SignalCard from '@/components/SignalCard';
import MGSidebar from '@/components/MGSidebar';
import LatestSignals from '@/components/LatestSignals';
import SourceClassifier from '@/components/SourceClassifier';
import SearchBar from '@/components/SearchBar';
import LivePlayer from '@/components/LivePlayer';

// ── Dynamic imports: solo se cargan cuando se necesitan (cero impacto en carga inicial) ──
const SignalOverlay = dynamic(() => import('@/components/SignalOverlay'), { ssr: false });
const FloatingProjector = dynamic(() => import('@/components/FloatingProjector'), { ssr: false });

type MobileTab = 'signals' | 'tv';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [selectedClassifier, setSelectedClassifier] = useState<string | null>(null);
  const [selectedRelevances, setSelectedRelevances] = useState<Set<Relevance>>(new Set());
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [floatingChannel, setFloatingChannel] = useState<TVChannel | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('signals');

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
    const next = new Set(selectedRelevances);
    if (next.has(sev)) next.delete(sev); else next.add(sev);
    setSelectedRelevances(next);
  };

  const handleRegionSelect = useCallback((r: Region | null) => {
    setSelectedRegion(r);
    setSidebarOpen(false); // Cerrar sidebar en mobile al seleccionar
  }, []);

  const handleClassifierSelect = useCallback((c: string | null) => {
    setSelectedClassifier(c);
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1C] text-[#F1F5F9]">
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

        {/* Mobile tab bar — solo visible en < lg */}
        <div className="lg:hidden flex border-t border-white/[0.04]">
          <button
            onClick={() => setMobileTab('signals')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] transition-colors ${
              mobileTab === 'signals'
                ? 'text-[#00E5A0] border-b-2 border-[#00E5A0] bg-[#00E5A0]/5'
                : 'text-white/35 hover:text-white/55'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Señales
          </button>
          <button
            onClick={() => setMobileTab('tv')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)] transition-colors ${
              mobileTab === 'tv'
                ? 'text-[#00E5A0] border-b-2 border-[#00E5A0] bg-[#00E5A0]/5'
                : 'text-white/35 hover:text-white/55'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            TV en Vivo
          </button>
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

      {/* MAIN */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-4 h-full">
          {/* Sidebar — desktop only (mobile usa offcanvas) */}
          <div className="hidden lg:block">
            <MGSidebar selectedRegion={selectedRegion} selectedClassifier={selectedClassifier} onRegionSelect={setSelectedRegion} onClassifierSelect={setSelectedClassifier} />
          </div>

          {/* Center column */}
          <div className={`flex flex-col gap-4 sm:gap-5 min-w-0 ${mobileTab !== 'signals' ? 'hidden lg:flex' : 'flex'}`}>
            <MetricsBar signals={filteredSignals} selectedRelevances={selectedRelevances} onToggleRelevance={toggleRelevance} />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredSignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} onRegionClick={setSelectedRegion} onClassifierClick={setSelectedClassifier} onSignalClick={setSelectedSignal} />
              ))}
            </div>
            {filteredSignals.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Radar className="w-8 h-8 text-white/15" />
                </div>
                <p className="text-sm text-white/25 font-[family-name:var(--font-space-grotesk)]">No se encontraron señales con los filtros actuales</p>
              </div>
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
      </main>

      {/* FLOATING PROJECTOR */}
      {floatingChannel && (
        <FloatingProjector
          channel={floatingChannel}
          onClose={() => setFloatingChannel(null)}
          onMinimize={() => setFloatingChannel(null)}
        />
      )}

      {/* SIGNAL OVERLAY */}
      {selectedSignal && (
        <SignalOverlay signal={selectedSignal} onClose={() => setSelectedSignal(null)} />
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
