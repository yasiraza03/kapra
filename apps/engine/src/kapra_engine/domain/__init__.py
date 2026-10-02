"""Domain models — the Python mirror of @kapra/genome-schema.

The JSON Schema in packages/genome-schema is canonical. These Pydantic models
mirror it and are kept honest by tests/test_genome_conformance.py, which dumps
a model instance and validates it against that very schema.
"""

from .genome import (
    Evidence,
    Gene,
    Genome,
    Interval,
    Shot,
    Source,
    VizSpec,
)
from .tiers import GENOME_SCHEMA_VERSION, ShotType, Tier

__all__ = [
    "GENOME_SCHEMA_VERSION",
    "Evidence",
    "Gene",
    "Genome",
    "Interval",
    "Shot",
    "ShotType",
    "Source",
    "Tier",
    "VizSpec",
]
