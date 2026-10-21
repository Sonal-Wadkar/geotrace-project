import { useNavigate } from 'react-router-dom';
import { Search, Trash2 } from 'lucide-react';
import { useTraceHistory, formatRelativeTime } from '../hooks/useTraceHistory';
import { useTracerouteContext } from '../context/TracerouteContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export function History() {
  const navigate = useNavigate();
  const { history, search, setSearch, clearHistory } = useTraceHistory();
  const { loadResult } = useTracerouteContext();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text">Trace History</h1>
        <div className="flex items-center gap-3">
          <div className="flex-1 sm:w-64">
            <Input
              id="history-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search traces..."
              icon={<Search className="w-4 h-4" />}
              aria-label="Search trace history"
            />
          </div>
          {history.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <EmptyState
          title="No traces yet"
          description="Run a traceroute to see your history here."
          action={{ label: 'Start a Trace', onClick: () => navigate('/') }}
        />
      ) : (
        <ul className="space-y-3" aria-label="Trace history list">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="bg-bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent/30 transition-colors"
            >
              <div>
                <p className="font-mono font-semibold text-text">{entry.target}</p>
                <p className="text-sm text-muted mt-1">
                  {entry.total_hops} hops • {entry.total_latency_ms} ms •{' '}
                  {entry.countries} countries
                </p>
                <p className="text-xs text-muted/70 mt-1">
                  {formatRelativeTime(entry.timestamp)}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  loadResult(entry.result);
                  navigate('/results');
                }}
              >
                View
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
