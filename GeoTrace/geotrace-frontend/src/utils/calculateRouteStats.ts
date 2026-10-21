import type { Hop, TraceStatus, TracerouteResult } from '../types/traceroute';
import type { NetworkHealth, RouteStatistics } from '../types/network';
import { countUniqueCountries } from './formatLocation';

export function calculateNetworkHealth(
  hops: Hop[],
  status: TraceStatus,
  packetLossPercent: number
): NetworkHealth {
  if (status === 'partial' || status === 'unreachable') return 'incomplete';
  if (status === 'failed') return 'unstable';

  const unresolvedCount = hops.filter(
    (h) => h.status === 'timeout' || h.status === 'unresolved'
  ).length;
  const unresolvedRatio = hops.length > 0 ? unresolvedCount / hops.length : 0;

  if (packetLossPercent > 10 || unresolvedRatio > 0.3) return 'unstable';
  if (packetLossPercent > 2 || unresolvedRatio > 0.1) return 'degraded';
  return 'stable';
}

export function calculateRouteStats(result: TracerouteResult): RouteStatistics {
  const countries = countUniqueCountries(result.hops);
  const lastHop = result.hops[result.hops.length - 1];
  const destinationName =
    lastHop?.hostname?.split('.').slice(-2, -1)[0] ??
    lastHop?.hostname ??
    result.target;

  return {
    totalHops: result.total_hops,
    totalLatencyMs: result.total_latency_ms,
    countries,
    packetLossPercent: result.packet_loss_percent,
    health: calculateNetworkHealth(
      result.hops,
      result.status,
      result.packet_loss_percent
    ),
    destinationName: destinationName.charAt(0).toUpperCase() + destinationName.slice(1),
  };
}

export function getMaxLatency(hops: Hop[]): number {
  const latencies = hops
    .map((h) => h.latency_ms)
    .filter((l): l is number => l !== null);
  return latencies.length > 0 ? Math.max(...latencies) : 0;
}
