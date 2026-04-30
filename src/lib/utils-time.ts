/** Utilidades de tiempo compartidas — usadas por SignalCard, AnalysisCard, LatestSignals */

export function timeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin}m`;
  if (diffHr < 24) return `hace ${diffHr}h`;
  return `hace ${diffDay}d`;
}

/** Señal "nueva" si tiene menos de 2 horas — solo usar en cliente (hydration mismatch) */
export function isRecent(timestamp: string): boolean {
  const diff = Date.now() - new Date(timestamp).getTime();
  return diff < 2 * 60 * 60 * 1000;
}
