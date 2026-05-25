# =============================================================================
# Stage 1: Builder - Build-time dependencies and package compilation
# =============================================================================
FROM python:3.11-slim-bookworm AS builder

# Set build environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

# Install build-time dependencies (compilers needed for pyswisseph, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    gfortran \
    libpq-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install requirements
COPY backend/requirements.txt .
RUN pip install --user --no-warn-script-location -r requirements.txt

# =============================================================================
# Stage 2: Runner - Lightweight production runtime
# =============================================================================
FROM python:3.11-slim-bookworm AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install runtime-only dependencies (dynamic libraries for postgres)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r alchm && \
    useradd -r -g alchm -u 1000 alchm

# Copy installed packages from builder
COPY --from=builder /root/.local /home/alchm/.local
ENV PATH=/home/alchm/.local/bin:$PATH

# Copy backend application code
COPY backend/ ./backend/

# Migration runner needs the SQL files. We copy them into the image so the
# backend can apply any unapplied database/init/*.sql on startup.
COPY database/init/ ./database/init/

# Ensure correct ownership
RUN chown -R alchm:alchm /app /home/alchm

USER alchm

EXPOSE 8000

# Health check helps Railway monitor container status
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# On boot, apply any unapplied database/init/*.sql via the migration runner,
# then start uvicorn. Runner exits 0 on success or when up-to-date, non-zero
# on first failing migration. Railway will not start the web process if the
# migration step fails (the && short-circuits), which is the desired behavior:
# we'd rather see a failed deploy than serve traffic against a half-migrated
# schema. Railway dynamically sets PORT, fallback to 8000.
CMD ["sh", "-c", "python -m backend.scripts.run_init_migrations && uvicorn backend.alchm_kitchen.main:app --host 0.0.0.0 --port ${PORT:-8000} --log-level info"]
