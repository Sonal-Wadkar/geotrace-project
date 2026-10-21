import { motion } from 'framer-motion';
import type { TraceProgressStage } from '../../types/traceroute';

interface TraceProgressProps {
  target: string;
  stage: TraceProgressStage;
  hopCount: number;
}

const STAGES: { key: TraceProgressStage; label: string }[] = [
  { key: 'resolving', label: 'Resolving destination' },
  { key: 'probing', label: 'Sending TTL probes' },
  { key: 'discovering', label: 'Discovering network hops' },
  { key: 'geolocating', label: 'Resolving router locations' },
  { key: 'building', label: 'Building geographical route' },
];

const stageOrder: TraceProgressStage[] = STAGES.map((s) => s.key);

function getStageStatus(
  current: TraceProgressStage,
  stage: TraceProgressStage
): 'done' | 'active' | 'pending' {
  const currentIdx = stageOrder.indexOf(current);
  const stageIdx = stageOrder.indexOf(stage);
  if (stageIdx < currentIdx) return 'done';
  if (stageIdx === currentIdx) return 'active';
  return 'pending';
}

export function TraceProgress({ target, stage, hopCount }: TraceProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-card border border-border rounded-2xl p-8 max-w-lg mx-auto"
      role="status"
      aria-live="polite"
      aria-label="Trace progress"
    >
      <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-2">
        Analyzing Route
      </p>
      <h2 className="text-xl font-semibold text-text mb-6">
        Tracing path to{' '}
        <span className="font-mono text-accent">{target}</span>
      </h2>

      <ul className="space-y-3 mb-6">
        {STAGES.map(({ key, label }) => {
          const status = getStageStatus(stage, key);
          return (
            <li key={key} className="flex items-center gap-3 text-sm">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  status === 'done'
                    ? 'bg-success/20 text-success'
                    : status === 'active'
                      ? 'bg-accent/20 text-accent pulse-dot'
                      : 'bg-bg-secondary text-muted border border-border'
                }`}
                aria-hidden="true"
              >
                {status === 'done' ? '✓' : status === 'active' ? '●' : '○'}
              </span>
              <span
                className={
                  status === 'active'
                    ? 'text-text font-medium'
                    : status === 'done'
                      ? 'text-muted'
                      : 'text-muted/60'
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm text-muted">Hops discovered</span>
        <span className="text-2xl font-bold text-accent tabular-nums">{hopCount}</span>
      </div>

      <div className="mt-4 h-1.5 bg-bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: '0%' }}
          animate={{
            width: `${Math.min(
              ((stageOrder.indexOf(stage) + 1) / stageOrder.length) * 100,
              100
            )}%`,
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
