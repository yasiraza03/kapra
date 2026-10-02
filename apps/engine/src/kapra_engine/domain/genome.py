"""The Genome and its parts — Pydantic v2 mirror of genome.schema.v1.json.

Python fields are snake_case (idiomatic); the JSON wire format is camelCase (the
canonical schema). A camelCase alias generator bridges the two, so the Python
reads naturally while serialization matches the schema exactly.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from .tiers import GENOME_SCHEMA_VERSION, ShotType, Tier


class _Strict(BaseModel):
    """Base: camelCase wire aliases, and reject unknown fields so drift fails loud."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
        use_enum_values=True,
    )


class Shot(_Strict):
    id: str = Field(min_length=1)
    type: ShotType
    width: int | None = Field(default=None, ge=1)
    height: int | None = Field(default=None, ge=1)
    uri: str | None = None


class CaptureInfo(_Strict):
    white_balanced: bool | None = None
    color_card_detected: bool | None = None
    scale_fiducial_detected: bool | None = None
    perspective_corrected: bool | None = None


class Source(_Strict):
    shots: list[Shot] = Field(min_length=1)
    capture: CaptureInfo | None = None


class Interval(_Strict):
    low: float
    high: float
    unit: str | None = None
    level: float | None = Field(default=None, ge=0, le=1)


class Evidence(_Strict):
    kind: str  # measurement | model-output | reference | derivation
    label: str = Field(min_length=1)
    detail: str | None = None
    value: Any | None = None
    viz_ref: str | None = None


class VizSpec(_Strict):
    id: str = Field(min_length=1)
    kind: str  # fft | gabor | palette | contour | heatmap | histogram | overlay | bars
    title: str | None = None
    caption: str | None = None
    data: Any | None = None


class Gene(_Strict):
    """The output of one Extractor: a single gene of the garment's genome."""

    gene_id: str = Field(min_length=1)
    tier: Tier
    label: str
    value: Any
    summary: str | None = None
    confidence: float = Field(ge=0, le=1)
    interval: Interval | None = None
    evidence: list[Evidence] = Field(min_length=1)
    viz: list[VizSpec] | None = None


class Genome(_Strict):
    schema_version: str = GENOME_SCHEMA_VERSION
    id: str = Field(min_length=1)
    created_at: datetime
    source: Source
    genes: list[Gene]
    timings: dict[str, float] | None = None
    warnings: list[str] | None = None

    def to_wire(self) -> dict[str, Any]:
        """Dump to a JSON-ready, camelCase dict matching genome.schema.v1.json."""
        return self.model_dump(mode="json", by_alias=True, exclude_none=True)
