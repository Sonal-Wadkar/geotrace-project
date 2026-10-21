import type { Hop } from '../../types/traceroute';
import { HopCard } from './HopCard';

interface HopTimelineProps {
  hops: Hop[];
  selectedHop: number | null;
  onSelectHop: (hop: number) => void;
}

export function HopTimeline({ hops, selectedHop, onSelectHop }: HopTimelineProps) {
  return (
    <div className="space-y-2">
      {hops.map((hop) => (
        <HopCard
          key={hop.hop}
          hop={hop}
          selected={selectedHop === hop.hop}
          onClick={() => onSelectHop(hop.hop)}
        />
      ))}
    </div>
  );
}

export { HopCard };
