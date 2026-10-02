"""FastAPI application entrypoint for the kapra engine."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from kapra_engine import __version__
from kapra_engine.api import health_router
from kapra_engine.core import configure_logging, get_settings

settings = get_settings()
configure_logging(settings.log_level)

app = FastAPI(
    title="kapra engine",
    version=__version__,
    description=(
        "Garment forensics. Feed it photographs; it reconstructs the garment's "
        "genome using real computer vision, and tells you exactly how confident "
        "it is and why."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {"service": "kapra-engine", "docs": "/docs", "health": "/health"}
