import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TraceInput } from '../components/traceroute/TraceInput';
import { TraceButton } from '../components/traceroute/TraceButton';
import { TraceProgress } from '../components/traceroute/TraceProgress';
import { ErrorState } from '../components/common/ErrorState';
import { isValidTarget, sanitizeTarget } from '../utils/validators';
import { useTracerouteContext } from '../context/TracerouteContext';

const EXAMPLES = ['google.com', 'cloudflare.com', 'github.com'];

export function Home() {
  const navigate = useNavigate();
  const {
    progress,
    result,
    isTracing,
    error,
    backendConnected,
    startTrace,
    reset,
  } = useTracerouteContext();

  const [target, setTarget] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (result && !isTracing) {
      navigate('/results');
    }
  }, [result, isTracing, navigate]);

  const handleTrace = useCallback(async () => {
    const sanitized = sanitizeTarget(target);
    if (!isValidTarget(sanitized)) {
      setValidationError('Please enter a valid domain or IP address.');
      return;
    }
    setValidationError('');
    await startTrace(sanitized);
  }, [target, startTrace]);

  if (isTracing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <TraceProgress
          target={target}
          stage={progress.stage}
          hopCount={progress.hopCount}
        />
      </div>
    );
  }

  return (
    <div className="grid-pattern min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase mb-4">
            Understand the Internet
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text leading-tight mb-4">
            See how your packets travel across the world.
          </h1>
          <p className="text-muted text-base sm:text-lg leading-relaxed">
            Trace a domain or IP address and visualize every network hop on an
            interactive global map.
          </p>
        </motion.div>

        {error && (
          <div className="w-full max-w-lg mb-6">
            <ErrorState
              type={backendConnected ? 'unreachable' : 'backend'}
              message={error}
              onRetry={() => {
                reset();
                handleTrace();
              }}
            />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg space-y-4"
        >
          <TraceInput
            value={target}
            onChange={(v) => {
              setTarget(v);
              if (validationError) setValidationError('');
            }}
            error={validationError}
            onSubmit={handleTrace}
          />
          <TraceButton
            onClick={handleTrace}
            disabled={!target.trim()}
          />

          <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
            <span className="text-xs text-muted">Try:</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setTarget(example);
                  setValidationError('');
                }}
                className="text-xs text-accent hover:text-accent/80 bg-accent/10 border border-accent/20 px-3 py-1 rounded-full transition-colors"
              >
                {example}
              </button>
            ))}
          </div>

          {!backendConnected && (
            <p className="text-xs text-warning text-center pt-2">
              Backend offline. Start the GeoTrace API server to run a trace.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
