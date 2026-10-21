import type { NetworkHealth } from '../../types/network';
import { StatusIndicator } from '../ui/StatusIndicator';

interface NetworkHealthProps {
  health: NetworkHealth;
}

export function NetworkHealth({ health }: NetworkHealthProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      <p className="text-xs font-semibold tracking-widest text-muted uppercase">
        Network Health
      </p>
      <StatusIndicator status={health} />
    </div>
  );
}
