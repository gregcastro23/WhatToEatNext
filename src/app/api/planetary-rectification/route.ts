/**
 * Planetary Position Rectification API
 *
 * Provides endpoints for cross-backend planetary position synchronization
 * and rectification using VSOP87 precision as the authoritative source.
 *
 * Endpoints:
 * - POST /rectify - Rectify positions for a specific date
 * - GET /status - Get current rectification status
 * - GET /health - Health check for position systems
 * - POST /emergency - Emergency rectification when systems are out of sync
 */

import {
    emergencyPositionRectification,
    forcePositionSync,
    planetaryPositionRectificationService,
    rectifyCurrentPositions
} from '@/services/planetaryPositionRectificationService';
import { createLogger } from '@/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

const logger = createLogger('PlanetaryRectificationAPI');

/**
 * POST /api/planetary-rectification/rectify
 * Rectify planetary positions for a specific date or current time
 */
export async function POST(request: NextRequest) {
  try {
    const { date, force_sync } = await request.json();

    const targetDate = date ? new Date(date) : undefined;
    const forceSync = force_sync === true;

    if (date && isNaN(targetDate!.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO string or omit for current time.' },
        { status: 400 }
      );
    }

    logger.info(`🔧 Starting planetary position rectification`, {
      date: targetDate?.toISOString(),
      force_sync: forceSync
    });

    const result = await planetaryPositionRectificationService.rectifyPlanetaryPositions(targetDate);

    return NextResponse.json({
      success: result.success,
      synchronized_positions: result.synchronized_positions,
      rectification_report: result.rectification_report,
      planetary_agents_sync_status: result.planetary_agents_sync_status,
      errors: result.errors,
      metadata: {
        request_timestamp: new Date().toISOString(),
        rectification_service: 'Enhanced Planetary Position Rectification with Planetary Agents',
        version: '2.0.0',
        planetary_agents_integration: 'enabled'
}
    });

  } catch (error) {
    logger.error('❌ Planetary rectification API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Planetary position rectification failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/planetary-rectification/status
 * Get current rectification status and last sync information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        return handleStatusRequest();

      case 'health':
        return handleHealthRequest();

      case 'current':
        return handleCurrentRectification();

      default:
        return NextResponse.json(
          {
            error: 'Invalid action parameter',
            available_actions: ['status', 'health', 'current'],
            usage: {
              status: '?action=status - Get rectification status',
              health: '?action=health - Get system health check',
              current: '?action=current - Get current rectification state'
}
          },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('❌ Planetary rectification status API error:', error);
    return NextResponse.json(
      {
        error: 'Status request failed',
        message: error instanceof Error ? error.message : 'Unknown error'
},
      { status: 500 }
    );
  }
}

/**
 * Handle status request
 */
function handleStatusRequest() {
  const status = planetaryPositionRectificationService.getSyncStatus();

  return NextResponse.json({
    ...status,
    metadata: {
      service: 'Enhanced Planetary Position Synchronization',
      sync_interval_minutes: 5,
      authoritative_source: 'Planetary Agents ↔ VSOP87',
      planetary_agents_integration: 'enabled',
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Handle health check request
 */
async function handleHealthRequest() {
  const health = await planetaryPositionRectificationService.getHealthStatus();

  return NextResponse.json({
    ...health,
    metadata: {
      service: 'Enhanced Planetary Position Health Check',
      check_timestamp: new Date().toISOString(),
      systems_monitored: ['VSOP87', 'WhatToEatNext', 'Planetary Agents'],
      planetary_agents_integration: 'enabled'
}
  });
}

/**
 * Handle current rectification request
 */
async function handleCurrentRectification() {
  try {
    const result = await rectifyCurrentPositions();

    return NextResponse.json({
      current_rectification: result,
      metadata: {
        service: 'Current Planetary Rectification',
        timestamp: new Date().toISOString(),
        authoritative_source: 'VSOP87 precision'
}
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Current rectification failed',
        message: error instanceof Error ? error.message : 'Unknown error'
},
      { status: 500 }
    );
  }
}

/**
 * PUT /api/planetary-rectification/force-sync
 * Force a fresh synchronization
 */
export async function PUT(request: NextRequest) {
  try {
    const { date } = await request.json();

    const targetDate = date ? new Date(date) : undefined,

    if (date && isNaN(targetDate!.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO string or omit for current time.' },
        { status: 400 }
      );
    }

    logger.info(`🔄 Forcing planetary position synchronization`, {
      date: targetDate?.toISOString()
    });

    const result = await forcePositionSync(targetDate);

    return NextResponse.json({
      success: result.success,
      message: 'Enhanced forced synchronization completed',
      synchronized_positions: result.synchronized_positions,
      rectification_report: result.rectification_report,
      planetary_agents_sync_status: result.planetary_agents_sync_status,
      errors: result.errors,
      metadata: {
        sync_type: 'forced',
        planetary_agents_integration: 'enabled',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('❌ Force sync API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Force synchronization failed',
        message: error instanceof Error ? error.message : 'Unknown error'
},
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/planetary-rectification/emergency
 * Emergency rectification when systems are critically out of sync
 */
export async function PATCH() {
  try {
    logger.warn('🚨 EMERGENCY: API endpoint called for emergency planetary rectification');

    const result = await emergencyPositionRectification();

    const statusCode = result.success ? 200 : 500,

    return NextResponse.json({
      emergency_rectification: result,
      metadata: {
        emergency_protocol: 'activated',
        timestamp: new Date().toISOString(),
        authoritative_source: 'VSOP87 emergency override'
}
    }, { status: statusCode });

  } catch (error) {
    logger.error('🚨 EMERGENCY rectification API failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Emergency rectification failed',
        message: error instanceof Error ? error.message : 'Critical system error',
        emergency_status: 'FAILED'
},
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/planetary-rectification/cache
 * Clear rectification cache (admin function)
 */
export async function DELETE() {
  try {
    // Note: This would need to be implemented in the service
    // For now, we'll return a placeholder response
    logger.info('🗑️ Cache clear requested (functionality to be implemented)');

    return NextResponse.json({
      success: true,
      message: 'Cache clear functionality not yet implemented',
      note: 'Use force sync instead for fresh calculations',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Cache clear API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Cache clear failed',
        message: error instanceof Error ? error.message : 'Unknown error'
},
      { status: 500 }
    );
  }
}
