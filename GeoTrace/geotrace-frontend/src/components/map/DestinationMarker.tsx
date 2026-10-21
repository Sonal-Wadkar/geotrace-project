import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { MapHop } from '../../types/map';
import { HopPopup } from './RouterMarker';

function createDestinationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width:36px;height:36px;
      display:flex;align-items:center;justify-content:center;
      background:#22c55e;border-radius:50%;
      border:2px solid rgba(255,255,255,0.4);
      box-shadow:0 0 16px #22c55e80;
      font-size:16px;color:#07111f;font-weight:bold;
    ">★</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

interface DestinationMarkerProps {
  hop: MapHop;
  onSelect: () => void;
}

export function DestinationMarker({ hop, onSelect }: DestinationMarkerProps) {
  return (
    <Marker
      position={[hop.lat, hop.lng]}
      icon={createDestinationIcon()}
      eventHandlers={{ click: onSelect }}
      zIndexOffset={1000}
    >
      <Popup>
        <HopPopup hop={hop} onViewDetails={onSelect} />
      </Popup>
    </Marker>
  );
}
