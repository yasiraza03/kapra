# kapra engine — container image.
#
# Targets Hugging Face Spaces (Docker SDK), which routes traffic to port 7860.
# Also runs anywhere else Docker does: `docker build -t kapra-engine . &&
# docker run -p 7860:7860 kapra-engine`.
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

# Spaces runs as a non-root user; keep a writable home for the SQLite file.
RUN useradd -m -u 1000 kapra && chown -R kapra:kapra /app
USER kapra

# NOTE: the Spaces filesystem is ephemeral — stored genomes do not survive a
# restart unless persistent storage is attached. See docs/DEPLOYMENT.md.
ENV KAPRA_DATABASE_URL=sqlite:////home/kapra/kapra.sqlite3

EXPOSE 7860

CMD ["uvicorn", "kapra_engine.main:app", "--host", "0.0.0.0", "--port", "7860"]
