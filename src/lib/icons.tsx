interface IconProps {
  className?: string;
  size?: number;
}

const iconDefaults = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// ─── page.tsx ───────────────────────────────────────────────

export function Shield({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function History({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

export function ArrowLeft({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

export function BookOpen({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

export function Eye({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function Scale({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 4h10" />
      <path d="M12 4v12" />
      <path d="M5 8h14" />
    </svg>
  );
}

export function FileText({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

export function Moon({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function Sun({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

// ─── SourceSummary.tsx ──────────────────────────────────────

export function BarChart3({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

// ─── ShareResult.tsx ────────────────────────────────────────

export function Share2({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98" />
      <path d="M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}

export function Check({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function Copy({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function Twitter({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

export function MessageCircle({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

// ─── InputForm.tsx ──────────────────────────────────────────

export function Search({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function Link({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function ChevronRight({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

// ─── SilencedVoices.tsx ─────────────────────────────────────

export function VolumeX({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="m22 9-6 6" />
      <path d="m16 9 6 6" />
    </svg>
  );
}

// ─── SourceCard.tsx ─────────────────────────────────────────

export function ExternalLink({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

// ─── DimensionCard.tsx ──────────────────────────────────────

export function ShieldCheck({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function Puzzle({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.285a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.618 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z" />
    </svg>
  );
}

export function Globe({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

export function AlertTriangle({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function CircleCheckBig({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

export function Brain({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

// ─── HistoryList.tsx ────────────────────────────────────────

export function Clock({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 13" />
    </svg>
  );
}

// ─── Collapsible sections ──────────────────────────────────

export function ChevronDown({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function MapPin({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function Tag({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

export function Layers({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

// ─── toast.tsx ──────────────────────────────────────────────

export function X({ className, size = 24 }: IconProps) {
  return (
    <svg
      {...iconDefaults}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
