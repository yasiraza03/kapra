# Deployment

Two deployables, both on free tiers: the **web app on Vercel** and the
**engine on Hugging Face Spaces** (Docker). Total cost: $0/month.

```
  browser ──▶ Vercel (Next.js)  ──▶  HF Spaces (FastAPI + OpenCV)
                       ▲                      │
                 ENGINE_INTERNAL_URL          └── SQLite (ephemeral)
```

The browser never calls the engine directly: the Next.js server fetches it
server-side and proxies `/api/engine/*` (see `apps/web/next.config.mjs`). That
means **no CORS configuration is needed**, and the engine URL stays private.

---

## 1. Engine → Hugging Face Spaces

1. Create a new Space: **SDK = Docker**, hardware = CPU basic (free).
2. Push the contents of `apps/engine/` to the Space repo (the `Dockerfile` is
   already there and listens on port 7860, which is what Spaces expects).

   ```bash
   git clone https://huggingface.co/spaces/<you>/kapra-engine
   cp -r apps/engine/* kapra-engine/
   cd kapra-engine && git add -A && git commit -m "kapra engine" && git push
   ```

3. Wait for the build, then verify:
   `https://<you>-kapra-engine.hf.space/health` → `{"status":"ok",...}`

**Known limitation:** the Spaces filesystem is ephemeral, so stored genomes are
lost when the Space restarts or sleeps. The archive will appear empty after a
cold start. Fixes, in order of effort: attach persistent storage (paid), or
point `KAPRA_DATABASE_URL` at a free hosted Postgres (Neon) — the repository
layer is already abstracted for exactly this (see ADR-0001).

### Engine environment variables

| Variable | Default | Notes |
|---|---|---|
| `KAPRA_DATABASE_URL` | `sqlite:////home/kapra/kapra.sqlite3` | set in the Dockerfile |
| `KAPRA_LOG_LEVEL` | `INFO` | |
| `KAPRA_CORS_ORIGINS` | `["http://localhost:3000"]` | only needed if a browser calls the engine directly |

---

## 2. Web → Vercel

1. Import the repository in Vercel. **Keep Root Directory as the repo root** —
   `vercel.json` already sets the monorepo build:

   ```json
   "buildCommand": "pnpm turbo run build --filter=@kapra/web",
   "outputDirectory": "apps/web/.next"
   ```

   Turborepo builds `@kapra/genome-schema` first, which generates the shared
   TypeScript types from the canonical JSON Schema.

2. Set one environment variable:

   | Variable | Value |
   |---|---|
   | `ENGINE_INTERNAL_URL` | `https://<you>-kapra-engine.hf.space` |

3. Deploy, then check `/` shows **engine online** in the footer readout.

---

## 3. Pre-flight checklist

Run before pushing a deploy:

```bash
pnpm run typecheck && pnpm run lint && pnpm run test && pnpm run build
cd apps/engine && ./.venv/Scripts/python.exe -m pytest -q   # or .venv/bin/python
```

- [ ] `pnpm run build` passes with **no dev server running** (Windows file locks
      prevent `next build` and `next dev` sharing `.next`)
- [ ] `ENGINE_INTERNAL_URL` set in Vercel
- [ ] Space `/health` returns 200
- [ ] Demo swatches committed under `apps/web/public/swatches/`

## 4. Cold starts

A free Space sleeps after inactivity and takes ~30s to wake. The web app
degrades honestly rather than hanging: `probeEngine()` times out after 2.5s and
the UI reports the engine as offline instead of blocking the page.
