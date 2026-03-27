# =============================================================================
# WhatToEatNext Backend - Production Dockerfile
# FastAPI + Uvicorn + PostgreSQL + Redis
# =============================================================================

# Stage 1: Base image with Python 3.11
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
  PYTHONDONTWRITEBYTECODE=1 \
  PIP_NO_CACHE_DIR=1 \
  PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
  # PostgreSQL client libraries
  libpq-dev \
  # Compiler and build tools for Python packages
  gcc \
  g++ \
  # Scientific computing dependencies (for numpy, scipy)
  gfortran \
  libopenblas-dev \
  liblapack-dev \
  # Curl for health checks
  curl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# =============================================================================
# Stage 2: Dependencies
# =============================================================================
FROM base AS dependencies

# Copy requirements file (repo-relative path for Railway)
COPY backend/requirements.txt .

# Install Python dependencies
# Separate scientific packages for better layer caching
RUN pip install --no-cache-dir \
  numpy==1.24.3 \
  scipy==1.11.4 \
  pandas==2.1.3 \
  scikit-learn==1.3.2

# Install remaining dependencies
RUN pip install --no-cache-dir -r requirements.txt

# =============================================================================
# Stage 3: Application
# =============================================================================
FROM base AS application

# Copy installed packages from dependencies stage
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

WORKDIR /app

# Set PYTHONPATH so "from backend.xxx" imports resolve
ENV PYTHONPATH=/app

# Create the backend package structure to match import paths (from backend.xxx)
RUN mkdir -p /app/backend

# Copy all backend modules INTO /app/backend/ so imports like
# "from backend.database import ..." resolve correctly
# Using repo-relative paths for Railway (build context is repo root)
COPY backend/database/ ./backend/database/
COPY backend/alchm_kitchen/ ./backend/alchm_kitchen/
COPY backend/utils/ ./backend/utils/
COPY backend/scripts/ ./backend/scripts/
COPY backend/alembic/ ./backend/alembic/
COPY backend/alembic.ini ./backend/
COPY backend/config/ ./backend/config/
COPY backend/schemas/ ./backend/schemas/

# Create __init__.py for the backend package
RUN touch /app/backend/__init__.py

# Copy environment file if it exists
RUN touch .env

# Create non-root user for security
RUN groupadd -r alchm && \
  useradd -r -g alchm -u 1000 alchm && \
  chown -R alchm:alchm /app

# Switch to non-root user
USER alchm

# Expose port (documentation only - actual port set by Railway via $PORT)
EXPOSE 8000

# NOTE: Railway handles health checks externally via railway.json
# Docker HEALTHCHECK removed to avoid conflicts with Railway's monitoring

# Default command: run uvicorn server
# Railway sets $PORT dynamically - this CMD is overridden by railway.json startCommand
CMD ["sh", "-c", "uvicorn backend.alchm_kitchen.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

# =============================================================================
# Build arguments for metadata
# =============================================================================
ARG BUILD_DATE
ARG BUILD_COMMIT
ARG BUILD_VERSION

# Metadata labels
LABEL maintainer="WhatToEatNext DevOps <devops@whattoeatnext.com>" \
  description="alchm.kitchen Backend Service - FastAPI + Uvicorn" \
  version="1.0.0" \
  service="alchm-kitchen" \
  environment="production" \
  build.date="${BUILD_DATE}" \
  build.commit="${BUILD_COMMIT}" \
  build.version="${BUILD_VERSION}"
