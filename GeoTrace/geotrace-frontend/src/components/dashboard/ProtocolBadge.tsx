interface ProtocolBadgeProps {
  protocol?: string;
}

export function ProtocolBadge({ protocol = 'ICMP' }: ProtocolBadgeProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium bg-bg-secondary text-accent border border-accent/30 rounded">
      {protocol}
    </span>
  );
}
