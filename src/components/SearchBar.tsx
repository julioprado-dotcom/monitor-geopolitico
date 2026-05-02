'use client';

import { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K / Cmd+K para聚焦 búsqueda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <form role="search" className="glass rounded-xl search-glow flex items-center gap-2 px-3 py-2 transition-shadow duration-150" onSubmit={(e) => e.preventDefault()}>
      <Search className="w-4 h-4 text-white/30 shrink-0" aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar señales geopolíticas, regiones, fuentes..."
        aria-label="Buscar señales geopolíticas"
        className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-text-faint outline-none font-[family-name:var(--font-space-grotesk)]"
      />
      {value ? (
        <button
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
        >
          <X className="w-3 h-3 text-white/40" />
        </button>
      ) : (
        <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-border-strong text-[9px] text-text-faint font-[family-name:var(--font-jetbrains-mono)]">
          <span className="text-[8px]">⌘</span>K
        </kbd>
      )}
    </form>
  );
}
