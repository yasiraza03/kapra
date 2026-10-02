"""Shared image primitives: decode, normalize, sample, and encode-for-the-web."""

from .core import (
    GRID_SPECTRUM,
    Rgb,
    apply_spectrum,
    center_patch,
    decode_rgb,
    downscale,
    encode_png_datauri,
    to_gray01,
)

__all__ = [
    "GRID_SPECTRUM",
    "Rgb",
    "apply_spectrum",
    "center_patch",
    "decode_rgb",
    "downscale",
    "encode_png_datauri",
    "to_gray01",
]
