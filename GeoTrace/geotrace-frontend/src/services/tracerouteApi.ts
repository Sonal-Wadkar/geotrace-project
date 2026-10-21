import type { TracerouteResult, TraceProgressEvent } from '../types/traceroute';

/**
 * Run one trace through SSE. We deliberately do not silently retry through REST
 * after an SSE failure: the server may already be running the first trace, so a
 * fallback could launch duplicate subprocesses.
 */
export async function runTrace(
  target: string,
  onEvent: (event: TraceProgressEvent) => void,
  signal?: AbortSignal,
): Promise<TracerouteResult> {
  if (signal?.aborted) {
    throw new DOMException('The trace was cancelled.', 'AbortError');
  }

  onEvent({ type: 'status', stage: 'resolving', message: 'Resolving destination' });
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
  const url = `${baseUrl}/traceroute/stream?target=${encodeURIComponent(target)}`;

  return new Promise<TracerouteResult>((resolve, reject) => {
    const eventSource = new EventSource(url);
    let settled = false;

    const cleanup = () => {
      eventSource.close();
      signal?.removeEventListener('abort', onAbort);
    };
    const settleResolve = (result: TracerouteResult) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };
    const settleReject = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };
    const onAbort = () => settleReject(new DOMException('The trace was cancelled.', 'AbortError'));

    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) {
      onAbort();
      return;
    }

    eventSource.onmessage = (event: MessageEvent<string>) => {
      let data: TraceProgressEvent;
      try {
        data = JSON.parse(event.data) as TraceProgressEvent;
      } catch {
        settleReject(new Error('The server returned an invalid progress event.'));
        return;
      }

      onEvent(data);
      if (data.type === 'complete' && data.result) {
        settleResolve(data.result);
      } else if (data.type === 'error') {
        settleReject(new Error(data.error || 'Traceroute failed.'));
      }
    };

    eventSource.onerror = () => {
      settleReject(new Error('The live trace connection failed. Please retry the trace.'));
    };
  });
}
