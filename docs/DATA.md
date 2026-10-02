# Data & licensing

> Honesty about data is enterprise-grade, not a weakness. kapra ships for
> **research use**. A commercial launch needs a license review and/or
> proprietary data collection — stated plainly here.

## Datasets we rely on

| Dataset | What it gives us | Used by | License posture |
|---------|------------------|---------|-----------------|
| **DTD** (Describable Textures, Oxford VGG) | 47 texture attributes incl. *woven, knitted, striped, grid* | weave/texture classifier + validation | research-friendly |
| **FMD** (Flickr Material Database) | 10 material classes incl. fabric | material baseline | research |
| **MINC-2500** (Materials in Context) | material patches incl. fabric | fiber classifier training | research |
| **KTH-TIPS2** | texture under varying scale + illumination | robustness / normalization validation | research |
| **Fashionpedia / DeepFashion2** | garment segmentation + fine attributes | silhouette + hardware + attributes | research-only |

> None of these are committed to the repo. They are downloaded locally / on
> Colab for training and validation. Raw weights and datasets are `.gitignore`d.

## Ethics & honesty commitments

- **No fake precision.** We never print a lab-grade number (e.g. "180 GSM") off a
  JPEG. Weight is reported as a *bucket* with a confidence interval.
- **Every claim is tiered and evidenced** (`MEASURED` / `ESTIMATED` / `INFERRED`).
- **Degrade, don't fabricate.** When a required shot is missing or segmentation
  is low-confidence, the affected genes lower their confidence and say so in
  `Genome.warnings` — they do not guess.

## Commercial path (future, documented, not pretended)

A licensable product would require either (a) datasets cleared for commercial
use, or (b) a proprietary capture pipeline producing owned, labelled data. This
is deliberately out of scope for V1 and tracked as a V2+ concern.
