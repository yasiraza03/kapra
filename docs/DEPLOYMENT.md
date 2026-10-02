# Deployment

Two deployables: the **web app on Vercel** and the **Python engine** somewhere
that can run a container. Vercel cannot run the engine — it needs OpenCV, SciPy
and scikit-image, which do not fit the serverless model.

```
  browser ──▶ Vercel (Next.js)  ──▶  container host (FastAPI + OpenCV)
                       ▲                      │
                 ENGINE_INTERNAL_URL          └── SQLite (ephemeral on free tiers)
```

The browser never calls the engine directly: the Next.js server fetches it
server-side and proxies `/api/engine/*` (see `apps/web/next.config.mjs`). So
**no CORS configuration is needed**, and the engine URL stays private.

---

## Picking a host for the engine

Free tiers moved in 2026. Verified state at time of writing:

| Host | Free? | Notes |
|---|---|---|
| **Render** | ✅ Yes | 512 MB RAM, no credit card. Sleeps after ~15 min idle (30–50 s cold start). `render.yaml` is in this repo. **Recommended.** |
| **Koyeb** | ✅ Yes | 1 vCPU / 512 MB, plus a **free Postgres** — which also solves the ephemeral-storage problem. |
| **Railway** | ⚠️ Credits | $5 once + $1/month. Fine for a demo, runs out under real use. |
| **Hugging Face Spaces** | ❌ No longer | Docker and Gradio SDKs are now **paid**; only Static is free. The Dockerfile still works there on a paid plan. |
| **Fly.io** | ❌ No | No free tier for new accounts. |

The `Dockerfile` binds `$PORT` with a 7860 fallback, so it runs unmodified on
any of them.

---

## 1. Engine → Render (recommended)

1. render.com → **New → Blueprint**, connect the GitHub repo. Render reads
   `render.yaml` and configures the service automatically.

   *Or without the blueprint:* **New → Web Service** → connect the repo →
   Runtime **Docker**, Root Directory `apps/engine`, Plan **Free**.

2. Wait for the build (the CV stack takes a few minutes the first time).
3. Verify: `https://kapra-engine.onrender.com/health` → `{"status":"ok",...}`

### Engine environment variables

| Variable | Default | Notes |
|---|---|---|
| `KAPRA_DATABASE_URL` | SQLite in the container | point at Postgres to persist the archive |
| `KAPRA_LOG_LEVEL` | `INFO` | |
| `PORT` | injected by the host | the Dockerfile honours it |
| `KAPRA_CORS_ORIGINS` | `["http://localhost:3000"]` | only needed if a browser calls the engine directly |

---

## 2. Web → Vercel

Vercel detects Next.js from the `package.json` in the **Root Directory**, so it
must point at the app, not the repo root.

1. Import the repository in Vercel.
2. **Set Root Directory to `apps/web`.** This is required — leaving it at the
   repo root produces *"No Next.js version detected"*, because the root
   `package.json` only holds `turbo` and `typescript`.
3. Leave everything else alone. `apps/web/vercel.json` supplies the build:

   ```json
   "buildCommand": "cd ../.. && pnpm turbo run build --filter=@kapra/web",
   "outputDirectory": ".next"
   ```

   Vercel installs from the workspace root (it detects `pnpm-workspace.yaml`),
   then Turborepo builds `@kapra/genome-schema` first — which generates the
   shared TypeScript types from the canonical JSON Schema — before `next build`.

4. Set one environment variable:

   | Variable | Value |
   |---|---|
   | `ENGINE_INTERNAL_URL` | your engine URL, e.g. `https://kapra-engine.onrender.com` |

5. Deploy, then check `/` shows **engine online** in the footer readout.

> Package manager: Vercel runs `pnpm v12.8.1` from the `packageManager` field
> without extra configuration — confirmed in a real build log. No corepack flag
> is needed.

---

## 3. Deploying the site before the engine

Perfectly fine. Every page renders and the whole site works; uploads simply
report **engine offline** until `ENGINE_INTERNAL_URL` points at a live engine.
`probeEngine()` times out after 2.5 s, so a missing engine never hangs a page.

## 4. Cold starts

A sleeping free instance takes ~30–50 s to wake. The first analysis after idle
will be slow; the UI degrades honestly rather than hanging.

## 5. Persistence

Free tiers have ephemeral disks, so the archive empties on restart. To fix,
create a free Postgres (Koyeb, Neon or Render) and set `KAPRA_DATABASE_URL` to
its connection string. Only the repository layer touches the database — see
`docs/decisions/0001-sqlite-dev-persistence.md`.

---

## Pre-flight checklist

```bash
pnpm run typecheck && pnpm run lint && pnpm run test
pnpm turbo run build --filter=@kapra/web   # with NO dev server running
cd apps/engine && .venv/Scripts/python -m pytest -q
```

- [ ] `ENGINE_INTERNAL_URL` set in Vercel
- [ ] engine `/health` returns 200
- [ ] demo swatches committed under `apps/web/public/swatches/`
