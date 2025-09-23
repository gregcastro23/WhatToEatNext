/**
 * Health Check Endpoint
 * Provides system health status for Docker and monitoring
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'not_applicable', // We don't use a database,
        cache: 'memory', // Using in-memory cache,
        external_apis: 'available', // Assume available unless we check
      }
    }

    return NextResponse.json(healthStatus, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
      { status: 500 }
    )
  }
}

export async function HEAD() {
  // Simple HEAD request for basic health check
  return new NextResponse(null, { status: 200 })
}