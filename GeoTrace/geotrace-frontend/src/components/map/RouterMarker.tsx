import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { MapHop } from '../../types/map';
import { formatLatency } from '../../utils/formatLatency';
import { Button } from '../common/Button';

function createMarkerIcon(state: MapHop['state']): L.DivIcon {
  const styles: Record<MapHop['state'], { bg: string; content: string; size: number }> = {
    normal: { bg: '#38bdf8', content: '●', size: 28 },
    selected: { bg: '#38bdf8', content: '◉', size: 36 },
    destination: { bg: '#22c55e', content: '★', size: 36 },
    unresolved: { bg: '#f59e0b', content: '?', size: 28 },
  };

  const { bg, content, size } = styles[state];

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width:${size}px;height:${size}px;
      display:flex;align-items:center;justify-content:center;
      background:${bg};border-radius:50%;
      border:2px solid rgba(255,255,255,0.3);
      box-shadow:0 0 12px ${bg}80;
      font-size:${state === 'destination' ? '14px' : '12px'};
      color:#07111f;font-weight:bold;
    ">${content}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

interface RouterMarkerProps {
  hop: MapHop;
  onSelect: () => void;
}

export function RouterMarker({ hop, onSelect }: RouterMarkerProps) {
  return (
    <Marker
      position={[hop.lat, hop.lng]}
      icon={createMarkerIcon(hop.state)}
      eventHandlers={{ click: onSelect }}
    >
      <Popup>
        <HopPopup hop={hop} onViewDetails={onSelect} />
      </Popup>
    </Marker>
  );
}

export function HopPopup({
  hop,
  onViewDetails,
}: {
  hop: MapHop;
  onViewDetails: () => void;
}) {
  return (
    <div className="hop-popup-card">
      <h3>Hop {String(hop.hop).padStart(2, '0')}</h3>
      <p className="ip">{hop.ip ?? '—'}</p>
      {[
        ['Hostname', hop.hostname ?? '—'],
        ['Location', [hop.city, hop.country].filter(Boolean).join(', ') || '—'],
        ['ISP', hop.isp ?? '—'],
        ['ASN', hop.asn ?? '—'],
        ['Latency', formatLatency(hop.latency_ms)],
        ['Packet Loss', `${hop.packet_loss_percent}%`],
      ].map(([label, value]) => (
        <div key={label} className="hop-popup-row">
          <span className="hop-popup-label">{label}</span>
          <span className="hop-popup-value">{value}</span>
        </div>
      ))}
      <Button
        variant="secondary"
        size="sm"
        className="w-full mt-3"
        onClick={onViewDetails}
      >
        View Details
      </Button>
    </div>
  );
}
