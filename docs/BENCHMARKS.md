# Benchmarks

> Receipts, not vibes. This file reports **real validation metrics** on held-out
> labelled splits. It is populated as the ESTIMATED layer lands (Phase 3). Until
> then it states the methodology so the numbers, when they arrive, are trusted.

## Methodology

- **Held-out splits.** Classifiers are trained and validated on disjoint splits
  of the datasets in [`DATA.md`](DATA.md). No test leakage.
- **Deterministic MEASURED layer.** FFT/GLCM/Gabor/CIELAB outputs are
  reproducible given identical pixels; validated with golden-image fixtures
  (`apps/engine/tests`), reported as pass/fail within tolerance, not accuracy.
- **Reported honestly.** We publish top-1 and top-k where relevant, confusion
  matrices for weave family, and ΔE2000 error distributions for color — including
  the cases where we're weak.

## Results

| Capability | Metric | Split | Result | Status |
|------------|--------|-------|--------|--------|
| Weave family classification | top-1 accuracy | DTD woven subset | — | pending (Phase 3) |
| Fiber / material class | top-3 accuracy | MINC-2500 fabric | — | pending (Phase 3) |
| Color palette extraction | median ΔE2000 vs. color-card | synthetic + KTH-TIPS2 | — | pending (Phase 2) |
| Weave periodicity (FFT) | error vs. known-period swatches | golden fixtures | — | pending (Phase 2) |

_Last updated: Phase 0 (methodology only; no results yet)._
