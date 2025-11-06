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

# Copy requirements file
COPY requirements.txt .

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

# Copy database module
COPY database/ ./database/

# Copy alchm_kitchen service
COPY alchm_kitchen/ ./alchm_kitchen/

# Copy scripts (if needed for initialization)
COPY scripts/ ./scripts/

# Copy alembic migrations
COPY alembic/ ./alembic/
COPY alembic.ini ./

# Copy environment file if it exists (will be overridden at runtime by docker-compose/k8s)
# Using shell to make it optional since .dockerignore excludes it
RUN touch .env

# Create non-root user for security
RUN groupadd -r alchm && \
    useradd -r -g alchm -u 1000 alchm && \
    chown -R alchm:alchm /app

# Switch to non-root user
USER alchm

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command: run uvicorn server
CMD ["uvicorn", "alchm_kitchen.main:app", "--host", "0.0.0.0", "--port", "8000"]

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
