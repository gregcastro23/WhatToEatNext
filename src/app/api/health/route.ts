/**
 * Health Check Endpoint
 * Provides system health status for Docker and monitoring
 */

import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/database";

export async function GET() {
  try {
    let dbStatus = "unavailable";
    
    try {
      const isHealthy = await checkDatabaseHealth();
      dbStatus = isHealthy ? "healthy" : "error";
    } catch (err) {
      console.error("[Health] DB check failed:", err);
      dbStatus = "error";
    }

    // Basic health checks
    const healthStatus = {
      status: dbStatus === "healthy" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "2.1.0",
      environment: process.env.NODE_ENV || "development",
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
