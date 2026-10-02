# Genome spec (v1.0.0)

> The genome is the whole product in one document. Canonical schema:
> [`packages/genome-schema/schema/genome.schema.v1.json`](../packages/genome-schema/schema/genome.schema.v1.json).
> This file is the human-readable companion.

## Versioning

Every genome records `schemaVersion`. Clients branch on the **major**. Adding
genes or viz kinds is backwards-compatible (new optional data); changing an
existing field's meaning requires a major bump. This is how a future paying
client's stored genomes keep parsing.

## Top-level shape

```jsonc
{
  "schemaVersion": "1.0.0",
  "id": "gen_…",
  "createdAt": "2026-10-02T12:00:00.000Z",
  "source": { "shots": [ … ], "capture": { … } },
  "genes": [ GeneResult, … ],
  "timings": { "weave": 240.1, … },   // per-extractor ms — an instrument touch
  "warnings": [ "backlit shot missing — weight confidence reduced" ]
}
```

## `GeneResult` — the unit of everything

| Field | Required | Notes |
|-------|----------|-------|
| `geneId` | ✓ | stable id, e.g. `weave`, `color`, `silhouette` |
| `tier` | ✓ | `MEASURED` \| `ESTIMATED` \| `INFERRED` |
| `label` | ✓ | human-facing name |
| `value` | ✓ | structured reading (gene-specific shape) |
| `summary` | | one-line human statement |
| `confidence` | ✓ | 0..1 |
| `interval` | | confidence interval (ESTIMATED) |
| `evidence` | ✓ (≥1) | **no claim ships without evidence** |
| `viz` | | declarative viz specs the web app renders |

## Honesty tiers

- **`MEASURED`** — deterministic function of pixels (FFT, GLCM, Gabor, CIELAB
  k-means, Fourier descriptors). Same pixels → same numbers.
- **`ESTIMATED`** — a model prediction; must carry `confidence` and, where
  meaningful, an `interval`.
- **`INFERRED`** — a hypothesis over the measured+estimated layers; its
  `evidence[]` must cite the specific measurements that drove it.

## VizSpec kinds (v1)

`fft` · `gabor` · `palette` · `contour` · `heatmap` · `histogram` · `overlay` ·
`bars`. The engine owns the `data`; the web app owns the rendering. New kinds can
be added without a schema bump because `data` is renderer-validated.
