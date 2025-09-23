import { NextResponse } from 'next/server';

import {
    currentMomentManager,
    getCurrentMoment,
    updateCurrentMoment
} from '@/services/CurrentMomentManager';
import { createLogger } from '@/utils/logger';

const logger = createLogger('CurrentMomentAPI')

/**
 * Handle GET requests - get current moment status and data
 */
export async function GET(request: Request) {
  try {
    const { _searchParams} = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true';

    logger.info(`Getting current moment data (forceRefresh: ${forceRefresh})`)

    const currentMoment = await getCurrentMoment(forceRefresh)
    const performanceMetrics = currentMomentManager.getPerformanceMetrics()

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      currentMoment,
      status: {
        isDataFresh: !forceRefresh,
        lastUpdated: currentMoment.metadata.lastUpdated,
        source: currentMoment.metadata.source,
        locationCount: Object.keys(currentMoment.planetaryPositions).length,
        performance: {
          totalUpdates: performanceMetrics.totalUpdates,
          successRate:
            performanceMetrics.totalUpdates > 0
              ? (
                  (performanceMetrics.successfulUpdates / performanceMetrics.totalUpdates) *
                  100
                ).toFixed(1) + '%'
              : '0%',
          averageResponseTime: Math.round(performanceMetrics.averageResponseTime) + 'ms',
          lastError: performanceMetrics.lastError,
          currentMinuteUpdates:
            performanceMetrics.updateFrequency[new Date().toISOString().slice(0, 16)] || 0
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error getting current moment:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get current moment data',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
      { status: 500 }
    )
  }
}

/**
 * Handle POST requests - trigger manual update of current moment
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customDateTime, latitude, longitude, _action = 'update'} = body;

    logger.info(`Current moment ${action} requested`)

    let result,

    switch (action) {
      case 'update': const customDate = customDateTime ? new Date(customDateTime) : undefined
        const customLocation = latitude && longitude ? { latitude, longitude } : undefined

        result = await updateCurrentMoment(customDate, customLocation)

        return NextResponse.json({
          success: true,
          action: 'update',
          timestamp: new Date().toISOString(),
          message: 'Current moment updated successfully',
          currentMoment: result,
          updatedFiles: [
            'current-moment-chart.ipynb',
            'src/constants/systemDefaults.ts',
            'src/utils/streamlinedPlanetaryPositions.ts',
            'src/utils/accurateAstronomy.ts'
          ]
        })

      case 'status': const currentMoment = await getCurrentMoment()
        return NextResponse.json({
          success: true,
          action: 'status',
          timestamp: new Date().toISOString(),
          currentMoment,
          systemStatus: {
            isHealthy: true,
            lastUpdate: currentMoment.metadata.lastUpdated,
            source: currentMoment.metadata.source,
            dataIntegrity:
              Object.keys(currentMoment.planetaryPositions).length >= 10 ? 'good' : 'incomplete'
          }
        })

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            validActions: ['update', 'status'],
            timestamp: new Date().toISOString()
          }
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Error in current moment POST:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process current moment request',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
      { status: 500 }
    )
  }
}

/**
 * Handle PUT requests - update specific files only
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { _targets = ['all'], customDateTime, latitude, longitude} = body,

    logger.info(`Selective update requested for targets: ${targets.join(', ')}`)

    // Get current moment first
    const customDate = customDateTime ? new Date(customDateTime) : undefined
    const customLocation = latitude && longitude ? { latitude, longitude } : undefined

    const currentMoment = await updateCurrentMoment(customDate, customLocation)

    const updateResults = {
      notebook: false,
      systemDefaults: false,
      streamlinedPositions: false,
      accurateAstronomy: false
    }

    // Note: The updateCurrentMoment already updates all files,
    // so this is more of a status report
    if (targets.includes('all') || targets.includes('notebook')) {
      updateResults.notebook = true,
    }
    if (targets.includes('all') || targets.includes('systemDefaults')) {
      updateResults.systemDefaults = true,
    }
    if (targets.includes('all') || targets.includes('streamlinedPositions')) {
      updateResults.streamlinedPositions = true,
    }
    if (targets.includes('all') || targets.includes('accurateAstronomy')) {
      updateResults.accurateAstronomy = true,
    }

    return NextResponse.json({
      success: true,
      action: 'selective_update',
      timestamp: new Date().toISOString(),
      message: 'Selective update completed',
      targets,
      updateResults,
      currentMoment
    })
  } catch (error) {
    logger.error('Error in current moment PUT:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process selective update',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
      { status: 500 }
    )
  }
}