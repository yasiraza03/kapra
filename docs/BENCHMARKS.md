# Benchmarks

> Receipts, not vibes. Including the parts we are weak at.

## Methodology

Validation currently runs against **six rendered reference swatches**
(`apps/engine/scripts/generate_swatches.py`). These are synthetic but not
trivial: each is a true interlacing pattern with rounded yarn shading, per-thread
slub, fibre fuzz and a lighting gradient, so ground truth (weave family, thread
period) is known exactly while the image still presents realistic noise.

This is a **white-box benchmark**: it proves the signal processing recovers
parameters it was never told. It is *not* evidence of performance on real
photographs, which needs the labelled public corpora in [`DATA.md`](DATA.md).
That gap is stated rather than hidden.

Reproduce:

```bash
cd apps/engine && .venv/Scripts/python scripts/generate_swatches.py
.venv/Scripts/python -m pytest -q
```

---

## Results

### Thread period (MEASURED)

Recovered from the dominant FFT peak against the rendered truth.

| Swatch | True period | Measured | Error |
|---|---|---|---|
| poplin-white | 7 px | 6.98 | **0.3%** |
| satin-charcoal | 9 px | 9.03 | **0.3%** |
| denim-indigo | 11 px | 10.96 | **0.4%** |
| flannel-grey | 13 px | 13.06 | **0.5%** |
| linen-natural | 14 px | 13.95 | **0.4%** |
| canvas-olive | 16 px | 16.16 | **1.0%** |

**All six within 1%.**

### Weave family (ESTIMATED)

Classified by the off-axis lattice ratio: √2 (plain), √5 (satin), 2√2 (twill).

| Swatch | Truth | Read | Confidence |
|---|---|---|---|
| canvas-olive | plain | plain | 0.84 |
| linen-natural | plain | plain | 0.79 |
| poplin-white | plain | plain | 0.89 |
| denim-indigo | twill | twill | 0.61 |
| flannel-grey | twill | twill | 0.58 |
| satin-charcoal | satin | satin | 0.66 |

**6/6 correct.** For context, the first heuristic (axial vs diagonal spectral
energy) scored **1/6** — it failed because the thread grid dominates the axes for
*every* weave, so that signal cannot separate them. The lattice-ratio method
replaced it.

### Rotation invariance

The peak search is not constrained to the frequency axes, so cloth photographed
at an angle reads the same.

| Input | Family | Period | Orientation |
|---|---|---|---|
| denim-indigo | twill | 10.96 px | 0.0° |
| denim-indigo, rotated 30° | twill | 11.05 px (**+0.8%**) | 149.7° (tracked) |

### Determinism (MEASURED)

Asserted in `tests/test_extractors.py`: the same bytes produce byte-identical
thread period, dominant colour and texture energy across runs (k-means is
seeded).

---

## Known weaknesses

- **No real-photograph benchmark yet.** Everything above is synthetic. Accuracy
  on real macros is unmeasured, and therefore unclaimed.
- **Weight is not validated and cannot be.** Without a scale reference the
  g/m² interval rests on an assumed 40 mm frame. It ships at ~0.3 confidence and
  is labelled an estimate everywhere it appears.
- **Fibre content is not implemented.** It needs the trained classifiers in the
  roadmap; a photograph cannot settle it.
- **Sheen is lighting-dependent** by nature and carries a deliberately modest
  confidence.
- **Six samples is a small benchmark.** The weave-family margins (0.58–0.89)
  suggest headroom, not a solved problem.

_Last updated: the vertical slice. Six genes live across two honesty tiers._
