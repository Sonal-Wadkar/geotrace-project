import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { Hop } from '../../types/traceroute';
import { formatLocation } from '../../utils/formatLocation';

interface LatencyChartProps {
  hops: Hop[];
  selectedHop: number | null;
  onSelectHop: (hop: number) => void;
}

interface ChartPoint {
  hop: number;
  latency: number | null;
  ip: string;
  location: string;
}

export function LatencyChart({ hops, selectedHop, onSelectHop }: LatencyChartProps) {
  const data = useMemo<ChartPoint[]>(
    () =>
      hops.map((h) => ({
        hop: h.hop,
        latency: h.latency_ms,
        ip: h.ip ?? '—',
        location: formatLocation(h),
      })),
    [hops]
  );

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6">
      <h3 className="text-xs font-semibold tracking-widest text-muted uppercase mb-6">
        Latency by Hop
      </h3>
      <div className="h-64 w-full" role="img" aria-label="Latency chart by hop">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1c3048" />
            <XAxis
              dataKey="hop"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{ value: 'Hop', position: 'insideBottom', offset: -2, fill: '#94a3b8' }}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{
                value: 'Latency (ms)',
                angle: -90,
                position: 'insideLeft',
                fill: '#94a3b8',
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip
              contentStyle={{
                background: '#101d30',
                border: '1px solid #1c3048',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
              formatter={(value) => [`${value ?? '—'} ms`, 'Latency']}
              labelFormatter={(label) => `Hop ${label}`}
            />
            {selectedHop !== null && (
              <ReferenceLine x={selectedHop} stroke="#38bdf8" strokeDasharray="4 4" />
            )}
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isSelected = payload.hop === selectedHop;
                return (
                  <circle
                    key={payload.hop}
                    cx={cx}
                    cy={cy}
                    r={isSelected ? 7 : 4}
                    fill={isSelected ? '#38bdf8' : '#07111f'}
                    stroke="#38bdf8"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectHop(payload.hop)}
                  />
                );
              }}
              connectNulls={false}
              activeDot={{ r: 6, fill: '#38bdf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
