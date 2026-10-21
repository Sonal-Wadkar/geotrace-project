import type { TracerouteResult } from '../../types/traceroute';
import type { RouteStatistics } from '../../types/network';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { NetworkHealth } from '../dashboard/NetworkHealth';

interface TraceSummaryProps {
  stats: RouteStatistics;
  result: TracerouteResult;
}

export function TraceSummary({ stats, result }: TraceSummaryProps) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-widest text-muted uppercase">
          Route Summary
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Total Hops" value={stats.totalHops} />
        <Stat
          label="Total Latency"
          value={stats.totalLatencyMs}
          suffix=" ms"
        />
        <Stat label="Countries" value={stats.countries} />
        <Stat
          label="Packet Loss"
          value={stats.packetLossPercent}
          suffix="%"
          decimals={1}
        />
      </div>

      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted mb-1">Destination</p>
        <p className="text-lg font-semibold text-text">{stats.destinationName}</p>
        {result.destination_ip && (
          <p className="text-xs font-mono text-muted mt-1">{result.destination_ip}</p>
        )}
      </div>

      <NetworkHealth health={stats.health} />
    </div>
  );
}

function Stat({
  label,
  value,
  suffix = '',
  decimals = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-widest text-muted uppercase mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-text">
        <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
      </p>
    </div>
  );
}
