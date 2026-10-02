"""The orchestrator: decode -> build context -> run extractors -> assemble Genome.

Each extractor is isolated: if one fails, it becomes a warning and the rest of
the genome still assembles. MEASURED genes are deterministic, so a genome is
reproducible for the same input.
"""

from __future__ import annotations

import secrets
from datetime import UTC, datetime

from kapra_engine.core import get_logger
from kapra_engine.core.logging import timed
from kapra_engine.domain import Gene, Genome, Shot, Source
from kapra_engine.domain.tiers import ShotType
from kapra_engine.extractors import GarmentContext, registry
from kapra_engine.imaging import decode_rgb, downscale, encode_png_datauri

log = get_logger("kapra.orchestrator")

_PREVIEW_MAX_SIDE = 768


def _new_id() -> str:
    return f"gen_{secrets.token_hex(8)}"


def analyze_image(data: bytes, *, shot_type: ShotType = ShotType.MACRO) -> Genome:
    rgb = decode_rgb(data)
    height, width = rgb.shape[:2]
    ctx = GarmentContext.from_image(rgb, shot_id="s1", shot_type=shot_type)

    genes: list[Gene] = []
    timings: dict[str, float] = {}
    for extractor in registry():
        try:
            with timed(log, extractor.id) as t:
                genes.append(extractor.extract(ctx))
            timings[extractor.id] = t["ms"]
        except Exception as exc:
            log.warning("extractor %s failed: %s", extractor.id, exc)
            ctx.warn(f"gene '{extractor.id}' could not be computed: {exc}")

    preview_uri = encode_png_datauri(downscale(rgb, _PREVIEW_MAX_SIDE))

    return Genome(
        schema_version="1.0.0",
        id=_new_id(),
        created_at=datetime.now(UTC),
        source=Source(
            shots=[
                Shot(
                    id="s1",
                    type=shot_type,
                    width=width,
                    height=height,
                    uri=preview_uri,
                )
            ]
        ),
        genes=genes,
        timings=timings or None,
        warnings=ctx.warnings or None,
    )
