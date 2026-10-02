"""Color & dye evenness — MEASURED, in perceptual CIELAB space.

Palette via k-means in CIELAB (perceptually uniform), dye evenness via the mean
CIEDE2000 distance of each pixel to its cluster centre. Both are deterministic
(seeded k-means), so the same pixels yield the same readings.
"""

from __future__ import annotations

import cv2
import numpy as np
import numpy.typing as npt
from skimage.color import deltaE_ciede2000, lab2rgb, rgb2lab

from kapra_engine.domain import Evidence, Gene, VizSpec
from kapra_engine.domain.tiers import ShotType, Tier
from kapra_engine.imaging.core import rgb_to_hex

from .base import GarmentContext, register

_K = 5
_SAMPLE_SIDE = 128


def _lab_pixels(patch: npt.NDArray[np.uint8]) -> npt.NDArray[np.float32]:
    small = cv2.resize(patch, (_SAMPLE_SIDE, _SAMPLE_SIDE), interpolation=cv2.INTER_AREA)
    lab = rgb2lab(small.astype(np.float64) / 255.0)
    return lab.reshape(-1, 3).astype(np.float32)


def _kmeans_lab(
    lab: npt.NDArray[np.float32], k: int
) -> tuple[npt.NDArray[np.int32], npt.NDArray[np.float32]]:
    cv2.setRNGSeed(42)  # deterministic MEASURED output
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5)
    # cv2's bundled stubs predate numpy-2 shape typing, so the overload check
    # misfires on a perfectly valid float32 array.
    _compact, labels, centers = cv2.kmeans(  # type: ignore[call-overload]
        lab, k, None, criteria, 4, cv2.KMEANS_PP_CENTERS
    )
    return labels.flatten(), centers


class ColorExtractor:
    id = "color"
    label = "Color & Dye Evenness"
    tier = Tier.MEASURED
    requires: tuple[ShotType, ...] = (ShotType.MACRO,)

    def extract(self, ctx: GarmentContext) -> Gene:
        lab = _lab_pixels(ctx.patch)
        labels, centers = _kmeans_lab(lab, _K)

        counts = np.bincount(labels, minlength=_K).astype(np.float64)
        proportions = counts / counts.sum()

        # dye evenness: mean CIEDE2000 of each pixel to its assigned centre.
        assigned = centers[labels]
        de = deltaE_ciede2000(lab, assigned)
        de_mean = float(np.mean(de))
        evenness = float(np.clip(1.0 - de_mean / 12.0, 0.0, 1.0))

        order = np.argsort(proportions)[::-1]
        swatches = []
        for i in order:
            lab_c = centers[i].astype(np.float64)
            rgb = lab2rgb(lab_c.reshape(1, 1, 3)).reshape(3)
            rgb_u8 = tuple(round(float(v) * 255) for v in np.clip(rgb, 0, 1))
            swatches.append(
                {
                    "hex": rgb_to_hex(rgb_u8),  # type: ignore[arg-type]
                    "rgb": list(rgb_u8),
                    "lab": [round(float(x), 1) for x in lab_c],
                    "proportion": round(float(proportions[i]), 3),
                }
            )

        dominant_hex = swatches[0]["hex"]

        return Gene(
            gene_id=self.id,
            tier=self.tier,
            label=self.label,
            value={
                "dominantHex": dominant_hex,
                "palette": swatches,
                "deltaE2000Mean": round(de_mean, 2),
                "evenness": round(evenness, 3),
            },
            summary=(
                f"Dominant {dominant_hex}; {len(swatches)}-color palette, "
                f"dye evenness {evenness:.0%} (mean ΔE {de_mean:.1f})."
            ),
            confidence=0.9,
            evidence=[
                Evidence(
                    kind="measurement",
                    label="CIEDE2000 mean intra-cluster distance",
                    detail="lower = more even dyeing",
                    value=round(de_mean, 2),
                    viz_ref="color-palette",
                ),
                Evidence(
                    kind="measurement",
                    label="Dominant cluster share",
                    value=swatches[0]["proportion"],
                ),
            ],
            viz=[
                VizSpec(
                    id="color-palette",
                    kind="palette",
                    title="CIELAB palette",
                    caption="k-means clusters in perceptual color space, by area share.",
                    data={
                        "swatches": swatches,
                        "deltaE2000Mean": round(de_mean, 2),
                        "evenness": round(evenness, 3),
                    },
                )
            ],
        )


register(ColorExtractor())
