import ipaddress
import re

IPV4_RE = re.compile(
    r"^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$"
)
DOMAIN_RE = re.compile(
    r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$"
)


def sanitize_target(value: str) -> str:
    return value.strip().lower()


def is_valid_ipv4(value: str) -> bool:
    return bool(IPV4_RE.match(value))


def is_valid_ipv6(value: str) -> bool:
    try:
        ipaddress.IPv6Address(value)
        return True
    except ipaddress.AddressValueError:
        return False


def is_valid_domain(value: str) -> bool:
    return bool(DOMAIN_RE.match(value))


def validate_target(value: str) -> str:
    cleaned = sanitize_target(value)
    if not cleaned:
        raise ValueError("Target cannot be empty")
    if not (is_valid_ipv4(cleaned) or is_valid_ipv6(cleaned) or is_valid_domain(cleaned)):
        raise ValueError("Invalid domain or IP address")
    return cleaned


CGNAT_NETWORK = ipaddress.ip_network("100.64.0.0/10")


def classify_ip(ip: str) -> str | None:
    """Return a human-readable label if `ip` is not globally routable
    (so callers can skip an external geolocation lookup that would fail
    anyway), or None if it's a normal public address."""
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return None

    if addr.is_loopback:
        return "Loopback"
    if addr.is_link_local:
        return "Link-Local"
    if addr.version == 4 and addr in CGNAT_NETWORK:
        # RFC 6598 — used by ISPs/mobile carriers for Carrier-Grade NAT,
        # sits between your router and the public internet.
        return "ISP Network (CGNAT)"
    if addr.is_private:
        return "Private Network"
    if addr.is_reserved:
        return "Reserved Range"
    return None


def is_private_ip(ip: str) -> bool:
    return classify_ip(ip) is not None
