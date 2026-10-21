import { useMemo } from 'react';
import { Polyline, CircleMarker } from 'react-leaflet';
import type { MapHop } from '../../types/map';

interface RouteLineProps {
  hops: MapHop[];
  animated?: boolean;
}

function createCurvedPoints(
  from: [number, number],
  to: [number, number],
  segments = 20
): [number, number][] {
  const points: [number, number][] = [];
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;
  const dist = Math.sqrt(
    Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2)
  );
  const offset = dist * 0.15;
  const controlLat = midLat + offset;
  const controlLng = midLng;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat =
      (1 - t) * (1 - t) * from[0] +
      2 * (1 - t) * t * controlLat +
      t * t * to[0];
    const lng =
      (1 - t) * (1 - t) * from[1] +
      2 * (1 - t) * t * controlLng +
      t * t * to[1];
    points.push([lat, lng]);
  }
  return points;
}

export function RouteLine({ hops, animated = false }: RouteLineProps) {
  const segments = useMemo(() => {
    const result: [number, number][][] = [];
    for (let i = 0; i < hops.length - 1; i++) {
      const from: [number, number] = [hops[i].lat, hops[i].lng];
      const to: [number, number] = [hops[i + 1].lat, hops[i + 1].lng];
      result.push(createCurvedPoints(from, to));
    }
    return result;
  }, [hops]);

  const lastSegment = segments[segments.length - 1];
  const packetPosition = lastSegment?.[Math.floor(lastSegment.length / 2)];

  return (
    <>
      {segments.map((points, idx) => (
        <Polyline
          key={idx}
          positions={points}
          pathOptions={{
            color: '#38bdf8',
            weight: 2.5,
            opacity: 0.8,
            dashArray: animated ? '8 4' : undefined,
            className: animated ? 'route-line-animated' : undefined,
          }}
        />
      ))}
      {animated && packetPosition && (
        <CircleMarker
          center={packetPosition}
          radius={6}
          pathOptions={{
            color: '#38bdf8',
            fillColor: '#38bdf8',
            fillOpacity: 1,
            className: 'packet-marker',
          }}
        />
      )}
    </>
  );
}
