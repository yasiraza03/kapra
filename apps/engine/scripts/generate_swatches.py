"""Render synthetic fabric swatches used as site imagery and demo specimens.

These are not stock photos: each is an actual interlacing pattern (plain, twill,
satin) rendered with rounded yarn shading, per-thread slub, fibre fuzz and a
lighting gradient. That means the instrument reads them the way it reads a real
macro — a twill swatch really does produce diagonal energy in frequency space.

Deterministic (seeded), so regenerating produces byte-identical output.

    python scripts/generate_swatches.py
"""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

OUT_DIR = Path(__file__).resolve().parents[2] / "web" / "public" / "swatches"
SIZE = 1024


@dataclass(frozen=True)
class Swatch:
    slug: str
    name: str
    weave: str  # plain | twill | satin
    period: int  # pixels per thread
    color: tuple[float, float, float]  # linear-ish RGB 0..1
    fuzz: float  # fibre haze
    slub: float  # yarn irregularity
    sheen: float  # specular boost


SWATCHES: tuple[Swatch, ...] = (
    Swatch("linen-natural", "Linen, natural", "plain", 14, (0.84, 0.78, 0.65), 0.055, 0.14, 0.02),
    Swatch("denim-indigo", "Denim, indigo", "twill", 11, (0.21, 0.29, 0.45), 0.040, 0.10, 0.05),
    Swatch("poplin-white", "Cotton poplin", "plain", 7, (0.93, 0.92, 0.89), 0.022, 0.04, 0.06),
    Swatch("satin-charcoal", "Satin, charcoal", "satin", 9, (0.17, 0.17, 0.19), 0.018, 0.05, 0.30),
    Swatch("flannel-grey", "Wool flannel", "twill", 13, (0.52, 0.52, 0.53), 0.090, 0.16, 0.01),
    Swatch("canvas-olive", "Cotton canvas", "plain", 16, (0.40, 0.42, 0.30), 0.050, 0.15, 0.03),
)


def interlacing(weave: str, n: int) -> np.ndarray:
    """True where warp (vertical thread) passes over weft."""
    i = np.arange(n)[:, None]  # weft / row
    j = np.arange(n)[None, :]  # warp / column
    if weave == "plain":
        return ((i + j) % 2) == 0
    if weave == "twill":  # 2/2 twill — the diagonal wale
        return ((j - i) % 4) < 2
    if weave == "satin":  # 5-harness, sparse binding points -> long floats
        return ((j - 2 * i) % 5) == 0
    raise ValueError(f"unknown weave {weave!r}")


def render(sw: Swatch, seed: int = 11) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = SIZE // sw.period + 1
    mask = np.kron(interlacing(sw.weave, n), np.ones((sw.period, sw.period), dtype=bool))
    mask = mask[:SIZE, :SIZE]

    # rounded yarn cross-section: bright along the thread's centre line
    t = (np.arange(SIZE) % sw.period) / sw.period
    profile = np.sin(np.pi * t) ** 0.55

    # per-thread slub (yarn thickness/brightness irregularity)
    thread_gain = rng.normal(1.0, sw.slub, n).repeat(sw.period)[:SIZE]
    warp = (profile * thread_gain)[None, :]
    weft = (profile * thread_gain)[:, None]

    base = np.where(mask, np.broadcast_to(warp, (SIZE, SIZE)), np.broadcast_to(weft, (SIZE, SIZE)))

    # threads passing under sit slightly in shadow
    base = base * np.where(mask, 1.0, 0.88)

    # fibre fuzz: fine noise, softened so it reads as haze not grain
    noise = rng.normal(0.0, sw.fuzz, (SIZE, SIZE))
    noise = cv2.GaussianBlur(noise, (0, 0), 1.1)
    base = base + noise

    # a soft, slightly off-centre key light
    yy, xx = np.mgrid[0:SIZE, 0:SIZE] / SIZE
    light = 0.90 + 0.22 * np.exp(-(((xx - 0.38) ** 2 + (yy - 0.30) ** 2) / 0.42))
    base = base * light

    base = np.clip(base, 0.0, 1.6)

    # dye it: cloth never goes fully black, and highlights desaturate toward white
    color = np.array(sw.color, dtype=np.float64)
    rgb = color[None, None, :] * (0.34 + 0.78 * base[..., None])
    if sw.sheen > 0:
        spec = np.clip(base - 0.82, 0, None) ** 2
        rgb = rgb + (sw.sheen * 3.2) * spec[..., None]

    # slight per-pixel dye variation keeps it from looking synthetic
    rgb = rgb * (1.0 + rng.normal(0.0, 0.012, (SIZE, SIZE, 1)))

    out = np.clip(rgb, 0, 1)
    return (out * 255).round().astype(np.uint8)


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for sw in SWATCHES:
        rgb = render(sw)
        path = OUT_DIR / f"{sw.slug}.jpg"
        ok = cv2.imwrite(
            str(path), cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), [int(cv2.IMWRITE_JPEG_QUALITY), 86]
        )
        if not ok:
            print(f"failed to write {path}", file=sys.stderr)
            return 1
        print(f"  {sw.slug:16s} {sw.weave:6s} {path.stat().st_size // 1024:4d} KB")
    print(f"\nwrote {len(SWATCHES)} swatches to {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
