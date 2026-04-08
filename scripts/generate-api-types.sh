#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# generate-api-types.sh
#
# Generates TypeScript types from the Railway FastAPI backend's
# auto-generated OpenAPI (Swagger) schema.
#
# USAGE:
#   yarn generate-types              # uses BACKEND_URL from .env.local
#   BACKEND_URL=https://... yarn generate-types
#
# OUTPUT:
#   src/types/generated/railway-api.ts
#
# HOW IT WORKS:
#   FastAPI auto-generates /openapi.json from Pydantic models.
#   openapi-typescript (already a dev dep) converts that JSON
#   into strict TypeScript interfaces.
#
#   CI TIP: Add "generate-types" to your CI pipeline BEFORE
#   "typecheck" to ensure the frontend never compiles against
#   stale backend types.
# ─────────────────────────────────────────────────────────────

set -euo pipefail

# Load BACKEND_URL from .env.local if not already set
if [ -z "${BACKEND_URL:-}" ] && [ -f ".env.local" ]; then
  export $(grep -E '^BACKEND_URL=' .env.local | xargs)
fi

BACKEND_URL="${BACKEND_URL:-https://whattoeatnext-production.up.railway.app}"
OPENAPI_URL="${BACKEND_URL}/openapi.json"
OUT_FILE="src/types/generated/railway-api.ts"

echo "🔄  Fetching OpenAPI schema from ${OPENAPI_URL} ..."

# Verify the endpoint is reachable before running the generator
if ! curl --silent --fail --max-time 10 "${OPENAPI_URL}" > /dev/null; then
  echo "⚠️   Backend unreachable at ${OPENAPI_URL}."
  echo "     Types NOT regenerated. Existing file preserved."
  exit 0
fi

mkdir -p "$(dirname "${OUT_FILE}")"

npx openapi-typescript "${OPENAPI_URL}" --output "${OUT_FILE}"

echo "✅  Types written to ${OUT_FILE}"
echo ""
echo "   Next steps:"
echo "   1. Review the generated file for any breaking changes."
echo "   2. Update imports in route handlers to use the new types."
echo "   3. Commit the updated types alongside any backend schema changes."
