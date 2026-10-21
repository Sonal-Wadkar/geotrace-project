import type { Hop } from '../types/traceroute';

export function formatLocation(hop: Hop): string {
  if (hop.city && hop.country) return `${hop.city}, ${hop.country}`;
  if (hop.country) return hop.country;
  if (hop.city) return hop.city;
  if (hop.status === 'timeout') return 'No response';
  if (hop.isp) return hop.isp;
  if (hop.latitude === null || hop.longitude === null) return 'Unresolved';
  return 'Location unavailable';
}

export function formatShortLocation(hop: Hop): string {
  if (hop.city) return hop.city;
  if (hop.country) return hop.country;
  if (hop.status === 'timeout') return 'No response';
  if (hop.isp) return hop.isp;
  return 'Unresolved';
}

export function countUniqueCountries(hops: Hop[]): number {
  const countries = new Set(
    hops
      .map((h) => h.country)
      .filter((c): c is string => Boolean(c))
  );
  return countries.size;
}
