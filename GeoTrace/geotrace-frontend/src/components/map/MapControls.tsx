import { useMap } from 'react-leaflet';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Pause, Play } from 'lucide-react';
import type { MapStyle } from '../../types/map';
import { Button } from '../common/Button';

interface MapControlsProps {
  mapStyle: MapStyle;
  onMapStyleChange: (style: MapStyle) => void;
  onFitRoute: () => void;
  onReplay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  isPaused: boolean;
}

export function MapControls({
  mapStyle,
  onMapStyleChange,
  onFitRoute,
  onReplay,
  onPause,
  isPlaying,
  isPaused,
}: MapControlsProps) {
  const map = useMap();

  const styles: MapStyle[] = ['dark', 'light', 'satellite'];

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
      <div className="flex flex-col bg-bg-card/90 backdrop-blur border border-border rounded-xl overflow-hidden shadow-lg">
        <ControlButton
          onClick={() => map.zoomIn()}
          label="Zoom in"
          icon={<ZoomIn className="w-4 h-4" />}
        />
        <ControlButton
          onClick={() => map.zoomOut()}
          label="Zoom out"
          icon={<ZoomOut className="w-4 h-4" />}
        />
        <ControlButton
          onClick={() => map.setView([20, 0], 2)}
          label="Reset view"
          icon={<Maximize2 className="w-4 h-4" />}
        />
        <ControlButton
          onClick={onFitRoute}
          label="Fit route"
          icon={<Maximize2 className="w-4 h-4" />}
        />
      </div>

      <div className="flex flex-col bg-bg-card/90 backdrop-blur border border-border rounded-xl overflow-hidden shadow-lg">
        {styles.map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => onMapStyleChange(style)}
            className={`px-3 py-2 text-xs capitalize transition-colors ${
              mapStyle === style
                ? 'bg-accent/20 text-accent'
                : 'text-muted hover:text-text hover:bg-bg-secondary'
            }`}
            aria-label={`${style} map style`}
            aria-pressed={mapStyle === style}
          >
            {style}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <Button
          variant="secondary"
          size="sm"
          onClick={onReplay}
          aria-label="Replay route animation"
        >
          <RotateCcw className="w-3 h-3" />
          Replay
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onPause}
          aria-label={isPlaying && !isPaused ? 'Pause animation' : 'Resume animation'}
        >
          {isPlaying && !isPaused ? (
            <>
              <Pause className="w-3 h-3" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3 h-3" /> Resume
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  icon,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="p-2.5 text-muted hover:text-accent hover:bg-bg-secondary transition-colors border-b border-border last:border-b-0"
    >
      {icon}
    </button>
  );
}
