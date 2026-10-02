"""Health & version endpoints — the Phase 0 proof-of-life."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from kapra_engine import __version__
from kapra_engine.domain import GENOME_SCHEMA_VERSION

router = APIRouter(tags=["meta"])


class HealthResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    status: str
    service: str
    version: str
    genome_schema_version: str


@router.get("/health", response_model=HealthResponse, summary="Liveness + versions")
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="kapra-engine",
        version=__version__,
        genome_schema_version=GENOME_SCHEMA_VERSION,
    )
