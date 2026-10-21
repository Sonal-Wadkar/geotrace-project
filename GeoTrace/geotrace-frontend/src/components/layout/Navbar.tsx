import { NavLink } from 'react-router-dom';
import { StatusIndicator } from '../ui/StatusIndicator';

interface NavbarProps {
  backendConnected: boolean;
}

const navLinks = [
  { to: '/', label: 'Traceroute' },
  { to: '/history', label: 'History' },
  { to: '/about', label: 'About' },
];

export function Navbar({ backendConnected }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/90 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-3 group">
            <img src="/logo.svg" alt="" className="w-8 h-8" aria-hidden="true" />
            <div>
              <span className="font-bold text-text group-hover:text-accent transition-colors">
                GeoTrace
              </span>
              <p className="text-[10px] text-muted leading-none hidden sm:block">
                Global Network Route Visualizer
              </p>
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'text-accent bg-accent/10'
                      : 'text-muted hover:text-text hover:bg-bg-secondary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <StatusIndicator
              status={backendConnected ? 'connected' : 'disconnected'}
              pulse={backendConnected}
            />
          </div>
        </div>

        <nav
          className="md:hidden flex items-center gap-1 pb-3 -mt-1 overflow-x-auto"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-accent bg-accent/10'
                    : 'text-muted hover:text-text'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
