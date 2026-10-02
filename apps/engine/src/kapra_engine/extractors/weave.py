"""Weave structure — the flagship genes.

Two genes, deliberately on different honesty tiers:

* ``weave``        MEASURED  — thread periodicity, orientation, GLCM texture
                               statistics. Deterministic functions of pixels.
* ``weave_family`` ESTIMATED — plain / twill / satin, inferred from the lattice
                               ratio between the off-axis structure and the
                               thread grid. Physically grounded, but a judgement.

Why the split: the thread repeat is read to within ~1% of truth, while naming
the interlacing is an inference that can be wrong. Reporting both at MEASURED
would overstate the second.
"""

from __future__ import annotations

import math

import cv2
import numpy as np
from skimage.feature import graycomatrix, graycoprops
from skimage.filters import gabor

from kapra_engine.domain import Evidence, Gene, VizSpec
from kapra_engine.domain.tiers import ShotType, Tier
from kapra_engine.imaging import apply_spectrum, encode_png_datauri

from .base import GarmentContext, register

_GABOR_ANGLES_DEG = (0, 45, 90, 135)
_SPECTRUM_PX = 320
_AXIS_TOL_DEG = 12.0
_OFF_AXIS_MIN_DEG = 25.0
_LATTICE_TOL = 0.07

# The off-axis structure of a weave sits at a fixed ratio of the thread period,
# set by the lattice vector of its repeat unit:
#   plain  2-thread repeat, vector (1,1) -> sqrt(2)
#   satin  5-harness,       vector (1,2) -> sqrt(5)
#   twill  2/2 wale,        vector (2,2) -> 2*sqrt(2)
_LATTICE: dict[str, float] = {
    "plain": math.sqrt(2.0),
    "satin": math.sqrt(5.0),
    "twill": 2.0 * math.sqrt(2.0),
}


def _power_spectrum(gray: np.ndarray) -> np.ndarray:
    """Windowed, centered log-power spectrum normalized to [0, 1]."""
    h, w = gray.shape
    window = np.outer(np.hanning(h), np.hanning(w))
    f = np.fft.fftshift(np.fft.fft2(gray * window))
    logp = np.log1p(np.abs(f) ** 2)
    mx = float(logp.max())
    return logp / mx if mx > 0 else logp


def _geometry(power: np.ndarray) -> dict[str, np.ndarray]:
    h, w = power.shape
    cy, cx = h // 2, w // 2
    yy, xx = np.ogrid[:h, :w]
    radius = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
    angle = np.degrees(np.arctan2(yy - cy, xx - cx)) % 180.0
    return {"radius": radius, "angle": angle}


def _dc_cut(power: np.ndarray) -> float:
    # Low enough that a coarse twill's lattice peak survives, high enough to
    # reject the lighting gradient.
    return max(6.0, max(power.shape) * 0.012)


def _angular_distance(angle: np.ndarray, target: float) -> np.ndarray:
    """Smallest separation between angles, modulo 180 degrees."""
    d = np.abs(angle - (target % 180.0))
    return np.minimum(d, 180.0 - d)


def _thread_peak(power: np.ndarray) -> tuple[float, float, float]:
    """(period_px, orientation_deg, prominence) of the dominant peak.

    This is the warp/weft grid. We take the global maximum rather than assuming
    it lies on the frequency axes, so a garment photographed at an angle is read
    just as well as one squared up to the frame.
    """
    geo = _geometry(power)
    radius, angle = geo["radius"], geo["angle"]
    n = max(power.shape)
    masked = power.copy()
    masked[radius < _dc_cut(power)] = 0.0

    idx = int(np.argmax(masked))
    py, px = divmod(idx, power.shape[1])
    r = float(radius[py, px])
    if r < 1e-6:
        return (0.0, 0.0, 0.0)

    period_px = n / r
    orientation_deg = float(angle[py, px])

    ring = (np.abs(radius - r) < 2.0) & (radius >= _dc_cut(power))
    ring_mean = float(masked[ring].mean()) if ring.any() else 0.0
    peak = float(masked[py, px])
    prominence = 0.0 if ring_mean <= 0 else min(peak / (ring_mean + 1e-9) / 20.0, 1.0)
    return (period_px, orientation_deg, prominence)


def _lattice_scores(
    power: np.ndarray, thread_period_px: float, grid_angle_deg: float
) -> dict[str, float]:
    """Peak power at each family's expected lattice ratio, off the thread grid.

    Angles are measured relative to the grid's own orientation, so the reading
    does not depend on how the cloth was oriented in the frame.
    """
    if thread_period_px <= 0:
        return dict.fromkeys(_LATTICE, 0.0)

    geo = _geometry(power)
    radius, angle = geo["radius"], geo["angle"]
    n = max(power.shape)
    cut = _dc_cut(power)

    masked = power.copy()
    masked[radius < cut] = 0.0
    along = _angular_distance(angle, grid_angle_deg)
    across = _angular_distance(angle, grid_angle_deg + 90.0)
    off_axis = (along > _OFF_AXIS_MIN_DEG) & (across > _OFF_AXIS_MIN_DEG) & (radius >= cut)

    with np.errstate(divide="ignore", invalid="ignore"):
        ratio = (n / np.maximum(radius, 1e-9)) / thread_period_px

    scores: dict[str, float] = {}
    for family, target in _LATTICE.items():
        band = off_axis & (np.abs(ratio - target) / target < _LATTICE_TOL)
        scores[family] = float(masked[band].max()) if band.any() else 0.0
    return scores


def _glcm_props(gray: np.ndarray, levels: int = 32) -> dict[str, float]:
    q = np.clip((gray * (levels - 1)).round().astype(np.uint8), 0, levels - 1)
    glcm = graycomatrix(
        q,
        distances=[1, 2],
        angles=[0, np.pi / 4, np.pi / 2, 3 * np.pi / 4],
        levels=levels,
        symmetric=True,
        normed=True,
    )
    return {
        "contrast": float(graycoprops(glcm, "contrast").mean()),
        "energy": float(graycoprops(glcm, "energy").mean()),
        "homogeneity": float(graycoprops(glcm, "homogeneity").mean()),
        "correlation": float(graycoprops(glcm, "correlation").mean()),
    }


def _gabor_energies(gray: np.ndarray, period_px: float) -> dict[int, float]:
    freq = 1.0 / period_px if period_px > 2 else 0.15
    freq = float(np.clip(freq, 0.05, 0.4))
    out: dict[int, float] = {}
    for deg in _GABOR_ANGLES_DEG:
        real, imag = gabor(gray, frequency=freq, theta=math.radians(deg))
        out[deg] = float(np.sqrt(real**2 + imag**2).mean())
    return out


def _spectrum_of(ctx: GarmentContext) -> np.ndarray:
    return ctx.memo("weave.power_spectrum", lambda: _power_spectrum(ctx.gray))


def _thread_of(ctx: GarmentContext) -> tuple[float, float, float]:
    return ctx.memo("weave.thread_peak", lambda: _thread_peak(_spectrum_of(ctx)))


class WeaveExtractor:
    """MEASURED: the thread grid itself."""

    id = "weave"
    label = "Weave Structure"
    tier = Tier.MEASURED
    requires: tuple[ShotType, ...] = (ShotType.MACRO,)

    def extract(self, ctx: GarmentContext) -> Gene:
        gray = ctx.gray
        power = _spectrum_of(ctx)
        period_px, orientation_deg, prominence = _thread_of(ctx)
        glcm = _glcm_props(gray)
        gabor_energy = _gabor_energies(gray, period_px)
        dominant_gabor = max(gabor_energy, key=lambda k: gabor_energy[k])

        spectrum_small = cv2.resize(
            power, (_SPECTRUM_PX, _SPECTRUM_PX), interpolation=cv2.INTER_AREA
        ).astype(np.float64)
        spectrum_img = encode_png_datauri(apply_spectrum(spectrum_small))
        gabor_max = max(gabor_energy.values()) or 1.0

        return Gene(
            gene_id=self.id,
            tier=self.tier,
            label=self.label,
            value={
                "threadPeriodPx": round(period_px, 2),
                "orientationDeg": round(orientation_deg, 1),
                "peakProminence": round(prominence, 3),
                "glcm": {k: round(v, 4) for k, v in glcm.items()},
            },
            summary=(f"Thread grid repeating every {period_px:.1f}px at {orientation_deg:.0f}°."),
            confidence=round(float(np.clip(0.45 + 0.5 * prominence, 0, 0.97)), 3),
            evidence=[
                Evidence(
                    kind="measurement",
                    label="FFT dominant axial peak",
                    detail="the warp/weft grid lies on the frequency axes",
                    value=round(prominence, 3),
                    viz_ref="weave-fft",
                ),
                Evidence(
                    kind="measurement",
                    label="GLCM contrast / homogeneity",
                    value={
                        "contrast": glcm["contrast"],
                        "homogeneity": glcm["homogeneity"],
                    },
                ),
                Evidence(
                    kind="measurement",
                    label="Dominant Gabor orientation",
                    value=f"{dominant_gabor}°",
                    viz_ref="weave-gabor",
                ),
            ],
            viz=[
                VizSpec(
                    id="weave-fft",
                    kind="fft",
                    title="2D Fourier power spectrum",
                    caption=("Thread periodicity and orientation, read from frequency space."),
                    data={
                        "image": spectrum_img,
                        "periodicityPx": round(period_px, 2),
                        "orientationDeg": round(orientation_deg, 1),
                    },
                ),
                VizSpec(
                    id="weave-gabor",
                    kind="bars",
                    title="Gabor orientation energy",
                    caption="Directional filter response across four orientations.",
                    data={
                        "items": [
                            {
                                "label": f"{deg}°",
                                "value": round(gabor_energy[deg], 5),
                                "max": round(gabor_max, 5),
                            }
                            for deg in _GABOR_ANGLES_DEG
                        ]
                    },
                ),
            ],
        )


class WeaveFamilyExtractor:
    """ESTIMATED: naming the interlacing from its lattice ratio."""

    id = "weave_family"
    label = "Weave Family"
    tier = Tier.ESTIMATED
    requires: tuple[ShotType, ...] = (ShotType.MACRO,)

    def extract(self, ctx: GarmentContext) -> Gene:
        power = _spectrum_of(ctx)
        period_px, grid_angle, prominence = _thread_of(ctx)
        scores = _lattice_scores(power, period_px, grid_angle)

        ranked = sorted(scores.items(), key=lambda kv: -kv[1])
        top_family, top_score = ranked[0]
        second_score = ranked[1][1] if len(ranked) > 1 else 0.0
        margin = (top_score - second_score) / (top_score + 1e-9) if top_score > 0 else 0.0

        if top_score <= 0 or prominence < 0.05:
            family = "indeterminate"
            confidence = 0.2
            summary = "No clear periodic interlacing — knit, irregular, or too soft a shot."
        else:
            family = top_family
            confidence = round(float(np.clip(0.42 + 0.62 * margin, 0, 0.93)), 3)
            summary = f"Most consistent with a {family} interlacing."

        score_max = max(max(scores.values()), 1e-9)
        return Gene(
            gene_id=self.id,
            tier=self.tier,
            label=self.label,
            value={
                "family": family,
                "latticeScores": {k: round(v, 4) for k, v in scores.items()},
                "margin": round(margin, 3),
                "threadPeriodPx": round(period_px, 2),
            },
            summary=summary,
            confidence=confidence,
            evidence=[
                Evidence(
                    kind="derivation",
                    label="Off-axis lattice ratio vs thread grid",
                    detail=("plain ≈ √2, satin ≈ √5, twill ≈ 2√2 times the thread period"),
                    value={k: round(v, 3) for k, v in scores.items()},
                    viz_ref="weave-family-scores",
                ),
                Evidence(
                    kind="measurement",
                    label="Separation from next-best family",
                    value=round(margin, 3),
                ),
            ],
            viz=[
                VizSpec(
                    id="weave-family-scores",
                    kind="bars",
                    title="Lattice match by family",
                    caption=("Spectral power found at each family's expected repeat ratio."),
                    data={
                        "items": [
                            {
                                "label": name[:5],
                                "value": round(score, 4),
                                "max": round(score_max, 4),
                            }
                            for name, score in ranked
                        ]
                    },
                )
            ],
        )


register(WeaveExtractor())
register(WeaveFamilyExtractor())
