import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from './Button';

type ErrorType = 'unreachable' | 'geolocation' | 'partial' | 'backend' | 'generic';

interface ErrorStateProps {
  type?: ErrorType;
  message?: string;
  onRetry?: () => void;
  onContinue?: () => void;
}

const configs: Record<
  ErrorType,
  { icon: React.ReactNode; title: string; description: string; retryLabel: string }
> = {
  unreachable: {
    icon: <WifiOff className="w-8 h-8 text-error" />,
    title: 'Unable to reach destination',
    description:
      'The destination did not respond to traceroute requests.',
    retryLabel: 'Try Again',
  },
  geolocation: {
    icon: <AlertTriangle className="w-8 h-8 text-warning" />,
    title: 'Location unavailable',
    description:
      'This router responded, but its geographical location could not be determined.',
    retryLabel: 'Continue Route',
  },
  partial: {
    icon: <AlertTriangle className="w-8 h-8 text-warning" />,
    title: 'Partial route detected',
    description:
      'Some intermediate routers did not respond. The available hops are shown below.',
    retryLabel: 'Try Again',
  },
  backend: {
    icon: <WifiOff className="w-8 h-8 text-error" />,
    title: 'Backend connection lost',
    description:
      'GeoTrace cannot perform a traceroute right now.',
    retryLabel: 'Retry Connection',
  },
  generic: {
    icon: <AlertTriangle className="w-8 h-8 text-error" />,
    title: 'Something went wrong',
    description: 'An unexpected error occurred during the trace.',
    retryLabel: 'Try Again',
  },
};

export function ErrorState({
  type = 'generic',
  message,
  onRetry,
  onContinue,
}: ErrorStateProps) {
  const config = configs[type];

  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-6 text-center bg-bg-card border border-border rounded-2xl"
      role="alert"
    >
      <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center mb-6">
        {config.icon}
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{config.title}</h3>
      <p className="text-muted text-sm max-w-md mb-2">{message ?? config.description}</p>
      <div className="flex gap-3 mt-4">
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" />
            {config.retryLabel}
          </Button>
        )}
        {onContinue && type === 'geolocation' && (
          <Button variant="secondary" onClick={onContinue}>
            Continue Route
          </Button>
        )}
      </div>
    </div>
  );
}
