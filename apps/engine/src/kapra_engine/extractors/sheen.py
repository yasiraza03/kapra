"""Finishing / sheen — MEASURED proxy from the specular-highlight distribution.

A matte fabric scatters light evenly; a mercerized or coated finish produces a
bright specular tail. We read that tail from the value-channel histogram. This is
a proxy (lighting-dependent), so its confidence is honest about that.
"""

from __future__ import annotations

import cv2
import numpy as np

from kapra_engine.domain import Evidence, Gene, VizSpec
from kapra_engine.domain.tiers import ShotType, Tier

from .base import GarmentContext, register


def _finish_label(gloss_ratio: float) -> str:
    if gloss_ratio >= 0.08:
        return "sheen"
    if gloss_ratio >= 0.03:
        return "semi-matte"
    return "matte"


class SheenExtractor:
    id = "sheen"
    label = "Finish / Sheen"
    tier = Tier.MEASURED
    requires: tuple[ShotType, ...] = (ShotType.MACRO,)

    def extract(self, ctx: GarmentContext) -> Gene:
        hsv = cv2.cvtColor(ctx.patch, cv2.COLOR_RGB2HSV)
        value = hsv[:, :, 2].astype(np.float64)
        sat = hsv[:, :, 1].astype(np.float64)

        # specular highlights: bright AND low-saturation pixels.
        bright = value > float(np.percentile(value, 98))
        specular = bright & (sat < 60)
        gloss_ratio = float(specular.mean())
        finish = _finish_label(gloss_ratio)

        hist, _ = np.histogram(value, bins=32, range=(0, 255), density=True)

        return Gene(
            gene_id=self.id,
            tier=self.tier,
            label=self.label,
            value={
                "finish": finish,
                "glossRatio": round(gloss_ratio, 4),
                "meanBrightness": round(float(value.mean()) / 255, 3),
            },
            summary=f"{finish.capitalize()} finish (specular share {gloss_ratio:.1%}).",
            confidence=0.6,
            evidence=[
                Evidence(
                    kind="measurement",
                    label="Specular highlight share",
                    detail="bright, low-saturation pixel fraction (lighting-dependent)",
                    value=round(gloss_ratio, 4),
                    viz_ref="sheen-hist",
                )
            ],
            viz=[
                VizSpec(
                    id="sheen-hist",
                    kind="histogram",
                    title="Brightness distribution",
                    caption="A long bright tail indicates a glossier finish.",
                    data={
                        "label": "value",
                        "bins": [round(float(x), 5) for x in hist.tolist()],
                    },
                )
            ],
        )


register(SheenExtractor())
