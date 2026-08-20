/**
 * Health Check Endpoint
 * Provides system health status for Docker and monitoring
 */

import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/database";

export async function GET() {
  try {
    let dbStatus = "unavailable";
    let dbLatencyMs: number | null = null;

    try {
      // `checkDatabaseHealth` returns an OBJECT ({healthy, latency?, error?}),
      // and it catches internally rather than throwing. The previous code did
      // `const isHealthy = await checkDatabaseHealth()` and then tested that
      // OBJECT for truthiness — always true — so this endpoint reported
      // "healthy" for every possible outcome, including an unreachable
      // database, and the catch below was unreachable too. Read `.healthy`.
      const health = await checkDatabaseHealth();
      dbStatus = health.healthy ? "healthy" : "error";
      dbLatencyMs = health.latency ?? null;
      if (!health.healthy) {
        // `_logger.warn` would emit nothing in production; this must be visible.
        console.error("[Health] database unhealthy:", health.error ?? "unknown");
      }
    } catch (err) {
      console.error("[Health] DB check failed:", err);
      dbStatus = "error";
    }

    // Basic health checks
    const healthStatus = {
      status: dbStatus === "healthy" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION ?? process.env.npm_package_version ?? "unknown",
      environment: process.env.NODE_ENV || "development",
      // NOTE: this route deliberately still answers HTTP 200 when the database
      // is down. The Docker/compose healthchecks use `curl -f`, which only
      // fails on >= 400, so they cannot see `status: "degraded"` either way —
      // but `/lab` (public) does `r.ok ? r.json() : null` and would render an
      // EMPTY panel during the outage it exists to show. Changing the status
      // code means fixing those consumers and accepting container restarts
      // during an upstream outage; that is a deliberate operational call, not
      // a drive-by.
      databaseLatencyMs: dbLatencyMs,
      services: {
        database: dbStatus,
        cache: "memory",
        external_apis: "checking...",
      },
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function HEAD() {
  // Simple HEAD request for basic health check
  return new NextResponse(null, { status: 200 });
}
