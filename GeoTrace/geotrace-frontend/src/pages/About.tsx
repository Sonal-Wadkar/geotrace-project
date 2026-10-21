import { GlassCard } from '../components/ui/GlassCard';
import { ProtocolBadge } from '../components/dashboard/ProtocolBadge';

const TECHNOLOGIES = [
  'Python',
  'Scapy',
  'React',
  'TypeScript',
  'Leaflet',
  'IP Geolocation API',
];

export function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">About GeoTrace</h1>
        <p className="text-muted">
          A visual tool for understanding how network traffic travels between endpoints.
        </p>
      </div>

      <GlassCard>
        <h2 className="text-lg font-semibold text-text mb-3">What is GeoTrace?</h2>
        <p className="text-muted leading-relaxed">
          GeoTrace transforms technical traceroute output into an intuitive geographical
          experience. Enter any domain or IP address and watch as network packets traverse
          routers across the globe — visualized on an interactive world map with latency
          metrics, ISP data, and route health analysis.
        </p>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold text-text mb-4">
          How does traceroute work?
        </h2>
        <div className="flex flex-col items-center gap-2 py-4 font-mono text-sm">
          {['TTL', 'Router', 'ICMP response', 'Next TTL', 'Next router'].map(
            (step, i, arr) => (
              <div key={step} className="flex flex-col items-center">
                <span className="bg-bg-secondary border border-border px-4 py-2 rounded-lg text-accent">
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-muted my-1" aria-hidden="true">
                    ↓
                  </span>
                )}
              </div>
            )
          )}
        </div>
        <p className="text-muted text-sm leading-relaxed mt-4">
          Traceroute works by sending packets with incrementally increasing Time-To-Live (TTL)
          values. Each router along the path decrements the TTL, and when it reaches zero,
          the router sends back an ICMP "Time Exceeded" message, revealing its identity.
        </p>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold text-text mb-4">Technologies</h2>
        <div className="flex flex-wrap gap-2">
          {TECHNOLOGIES.map((tech) => (
            <ProtocolBadge key={tech} protocol={tech} />
          ))}
        </div>
      </GlassCard>

      <GlassCard className="border-warning/30">
        <h2 className="text-lg font-semibold text-warning mb-3">Disclaimer</h2>
        <ul className="space-y-2 text-sm text-muted leading-relaxed list-disc list-inside">
          <li>IP geolocation is approximate and may not reflect the exact physical location of network equipment.</li>
          <li>Not every router responds to traceroute probes — some hops may appear as timeouts.</li>
          <li>Geographic lines represent inferred route locations, not physical cable paths.</li>
          <li>Results vary depending on network conditions, routing policies, and time of day.</li>
          <li>Demo Mode displays simulated data clearly labeled as DEMO DATA — never real measurements.</li>
        </ul>
      </GlassCard>
    </div>
  );
}
