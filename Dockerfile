# WhatToEatNext - Advanced Alchemical Food Recommendation System
# Multi-stage Docker build optimized for Next.js 15.5.16 + React 19 + TypeScript

# Stage 1: Base image with Bun
FROM oven/bun:alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    curl \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Stage 2: Dependencies installation
FROM base AS deps

# Copy package files and lockfile
COPY package.json bun.lock ./

# Install dependencies with frozen lockfile for reproducible builds
RUN bun install --frozen-lockfile

# Stage 3: Build the application
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and configuration files
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN bun run build

# Stage 4: Production runtime
FROM base AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy node_modules from builder
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Copy necessary configuration files
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application using Next.js start
CMD ["bun", "run", "start"]
