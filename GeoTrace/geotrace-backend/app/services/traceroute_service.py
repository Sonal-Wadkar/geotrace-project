from collections.abc import AsyncIterator, Callable

from app.config import settings
from app.models.schemas import Hop, TracerouteResult
from app.services.geolocation_service import enrich_hop
from app.services.scapy_traceroute import run_scapy_traceroute
from app.services.system_traceroute import resolve_destination_ip, run_system_traceroute
from app.services.validators import validate_target


def _compute_stats(
    target: str, hops: list[Hop], destination_ip: str | None
) -> TracerouteResult:
    latencies = [h.latency_ms for h in hops if h.latency_ms is not None]
    total_latency = latencies[-1] if latencies else 0.0

    timeout_count = sum(1 for h in hops if h.status == "timeout")
    # This is the mean of per-hop probe loss, not end-to-end packet loss.
    measured_loss = [h.packet_loss_percent for h in hops if h.status != "timeout" or h.packet_loss_percent > 0]
    packet_loss = (sum(measured_loss) / len(measured_loss)) if measured_loss else (100.0 if hops and timeout_count == len(hops) else 0.0)

    reached_destination = bool(
        destination_ip
        and hops
        and hops[-1].ip == destination_ip
        and hops[-1].status == "success"
    )

    if not hops:
        status = "failed"
    elif timeout_count == len(hops):
        status = "unreachable"
    elif timeout_count > 0 or not reached_destination:
        status = "partial"
    else:
        status = "complete"

    return TracerouteResult(
        target=target,
        destination_ip=destination_ip,
        status=status,
        total_hops=len(hops),
        total_latency_ms=round(total_latency, 1),
        packet_loss_percent=round(packet_loss, 1),
        hops=hops,
    )


async def _trace_hops(target: str) -> AsyncIterator[dict]:
    if settings.use_scapy:
        try:
            async for hop in run_scapy_traceroute(target):
                yield hop
            return
        except (RuntimeError, OSError) as exc:
            # Scapy commonly requires elevated privileges; fall back to the
            # system traceroute, but don't silently swallow arbitrary bugs.
            import logging
            logging.getLogger(__name__).warning("Scapy traceroute unavailable; using system traceroute: %s", exc)

    async for hop in run_system_traceroute(target):
        yield hop


ProgressCallback = Callable[[dict], None]


async def execute_traceroute(
    target: str,
    on_hop: ProgressCallback | None = None,
    on_status: ProgressCallback | None = None,
) -> TracerouteResult:
    clean_target = validate_target(target)
    destination_ip = resolve_destination_ip(clean_target)

    if on_status:
        on_status({"type": "status", "stage": "resolving", "message": "Resolving destination"})
    if on_status:
        on_status({"type": "status", "stage": "probing", "message": "Sending TTL probes"})
    if on_status:
        on_status({"type": "status", "stage": "discovering", "message": "Discovering network hops"})

    raw_hops: list[dict] = []
    async for raw in _trace_hops(clean_target):
        raw_hops.append(raw)
        if on_hop:
            on_hop({"type": "hop_discovered", "hop": raw})

    if on_status:
        on_status({"type": "status", "stage": "geolocating", "message": "Resolving router locations"})

    enriched: list[Hop] = []
    for raw in raw_hops:
        data = await enrich_hop(raw)
        enriched.append(Hop(**data))

    if on_status:
        on_status({"type": "status", "stage": "building", "message": "Building geographical route"})

    return _compute_stats(clean_target, enriched, destination_ip)


async def stream_traceroute(target: str) -> AsyncIterator[dict]:
    """Yield SSE events as hops are discovered and enriched."""
    try:
        clean_target = validate_target(target)
    except ValueError as exc:
        yield {"type": "error", "error": str(exc)}
        return

    destination_ip = resolve_destination_ip(clean_target)

    yield {"type": "status", "stage": "resolving", "message": "Resolving destination"}
    yield {"type": "status", "stage": "probing", "message": "Sending TTL probes"}
    yield {"type": "status", "stage": "discovering", "message": "Discovering network hops"}

    enriched_hops: list[Hop] = []

    try:
        async for raw in _trace_hops(clean_target):
            data = await enrich_hop(raw)
            hop = Hop(**data)
            enriched_hops.append(hop)
            yield {"type": "hop_discovered", "hop": hop.model_dump()}
    except Exception:
        import logging
        logging.getLogger(__name__).exception("Streaming traceroute failed")
        yield {"type": "error", "error": "Traceroute failed. Check the destination and server network permissions."}
        return

    yield {"type": "status", "stage": "geolocating", "message": "Resolving router locations"}
    yield {"type": "status", "stage": "building", "message": "Building geographical route"}

    result = _compute_stats(clean_target, enriched_hops, destination_ip)
    yield {"type": "complete", "result": result.model_dump()}
