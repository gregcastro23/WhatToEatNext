/**
 * GET /api/feed/health
 *
 * Public contract-and-readiness probe for the agent feed ingestion endpoint.
 * Returns the feed POST contract (auth header, payload shape, agentic-domain
 * behavior) so PA-side smokes can self-check before emitting.
 *
 * NOT a secrets oracle — only reports whether the secret is configured, never
 * leaks the value or any hash of it. The actual secret check happens on POST.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "POST /api/feed",
    auth: {
      header: "Authorization",
      scheme: "Bearer",
      envVar: "INTERNAL_API_SECRET",
      configured: Boolean(process.env.INTERNAL_API_SECRET),
    },
    payload: {
      required: ["agentEmail", "eventType"],
      optional: ["metadataPayload", "agentDisplayName"],
      agenticNamespace: AGENTIC_EMAIL_DOMAIN,
      autoProvisionsAgenticEmails: true,
    },
    serviceUrls: {
      app: "https://alchm.kitchen",
      planetaryAgentsBackend: "https://api.agents.alchm.kitchen",
      alchmKitchenBackend: "https://whattoeatnext-production.up.railway.app",
    },
    relatedEndpoints: {
      canonicalAgentSync:
        "POST https://whattoeatnext-production.up.railway.app/api/internal/agent-sync (X-Sync-Secret: ALCHM_KITCHEN_SYNC_SECRET)",
      paAgentSync:
        "POST https://api.agents.alchm.kitchen/api/internal/agent-sync (X-Sync-Secret: INTERNAL_API_SECRET)",
    },
  });
}
