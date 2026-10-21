export type HopStatus = 'success' | 'timeout' | 'unresolved' | 'error';

export interface Hop {
  hop: number;
  ip: string | null;
  hostname: string | null;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  isp: string | null;
  asn: string | null;
  latency_ms: number | null;
  packet_loss_percent: number;
  status: HopStatus;
}

export type TraceStatus = 'complete' | 'partial' | 'failed' | 'unreachable';

export interface TracerouteResult {
  target: string;
  destination_ip: string | null;
  status: TraceStatus;
  total_hops: number;
  total_latency_ms: number;
  packet_loss_percent: number;
  hops: Hop[];
}

export type TraceProgressStage =
  | 'idle'
  | 'resolving'
  | 'probing'
  | 'discovering'
  | 'geolocating'
  | 'building'
  | 'complete'
  | 'error';

export interface TraceProgress {
  stage: TraceProgressStage;
  message: string;
  hopCount: number;
  hops: Hop[];
}

export interface TraceProgressEvent {
  type: 'status' | 'hop_discovered' | 'complete' | 'error';
  stage?: TraceProgressStage;
  message?: string;
  hop?: Hop;
  result?: TracerouteResult;
  error?: string;
}

export interface TraceHistoryEntry {
  id: string;
  target: string;
  total_hops: number;
  total_latency_ms: number;
  countries: number;
  timestamp: number;
  result: TracerouteResult;
}

export interface TraceRequest {
  target: string;
}
