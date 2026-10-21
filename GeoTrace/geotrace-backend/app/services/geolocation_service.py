import asyncio
import logging
import socket
import time
from collections import OrderedDict

import httpx

from app.config import settings
from app.services.validators import classify_ip

logger = logging.getLogger("geotrace.geolocation")

_GEO_CACHE_MAX_ENTRIES = 512
_GEO_CACHE_TTL_SECONDS = 3600
_geo_cache: OrderedDict[str, tuple[float, dict]] = OrderedDict()


def _cache_get(ip: str) -> dict | None:
    cached = _geo_cache.get(ip)
    if cached is None:
        return None
    created_at, value = cached
    if time.monotonic() - created_at > _GEO_CACHE_TTL_SECONDS:
        _geo_cache.pop(ip, None)
        return None
    _geo_cache.move_to_end(ip)
    return dict(value)


def _cache_set(ip: str, value: dict) -> None:
    _geo_cache[ip] = (time.monotonic(), dict(value))
    _geo_cache.move_to_end(ip)
    while len(_geo_cache) > _GEO_CACHE_MAX_ENTRIES:
        _geo_cache.popitem(last=False)

_EMPTY_RESULT = {
    "latitude": None,
    "longitude": None,
    "city": None,
    "country": None,
    "isp": None,
    "asn": None,
    "hostname": None,
}


async def _reverse_dns(ip: str) -> str | None:
    """Best-effort PTR lookup, independent of the geolocation HTTP API.

    This uses plain OS-level DNS, which tends to work even on networks that
    block/filter a specific third-party geolocation API domain.
    """
    try:
        hostname, _, _ = await asyncio.wait_for(
            asyncio.to_thread(socket.gethostbyaddr, ip), timeout=3.0
        )
        return hostname
    except (socket.herror, socket.gaierror, asyncio.TimeoutError, OSError):
        return None


async def _fetch_geo(ip: str, url: str) -> httpx.Response:
    async with httpx.AsyncClient(timeout=8.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response


async def lookup_ip(ip: str) -> dict:
    """Fetch geolocation / ISP / ASN for a public IP via ipwho.is (HTTPS,
    no signup/API key required).

    Earlier providers ruled out along the way:
    - ip-api.com: HTTP-only on its free tier, gets silently blackholed by
      some ISPs — requests hang until they time out with no explanation.
    - ipapi.co: HTTPS, but its unauthenticated free tier rate-limits almost
      immediately (HTTP 429) for many users.
    ipwho.is is HTTPS-native with a much more generous free/no-key tier.
    """
    non_public_label = classify_ip(ip)
    if non_public_label:
        return {
            "latitude": None,
            "longitude": None,
            "city": None,
            "country": None,
            "isp": non_public_label,
            "asn": None,
        }

    cached = _cache_get(ip)
    if cached is not None:
        return cached

    url = f"{settings.geo_api_url}/{ip}"

    for attempt in (1, 2):
        try:
            response = await _fetch_geo(ip, url)
            data = response.json()
            break
        except httpx.TimeoutException:
            logger.warning("Geolocation lookup for %s timed out contacting %s", ip, url)
            result = dict(_EMPTY_RESULT)
            _cache_set(ip, result)
            return result
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 429 and attempt == 1:
                logger.info("Geolocation lookup for %s rate-limited, retrying once", ip)
                await asyncio.sleep(1.5)
                continue
            logger.warning(
                "Geolocation lookup for %s failed: HTTP %s from %s — %s",
                ip,
                exc.response.status_code,
                url,
                exc.response.text[:200],
            )
            result = dict(_EMPTY_RESULT)
            _cache_set(ip, result)
            return result
        except (httpx.HTTPError, ValueError) as exc:
            logger.warning(
                "Geolocation lookup for %s failed: %s: %s", ip, type(exc).__name__, exc
            )
            result = dict(_EMPTY_RESULT)
            _cache_set(ip, result)
            return result
    else:
        result = dict(_EMPTY_RESULT)
        _cache_set(ip, result)
        return result

    if data.get("success") is False:
        logger.warning(
            "Geolocation API returned failure for %s: %s",
            ip,
            data.get("message", "no message"),
        )
        result = dict(_EMPTY_RESULT)
    else:
        connection = data.get("connection") or {}
        asn_raw = connection.get("asn")
        asn = f"AS{asn_raw}" if isinstance(asn_raw, int) else asn_raw
        result = {
            "latitude": data.get("latitude"),
            "longitude": data.get("longitude"),
            "city": data.get("city"),
            "country": data.get("country"),
            "isp": connection.get("isp") or connection.get("org"),
            "asn": asn,
            "hostname": None,
        }

    _cache_set(ip, result)
    return result


async def enrich_hop(hop: dict) -> dict:
    ip = hop.get("ip")
    if not ip:
        return hop

    if classify_ip(ip):
        # Private/CGNAT/reserved ranges: skip the network calls entirely,
        # they won't resolve to anything meaningful.
        geo = await lookup_ip(ip)
        hostname = hop.get("hostname")
    else:
        geo_task = asyncio.create_task(lookup_ip(ip))
        dns_task = asyncio.create_task(_reverse_dns(ip))
        geo, reverse_hostname = await asyncio.gather(geo_task, dns_task)
        hostname = hop.get("hostname") or geo.get("hostname") or reverse_hostname

    return {
        **hop,
        "hostname": hostname,
        "latitude": geo["latitude"],
        "longitude": geo["longitude"],
        "city": geo["city"],
        "country": geo["country"],
        "isp": geo["isp"],
        "asn": geo["asn"],
    }
