"""Optional Scapy-based traceroute (requires elevated privileges on most systems)."""

from collections.abc import AsyncIterator

from app.config import settings


async def run_scapy_traceroute(target: str) -> AsyncIterator[dict]:
    if not settings.use_scapy:
        raise RuntimeError("Scapy traceroute is disabled")

    try:
        from scapy.all import IP, ICMP, sr1  # type: ignore
        import socket
    except ImportError as exc:
        raise RuntimeError("Scapy is not installed") from exc

    destination_ip = socket.gethostbyname(target)
    max_hops = settings.max_hops

    for ttl in range(1, max_hops + 1):
        packet = IP(dst=destination_ip, ttl=ttl) / ICMP()
        reply = sr1(packet, verbose=0, timeout=2)

        if reply is None:
            yield {
                "hop": ttl,
                "ip": None,
                "hostname": None,
                "latency_ms": None,
                "packet_loss_percent": 100.0,
                "status": "timeout",
            }
            continue

        latency_ms = (reply.time - packet.sent_time) * 1000 if hasattr(reply, "time") else None
        src_ip = reply.src

        hostname = None
        try:
            hostname = socket.gethostbyaddr(src_ip)[0]
        except (socket.herror, socket.gaierror):
            pass

        yield {
            "hop": ttl,
            "ip": src_ip,
            "hostname": hostname,
            "latency_ms": round(latency_ms, 2) if latency_ms else None,
            "packet_loss_percent": 0.0,
            "status": "success",
        }

        if src_ip == destination_ip:
            break
