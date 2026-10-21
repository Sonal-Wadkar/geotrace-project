"""Run GeoTrace backend: uvicorn app.main:app --reload --port 8000"""

import sys

import uvicorn

from app.config import settings

if __name__ == "__main__":
    # On Windows, uvicorn's --reload forces the WindowsSelectorEventLoop,
    # which does NOT support asyncio.create_subprocess_exec — that's what
    # launches `tracert`. That raises NotImplementedError (a RuntimeError
    # subclass), which the traceroute route maps straight to a 502.
    # Reload isn't needed for normal use, so just disable it on Windows.
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=sys.platform != "win32",
    )