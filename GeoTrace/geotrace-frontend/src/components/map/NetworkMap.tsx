import { useMemo, useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Hop } from '../../types/traceroute';
import type { MapStyle, MapHop } from '../../types/map';
import { hopHasGeolocation } from '../../services/geolocationApi';
import { RouteLine } from './RouteLine';
import { RouterMarker } from './RouterMarker';
import { DestinationMarker } from './DestinationMarker';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import 'leaflet/dist/leaflet.css';
import '../../styles/map.css';

const TILE_URLS: Record<MapStyle, string> = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface NetworkMapProps {
  hops: Hop[];
  selectedHop: number | null;
  visibleHops: number;
  onSelectHop: (hop: number) => void;
  mapStyle: MapStyle;
  onMapStyleChange: (style: MapStyle) => void;
  onReplay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  isPaused: boolean;
}

function hopsToMapHops(hops: Hop[], selectedHop: number | null): MapHop[] {
  return hops.map((hop, idx) => {
    const isLast = idx === hops.length - 1;
    const hasLocation = hopHasGeolocation(hop);
    const isUnresolved =
      hop.status === 'timeout' || hop.status === 'unresolved' || !hasLocation;

    let state: MapHop['state'] = 'normal';
    if (isLast && hasLocation) state = 'destination';
    else if (selectedHop === hop.hop) state = 'selected';
    else if (isUnresolved) state = 'unresolved';

    return {
      hop: hop.hop,
      lat: hop.latitude ?? 0,
      lng: hop.longitude ?? 0,
      state,
      ip: hop.ip,
      hostname: hop.hostname,
      city: hop.city,
      country: hop.country,
      isp: hop.isp,
      asn: hop.asn,
      latency_ms: hop.latency_ms,
      packet_loss_percent: hop.packet_loss_percent,
      hasLocation,
    };
  });
}

function MapController({
  hops,
  selectedHop,
  fitTrigger,
}: {
  hops: MapHop[];
  selectedHop: number | null;
  fitTrigger: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedHop === null) return;
    const hop = hops.find((h) => h.hop === selectedHop && h.hasLocation);
    if (hop) {
      map.flyTo([hop.lat, hop.lng], Math.max(map.getZoom(), 5), { duration: 0.8 });
    }
  }, [selectedHop, hops, map]);

  useEffect(() => {
    const located = hops.filter((h) => h.hasLocation);
    if (located.length === 0) return;
    const bounds = L.latLngBounds(located.map((h) => [h.lat, h.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6 });
  }, [fitTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export function NetworkMap({
  hops,
  selectedHop,
  visibleHops,
  onSelectHop,
  mapStyle,
  onMapStyleChange,
  onReplay,
  onPause,
  isPlaying,
  isPaused,
}: NetworkMapProps) {
  const [fitTrigger, setFitTrigger] = useState(0);
  const mapHops = useMemo(
    () => hopsToMapHops(hops, selectedHop),
    [hops, selectedHop]
  );

  const visibleMapHops = useMemo(
    () => mapHops.filter((h) => h.hop <= visibleHops),
    [mapHops, visibleHops]
  );

  const locatedHops = useMemo(
    () => visibleMapHops.filter((h) => h.hasLocation),
    [visibleMapHops]
  );

  const fitRoute = useCallback(() => {
    setFitTrigger((n) => n + 1);
  }, []);

  const defaultCenter: [number, number] = useMemo(() => {
    const first = locatedHops[0];
    return first ? [first.lat, first.lng] : [20, 0];
  }, [locatedHops]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-border">
      <MapContainer
        center={defaultCenter}
        zoom={3}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer url={TILE_URLS[mapStyle]} attribution={TILE_ATTRIBUTION} />
        <MapController
          hops={mapHops}
          selectedHop={selectedHop}
          fitTrigger={fitTrigger}
        />

        <RouteLine hops={locatedHops} animated={isPlaying && !isPaused} />

        {visibleMapHops.map((hop) =>
          hop.hasLocation ? (
            hop.state === 'destination' ? (
              <DestinationMarker
                key={hop.hop}
                hop={hop}
                onSelect={() => onSelectHop(hop.hop)}
              />
            ) : (
              <RouterMarker
                key={hop.hop}
                hop={hop}
                onSelect={() => onSelectHop(hop.hop)}
              />
            )
          ) : null
        )}

        <MapControls
          mapStyle={mapStyle}
          onMapStyleChange={onMapStyleChange}
          onFitRoute={fitRoute}
          onReplay={onReplay}
          onPause={onPause}
          isPlaying={isPlaying}
          isPaused={isPaused}
        />
      </MapContainer>

      <MapLegend />
    </div>
  );
}
