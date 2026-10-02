# Architecture

> Companion to [`MASTER_PLAN.md`](MASTER_PLAN.md). This file documents *how the
> code is organized and why*, and is kept current as phases land.

## Shape

kapra is a polyglot monorepo with two deployables and shared contracts.

```
                 ┌─────────────────────────────────────────┐
                 │  packages/genome-schema (JSON Schema)     │
                 │  the single source of truth for Genome    │
                 └───────────────┬───────────────┬───────────┘
            generates TS types   │               │  mirrored by (conformance-tested)
                                 ▼               ▼
                   apps/web (Next.js)     apps/engine (FastAPI)
                   renders the report     runs the extractors
                          │                      │
                          └────── OpenAPI ───────┘
                       (engine → generated TS client)
```

## The two hard rules

1. **One source of truth for the genome.** `packages/genome-schema/schema/genome.schema.v1.json`
   is canonical. The TS types are *generated* from it; the Python Pydantic models
   *mirror* it and a conformance test (`apps/engine/tests/test_genome_conformance.py`)
   fails if they drift.
2. **Contract-first API.** The engine's OpenAPI document generates the web
   client. Web and engine cannot silently diverge.

## The engine's internal layering (`apps/engine/src/kapra_engine`)

| Layer | Responsibility |
|-------|----------------|
| `core/` | config (12-factor), structured logging + timing, errors |
| `domain/` | Genome, Gene, Tier, Evidence, VizSpec — the Pydantic mirror |
| `capture/` | normalization: white-balance, perspective, scale *(Phase 1)* |
| `segmentation/` | garment/background isolation *(Phase 1)* |
| `extractors/` | **one file per gene** — the plugin system *(Phase 2+)* |
| `reasoning/` | the INFERRED layer (local LLM over the genome) *(Phase 4)* |
| `orchestrator/` | DAG resolution, parallel run, genome assembly *(Phase 2)* |
| `persistence/` | repository layer (SQLite now → Postgres/pgvector later) |
| `api/` | FastAPI routers; owns the OpenAPI contract |

## The Extractor plugin pattern (the scalability story)

Every gene implements one interface and registers itself. Adding a gene is
adding a file; nothing else changes. The orchestrator asks each registered
extractor what shots it `requires`, runs the satisfiable ones (parallel where
independent), and assembles a single versioned `Genome`. Full interface lands in
Phase 2 (`extractors/base.py`).

## Honesty is structural, not cosmetic

The `Tier` on every `Gene` and the required non-empty `evidence[]` are enforced
by the schema itself. A claim with no evidence *cannot be serialized*. The UI
renders tiers as a stable, first-class typographic system (`TierChip`).
