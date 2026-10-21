export function formatLatency(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return '—';
  if (ms < 1) return '<1 ms';
  return `${Math.round(ms)} ms`;
}

export function formatPacketLoss(percent: number): string {
  return `${percent.toFixed(1)}%`;
}
