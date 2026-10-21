"""HTTP and SSE endpoints for traceroute execution."""

import json
import logging

from fastapi import APIRouter, HTTPException, Query
from sse_starlette.sse import EventSourceResponse

from app.models.schemas import TraceRequest, TracerouteResult
from app.services.traceroute_service import execute_traceroute, stream_traceroute

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["traceroute"])


@router.post("/traceroute", response_model=TracerouteResult)
async def traceroute(request: TraceRequest) -> TracerouteResult:
    try:
        return await execute_traceroute(request.target)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception:
        logger.exception("Unexpected traceroute failure")
        raise HTTPException(status_code=500, detail="An unexpected traceroute error occurred.") from None


@router.get("/traceroute/stream")
async def traceroute_stream(target: str = Query(..., min_length=1, max_length=253)) -> EventSourceResponse:
    async def event_generator():
        async for event in stream_traceroute(target):
            yield {"data": json.dumps(event)}

    return EventSourceResponse(event_generator(), ping=15)
