import type { RouteStatistics as RouteStats } from '../../types/network';
import { AnimatedCounter } from '../ui/AnimatedCounter';

interface RouteStatisticsProps {
  stats: RouteStats;
}

export function RouteStatistics({ stats }: RouteStatisticsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Hops', value: stats.totalHops },
        { label: 'Latency', value: stats.totalLatencyMs, suffix: ' ms' },
        { label: 'Countries', value: stats.countries },
        { label: 'Loss', value: stats.packetLossPercent, suffix: '%', decimals: 1 },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <p className="text-[10px] text-muted uppercase tracking-wider">{item.label}</p>
          <p className="text-lg font-bold text-text">
            <AnimatedCounter
              value={item.value}
              suffix={item.suffix}
              decimals={item.decimals}
            />
          </p>
        </div>
      ))}
    </div>
  );
}
