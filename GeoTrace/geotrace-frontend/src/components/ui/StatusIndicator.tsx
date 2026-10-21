import type { NetworkHealth } from '../../types/network';

interface StatusIndicatorProps {
  status: NetworkHealth | 'connected' | 'disconnected';
  label?: string;
  pulse?: boolean;
}

const statusColors: Record<string, string> = {
  stable: 'bg-success',
  degraded: 'bg-warning',
  unstable: 'bg-error',
  incomplete: 'bg-warning',
  connected: 'bg-success',
  disconnected: 'bg-error',
};

const statusLabels: Record<string, string> = {
  stable: 'Stable',
  degraded: 'Degraded',
  unstable: 'Unstable',
  incomplete: 'Incomplete',
  connected: 'Backend Connected',
  disconnected: 'Backend Offline',
};

export function StatusIndicator({ status, label, pulse = false }: StatusIndicatorProps) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted">
      <span
        className={`w-2 h-2 rounded-full ${statusColors[status]} ${pulse ? 'pulse-dot' : ''}`}
        aria-hidden="true"
      />
      <span>{label ?? statusLabels[status]}</span>
    </span>
  );
}
