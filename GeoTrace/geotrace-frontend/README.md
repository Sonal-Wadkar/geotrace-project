# GeoTrace — Interactive Global Network Route Visualizer

A modern web interface that visualizes the path taken by network packets from your machine to any destination domain or IP address.

## Features

- **Interactive world map** with animated route visualization (Leaflet / React-Leaflet)
- **Real-time trace progress** with hop discovery counter
- **Synchronized interactions** between map, latency chart, and route details table
- **Route statistics** with animated counters (hops, latency, countries, packet loss)
- **Network health indicator** derived from actual backend metrics
- **Trace history** stored locally in the browser
- **Demo Mode** for presentations when the backend is unavailable
- **Dark cybersecurity aesthetic** with responsive design and accessibility support

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React-Leaflet / Leaflet
- Framer Motion
- Recharts
- Lucide React
- Axios

## Getting Started

### Prerequisites

- Node.js 18+
- GeoTrace backend running on `http://localhost:8000` (optional — use Demo Mode without it)

### Installation

```bash
cd geotrace-frontend
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Demo Mode

Toggle **Demo Mode** in the bottom-right corner to explore the full UI with simulated traceroute data. Demo results are clearly labeled **DEMO DATA**.

### Backend API

The frontend expects:

```
POST /api/traceroute
{ "target": "google.com" }
```

Optional streaming via SSE at `/api/traceroute/stream?target=...`

Health check: `GET /api/health`

## Project Structure

```
src/
├── components/     # UI components (layout, map, traceroute, dashboard, common)
├── pages/          # Home, TraceResults, History, About
├── hooks/          # useTraceroute, useTraceHistory, useMapAnimation
├── services/       # API clients and demo trace logic
├── types/          # TypeScript interfaces
├── utils/          # Formatters, validators, route stats
└── context/        # Global traceroute state
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Disclaimer

- IP geolocation is approximate.
- Geographic lines represent inferred route locations, not physical cable paths.
- Not every router responds to traceroute probes.
- Demo Mode displays simulated data — never real network measurements.
