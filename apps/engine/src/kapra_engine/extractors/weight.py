"""Fabric weight — ESTIMATED, and honest about a hard limit.

You cannot read grams per square metre off a photograph. Mass is not in the
pixels, and neither is absolute scale: the same cloth photographed closer looks
coarser. So this gene does three things rather than inventing a number:

1. states its assumption explicitly (a macro frames roughly 40mm of cloth),
2. derives thread density from that assumption and the measured thread period,
3. reports a weight *class* plus a wide g/m^2 interval at low confidence.

If a scale reference (a coin, a ruler, a fiducial) is ever detected during
capture, this becomes a genuine measurement. Until then it is a hint.
"""

from __future__ import annotations

import numpy as np

from kapra_engine.domain import Evidence, Gene, Interval, VizSpec
from kapra_engine.domain.tiers import ShotType, Tier

from .base import GarmentContext, register
from .weave import _thread_of

# What we assume a macro shot frames, edge to edge, in millimetres.
_ASSUMED_FRAME_MM = 40.0

# threads/cm -> (class, typical g/m^2 range). Coarser, fewer threads generally
# means a heavier cloth; fine, dense counts mean shirting weights.
_BANDS: tuple[tuple[float, str, int, int], ...] = (
    (14.0, "heavyweight", 300, 480),
    (22.0, "midweight", 200, 320),
    (34.0, "midweight", 140, 230),
    (50.0, "lightweight", 90, 160),
    (1e9, "lightweight", 60, 110),
)


def _classify(threads_per_cm: float) -> tuple[str, int, int]:
    for limit, label, low, high in _BANDS:
        if threads_per_cm < limit:
            return (label, low, high)
    return ("midweight", 150, 260)


class WeightExtractor:
    id = "weight"
    label = "Weight Class"
    tier = Tier.ESTIMATED
    requires: tuple[ShotType, ...] = (ShotType.MACRO,)

    def extract(self, ctx: GarmentContext) -> Gene:
        period_px, _angle, prominence = _thread_of(ctx)
        patch_px = float(ctx.patch.shape[0])

        if period_px <= 0 or patch_px <= 0:
            threads_per_cm = 0.0
        else:
            px_per_mm = patch_px / _ASSUMED_FRAME_MM
            period_mm = period_px / px_per_mm
            threads_per_cm = 10.0 / period_mm if period_mm > 0 else 0.0

        weight_class, gsm_low, gsm_high = _classify(threads_per_cm)

        # Confidence stays deliberately low: the scale assumption dominates the
        # error, so a crisp spectrum cannot rescue it.
        confidence = round(float(np.clip(0.22 + 0.25 * prominence, 0.15, 0.5)), 3)

        return Gene(
            gene_id=self.id,
            tier=self.tier,
            label=self.label,
            value={
                "class": weight_class,
                "gsmLow": gsm_low,
                "gsmHigh": gsm_high,
                "threadsPerCm": round(threads_per_cm, 1),
                "assumedFrameMm": _ASSUMED_FRAME_MM,
                "scaleReferenceDetected": False,
            },
            summary=(
                f"Probably {weight_class}, around {gsm_low}-{gsm_high} g/m² "
                f"(assuming the frame covers ~{_ASSUMED_FRAME_MM:.0f}mm of cloth)."
            ),
            confidence=confidence,
            interval=Interval(low=gsm_low, high=gsm_high, unit="g/m²", level=0.6),
            evidence=[
                Evidence(
                    kind="derivation",
                    label="Thread density from the measured repeat",
                    detail=f"assumes a {_ASSUMED_FRAME_MM:.0f}mm frame; no scale reference found",
                    value=f"{threads_per_cm:.1f} threads/cm",
                ),
                Evidence(
                    kind="reference",
                    label="Weight band for that density",
                    value=f"{gsm_low}-{gsm_high} g/m²",
                ),
            ],
            viz=[
                VizSpec(
                    id="weight-scale",
                    kind="bars",
                    title="Where this sits",
                    caption=(
                        "Typical ranges. Without a scale reference in frame this is a "
                        "hint, not a measurement."
                    ),
                    data={
                        "items": [
                            {
                                "label": "light",
                                "value": 1 if weight_class == "lightweight" else 0,
                                "max": 1,
                            },
                            {
                                "label": "mid",
                                "value": 1 if weight_class == "midweight" else 0,
                                "max": 1,
                            },
                            {
                                "label": "heavy",
                                "value": 1 if weight_class == "heavyweight" else 0,
                                "max": 1,
                            },
                        ]
                    },
                )
            ],
        )


register(WeightExtractor())
