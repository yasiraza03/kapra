# kapra

> A garment forensics instrument. Photograph a piece of cloth; kapra reconstructs
> its **genome** — weave, colour, texture, weight, finish — using real signal
> processing, and tells you **exactly how far each reading can be trusted.**

Not an AI wrapper. There is no model guessing on your behalf: a 2D Fourier
transform measures the weave, k-means in CIELAB measures the dye, Local Binary
Patterns measure the texture. Every claim carries the measurement that produced
it, and the instrument says plainly where its knowledge stops.

**Zero model weights.** The core runs on NumPy and OpenCV, locally. Clone it,
run one command, and it works — offline, with no API keys.

---

## What it tells you

A report opens in plain English, then shows the measurements behind it:

> **A midweight indigo twill weave.**
>
> | | | |
> |---|---|---|
> | **Fabric** Twill weave | **Colour** indigo `#33466b` | **Weight** Midweight |
> | *Threads step across to form a diagonal. Think denim, chino.* | *Dyeing is very even (91% consistency).* | *~200–320 g/m² — an estimate; a photo has no scale.* |

Below that sit the real figures: the Fourier power spectrum, Gabor orientation
energies, the CIELAB palette, LBP histograms, confidence meters and the evidence
list for every gene.

## The honesty system

Every claim wears a tier, and the schema **refuses to serialise one without
evidence** — so an unsupported claim cannot reach the page.

| Tier | Meaning | Example |
|---|---|---|
| `MEASURED` | Computed directly from pixels. Deterministic, reproducible. | Thread repeat via FFT, CIELAB palette, LBP texture |
| `ESTIMATED` | A prediction carrying confidence and, where meaningful, an interval. | Weave family, weight class (g/m² range) |
| `INFERRED` | A hypothesis, labelled as one, citing what led to it. | Construction & process *(planned)* |

The split is deliberate. The thread repeat is read to within ~1% of truth, so it
is `MEASURED`. Naming the interlacing is a judgement, so it is `ESTIMATED`. GSM
cannot be known from a photograph at all, so it is reported as a class with a
wide interval and low confidence — never as a fabricated number.

## Genes

| Gene | Tier | Method |
|---|---|---|
| Weave Structure | `MEASURED` | 2D FFT · GLCM · Gabor bank |
| Weave Family | `ESTIMATED` | Off-axis lattice ratio (√2 plain, √5 satin, 2√2 twill) |
| Colour & Dye Evenness | `MEASURED` | CIELAB k-means · CIEDE2000 |
| Texture Fineness | `MEASURED` | Local Binary Patterns · Laplacian energy |
| Finish & Sheen | `MEASURED` | Specular-highlight distribution |
| Weight Class | `ESTIMATED` | Thread density from the measured repeat |

Validated results are in [`docs/BENCHMARKS.md`](docs/BENCHMARKS.md).

---

## Quick start

Requires **Node 20+**, **pnpm**, and **Python 3.12+**.

```bash
pnpm install
pnpm run bootstrap     # builds the schema, creates the venv, installs the CV stack
pnpm run dev           # engine :8000 + web :3000, one terminal
```

Open **http://localhost:3000** and sequence one of the six demo swatches — no
photo of your own required.

> `pnpm run dev` runs both servers with prefixed output; Ctrl+C stops both.

## Layout

```
apps/
  web/      Next.js front end — editorial multi-page site + the forensic report
  engine/   FastAPI CV service — the extractors, orchestrator and persistence
packages/
  genome-schema/  the versioned Genome schema: ONE source of truth (TS + Python)
  ui-tokens/      design tokens: bone paper, ink, cyanotype bands, oxblood accent
docs/       plan, architecture, data/licences, benchmarks, genome spec, deployment
scripts/    dev.mjs (run everything) · bootstrap.mjs (set up a fresh clone)
```

### Architecture in one paragraph

`packages/genome-schema` holds the canonical JSON Schema. TypeScript types are
*generated* from it; the Python Pydantic models *mirror* it, and a conformance
test fails if they drift. The engine exposes extractors as plugins — **adding a
gene is adding one file** that registers itself; the orchestrator discovers it,
runs it, times it, and isolates its failures into warnings. See
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## The demo swatches

The six specimens in `apps/web/public/swatches/` are **generated, not stock
photos** — real interlacing patterns rendered with yarn shading, slub and fibre
fuzz by `apps/engine/scripts/generate_swatches.py`. No licensed assets, and the
instrument reads them exactly as it reads a real macro.

Regenerate them with:

```bash
cd apps/engine && .venv/Scripts/python scripts/generate_swatches.py
```

## Quality

```bash
pnpm run typecheck && pnpm run lint && pnpm run test && pnpm run build
cd apps/engine && .venv/Scripts/python -m pytest -q
```

TypeScript `strict` (with `exactOptionalPropertyTypes`), `ruff`, `mypy --strict`,
pytest, vitest, and GitHub Actions across both toolchains.

## Deploying

Web on Vercel; the Python engine on any container host (Render has a real free
tier and a `render.yaml` blueprint is included).
See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Status & limits

Six genes live across two tiers, end to end: upload → analysis → stored genome →
report → archive. What it deliberately **cannot** do — fibre content, true GSM,
brand or authenticity — is documented on `/method` and in
[`docs/DATA.md`](docs/DATA.md).

Research use. Dataset licences for the planned `ESTIMATED` classifiers are
documented rather than glossed over.
