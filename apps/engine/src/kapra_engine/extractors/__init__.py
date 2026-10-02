"""Extractor plugin package. Importing it registers every built-in gene."""

# Importing each module runs its register(...) call. Order is not significant.
from . import color, sheen, texture, weave, weight  # noqa: F401  (register on import)
from .base import Extractor, GarmentContext, clear_registry, register, registry

__all__ = [
    "Extractor",
    "GarmentContext",
    "clear_registry",
    "register",
    "registry",
]
