# Data, models & licensing

> Honesty about data is enterprise-grade, not a weakness.

## What kapra uses today: nothing

This is the important part, and it is easy to get wrong when reading the roadmap.

**As shipped, kapra uses no datasets, no trained models, and no neural networks
of any kind.** There is nothing to download, nothing to license, and no weights
in this repository. Every reading is produced by classical signal processing
over the pixels you provide.

The complete third-party surface of the engine is:

| Library | Used for |
|---|---|
| **NumPy** | FFT, array maths |
| **OpenCV** (`opencv-python-headless`) | decode, resize, colour conversion, k-means, Laplacian |
| **scikit-image** | GLCM, Gabor filters, Local Binary Patterns, CIELAB + CIEDE2000 |
| **SciPy** | numerical support |
| FastAPI · Pydantic · SQLAlchemy | service, validation, storage |

That is the whole list. No PyTorch, no ONNX Runtime, no transformers, no
scikit-learn, no rembg, no Ollama. You can verify it yourself:

```bash
cd apps/engine && .venv/Scripts/python -m pip list | grep -iE "torch|onnx|transformers|rembg"
# (no output)
```

### Why this matters

- Every `MEASURED` reading is a **deterministic function of your pixels**, not a
  model's opinion. It can be re-derived by hand from the same image.
- The repo clones and runs **offline**, on CPU, with no API keys.
- There is no training data to be biased by, and no licence encumbering output.

### What this costs us

Honestly: the things a model would be better at. kapra cannot identify fibre
content, cannot recognise garment type, and cannot judge quality. Those need
learned priors, which means the datasets below — none of which are in use yet.

---

## Datasets: planned, not used

These are the corpora the roadmap's `ESTIMATED` genes would need. **None are
currently downloaded, trained on, or depended upon.** They are listed so the
licence position is understood *before* any of them is introduced.

| Dataset | Would provide | For which planned gene | Licence posture |
|---|---|---|---|
| **DTD** (Describable Textures, Oxford VGG) | 47 texture attributes incl. *woven, knitted* | weave/texture validation on real photos | research-friendly |
| **FMD** (Flickr Material Database) | 10 material classes incl. fabric | fibre baseline | research |
| **MINC-2500** (Materials in Context) | material patches incl. fabric | fibre classifier training | research |
| **KTH-TIPS2** | texture under varying scale + illumination | robustness validation | research |
| **Fashionpedia / DeepFashion2** | garment segmentation + attributes | silhouette, hardware | research-only |

If and when these are introduced, they are downloaded locally or on Colab;
datasets and weights stay `.gitignore`d and are never committed.

## Benchmarks are currently synthetic

The validated numbers in [`BENCHMARKS.md`](BENCHMARKS.md) come from six
**rendered** reference swatches, not photographs. They prove the signal
processing recovers parameters it was never told (thread period within 1%,
weave family 6/6) — they do **not** establish accuracy on real-world macros.
That gap is real and stated rather than papered over.

## Ethics & honesty commitments

- **No fake precision.** We never print a lab-grade GSM off a JPEG. Weight is a
  class with a wide interval, at ~0.3 confidence, with its assumption stated.
- **Every claim is tiered and evidenced** (`MEASURED` / `ESTIMATED` / `INFERRED`);
  the schema refuses to serialise a claim with no evidence.
- **Degrade, don't fabricate.** A failing gene becomes a warning in
  `Genome.warnings`; it does not guess.
- **No identity claims.** kapra measures material properties. It makes no claim
  about brand, provenance or authenticity.

## Commercial path

A licensable product would need either datasets cleared for commercial use, or a
proprietary capture pipeline producing owned, labelled data. Deliberately out of
scope for V1 and tracked as a V2+ concern.
