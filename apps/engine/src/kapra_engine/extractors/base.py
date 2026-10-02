"""The Extractor plugin system — the pattern the whole engine hinges on.

Add a gene = add a file that defines an Extractor and calls `register`. The
orchestrator discovers everything in the registry, asks each extractor which
shots it needs, runs the satisfiable ones, and assembles a single Genome.
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any, Protocol, TypeVar, runtime_checkable

import numpy as np

from kapra_engine.domain import Gene
from kapra_engine.domain.tiers import ShotType, Tier
from kapra_engine.imaging import Rgb, center_patch, downscale, to_gray01

_T = TypeVar("_T")


@dataclass
class GarmentContext:
    """Everything an extractor needs about one garment under analysis.

    For the vertical slice this wraps a single uploaded image; the same context
    grows to hold multiple shots (macro, full-front, ...) as capture lands.
    """

    shot_id: str
    shot_type: ShotType
    image: Rgb  # full RGB uint8, already downscaled for analysis
    warnings: list[str] = field(default_factory=list)

    _patch: Rgb | None = None
    _gray: np.ndarray | None = None
    _cache: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_image(
        cls, image: Rgb, *, shot_id: str, shot_type: ShotType, max_side: int = 1024
    ) -> GarmentContext:
        return cls(shot_id=shot_id, shot_type=shot_type, image=downscale(image, max_side))

    @property
    def patch(self) -> Rgb:
        """A clean centered interior crop — what fabric-level genes analyze."""
        if self._patch is None:
            self._patch = center_patch(self.image, frac=0.6)
        return self._patch

    @property
    def gray(self) -> np.ndarray:
        if self._gray is None:
            self._gray = to_gray01(self.patch)
        return self._gray

    def memo(self, key: str, factory: Callable[[], _T]) -> _T:
        """Cache an expensive derived value across extractors.

        Several genes read the same FFT; computing it once keeps the pipeline
        honest about cost without coupling the extractors to each other.
        """
        if key not in self._cache:
            self._cache[key] = factory()
        value: _T = self._cache[key]
        return value

    def warn(self, message: str) -> None:
        self.warnings.append(message)


@runtime_checkable
class Extractor(Protocol):
    """One gene. Deterministic for MEASURED tiers: same pixels -> same numbers."""

    id: str
    label: str
    tier: Tier
    requires: tuple[ShotType, ...]

    def extract(self, ctx: GarmentContext) -> Gene: ...


_REGISTRY: dict[str, Extractor] = {}


def register(extractor: Extractor) -> Extractor:
    """Register an extractor instance under its id (idempotent per id)."""
    if extractor.id in _REGISTRY:
        raise ValueError(f"duplicate extractor id: {extractor.id!r}")
    _REGISTRY[extractor.id] = extractor
    return extractor


def registry() -> list[Extractor]:
    return list(_REGISTRY.values())


def clear_registry() -> None:  # test support
    _REGISTRY.clear()
