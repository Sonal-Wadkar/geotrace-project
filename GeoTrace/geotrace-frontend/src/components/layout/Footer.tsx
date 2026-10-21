export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary/50 mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
        <p>GeoTrace — Network Route Visualization</p>
        <p>IP geolocation is approximate. Routes represent inferred locations, not physical paths.</p>
      </div>
    </footer>
  );
}
