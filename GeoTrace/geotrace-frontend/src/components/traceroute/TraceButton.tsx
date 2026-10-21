import { ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

interface TraceButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function TraceButton({ onClick, disabled, loading }: TraceButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      size="lg"
      className="w-full sm:w-auto min-w-[160px]"
      aria-label="Start network trace"
    >
      Start Trace
      <ArrowRight className="w-4 h-4" aria-hidden="true" />
    </Button>
  );
}
