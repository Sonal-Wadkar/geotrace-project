# GeoTrace Backend

Python API server for the GeoTrace Computer Networks project. Performs real traceroute operations and enriches each hop with geolocation, ISP, and ASN data.

## Features

- `POST /api/traceroute` — run traceroute to a domain or IP
- `GET /api/traceroute/stream` — Server-Sent Events for live hop discovery
- `GET /api/health` — health check for frontend connection status
- IP geolocation via [ip-api.com](http://ip-api.com) (no API key required for development)
- Optional Scapy-based traceroute (`USE_SCAPY=true`, requires admin/root)

## Requirements

- Python 3.11+
- System `traceroute` command (pre-installed on macOS/Linux)

## Setup

```bash
cd geotrace-backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

API runs at **http://localhost:8000**

## API

### Health check

```bash
curl http://localhost:8000/api/health
```

### Traceroute

```bash
curl -X POST http://localhost:8000/api/traceroute \
  -H "Content-Type: application/json" \
  -d '{"target": "google.com"}'
```

### Streaming (SSE)

```bash
curl -N "http://localhost:8000/api/traceroute/stream?target=google.com"
```

## Run with frontend

**Terminal 1 — Backend:**
```bash
cd geotrace-backend
source venv/bin/activate
python run.py
```

**Terminal 2 — Frontend:**
```bash
cd geotrace-frontend
npm run dev
```

Open http://localhost:5173, turn **Demo Mode OFF**, and trace a target.

## CN Concepts

| Concept | Implementation |
|---------|----------------|
| TTL | Incremented per hop in traceroute probes |
| ICMP | Time-exceeded responses from routers |
| Traceroute | System `traceroute` or Scapy |
| End-to-end delay | Latency (ms) per hop |
| Routing path | Hop-by-hop IP chain to destination |

## Notes

- Private/local IPs (192.168.x.x) are not geolocated — labeled as Local Network
- Some routers block ICMP — those hops show as timeouts (`*`)
- Geolocation is approximate, not exact physical router location
- ip-api.com free tier: ~45 requests/minute

## Project structure

```
geotrace-backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Settings
│   ├── models/schemas.py    # Request/response models
│   ├── routes/              # API endpoints
│   └── services/            # Traceroute, geolocation, validation
├── requirements.txt
└── run.py
```
