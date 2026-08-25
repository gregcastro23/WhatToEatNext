#!/usr/bin/env bash

# ==============================================================================
# Vercel Ignored Build Step Script
# ==============================================================================
# Purpose:
#   Cancels Vercel builds early (at zero build CPU cost) when commits do not
#   modify Next.js frontend code or configuration (e.g. backend Python updates,
#   database migrations, Rust crates, markdown documentation, or test runs).
#
# Exit Codes for Vercel:
#   exit 0 -> SKIP / CANCEL build (no CPU minutes claimed or billed)
#   exit 1 -> PROCEED with build (changes detected in frontend paths)
# ==============================================================================

set -uo pipefail

echo "======================================================="
echo "🔍 Alchm.kitchen Vercel Build Step Filter"
echo "======================================================="

COMMIT_MSG="${VERCEL_GIT_COMMIT_MESSAGE:-$(git log -1 --pretty=%B 2>/dev/null || echo '')}"
COMMIT_REF="${VERCEL_GIT_COMMIT_REF:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')}"
PREV_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"
CURR_SHA="${VERCEL_GIT_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null || echo '')}"
VERCEL_ENV="${VERCEL_ENV:-development}"

echo "📌 Branch: $COMMIT_REF"
echo "📌 Environment: $VERCEL_ENV"
echo "📌 Current SHA: ${CURR_SHA:-unknown}"
echo "📌 Previous Deployed SHA: ${PREV_SHA:-none}"

# ------------------------------------------------------------------------------
# 1. Check for explicit skip directives in commit message
# ------------------------------------------------------------------------------
if [[ "$COMMIT_MSG" =~ \[(skip[ -]vercel|skip[ -]ci|no[ -]build|skip[ -]build)\] ]]; then
  echo "⏩ [SKIP] Explicit skip directive detected in commit message:"
  echo "   \"$COMMIT_MSG\""
  echo "🛑 Cancelling Vercel build (0 CPU minutes used)."
  exit 0
fi

# ------------------------------------------------------------------------------
# 2. Define frontend critical files and directories
# ------------------------------------------------------------------------------
FRONTEND_PATHS=(
  "src"
  "public"
  "next.config.js"
  "package.json"
  "bun.lock"
  "vercel.json"
  "tailwind.config.js"
  "postcss.config.mjs"
  "tsconfig.json"
  ".vercelignore"
  "components.json"
  "scripts/check-route-sizes.cjs"
  "scripts/check-version.cjs"
  "scripts/vercel-ignore-build-step.sh"
)

# ------------------------------------------------------------------------------
# 3. Determine Git Diff Target
# ------------------------------------------------------------------------------
DIFF_TARGET=""

if [[ -n "$PREV_SHA" ]] && git cat-file -e "${PREV_SHA}^{commit}" 2>/dev/null; then
  echo "🔎 Evaluating diff against previous deployment ($PREV_SHA)..."
  DIFF_TARGET="$PREV_SHA $CURR_SHA"
elif git rev-parse --verify HEAD^ >/dev/null 2>&1; then
  echo "🔎 Evaluating diff against parent commit (HEAD^)..."
  DIFF_TARGET="HEAD^ HEAD"
fi

if [[ -z "$DIFF_TARGET" ]]; then
  echo "⚠️ [FALLBACK] Unable to determine git parent or previous deployment SHA."
  echo "✅ Defaulting to proceed with build safely."
  exit 1
fi

# ------------------------------------------------------------------------------
# 4. Check for differences in frontend critical paths
# ------------------------------------------------------------------------------
# git diff --quiet returns:
#   0 if no differences were found
#   1 if differences were found
if git diff --quiet $DIFF_TARGET -- "${FRONTEND_PATHS[@]}"; then
  echo "🛑 [SKIP] No changes detected in frontend paths:"
  git diff --name-only $DIFF_TARGET | head -n 15 | while read -r file; do
    echo "   - $file"
  done
  echo "🛑 Cancelling Vercel build (0 CPU minutes used)."
  exit 0
else
  echo "✅ [BUILD] Frontend changes detected:"
  git diff --name-only $DIFF_TARGET -- "${FRONTEND_PATHS[@]}" | head -n 15 | while read -r file; do
    echo "   + $file"
  done
  echo "🚀 Proceeding with Vercel production build."
  exit 1
fi
