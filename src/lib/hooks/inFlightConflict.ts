/**
 * In-flight duplicate response helper.
 *
 * ASOL's delivery classifier (alchm-agents-solana/lib/wten/delivery.ts:isInFlightBody)
 * specifically checks for `status: "in_flight"` in the JSON response body on HTTP 409
 * to trigger provider backoff and retries rather than treating the duplicate as
 * already_applied or rejected.
 *
 * @file src/lib/hooks/inFlightConflict.ts
 */

import { NextResponse } from "next/server";

export function inFlightConflict(
  legacy: Record<string, unknown> = {},
): NextResponse {
  return NextResponse.json(
    {
      ...legacy,
      status: "in_flight",
    },
    {
      status: 409,
      headers: {
        "Retry-After": "1",
      },
    },
  );
}
