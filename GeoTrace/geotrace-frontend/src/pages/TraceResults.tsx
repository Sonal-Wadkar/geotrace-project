import { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useTracerouteContext } from '../context/TracerouteContext';
import { calculateRouteStats } from '../utils/calculateRouteStats';
import { useMapAnimation } from '../hooks/useMapAnimation';
import { TraceSummary } from '../components/traceroute/TraceSummary';
import { LatencyChart } from '../components/dashboard/LatencyChart';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SkeletonCard } from '../components/common/Skeleton';
import { formatLatency } from '../utils/formatLatency';
import { formatLocation } from '../utils/formatLocation';
import type { MapStyle } from '../types/map';
import type { Hop } from '../types/traceroute';

const NetworkMap = lazy(() =>
  import('../components/map/NetworkMap').then((m) => ({ default: m.NetworkMap }))
);

export function TraceResults() {
  const navigate = useNavigate();
  const { result, isTracing, error, reset, addToHistory } =
    useTracerouteContext();

  const [selectedHop, setSelectedHop] = useState<number | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('dark');
  const [sortAsc, setSortAsc] = useState(true);

  const stats = useMemo(
    () => (result ? calculateRouteStats(result) : null),
    [result]
  );

  const animation = useMapAnimation({
    totalHops: result?.total_hops ?? 0,
    autoStart: !!result,
  });

  useEffect(() => {
    if (result) {
      addToHistory(result);
    }
  }, [addToHistory, result]);

  useEffect(() => {
    if (!isTracing && !result && !error) {
      navigate('/', { replace: true });
    }
  }, [error, isTracing, navigate, result]);

  if (isTracing) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <ErrorState
        type="unreachable"
        message={error}
        onRetry={() => navigate('/')}
      />
    );
  }

  if (!result || !stats) {
    return null;
  }

  const sortedHops = [...result.hops].sort((a, b) =>
    sortAsc ? a.hop - b.hop : b.hop - a.hop
  );

  const handleSelectHop = (hopNum: number) => {
    setSelectedHop(hopNum);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-text">
            Trace:{' '}
            <span className="font-mono text-accent">{result.target}</span>
          </h1>
          {result.status === 'partial' && (
            <Badge variant="warning">Partial Route</Badge>
          )}
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            reset();
            navigate('/');
          }}
        >
          <Plus className="w-4 h-4" />
          New Trace
        </Button>
      </div>

      {result.status === 'partial' && (
        <ErrorState type="partial" onRetry={() => navigate('/')} />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] lg:h-[520px]">
          <Suspense
            fallback={
              <div className="w-full h-full bg-bg-card border border-border rounded-2xl animate-pulse" />
            }
          >
            <NetworkMap
              hops={result.hops}
              selectedHop={selectedHop}
              visibleHops={animation.visibleHops}
              onSelectHop={handleSelectHop}
              mapStyle={mapStyle}
              onMapStyleChange={setMapStyle}
              onReplay={animation.replay}
              onPause={
                animation.isPlaying && !animation.isPaused
                  ? animation.pause
                  : animation.resume
              }
              isPlaying={animation.isPlaying}
              isPaused={animation.isPaused}
            />
          </Suspense>
        </div>
        <TraceSummary stats={stats} result={result} />
      </div>

      <LatencyChart
        hops={result.hops}
        selectedHop={selectedHop}
        onSelectHop={handleSelectHop}
      />

      <RouteDetailsTable
        hops={sortedHops}
        selectedHop={selectedHop}
        onSelectHop={handleSelectHop}
        sortAsc={sortAsc}
        onToggleSort={() => setSortAsc((v) => !v)}
      />
    </motion.div>
  );
}

function RouteDetailsTable({
  hops,
  selectedHop,
  onSelectHop,
  sortAsc,
  onToggleSort,
}: {
  hops: Hop[];
  selectedHop: number | null;
  onSelectHop: (hop: number) => void;
  sortAsc: boolean;
  onToggleSort: () => void;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-xs font-semibold tracking-widest text-muted uppercase">
          Route Details
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Route details">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 text-xs font-semibold text-muted uppercase">
                <button
                  type="button"
                  onClick={onToggleSort}
                  className="hover:text-accent transition-colors"
                  aria-label={`Sort by hop ${sortAsc ? 'descending' : 'ascending'}`}
                >
                  # {sortAsc ? '↑' : '↓'}
                </button>
              </th>
              {['IP Address', 'Hostname', 'Location', 'ISP', 'ASN', 'Latency', 'Status'].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-xs font-semibold text-muted uppercase whitespace-nowrap"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {hops.map((hop) => (
              <tr
                key={hop.hop}
                onClick={() => onSelectHop(hop.hop)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectHop(hop.hop);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-selected={selectedHop === hop.hop}
                className={`border-b border-border/50 cursor-pointer transition-colors ${
                  selectedHop === hop.hop
                    ? 'bg-accent/10 border-l-2 border-l-accent'
                    : 'hover:bg-bg-secondary/50'
                }`}
              >
                <td className="px-4 py-3 font-mono text-accent">
                  {String(hop.hop).padStart(2, '0')}
                </td>
                <td className="px-4 py-3 font-mono whitespace-nowrap">
                  {hop.ip ?? '?'}
                </td>
                <td className="px-4 py-3 text-muted whitespace-nowrap max-w-[160px] truncate">
                  {hop.hostname ?? '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatLocation(hop)}
                </td>
                <td className="px-4 py-3 text-muted whitespace-nowrap max-w-[140px] truncate">
                  {hop.isp ?? '—'}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted whitespace-nowrap">
                  {hop.asn ?? '—'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatLatency(hop.latency_ms)}
                </td>
                <td className="px-4 py-3">
                  <HopStatusDot status={hop.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HopStatusDot({ status }: { status: Hop['status'] }) {
  const colors: Record<Hop['status'], string> = {
    success: 'bg-success',
    timeout: 'bg-warning',
    unresolved: 'bg-warning',
    error: 'bg-error',
  };
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]}`}
      aria-label={status}
    />
  );
}
