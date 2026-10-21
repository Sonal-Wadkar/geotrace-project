import { Search } from 'lucide-react';
import { Input } from '../common/Input';

interface TraceInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  onSubmit?: () => void;
}

export function TraceInput({
  value,
  onChange,
  error,
  disabled,
  onSubmit,
}: TraceInputProps) {
  return (
    <Input
      id="trace-target"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onSubmit) onSubmit();
      }}
      placeholder="e.g. google.com"
      disabled={disabled}
      error={error}
      icon={<Search className="w-4 h-4" aria-hidden="true" />}
      aria-label="Enter domain or IP address"
      autoComplete="off"
      spellCheck={false}
    />
  );
}
