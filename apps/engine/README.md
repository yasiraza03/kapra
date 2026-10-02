# kapra-engine

The CV/ML service. FastAPI + Pydantic v2. Reconstructs a garment's genome from
photographs using classical computer vision (FFT / GLCM / Gabor / CIELAB), with
pluggable extractors and honest, tiered confidence.

## Dev setup

```bash
python -m venv .venv
. .venv/Scripts/activate            # Windows (Git Bash);  .venv\Scripts\Activate.ps1 in PowerShell
pip install -e ".[dev]"             # Phase 0 base
pip install -e ".[dev,cv]"          # add when reaching the measured core (Phase 2)
```

## Run

```bash
uvicorn kapra_engine.main:app --app-dir src --reload --port 8000
# or from the repo root: pnpm engine
```

Docs: http://localhost:8000/docs · OpenAPI: http://localhost:8000/openapi.json
