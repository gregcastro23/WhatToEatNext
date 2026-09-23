/**
 * Shared auth helpers for /api/cron/* routes. Vercel cron adds
 * `Authorization: Bearer <CRON_SECRET>` automatically when CRON_SECRET
 * is set in the project env. We refuse the request without one — never
 * leave a cron endpoint open to arbitrary callers.
 *
 * @file src/app/api/cron/_lib/cronAuth.ts
 */

import { bearerMatches } from "@/lib/hooks/secureCompare";
import type { NextRequest } from "next/server";

export function isAuthorizedCron(request: NextRequest): boolean {
  return bearerMatches(request.headers.get("authorization"), process.env.CRON_SECRET);
}

export function getCronBaseUrl(): string {
  if (process.env.SYNTHETIC_PROBE_BASE_URL) {
    return process.env.SYNTHETIC_PROBE_BASE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
