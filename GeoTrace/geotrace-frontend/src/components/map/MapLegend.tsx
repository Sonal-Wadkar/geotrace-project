export function MapLegend() {
  const items = [
    { symbol: '●', label: 'Router', color: 'text-accent' },
    { symbol: '★', label: 'Destination', color: 'text-success' },
    { symbol: '—', label: 'Network Route', color: 'text-accent' },
    { symbol: '?', label: 'Unresolved Hop', color: 'text-warning' },
  ];

  return (
    <div
      className="absolute bottom-3 left-3 z-[1000] bg-bg-card/90 backdrop-blur border border-border rounded-xl px-4 py-3 shadow-lg"
      aria-label="Map legend"
    >
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs text-muted">
            <span className={`font-bold ${item.color}`} aria-hidden="true">
              {item.symbol}
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
