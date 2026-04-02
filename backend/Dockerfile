# =============================================================================
# WhatToEatNext Backend - Railway Deployment
# Single-stage build for Railway compatibility
# =============================================================================

FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install requirements first (better layer caching)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Create backend directory structure
RUN mkdir -p /app/backend

# Copy backend code - using single COPY command to reduce layers
COPY backend/ ./backend/

# Create non-root user
RUN groupadd -r alchm && \
    useradd -r -g alchm -u 1000 alchm && \
    chown -R alchm:alchm /app

USER alchm

EXPOSE 8000

# Railway sets $PORT dynamically
CMD ["sh", "-c", "uvicorn backend.alchm_kitchen.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
