'use client';

import { mockPatterns } from '@/lib/mockPatterns';

const patternColors: Record<string, string> = {
  red: '#EF4444',
  green: '#22C55E',
  yellow: '#EAB308',
};

export default function PatternList() {
  const patterns = mockPatterns["24h"];

  return (
    <ul className="flex flex-col gap-2">
      {patterns.map((p, i) => (
        <li key={i} className="flex items-start gap-3">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
            style={{ backgroundColor: patternColors[p.color] || '#64748B' }}
          />
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[9px] font-bold uppercase tracking-wider font-[family-name:var(--font-jetbrains-mono)]"
              style={{ color: patternColors[p.color] || '#64748B' }}
            >
              {p.tipo}
            </span>
            <span className="text-[11px] sm:text-xs text-white/55 leading-relaxed font-[family-name:var(--font-space-grotesk)]">
              {p.texto}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
