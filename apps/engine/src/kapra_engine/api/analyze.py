"""Analysis endpoints: upload a garment photo, get (and later fetch) its genome."""

from __future__ import annotations

from typing import Annotated, Any

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from kapra_engine.core import get_logger
from kapra_engine.orchestrator import analyze_image
from kapra_engine.persistence import get_repository

router = APIRouter(tags=["analysis"])
log = get_logger("kapra.api")

_MAX_BYTES = 15 * 1024 * 1024  # 15 MB


@router.post("/analyze", summary="Analyze a garment photo into a genome")
async def analyze(file: Annotated[UploadFile, File()]) -> JSONResponse:
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=415, detail="expected an image upload")

    data = await file.read()
    if len(data) > _MAX_BYTES:
        raise HTTPException(status_code=413, detail="image exceeds 15MB limit")
    if not data:
        raise HTTPException(status_code=400, detail="empty upload")

    try:
        genome = analyze_image(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    get_repository().save(genome)
    log.info("analyzed %s -> %d genes", genome.id, len(genome.genes))
    return JSONResponse(genome.to_wire())


@router.get("/genomes", summary="List recent genome summaries (the archive)")
def list_genomes(limit: int = 24) -> JSONResponse:
    capped = max(1, min(limit, 100))
    return JSONResponse({"items": get_repository().list_recent(capped)})


@router.get("/genome/{genome_id}", summary="Fetch a stored genome")
def get_genome(genome_id: str) -> JSONResponse:
    wire: dict[str, Any] | None = get_repository().get(genome_id)
    if wire is None:
        raise HTTPException(status_code=404, detail="genome not found")
    return JSONResponse(wire)
