export type NetworkHealth = 'stable' | 'degraded' | 'unstable' | 'incomplete';

export interface RouteStatistics {
  totalHops: number;
  totalLatencyMs: number;
  countries: number;
  packetLossPercent: number;
  health: NetworkHealth;
  destinationName: string;
}
