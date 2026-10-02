# ADR 0001 — SQLite for dev persistence, Postgres/pgvector deferred to V2

- **Status:** accepted
- **Date:** 2026-10-02
- **Phase:** 0

## Context

The master plan specified PostgreSQL + pgvector for genome storage and
similarity search. The development machine has no Docker, so standing up
Postgres+pgvector locally is high-friction, and pgvector similarity search is a
**V2** concern (retrieval / nearest-neighbour), not part of the V1 single-garment
report.

## Decision

Use **SQLite** for development persistence in V1, behind a repository
abstraction in `kapra_engine/persistence`. The `database_url` setting is the
only coupling point. Vector similarity is not implemented in V1; when V2 needs
it, swap the repository implementation to Postgres + pgvector (e.g. Neon free
tier) by changing the URL and one adapter.

## Consequences

- **+** Zero setup, zero signup, fully offline dev. Nothing blocks V1.
- **+** The repository seam is designed in from day one, so the swap is small.
- **−** No real vector search until V2 (acceptable — it's a V2 feature).
- **−** Dev and (future) prod databases differ; mitigated by keeping persistence
  logic in the repository layer and testing against the interface.
