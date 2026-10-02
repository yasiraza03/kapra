"""The honesty taxonomy and capture vocabulary — the soul of kapra."""

from __future__ import annotations

from enum import StrEnum

GENOME_SCHEMA_VERSION = "1.0.0"


class Tier(StrEnum):
    """The honesty tier of a claim.

    MEASURED  — computed directly from pixels. Deterministic. Reproducible.
    ESTIMATED — a model prediction carrying a confidence / interval.
    INFERRED  — a hypothesis reasoned from the measured+estimated layers,
                explicitly labelled as inference.
    """

    MEASURED = "MEASURED"
    ESTIMATED = "ESTIMATED"
    INFERRED = "INFERRED"


class ShotType(StrEnum):
    """The role a photograph plays in analysis."""

    FULL_FRONT = "full-front"
    FULL_BACK = "full-back"
    MACRO = "macro"
    DETAIL = "detail"
    LABEL = "label"
    BACKLIT = "backlit"
