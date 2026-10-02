"""Texture fineness — MEASURED via Local Binary Patterns + micro-detail energy."""

from __future__ import annotations

import cv2
import numpy as np
from skimage.feature import local_binary_pattern

from kapra_engine.domain import Evidence, Gene, VizSpec
from kapra_engine.domain.tiers import ShotType, Tier

from .base import GarmentContext, register

_P = 24
_R = 3.0


def _scale_label(lap_var: float) -> tuple[str, float]:
    """Bucket micro-detail energy into a coarse/medium/fine scale."""
    if lap_var >= 450:
        return ("fine", 0.75)
    if lap_var >= 120:
        return ("medium", 0.7)
    return ("coarse", 0.7)


class TextureExtractor:
    id = "texture"
    label = "Texture Fineness"
    tier = Tier.MEASURED
    requires: tuple[ShotType, ...] = (ShotType.MACRO,)

    def extract(self, ctx: GarmentContext) -> Gene:
        gray_u8 = (np.clip(ctx.gray, 0, 1) * 255).astype(np.uint8)

        lbp = local_binary_pattern(gray_u8, _P, _R, method="uniform")
        n_bins = _P + 2
        hist, _ = np.histogram(lbp, bins=n_bins, range=(0, n_bins), density=True)
        uniformity = float(np.sum(hist**2))

        lap_var = float(cv2.Laplacian(gray_u8, cv2.CV_64F).var())
        scale, conf = _scale_label(lap_var)

        return Gene(
            gene_id=self.id,
            tier=self.tier,
            label=self.label,
            value={
                "scale": scale,
                "lbpUniformity": round(uniformity, 4),
                "laplacianVar": round(lap_var, 1),
            },
            summary=f"{scale.capitalize()} texture (micro-detail energy {lap_var:.0f}).",
            confidence=conf,
            evidence=[
                Evidence(
                    kind="measurement",
                    label="Laplacian variance (micro-detail energy)",
                    value=round(lap_var, 1),
                ),
                Evidence(
                    kind="measurement",
                    label="LBP uniformity",
                    detail="energy of the local-binary-pattern histogram",
                    value=round(uniformity, 4),
                    viz_ref="texture-lbp",
                ),
            ],
            viz=[
                VizSpec(
                    id="texture-lbp",
                    kind="histogram",
                    title="Local Binary Pattern histogram",
                    caption="Distribution of local micro-structure codes.",
                    data={
                        "label": "LBP code",
                        "bins": [round(float(x), 4) for x in hist.tolist()],
                    },
                )
            ],
        )


register(TextureExtractor())
