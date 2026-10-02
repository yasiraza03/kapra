"""Image primitives. All arrays are RGB uint8 (H, W, 3) unless noted.

Kept dependency-light on purpose: numpy + OpenCV only. No model weights, so this
runs anywhere the repo is cloned.
"""

from __future__ import annotations

import base64

import cv2
import numpy as np
import numpy.typing as npt

Rgb = npt.NDArray[np.uint8]
Gray01 = npt.NDArray[np.float64]

# The kapra data spectrum (see @kapra/ui-tokens). Used ONLY for measurement
# visuals — the rule that keeps the instrument honest: no decorative color.
GRID_SPECTRUM: tuple[tuple[int, int, int], ...] = (
    (10, 30, 46),  # --data-0 deep cyanotype
    (20, 80, 110),  # --data-1
    (46, 143, 168),  # --data-2 teal
    (123, 196, 182),  # --data-3
    (217, 210, 138),  # --data-4 sand
    (232, 162, 74),  # --data-5
    (206, 64, 46),  # --data-6 thread-red
)


def decode_rgb(data: bytes) -> Rgb:
    """Decode arbitrary image bytes (JPEG/PNG/WebP/...) to an RGB uint8 array."""
    buf = np.frombuffer(data, dtype=np.uint8)
    bgr = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("could not decode image bytes")
    rgb: Rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.uint8)
    return rgb


def downscale(rgb: Rgb, max_side: int = 1024) -> Rgb:
    """Downscale so the longest side is at most `max_side`. Upscales nothing."""
    h, w = rgb.shape[:2]
    longest = max(h, w)
    if longest <= max_side:
        return rgb
    scale = max_side / float(longest)
    out: Rgb = cv2.resize(
        rgb, (round(w * scale), round(h * scale)), interpolation=cv2.INTER_AREA
    ).astype(np.uint8)
    return out


def to_gray01(rgb: Rgb) -> Gray01:
    """Luminance in [0, 1] as float64."""
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    return (gray.astype(np.float64)) / 255.0


def center_patch(rgb: Rgb, frac: float = 0.6) -> Rgb:
    """Crop a centered square patch covering `frac` of the shorter side.

    Fabric genes (weave/texture) want a clean interior region, away from edges.
    """
    h, w = rgb.shape[:2]
    side = int(min(h, w) * frac)
    side = max(side, 16)
    cy, cx = h // 2, w // 2
    half = side // 2
    y0, x0 = max(cy - half, 0), max(cx - half, 0)
    return rgb[y0 : y0 + side, x0 : x0 + side]


def apply_spectrum(gray01: Gray01) -> Rgb:
    """Map a [0,1] scalar field to the kapra data spectrum (for heatmaps/FFT)."""
    lut = _spectrum_lut()
    idx = np.clip(np.round(gray01 * 255.0), 0, 255).astype(np.uint8)
    out: Rgb = lut[idx]
    return out


_LUT_CACHE: Rgb | None = None


def _spectrum_lut() -> Rgb:
    global _LUT_CACHE
    if _LUT_CACHE is not None:
        return _LUT_CACHE
    stops = np.array(GRID_SPECTRUM, dtype=np.float64)
    n = len(stops)
    xs = np.linspace(0.0, 1.0, n)
    grid = np.linspace(0.0, 1.0, 256)
    lut = np.empty((256, 3), dtype=np.float64)
    for c in range(3):
        lut[:, c] = np.interp(grid, xs, stops[:, c])
    _LUT_CACHE = np.clip(lut, 0, 255).astype(np.uint8)
    return _LUT_CACHE


def encode_png_datauri(rgb: Rgb) -> str:
    """Encode an RGB array to a base64 PNG data URI for inline <img> rendering."""
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    ok, buf = cv2.imencode(".png", bgr)
    if not ok:
        raise ValueError("png encode failed")
    b64 = base64.b64encode(buf.tobytes()).decode("ascii")
    return f"data:image/png;base64,{b64}"


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02x}{:02x}{:02x}".format(*rgb)
