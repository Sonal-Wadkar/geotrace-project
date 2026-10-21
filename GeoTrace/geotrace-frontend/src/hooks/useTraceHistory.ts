import { useCallback, useEffect, useState } from 'react';
import type { TraceHistoryEntry, TracerouteResult } from '../types/traceroute';
import { countUniqueCountries } from '../utils/formatLocation';

const STORAGE_KEY = 'geotrace_history';
const MAX_ENTRIES = 50;

function isHistoryEntry(value: unknown): value is TraceHistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<TraceHistoryEntry>;
  return typeof entry.id === 'string'
    && typeof entry.target === 'string'
    && typeof entry.timestamp === 'number'
    && typeof entry.total_hops === 'number'
    && typeof entry.total_latency_ms === 'number'
    && Array.isArray(entry.countries)
    && !!entry.result
    && Array.isArray(entry.result.hops);
}

function loadHistory(): TraceHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(isHistoryEntry).slice(0, MAX_ENTRIES)
      : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: TraceHistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // Keep the in-memory experience working when storage is disabled or full.
  }
}

export function useTraceHistory() {
  const [history, setHistory] = useState<TraceHistoryEntry[]>(() => loadHistory());
  const [search, setSearch] = useState('');

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addEntry = useCallback((result: TracerouteResult) => {
    const entry: TraceHistoryEntry = {
      id: crypto.randomUUID(),
      target: result.target,
      total_hops: result.total_hops,
      total_latency_ms: result.total_latency_ms,
      countries: countUniqueCountries(result.hops),
      timestamp: Date.now(),
      result,
    };
    setHistory((prev) => [entry, ...prev.filter((e) => e.target !== result.target)].slice(0, MAX_ENTRIES));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }
  }, []);

  const filtered = history.filter((entry) =>
    entry.target.toLowerCase().includes(search.toLowerCase())
  );

  return {
    history: filtered,
    search,
    setSearch,
    addEntry,
    clearHistory,
    totalCount: history.length,
  };
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString();
}
