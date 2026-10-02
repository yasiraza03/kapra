# kapra engine — container image.
#
# Portable across hosts: the server binds whatever port the platform injects via
# $PORT (Render, Koyeb, Cloud Run, Railway all do this), falling back to 7860 so
# it also runs locally and on Hugging Face Spaces.
#
#   docker build -t kapra-engine .
#   docker run -p 8000:8000 -e PORT=8000 kapra-engine
FROM python:3.12-slim

# OpenCV needs these even in the headless build (libGL for imgproc, glib for
# threading). Without them `import cv2` fails at runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libgl1 \
        libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUTF8=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Dependency layer first so source edits don't reinstall the CV stack.
COPY pyproject.toml README.md ./
COPY src ./src
RUN pip install --upgrade pip && pip install ".[cv,db]"

# Run unprivileged, with a writable home for the SQLite file.
RUN useradd -m -u 1000 kapra && chown -R kapra:kapra /app
USER kapra

# NOTE: most free tiers have an ephemeral filesystem — stored genomes do not
# survive a restart. Point KAPRA_DATABASE_URL at a hosted Postgres to persist
# them; the repository layer is already abstracted for it (see ADR-0001).
ENV KAPRA_DATABASE_URL=sqlite:////home/kapra/kapra.sqlite3 \
    PORT=7860

EXPOSE 7860

# Shell form so ${PORT} is expanded at runtime by the platform.
CMD uvicorn kapra_engine.main:app --host 0.0.0.0 --port ${PORT:-7860}
