# kapra

> A garment forensics instrument. Feed it photographs of a piece of clothing; it
> reconstructs the garment's **genome** — weave, texture, color, silhouette,
> construction — using real computer vision, and it tells you **exactly how
> confident it is and why.**

Not an AI wrapper. A research-grade, product-shaped instrument. Every claim it
makes carries an **honesty tier** and points at the measurement that backs it.

| Tier | Meaning |
|------|---------|
| `MEASURED`  | Computed directly from pixels. Deterministic. Reproducible. |
| `ESTIMATED` | A model prediction with a confidence / interval. |
| `INFERRED`  | A hypothesis reasoned from the layers above — labelled as inference. |

See [`docs/MASTER_PLAN.md`](docs/MASTER_PLAN.md) for the full thesis, architecture
and roadmap.

## Layout

```
apps/
  web/      Next.js front end (TypeScript, Tailwind, the cyanotype identity)
  engine/   FastAPI CV/ML service (Python) — the real computer vision
packages/
  genome-schema/  the versioned Genome schema — single source of truth (TS + Python)
  ui-tokens/      design tokens: cyanotype x bone x thread-red
docs/       plan, architecture, data/licenses, benchmarks, genome spec, decisions
```

## Quick start

```bash
# JS side (monorepo)
pnpm install
pnpm run schema:build       # generate genome types from JSON Schema
pnpm run web                # http://localhost:3000

# Engine (separate terminal)
cd apps/engine
python -m venv .venv && . .venv/Scripts/activate
pip install -e ".[dev]"
uvicorn kapra_engine.main:app --app-dir src --reload --port 8000
```

Open http://localhost:3000 — the home page probes the engine and shows it online.

## Status

**Phase 0 — foundations.** Monorepo, versioned genome schema (TS + Python,
conformance-tested), design-token system, engine `/health`, web shell on the
identity system, CI. See the roadmap in the master plan.
