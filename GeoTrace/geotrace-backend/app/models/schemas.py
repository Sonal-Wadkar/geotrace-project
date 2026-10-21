from typing import Literal

# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field


HopStatus = Literal["success", "timeout", "unresolved", "error"]
TraceStatus = Literal["complete", "partial", "failed", "unreachable"]


class TraceRequest(BaseModel):
    target: str = Field(..., min_length=1, max_length=253)


class Hop(BaseModel):
    hop: int
    ip: str | None = None
    hostname: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    city: str | None = None
    country: str | None = None
    isp: str | None = None
    asn: str | None = None
    latency_ms: float | None = None
    packet_loss_percent: float = 0.0
    status: HopStatus = "success"


class TracerouteResult(BaseModel):
    target: str
    destination_ip: str | None = None
    status: TraceStatus
    total_hops: int
    total_latency_ms: float
    packet_loss_percent: float
    hops: list[Hop]


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "geotrace-backend"
