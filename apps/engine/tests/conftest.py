"""Shared test fixtures and repo-path helpers."""

from __future__ import annotations

import json
import os
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

# Point persistence at a throwaway SQLite file BEFORE anything reads settings,
# so tests never touch a real database or litter the repo.
_TMP_DB = Path(tempfile.gettempdir()) / "kapra_test.sqlite3"
_TMP_DB.unlink(missing_ok=True)
os.environ.setdefault("KAPRA_DATABASE_URL", f"sqlite:///{_TMP_DB.as_posix()}")

import cv2
import numpy as np
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


def _synthetic_weave(period: float = 8.0, size: int = 600) -> bytes:
    """A diagonal grating (period/√2 perpendicular period) — a known twill-like weave."""
    yy, xx = np.mgrid[0:size, 0:size]
    grid = np.sin(2 * np.pi * (xx + yy) / period) * 0.5 + 0.5
    gray = (grid * 180 + 40).astype(np.uint8)
    rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
    rgb[:, :, 2] = np.clip(rgb[:, :, 2].astype(int) + 40, 0, 255)  # slight blue tint
    ok, buf = cv2.imencode(".png", cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))
    assert ok
    return bytes(buf.tobytes())


@pytest.fixture
def weave_png() -> bytes:
    return _synthetic_weave()


def _synthetic_plain_weave(period: int = 10, size: int = 640) -> bytes:
    """A rendered plain (over-under) weave with rounded yarn shading.

    Its off-axis lattice structure sits at sqrt(2) x the thread period, which is
    what the weave_family extractor keys on.
    """
    n = size // period + 1
    i = np.arange(n)[:, None]
    j = np.arange(n)[None, :]
    mask = np.kron(((i + j) % 2) == 0, np.ones((period, period), dtype=bool))[:size, :size]

    t = (np.arange(size) % period) / period
    profile = np.sin(np.pi * t) ** 0.55
    warp = np.broadcast_to(profile[None, :], (size, size))
    weft = np.broadcast_to(profile[:, None], (size, size))
    base = np.where(mask, warp, weft) * np.where(mask, 1.0, 0.88)

    gray = np.clip(base * 190 + 35, 0, 255).astype(np.uint8)
    rgb = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
    ok, buf = cv2.imencode(".png", cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))
    assert ok
    return bytes(buf.tobytes())


@pytest.fixture
def plain_weave_png() -> bytes:
    return _synthetic_plain_weave()


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
