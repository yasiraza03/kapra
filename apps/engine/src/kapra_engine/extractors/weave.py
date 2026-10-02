"""Weave structure — the flagship MEASURED gene.

Real DSP: the 2D power spectrum of a woven fabric carries its periodicity and
dominant orientation; GLCM and a Gabor bank corroborate scale and directionality.
Everything here is a deterministic function of the pixels.
"""

from __future__ import annotations

import math

import numpy as np
from skimage.feature import graycomatrix, graycoprops
from skimage.filters import gabor

from kapra_engine.domain import Evidence, Gene, VizSpec
from kapra_engine.domain.tiers import ShotType, Tier
from kapra_engine.imaging import apply_spectrum, encode_png_datauri

from .base import GarmentContext, register

_GABOR_ANGLES_DEG = (0, 45, 90, 135)


def _power_spectrum(gray: np.ndarray) -> np.ndarray:
    """Windowed, centered log-power spectrum normalized to [0, 1]."""
    h, w = gray.shape
    wy = np.hanning(h)
    wx = np.hanning(w)
    window = np.outer(wy, wx)
    f = np.fft.fftshift(np.fft.fft2(gray * window))
    power = np.abs(f) ** 2
    logp = np.log1p(power)
    mx = float(logp.max())
    return logp / mx if mx > 0 else logp


def _dominant_peak(power: np.ndarray, dc_radius_frac: float = 0.03) -> tuple[float, float, float]:
    """Return (period_px, orientation_deg, prominence) from the spectrum.

    Suppresses the DC neighbourhood, finds the strongest remaining peak, and
    derives spatial period and orientation from its offset from centre.
    """
    h, w = power.shape
    cy, cx = h // 2, w // 2
    yy, xx = np.ogrid[:h, :w]
    r = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
    dc = max(h, w) * dc_radius_frac
    masked = power.copy()
    masked[r < dc] = 0.0

    peak_idx = int(np.argmax(masked))
    py, px = divmod(peak_idx, w)
    dy, dx = (py - cy), (px - cx)
    radius = math.hypot(dy, dx)
    if radius < 1e-6:
        return (0.0, 0.0, 0.0)

    period_px = max(h, w) / radius
    orientation_deg = (math.degrees(math.atan2(dy, dx))) % 180.0

    # prominence: peak vs. the mean energy in its frequency annulus.
    ring = (np.abs(r - radius) < 2.0) & (r >= dc)
    ring_mean = float(masked[ring].mean()) if ring.any() else 0.0
    peak_val = float(masked[py, px])
    prominence = 0.0 if ring_mean <= 0 else min(peak_val / (ring_mean + 1e-9) / 20.0, 1.0)
    return (period_px, orientation_deg, prominence)


def _angular_energy(power: np.ndarray, dc_radius_frac: float = 0.03) -> dict[str, float]:
    """Fraction of spectral energy that is axial (0/90) vs diagonal (45/135)."""
    h, w = power.shape
    cy, cx = h // 2, w // 2
    yy, xx = np.ogrid[:h, :w]
    r = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
    dc = max(h, w) * dc_radius_frac
    ang = (np.degrees(np.arctan2(yy - cy, xx - cx))) % 180.0
    mask = r >= dc
    tol = 20.0

    def band(center: float) -> float:
        sel = mask & (np.minimum(np.abs(ang - center), 180 - np.abs(ang - center)) < tol)
        return float(power[sel].sum())

    axial = band(0.0) + band(90.0)
    diagonal = band(45.0) + band(135.0)
    total = axial + diagonal + 1e-9
    return {"axial": axial / total, "diagonal": diagonal / total}


def _classify_family(
    period_px: float, prominence: float, angular: dict[str, float]
) -> tuple[str, float]:
    """Heuristic weave family from periodicity strength + directionality.

    Honest: this is a rule over real measurements, not a trained model, so its
    confidence is deliberately modest and reported as such.
    """
    if prominence < 0.12:
        # little periodic structure -> knit-like / irregular
        return ("knit-or-irregular", 0.35 + prominence)

    diagonal = angular["diagonal"]
    axial = angular["axial"]
    if diagonal > axial * 1.25:
        return ("twill", min(0.5 + prominence, 0.9))
    if axial > diagonal * 1.25:
        return ("plain", min(0.5 + prominence, 0.9))
    return ("satin-or-complex", min(0.45 + prominence * 0.5, 0.75))


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


class WeaveExtractor:
    id = "weave"
    label = "Weave Structure"
    tier = Tier.MEASURED
    requires: tuple[ShotType, ...] = (ShotType.MACRO,)

    def extract(self, ctx: GarmentContext) -> Gene:
        gray = ctx.gray
        power = _power_spectrum(gray)
        period_px, orientation_deg, prominence = _dominant_peak(power)
        angular = _angular_energy(power)
        family, family_conf = _classify_family(period_px, prominence, angular)
        glcm = _glcm_props(gray)
        gabor_energy = _gabor_energies(gray, period_px)
        dominant_gabor = max(gabor_energy, key=lambda k: gabor_energy[k])

        spectrum_img = encode_png_datauri(apply_spectrum(power))
        gabor_max = max(gabor_energy.values()) or 1.0

        return Gene(
            gene_id=self.id,
            tier=self.tier,
            label=self.label,
            value={
                "family": family,
                "periodicityPx": round(period_px, 2),
                "orientationDeg": round(orientation_deg, 1),
                "directionality": {
                    "axial": round(angular["axial"], 3),
                    "diagonal": round(angular["diagonal"], 3),
                },
                "glcm": {k: round(v, 4) for k, v in glcm.items()},
            },
            summary=(
                f"{family.replace('-', ' ')} weave, ~{period_px:.1f}px repeat "
                f"at {orientation_deg:.0f}°."
            ),
            confidence=round(float(np.clip(0.4 * prominence + 0.6 * family_conf, 0, 1)), 3),
            evidence=[
                Evidence(
                    kind="measurement",
                    label="FFT dominant peak prominence",
                    detail="peak power vs. its frequency annulus mean",
                    value=round(prominence, 3),
                    viz_ref="weave-fft",
                ),
                Evidence(
                    kind="measurement",
                    label="GLCM contrast / homogeneity",
                    value={"contrast": glcm["contrast"], "homogeneity": glcm["homogeneity"]},
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
                    caption="Periodicity and orientation of the weave, read from frequency space.",
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
                    caption="Directional filter response — corroborates the weave orientation.",
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


register(WeaveExtractor())
