"""Shared test fixtures and repo-path helpers."""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import pytest

from kapra_engine.domain import (
    Evidence,
    Gene,
    Genome,
    Shot,
    Source,
    VizSpec,
)
from kapra_engine.domain.tiers import GENOME_SCHEMA_VERSION, ShotType, Tier


def _find_repo_root(start: Path) -> Path:
    for p in [start, *start.parents]:
        if (p / "pnpm-workspace.yaml").exists():
            return p
    raise RuntimeError("repo root (pnpm-workspace.yaml) not found")


REPO_ROOT = _find_repo_root(Path(__file__).resolve())
SCHEMA_PATH = REPO_ROOT / "packages" / "genome-schema" / "schema" / "genome.schema.v1.json"


@pytest.fixture(scope="session")
def genome_json_schema() -> dict[str, Any]:
    return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


@pytest.fixture
def sample_genome() -> Genome:
    return Genome(
        schema_version=GENOME_SCHEMA_VERSION,
        id="gen_test_0001",
        created_at=datetime(2026, 10, 2, 12, 0, 0, tzinfo=UTC),
        source=Source(shots=[Shot(id="s1", type=ShotType.MACRO, width=2048, height=2048)]),
        genes=[
            Gene(
                gene_id="weave",
                tier=Tier.MEASURED,
                label="Weave Structure",
                value={"family": "twill", "periodicityPx": 7.2, "orientationDeg": 63},
                summary="Twill weave, ~7px repeat at 63 degrees.",
                confidence=0.82,
                evidence=[
                    Evidence(kind="measurement", label="FFT dominant peak", value=0.14),
                ],
                viz=[VizSpec(id="weave-fft", kind="fft", title="Weave FFT")],
            )
        ],
    )
