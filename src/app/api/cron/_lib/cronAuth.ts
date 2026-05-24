/**
 * Shared auth helpers for /api/cron/* routes. Vercel cron adds
 * `Authorization: Bearer <CRON_SECRET>` automatically when CRON_SECRET
 * is set in the project env. We refuse the request without one — never
 * leave a cron endpoint open to arbitrary callers.
 *
 * @file src/app/api/cron/_lib/cronAuth.ts
 */

import type { NextRequest } from "next/server";

export function isAuthorizedCron(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${cronSecret}`;
  if (header.length !== expected.length) return false;
  return header === expected;
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
