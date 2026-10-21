interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-[10px] font-semibold tracking-widest text-muted uppercase">
          {label}
        </p>
      </div>
      <p className="text-xl font-bold text-text">{value}</p>
    </div>
  );
}
