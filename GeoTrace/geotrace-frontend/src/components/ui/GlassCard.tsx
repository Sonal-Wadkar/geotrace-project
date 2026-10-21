interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddings = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function GlassCard({
  children,
  className = '',
  padding = 'md',
}: GlassCardProps) {
  return (
    <div
      className={`glass rounded-2xl ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
