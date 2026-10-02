"""Structured logging. Timing per extractor is a first-class instrument touch."""

from __future__ import annotations

import logging
import sys
import time
from collections.abc import Iterator
from contextlib import contextmanager

_CONFIGURED = False


def configure_logging(level: str = "INFO") -> None:
    global _CONFIGURED
    if _CONFIGURED:
        return
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s %(levelname)-7s [%(name)s] %(message)s",
            datefmt="%H:%M:%S",
        )
    )
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level.upper())
    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


@contextmanager
def timed(logger: logging.Logger, label: str) -> Iterator[dict[str, float]]:
    """Time a block; yields a dict whose 'ms' is filled in on exit.

    Used by the orchestrator to populate Genome.timings per extractor.
    """
    start = time.perf_counter()
    out: dict[str, float] = {"ms": 0.0}
    try:
        yield out
    finally:
        out["ms"] = round((time.perf_counter() - start) * 1000, 2)
        logger.debug("%s took %.2fms", label, out["ms"])
