import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  TraceProgress,
  TraceProgressStage,
  TracerouteResult,
  Hop,
} from '../types/traceroute';
import { runTrace } from '../services/tracerouteApi';
import { checkBackendHealth } from '../services/api';

const INITIAL_PROGRESS: TraceProgress = {
  stage: 'idle',
  message: '',
  hopCount: 0,
  hops: [],
};

export function useTraceroute() {
  const [progress, setProgress] = useState<TraceProgress>(INITIAL_PROGRESS);
  const [result, setResult] = useState<TracerouteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracing, setIsTracing] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const healthy = await checkBackendHealth();
      if (mounted) setBackendConnected(healthy);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setProgress(INITIAL_PROGRESS);
    setResult(null);
    setError(null);
    setIsTracing(false);
  }, []);

  const startTrace = useCallback(
    async (target: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsTracing(true);
      setError(null);
      setResult(null);
      setProgress({
        stage: 'resolving',
        message: 'Resolving destination',
        hopCount: 0,
        hops: [],
      });

      try {
        const traceResult = await runTrace(
          target,
          (event) => {
            if (controller.signal.aborted) return;

            if (event.type === 'status' && event.stage) {
              setProgress((prev) => ({
                ...prev,
                stage: event.stage as TraceProgressStage,
                message: event.message ?? prev.message,
              }));
            }

            if (event.type === 'hop_discovered' && event.hop) {
              setProgress((prev) => {
                const exists = prev.hops.some((h) => h.hop === event.hop!.hop);
                const hops: Hop[] = exists
                  ? prev.hops
                  : [...prev.hops, event.hop!];
                return {
                  ...prev,
                  hops,
                  hopCount: hops.length,
                  stage: 'discovering',
                  message: 'Discovering network hops',
                };
              });
            }

            if (event.type === 'complete' && event.result) {
              setResult(event.result);
              setProgress((prev) => ({
                ...prev,
                stage: 'complete',
                message: 'Route analysis complete',
                hopCount: event.result!.total_hops,
                hops: event.result!.hops,
              }));
            }

            if (event.type === 'error') {
              setError(event.error ?? 'Trace failed');
              setProgress((prev) => ({ ...prev, stage: 'error' }));
            }
          },
          controller.signal
        );

        if (!controller.signal.aborted) {
          setResult(traceResult);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;

        const message = backendConnected
          ? 'Unable to reach destination. The destination did not respond to traceroute requests.'
          : 'Backend connection lost. GeoTrace cannot perform a traceroute right now.';

        setError(message);
        setProgress((prev) => ({ ...prev, stage: 'error' }));
      } finally {
        if (!controller.signal.aborted) {
          setIsTracing(false);
        }
      }
    },
    [backendConnected]
  );

  const cancelTrace = useCallback(() => {
    abortRef.current?.abort();
    reset();
  }, [reset]);

  return {
    progress,
    result,
    error,
    isTracing,
    backendConnected,
    startTrace,
    cancelTrace,
    reset,
  };
}
