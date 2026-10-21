import type { Hop } from '../../types/traceroute';
import { formatLatency } from '../../utils/formatLatency';
import { formatShortLocation } from '../../utils/formatLocation';

interface HopCardProps {
  hop: Hop;
  selected?: boolean;
  onClick?: () => void;
}

export function HopCard({ hop, selected, onClick }: HopCardProps) {
  const isUnresolved =
    hop.status === 'timeout' || hop.status === 'unresolved' || hop.latitude === null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        selected
          ? 'border-accent bg-accent/5 ring-1 ring-accent/30'
          : 'border-border bg-bg-secondary/50 hover:border-accent/30'
      }`}
      aria-pressed={selected}
      aria-label={`Hop ${hop.hop}: ${hop.ip ?? 'unresolved'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-accent">
          HOP {String(hop.hop).padStart(2, '0')}
        </span>
        <span className="text-xs text-muted">{formatLatency(hop.latency_ms)}</span>
      </div>
      <p className="font-mono text-sm text-text mt-1 truncate">
        {hop.ip ?? (isUnresolved ? '?' : '—')}
      </p>
      <p className="text-xs text-muted mt-0.5 truncate">
        {formatShortLocation(hop)}
      </p>
    </button>
  );
}
