import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, icon, className = '', ...props }, ref) => (
    <div className="w-full">
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-bg-secondary border rounded-xl px-4 py-3 text-text placeholder:text-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent ${
            icon ? 'pl-11' : ''
          } ${error ? 'border-error' : 'border-border hover:border-border/80'} ${className}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p
          id={`${props.id}-error`}
          className="mt-2 text-sm text-error flex items-center gap-1.5"
          role="alert"
        >
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
);

Input.displayName = 'Input';
