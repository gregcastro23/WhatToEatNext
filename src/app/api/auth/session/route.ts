/**
 * Explicit Auth.js session endpoint.
 *
 * The catch-all /api/auth/[...nextauth] route still handles the full Auth.js
 * surface, but keeping /api/auth/session concrete prevents transient dev/HMR
 * route misses from returning the HTML 404 page to next-auth/react.
 */

import { handlers } from "@/lib/auth/auth";
import { applyRequestAuthOrigin } from "@/lib/auth/runtimeOrigin";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  applyRequestAuthOrigin(request);
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  applyRequestAuthOrigin(request);
  return handlers.POST(request);
}
