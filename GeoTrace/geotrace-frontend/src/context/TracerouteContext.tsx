import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { TracerouteResult } from '../types/traceroute';
import { useTraceroute } from '../hooks/useTraceroute';
import { useTraceHistory } from '../hooks/useTraceHistory';

interface TracerouteContextValue {
  progress: ReturnType<typeof useTraceroute>['progress'];
  result: TracerouteResult | null;
  error: string | null;
  isTracing: boolean;
  backendConnected: boolean;
  startTrace: (target: string) => Promise<void>;
  cancelTrace: () => void;
  reset: () => void;
  loadResult: (result: TracerouteResult) => void;
  addToHistory: (result: TracerouteResult) => void;
}

const TracerouteContext = createContext<TracerouteContextValue | null>(null);

export function TracerouteProvider({ children }: { children: ReactNode }) {
  const traceroute = useTraceroute();
  const { addEntry } = useTraceHistory();
  const { reset: resetTrace, startTrace: runTrace, cancelTrace } = traceroute;
  const [loadedResult, setLoadedResult] = useState<TracerouteResult | null>(null);

  const loadResult = useCallback((nextResult: TracerouteResult) => {
    resetTrace();
    setLoadedResult(nextResult);
  }, [resetTrace]);

  const result = loadedResult ?? traceroute.result;

  const reset = useCallback(() => {
    setLoadedResult(null);
    resetTrace();
  }, [resetTrace]);

  const startTrace = useCallback(async (target: string) => {
    setLoadedResult(null);
    await runTrace(target);
  }, [runTrace]);

  return (
    <TracerouteContext.Provider
      value={{
        progress: traceroute.progress,
        result,
        error: traceroute.error,
        isTracing: traceroute.isTracing,
        backendConnected: traceroute.backendConnected,
        startTrace,
        cancelTrace,
        reset,
        loadResult,
        addToHistory: addEntry,
      }}
    >
      {children}
    </TracerouteContext.Provider>
  );
}

export function useTracerouteContext() {
  const ctx = useContext(TracerouteContext);
  if (!ctx) {
    throw new Error('useTracerouteContext must be used within TracerouteProvider');
  }
  return ctx;
}
