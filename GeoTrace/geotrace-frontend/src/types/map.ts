export type MapStyle = 'dark' | 'light' | 'satellite';

export type MarkerState = 'normal' | 'selected' | 'destination' | 'unresolved';

export interface MapHop {
  hop: number;
  lat: number;
  lng: number;
  state: MarkerState;
  ip: string | null;
  hostname: string | null;
  city: string | null;
  country: string | null;
  isp: string | null;
  asn: string | null;
  latency_ms: number | null;
  packet_loss_percent: number;
  hasLocation: boolean;
}

export interface RouteSegment {
  from: [number, number];
  to: [number, number];
  hopIndex: number;
}
