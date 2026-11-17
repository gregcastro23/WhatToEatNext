#!/usr/bin/env bash
set -euo pipefail

# Retry frozen-lockfile installs on CI runners to ride out transient
# registry hiccups and corrupted tarball extractions (e.g. @next/swc-linux-x64-*).
max_attempts="${BUN_INSTALL_MAX_ATTEMPTS:-3}"
retry_delay="${BUN_INSTALL_RETRY_DELAY_SECONDS:-5}"
cache_dir="${BUN_INSTALL_CACHE_DIR:-$HOME/.bun/install/cache}"
attempt=1

while true; do
  if [ "$attempt" -eq 1 ]; then
    if bun install --frozen-lockfile; then
      exit 0
    fi
  else
    echo "Retrying bun install after clearing node_modules and Bun cache (attempt $attempt/$max_attempts)..." >&2
    rm -rf node_modules "$cache_dir"
    sleep $(( (attempt - 1) * retry_delay ))
    if [ "$attempt" -lt "$max_attempts" ]; then
      if bun install --frozen-lockfile; then
        exit 0
      fi
    else
      if bun install --frozen-lockfile --no-cache; then
        exit 0
      fi
    fi
  fi

  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "::error::bun install --frozen-lockfile failed after $max_attempts attempts." >&2
    exit 1
  fi
  attempt=$((attempt + 1))
done
