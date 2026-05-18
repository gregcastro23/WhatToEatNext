/**
 * GET /api/auth/sessions — list this user's active sessions.
 *
 * Returns rows from the `device_sessions` table when present; falls back
 * to JWT introspection (a single "current" row from the requester's token)
 * when the table is missing or the DB is unreachable, so the
 * /profile/security UI always renders something useful.
 *
 * @file src/app/api/auth/sessions/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

interface SessionRow {
  id: string;
  sub: string;
  device: string;
  loc: string;
  time: string;
  current: boolean;
}

function relativeTime(input: Date | string | null | undefined): string {
  if (!input) return "—";
  const ts = typeof input === "string" ? new Date(input) : input;
  const diff = Date.now() - ts.getTime();
  if (!Number.isFinite(diff)) return "—";
  if (diff < 60_000) return "Active now";
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return ts.toISOString().slice(0, 10);
}

function jwtFallback(
  request: Request,
  userId: string,
  jti?: string | null,
): SessionRow[] {
  const ua = request.headers.get("user-agent") || "Unknown device";
  return [
    {
      id: jti || "current",
      sub: "kitchen.alchm.kitchen",
      device: ua.split(/[)]/)[0]?.slice(0, 80) || "This browser",
      loc: "—",
      time: "Active now",
      current: true,
    },
  ];
}

export async function GET(request: Request) {
  const session = await auth();
  const user = session?.user as
    | { id?: string; tier?: string }
    | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Resolve the current jti from the JWT so we can mark the corresponding
  // device_sessions row as "current".
  let currentJti: string | undefined;
  try {
    const { getToken } = await import("next-auth/jwt");
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });
    currentJti = token?.deviceSessionId ?? token?.sessionId ?? undefined;
  } catch {
    /* ignore — fall back to JWT introspection below */
  }

  try {
    const { executeQuery } = await import("@/lib/database");
    const result = await executeQuery(
      `SELECT id, subdomain, device, user_agent, location_city, location_region, location_country, last_seen_at, revoked_at
         FROM device_sessions
        WHERE user_id = $1 AND revoked_at IS NULL
        ORDER BY last_seen_at DESC
        LIMIT 25`,
      [user.id],
    );

    const rows: SessionRow[] = result.rows.map((r: any) => {
      const ua = (r.user_agent || r.device || "Unknown device") as string;
      const locParts = [r.location_city, r.location_region, r.location_country]
        .filter((x: unknown): x is string => typeof x === "string" && x.length > 0);
      return {
        id: r.id as string,
        sub: (r.subdomain as string) || "kitchen.alchm.kitchen",
        device: ua.slice(0, 80),
        loc: locParts.join(", ") || "—",
        time: relativeTime(r.last_seen_at as string),
        current: currentJti === r.id,
      };
    });

    if (rows.length === 0) {
      return NextResponse.json({
        sessions: jwtFallback(request, user.id, currentJti),
        source: "jwt-fallback",
      });
    }

    return NextResponse.json({ sessions: rows, source: "db" });
  } catch (err) {
    // DB unavailable or table missing — degrade to JWT introspection.
    return NextResponse.json({
      sessions: jwtFallback(request, user.id, currentJti),
      source: "jwt-fallback",
      error: process.env.NODE_ENV === "development" ? String(err) : undefined,
    });
  }
}
