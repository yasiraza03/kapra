# kapra — Master Plan

> **One line:** a garment forensics instrument. Feed it photos of a piece of clothing; it reconstructs the garment's *genome* — weave, texture, color, silhouette, construction — using real computer vision and signal processing, and it tells you **exactly how confident it is and why.**

> **The energy:** not an AI wrapper. A research-grade, product-shaped instrument that happens to look like it fell out of a textile lab in 2049. Honest about what pixels can and can't tell you — and that honesty is the flex.

---

## 0. The thesis (read this or nothing else)

Everybody and their cat has built "upload a photo, AI tells you X." That bar is on the floor. kapra clears it by doing the opposite of hand-waving:

- **It measures, it doesn't vibe.** A 2D Fourier transform of a weave is a *real number signature*, not a guess. GLCM texture energy is a real number. CIELAB ΔE dye variance is a real number. We compute these from pixels and show the receipts.
- **It never over-claims.** You *cannot* read exact GSM off a JPEG. So we don't pretend to. Every gene is stamped with an honesty tier (`MEASURED` / `ESTIMATED` / `INFERRED`) and a confidence interval. An engineer who sees this respects it more than magic.
- **It's a product, not a demo.** Versioned genome schema, pluggable extractor architecture, contract-first API, typed everywhere, tested, CI'd. Built so a textile sourcing company could actually license it one day.

If we nail those three, the reaction we want — *"wait, how did he even build this?"* — writes itself.

---

## 1. The honesty taxonomy (the soul of the project)

Every claim kapra makes carries a tier. This is non-negotiable and it's rendered in the UI as a first-class typographic system.

| Tier | Meaning | Example |
|---|---|---|
| **`MEASURED`** | Computed directly from pixels. Deterministic. Reproducible. | Weave periodicity via FFT, color palette via LAB k-means, silhouette Fourier descriptors |
| **`ESTIMATED`** | Model prediction with a confidence score / interval. | Fiber class (cotton 0.71 / linen 0.19 / …), weight bucket (midweight, CI ±15%) |
| **`INFERRED`** | Hypothesis reasoned from the measured + estimated layers. Explicitly labeled as inference. | "Likely flat-fell seam construction → suggests workwear-grade durability" |

**Rule:** no claim ships without a tier and an evidence pointer (the measurement or the viz that backs it). If we can't back it, it doesn't render.

---

## 2. What each gene actually is (no vibes, only methods)

This is the depth. Each gene = an **Extractor** (see §5) with a named algorithm.

### MEASURED genes (pure signal/CV — the core)
- **Weave structure** → 2D FFT power spectrum (periodicity + dominant orientation), GLCM (contrast / energy / homogeneity / correlation), Gabor filter bank response. Distinguishes plain / twill / satin / knit by frequency + directionality. *The FFT render looks like a starfield cross — gorgeous and real.*
- **Texture fineness** → Local Binary Patterns + GLCM statistics → coarse/fine scale.
- **Color & dye evenness** → k-means in CIELAB → dominant palette; ΔE2000 variance across patches = dye consistency metric.
- **Silhouette** → local background removal (BiRefNet/rembg) → contour → elliptic Fourier descriptors + Hu moments + proportion ratios.
- **Finishing / sheen** → specular-highlight histogram + gloss ratio → matte / mercerized / coated proxy.
- **Holistic fingerprint** → DINOv2 embedding (local ONNX). This vector powers similarity + retrieval later.

### ESTIMATED genes (models + confidence)
- **Fiber / material** → classifier fine-tuned on public material/texture datasets (DTD, FMD, MINC) → probabilistic top-k. Honest accuracy, not lab-grade.
- **Weight / GSM** → *bucketed* estimate (lightweight / midweight / heavyweight) from weave tightness + opacity (if a backlit shot exists) + fiber prior, with a stated confidence interval. We never print a fake "180 GSM".
- **Hardware** → buttons/zippers via object detection; metal-vs-plastic from specular response.

### INFERRED genes (grounded reasoning)
- **Construction / origin / likely process** → a *local* LLM (via Ollama — Qwen2.5 / Llama 3.x, **no API key, zero cost**) reasons over the structured genome + a curated textile knowledge base, and must cite which measurements drove each claim. Explicitly labeled inference. In free-tier prod this is optional/degraded (CPU is slow) — it shines in local/dev and is a "pro" feature for a hosted product.

---

## 3. Data strategy (zero photography, all public, license-aware)

You're not shooting RAQM. We lean entirely on public, labeled datasets. These give us *ground truth to validate against* — the thing that turns "demo" into "research artifact."

| Dataset | What it gives us | Use | License note |
|---|---|---|---|
| **DTD** (Describable Textures, Oxford VGG) | 47 texture attributes incl. *woven, knitted, striped, grid* | weave/texture classifier + validation | research-friendly |
| **FMD** (Flickr Material Database) | 10 material classes incl. fabric | material baseline | research |
| **MINC-2500** (Materials in Context) | material patches incl. fabric | fiber classifier train | research |
| **KTH-TIPS2** | texture under varying scale + illumination | robustness / normalization validation | research |
| **Fashionpedia / DeepFashion2** | garment segmentation + fine attributes | silhouette + hardware + attributes | research-only |

> **Product honesty:** these are research/academic licenses. The repo ships research-use. A real commercial launch needs a license review and/or proprietary data collection — we document this openly in `docs/DATA.md`. Being upfront about it is enterprise-grade, not a weakness.

**Validation loop:** we hold out labeled splits and report real metrics (weave classification accuracy, fiber top-k, color ΔE error) in `docs/BENCHMARKS.md`. Receipts, not vibes.

---

## 4. The stack (best models, least friction, $0)

| Layer | Choice | Why |
|---|---|---|
| **Monorepo** | pnpm workspaces + Turborepo | one repo, clean boundaries, cached builds |
| **Web** | Next.js (App Router) + React + TypeScript (strict) + Tailwind | your lane; reuse your token-system philosophy |
| **Engine** | Python + FastAPI + Pydantic v2 | real CV needs OpenCV/scikit-image/ONNX; contract-first |
| **CV/DSP** | OpenCV, scikit-image, NumPy, SciPy | FFT, GLCM, Gabor, LBP, contours — classical + bulletproof |
| **Segmentation** | BiRefNet / rembg (local) | SOTA background removal, free |
| **Embeddings** | DINOv2 via ONNX Runtime | best-in-class self-supervised visual features |
| **Classifiers** | ViT/CNN fine-tuned on DTD+MINC, exported to ONNX | trained on **free Colab GPU**, served on CPU |
| **Reasoning (INFERRED)** | Ollama (Qwen2.5 / Llama 3.x) | local, free, no API key — on-brand with your zero-budget rule |
| **DB** | PostgreSQL + **pgvector** | genome storage + similarity search; Neon free tier |
| **Contract** | OpenAPI → generated TS types | web + engine never drift |
| **Hosting** | Web → Vercel (free) · Engine → HF Spaces Docker (free CPU) · DB → Neon (free) | $0/month, real URLs |
| **Quality** | ruff + mypy + pytest · ESLint + vitest · Playwright · GitHub Actions | enterprise hygiene, free CI |

---

## 5. The architecture that makes it scalable (the enterprise core)

### Extractor plugin pattern — the whole system hinges on this
Every gene implements one interface. Add a gene = add a plugin. Nothing else changes. This is the scalability + sellability story in one pattern.

```python
class Extractor(Protocol):
    id: str                      # "weave", "color", "silhouette", ...
    tier: Tier                   # MEASURED | ESTIMATED | INFERRED
    requires: list[ShotType]     # which photos it needs (macro, full-front, ...)

    def extract(self, ctx: GarmentContext) -> GeneResult: ...

@dataclass
class GeneResult:
    gene_id: str
    tier: Tier
    value: Any                   # the structured reading
    confidence: float            # 0..1
    interval: Interval | None    # for ESTIMATED
    evidence: list[Evidence]     # measurements that justify the value
    viz: VizSpec | None          # how the UI renders the proof (FFT image, swatches, overlay)
```

The **Orchestrator** resolves the DAG (which extractors can run given the uploaded shots), runs them (parallel where independent), and assembles a **Genome** — a single versioned document.

### Genome schema is versioned (product-grade)
`genome.schema.v1.json`. Every genome stores its `schemaVersion`. When we add genes or change encodings, old genomes still parse and old clients still work. This is how you don't break a paying customer later.

### Pipeline, end to end
```
Upload (shot set)
  → Normalize (white-balance via gray-world/color-card, perspective, scale via fiducial)
  → Segment (BiRefNet) → isolate garment + fabric patches
  → Orchestrator runs Extractors (DAG, parallel)
      MEASURED: weave, texture, color, silhouette, sheen, embedding
      ESTIMATED: fiber, weight, hardware
      INFERRED: construction/origin (local LLM over the genome)
  → Assemble Genome (v1) + confidence + evidence + viz specs
  → Persist (Postgres + pgvector)
  → Web renders the Forensic Report
```

---

## 6. Folder structure (granular, scalable, polyglot monorepo)

```
kapra/
├── apps/
│   ├── web/                        # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                # routes: /, /analyze, /genome/[id]
│   │   │   ├── components/
│   │   │   │   ├── report/         # genome report views
│   │   │   │   ├── viz/            # FFT canvas, Gabor grid, palette, silhouette overlay
│   │   │   │   ├── capture/        # upload + shot-protocol guidance
│   │   │   │   └── ui/             # design-system primitives (Button, Tier, Meter)
│   │   │   ├── lib/
│   │   │   │   ├── api/            # generated OpenAPI client
│   │   │   │   └── design/         # tokens, motion curves
│   │   │   └── styles/globals.css  # cyanotype × bone × thread-red token system
│   │   └── tests/                  # vitest + playwright
│   │
│   └── engine/                     # Python FastAPI CV/ML service
│       ├── src/kapra_engine/
│       │   ├── api/                # FastAPI routers, OpenAPI schema
│       │   ├── core/               # config (12-factor), logging, errors, types
│       │   ├── domain/             # Genome, GeneResult, Tier, schema versioning
│       │   ├── capture/            # normalization: white-balance, perspective, scale
│       │   ├── segmentation/       # BiRefNet/rembg wrapper
│       │   ├── extractors/         # ONE FILE PER GENE (the plugin system)
│       │   │   ├── base.py         # Extractor protocol + registry
│       │   │   ├── weave.py        # FFT + GLCM + Gabor
│       │   │   ├── color.py        # LAB k-means + ΔE
│       │   │   ├── texture.py      # LBP + GLCM
│       │   │   ├── silhouette.py   # contour + Fourier descriptors
│       │   │   ├── sheen.py        # specular histogram
│       │   │   ├── fiber.py        # ONNX classifier
│       │   │   ├── weight.py       # bucketed GSM estimate
│       │   │   ├── hardware.py     # detection
│       │   │   └── embedding.py    # DINOv2 ONNX
│       │   ├── reasoning/          # INFERRED layer (Ollama client + knowledge base)
│       │   ├── orchestrator/       # DAG resolution + parallel run + assembly
│       │   └── persistence/        # Postgres + pgvector repos
│       ├── models/                 # ONNX weights (git-lfs / downloaded on build)
│       ├── notebooks/              # Colab training notebooks (fiber/weave)
│       └── tests/                  # pytest (unit per extractor + golden-image tests)
│
├── packages/
│   ├── genome-schema/              # JSON Schema + generated TS & Python types (shared truth)
│   ├── config/                     # shared eslint/ts/ruff config
│   └── ui-tokens/                  # design tokens as the single source
│
├── docs/
│   ├── MASTER_PLAN.md              # this file
│   ├── ARCHITECTURE.md
│   ├── DATA.md                     # datasets + licenses + ethics
│   ├── BENCHMARKS.md               # real validation metrics
│   └── GENOME_SPEC.md              # the versioned schema, documented
├── .github/workflows/             # CI: lint, typecheck, test, build
├── docker-compose.yml             # engine + postgres+pgvector for local dev
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 7. Coding practices (non-negotiables)

- **Typed everywhere.** TS `strict`. Python Pydantic v2 + mypy. No `any`, no untyped dicts crossing boundaries.
- **Contract-first.** The engine's OpenAPI schema generates the web client. Web and engine *cannot* drift.
- **One source of truth for the genome.** `packages/genome-schema` generates both TS and Python types. Change it in one place.
- **Every extractor is independently testable** with golden-image fixtures (known input → known measurement range). This is how we prove the CV is real.
- **12-factor config.** No secrets in code. Env-driven. (We have almost no secrets — that's the point.)
- **Deterministic MEASURED layer.** Same pixels → same numbers, always. Seeded where randomness exists (k-means).
- **Conventional commits + CI gates.** Lint + typecheck + test must pass to merge.
- **Reproducible models.** Training notebooks committed; weights versioned; export-to-ONNX scripted.
- **Observability.** Structured logging + timing per extractor (the report can show "weave analyzed in 240ms" — a nice instrument touch).

---

## 8. Visual identity — cyanotype × bone × thread-red (anti-slop)

Different energy from your portfolio on purpose. The concept: **textiles were historically archived as cyanotype blueprints.** kapra is that archive, reborn as a forensic instrument.

- **Palette:** deep cyanotype indigo (ground), bone/ecru paper (surface), a single thread-red accent for the live/active signal, and a constrained data-viz spectrum reserved *only* for heatmaps/FFT/Gabor.
- **Type:** editorial high-contrast serif for the voice, a precise mono for all data readouts + tiers, a clean grotesk for body. Strict scale. Intentional asymmetry.
- **Motifs:** blueprint measurement grid as canvas; technical-drawing callout lines pointing at garment features; the genome rendered as a vertical *strand* you scroll; FFT/Gabor/palette as real first-class visuals.
- **The rule that kills slop:** *nothing decorative that isn't also data.* Every gradient, every glow, every animated element is backed by a real measurement. If it's just pretty, it's cut.
- **Motion:** liquid easing, reveal-on-scroll, but restrained — this is an instrument, not a toy.

---

## 9. Roadmap — milestones that each actually run

> V1 goal (your pick): **single-garment genome report.** Comparison engine + retrieval are V2.

**Phase 0 — Foundations.** Monorepo, Turborepo/pnpm, CI, OpenAPI contract skeleton, genome-schema v0, design-token system, docker-compose (engine + pgvector). *Runs: `/health` endpoint + empty web shell on the identity system.*

**Phase 1 — Capture + Normalize.** Upload + shot-protocol UI; white-balance (gray-world + optional color card), perspective correction, scale via fiducial; segmentation (BiRefNet). *Runs: upload a garment → get a clean, normalized, segmented image + fabric patches back.*

**Phase 2 — The MEASURED core.** Weave (FFT/GLCM/Gabor), color (LAB/ΔE), texture (LBP), silhouette (Fourier descriptors), sheen, DINOv2 embedding — each with its viz spec. *Runs: real measurements + their visualizations for any upload. This alone is already impressive.*

**Phase 3 — The ESTIMATED layer.** Train fiber/weave classifiers on DTD+MINC (Colab), export ONNX; weight bucket + CI; hardware detection. Publish `BENCHMARKS.md`. *Runs: probabilistic fiber/weight/hardware with honest confidence.*

**Phase 4 — The INFERRED layer.** Ollama reasoning over the genome + textile knowledge base, citing evidence. Guarded/optional in free prod. *Runs: construction/origin hypotheses with cited measurements.*

**Phase 5 — The Forensic Report (V1 hero).** The full genome report UI: honesty tiers, real viz, the genome strand, measurement callouts, timing instrument. Persist to pgvector. *Runs: the complete single-garment experience, deployed, on a real URL.*

**V2 (future, after V1 ships):** two-garment comparison ("are these the same quality?" with per-dimension inspectable bars), pgvector nearest-neighbor retrieval ("closest garment in the archive"), the product/licensing path.

---

## 10. Risks & how we disarm them (no mistakes = name them first)

| Risk | Disarm |
|---|---|
| CV claims sound fake | Honesty tiers + visible evidence + published benchmarks. We under-promise. |
| Free-tier CPU too slow for LLM | INFERRED is optional/degraded in prod; shines locally. MEASURED+ESTIMATED carry V1. |
| Dataset licenses block a product | `docs/DATA.md` is upfront; commercial path documented separately. |
| Segmentation fails on busy backgrounds | Shot protocol guides clean captures; graceful degradation + confidence drop. |
| Scope creep (the classic killer) | V1 is strictly single-garment report. Comparison is V2. Hold the line. |
| Model weights bloat the repo | git-lfs / download-on-build; never commit raw weights. |

---

## 11. Why this wins (the interview receipts)

- **Real DSP:** "I compute the 2D FFT of the weave and classify by its frequency signature" — almost nobody on GitHub does this.
- **Honest uncertainty:** a confidence system + published benchmarks reads as *research maturity*, not student project.
- **Scalable architecture:** the Extractor plugin pattern + versioned genome schema is a genuine systems-design story.
- **Product thinking:** licensing awareness, schema versioning, contract-first — it looks like something a company could buy.
- **Domain fusion:** textile knowledge + CV + full-stack + local ML, zero budget. That combination is rare and memorable.

---

*Status: PLAN. Awaiting green light to start Phase 0.*
