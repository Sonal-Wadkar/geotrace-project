"""Cross-platform system traceroute runner with a strict overall deadline."""

from __future__ import annotations

import asyncio
import ipaddress
import platform
import re
import shutil
import socket
import time
from collections.abc import AsyncIterator

from app.config import settings


def resolve_destination_ip(target: str) -> str | None:
    """Resolve a literal IP or hostname, preserving IPv4/IPv6 support."""
    try:
        return str(ipaddress.ip_address(target))
    except ValueError:
        pass

    try:
        results = socket.getaddrinfo(target, None, type=socket.SOCK_DGRAM)
    except socket.gaierror:
        return None

    # Prefer IPv4 for hostnames because many Windows and home-network setups
    # resolve AAAA records even when IPv6 traceroute is not actually routable.
    # IPv6-only destinations still work through the fallback below.
    ipv4 = next((item[4][0] for item in results if item[0] == socket.AF_INET), None)
    if ipv4:
        return ipv4
    ipv6 = next((item[4][0] for item in results if item[0] == socket.AF_INET6), None)
    return ipv6


def _is_ip_address(token: str) -> bool:
    try:
        ipaddress.ip_address(token.strip("[]"))
        return True
    except ValueError:
        return False


def _extract_probe_latencies(tokens: list[str]) -> list[float | None]:
    values: list[float | None] = []
    i = 0
    while i < len(tokens):
        token = tokens[i].lower()
        if token == "*":
            values.append(None)
            i += 1
        elif token in ("<1", "<1ms"):
            values.append(0.5)
            i += 1
            if token == "<1" and i < len(tokens) and tokens[i].lower() == "ms":
                i += 1
        else:
            match = re.fullmatch(r"([0-9]+(?:\.[0-9]+)?)\s*ms", token)
            if match:
                values.append(float(match.group(1)))
                i += 1
                continue
            if (re.fullmatch(r"[0-9]+(?:\.[0-9]+)?", token)
                    and i + 1 < len(tokens) and tokens[i + 1].lower() == "ms"):
                values.append(float(token))
                i += 2
            else:
                i += 1
    return values


def _make_hop(hop_num: int, ip: str | None, probe_tokens: list[str], hostname: str | None = None) -> dict:
    probes = _extract_probe_latencies(probe_tokens)
    successful = [value for value in probes if value is not None]
    latency = round(sum(successful) / len(successful), 2) if successful else None
    # Do not claim a loss percentage when the parser could not identify any probes.
    loss = round((len(probes) - len(successful)) / len(probes) * 100, 1) if probes else 0.0
    return {
        "hop": hop_num,
        "ip": ip,
        "hostname": hostname,
        "latency_ms": latency,
        "packet_loss_percent": loss if probes else (100.0 if ip is None else 0.0),
        "status": "success" if ip and latency is not None else "timeout",
    }


def parse_unix_hop_line(line: str) -> dict | None:
    stripped = line.strip()
    match = re.match(r"^(\d+)\s+(.*)$", stripped)
    if not match:
        return None
    hop_num, rest = int(match.group(1)), match.group(2).strip()
    if not rest:
        return None
    tokens = rest.split()
    if all(token == "*" for token in tokens):
        return _make_hop(hop_num, None, tokens)

    ip_token = tokens[0].strip("[]")
    hostname = None
    if not _is_ip_address(ip_token):
        hostname = ip_token
        try:
            addresses = socket.getaddrinfo(ip_token, None, type=socket.SOCK_DGRAM)
            ip_token = addresses[0][4][0] if addresses else None
        except socket.gaierror:
            ip_token = None
    return _make_hop(hop_num, ip_token, tokens[1:], hostname)


def parse_windows_hop_line(line: str) -> dict | None:
    stripped = line.strip()
    match = re.match(r"^(\d+)\s+(.*)$", stripped)
    if not match:
        return None
    hop_num, rest = int(match.group(1)), match.group(2).strip()
    if "request timed out" in rest.lower() or rest == "* * *":
        return _make_hop(hop_num, None, ["*", "*", "*"])
    tokens = rest.split()
    ip_token = next((token.strip("[]") for token in reversed(tokens) if _is_ip_address(token.strip("[]"))), None)
    probe_tokens = tokens[:]
    if ip_token:
        # Remove the address token only; preserve all probe tokens.
        for index in range(len(probe_tokens) - 1, -1, -1):
            if probe_tokens[index].strip("[]") == ip_token:
                probe_tokens.pop(index)
                break
    return _make_hop(hop_num, ip_token, probe_tokens)


def parse_traceroute_line(line: str, is_windows: bool = False) -> dict | None:
    return parse_windows_hop_line(line) if is_windows else parse_unix_hop_line(line)


def build_traceroute_command(target: str) -> list[str]:
    system = platform.system().lower()
    try:
        literal_ip = ipaddress.ip_address(target)
        ipv6 = literal_ip.version == 6
    except ValueError:
        destination = resolve_destination_ip(target)
        ipv6 = bool(destination and ipaddress.ip_address(destination).version == 6)

    if system == "windows":
        executable = shutil.which("tracert")
        if not executable:
            raise RuntimeError("Windows tracert utility was not found.")
        # Keep each probe bounded; Windows' default wait can make a trace
        # exceed the application's overall timeout on ordinary filtered hops.
        args = [executable, "-d", "-h", str(settings.max_hops), "-w", "1000"]
        if ipv6:
            args.append("-6")
        else:
            args.append("-4")
        return [*args, target]

    executable_name = "traceroute6" if ipv6 and shutil.which("traceroute6") else "traceroute"
    executable = shutil.which(executable_name)
    if not executable:
        raise RuntimeError("The traceroute utility is not installed on this host.")
    args = [executable, "-n", "-m", str(settings.max_hops), "-q", "3", "-w", "2"]
    if ipv6:
        args.append("-6")
    else:
        args.append("-I")
    return [*args, target]


async def run_system_traceroute(target: str) -> AsyncIterator[dict]:
    """Yield parsed hops and enforce one deadline for the entire subprocess."""
    cmd = build_traceroute_command(target)
    is_windows = platform.system().lower() == "windows"
    destination_ip = resolve_destination_ip(target)
    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.DEVNULL,
        )
    except FileNotFoundError as exc:
        raise RuntimeError("The system traceroute utility is unavailable.") from exc

    assert process.stdout is not None
    deadline = time.monotonic() + settings.trace_timeout_seconds
    seen_hops: set[int] = set()
    reached_destination = False
    try:
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                if seen_hops:
                    # Return the hops already discovered as a partial trace.
                    break
                raise TimeoutError("Traceroute exceeded its overall time limit.")
            try:
                line_bytes = await asyncio.wait_for(process.stdout.readline(), timeout=remaining)
            except asyncio.TimeoutError as exc:
                if seen_hops:
                    # A slow/filtered route should not discard useful partial data.
                    break
                raise TimeoutError("Traceroute exceeded its overall time limit.") from exc
            if not line_bytes:
                break
            parsed = parse_traceroute_line(line_bytes.decode("utf-8", errors="replace"), is_windows)
            if not parsed or parsed["hop"] in seen_hops:
                continue
            seen_hops.add(parsed["hop"])
            yield parsed
            if destination_ip and parsed.get("ip") == destination_ip:
                reached_destination = True
                break
            # Do not stop after consecutive non-responsive hops: some routers
            # suppress TTL-expired replies while later hops still respond.
    finally:
        if process.returncode is None:
            process.terminate()
            try:
                await asyncio.wait_for(process.wait(), timeout=2)
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()
        else:
            await process.wait()

    if not seen_hops:
        raise RuntimeError("Traceroute returned no parseable hops. The host may block probes.")
