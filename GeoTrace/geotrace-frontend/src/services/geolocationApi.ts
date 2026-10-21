import type { Hop } from '../types/traceroute';

export function hopHasGeolocation(hop: Hop): boolean {
  return hop.latitude !== null && hop.longitude !== null;
}

export function hopsWithGeolocation(hops: Hop[]): Hop[] {
  return hops.filter(hopHasGeolocation);
}
