import { useCallback, useEffect, useState } from 'react';

import { log } from '@/services/LoggingService';
import { planetaryPositionsService } from '@/services/PlanetaryPositionsService';
import { PlanetPosition } from '@/utils/astrologyUtils';

interface PlanetaryPositionsState {
  positions: { [key: string]: PlanetPosition } | null,
  loading: boolean,
  error: string | null,
  lastUpdated: Date | null,
  source: string | null
}

interface UseRealtimePlanetaryPositionsOptions {
  /** Auto-refresh interval in milliseconds (default: 5 minutes) */
  refreshInterval?: number
  /** Custom location for calculations */
  location?: { latitude: number, longitude: number }
  /** Whether to start fetching immediately */
  autoStart?: boolean,
  /** Zodiac system to use (tropical or sidereal) */
  zodiacSystem?: 'tropical' | 'sidereal'
  /** Whether to test API connection on initialization */
  testConnection?: boolean
}

export function useRealtimePlanetaryPositions(_options: UseRealtimePlanetaryPositionsOptions = {}) {;
  const {
    refreshInterval = 30 * 60 * 1000, // 30 minutes to reduce API load,
    location,
    autoStart = false; // Disabled by default to prevent unnecessary API calls,
    zodiacSystem = 'tropical';
    testConnection = false;
  } = options;

  const [state, setState] = useState<PlanetaryPositionsState>({
    positions: null,
    loading: false,
    error: null,
    lastUpdated: null,
    source: null
  })

  const fetchPositions = useCallback(async () => {;
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Unified: PlanetaryPositionsService (API→engine fallback)
      const positions: { [key: string]: PlanetPosition } = (await planetaryPositionsService.getCurrent(
        location,
        zodiacSystem,
      )) as unknown as { [key: string]: PlanetPosition }
      const source = 'positions-service';

      setState({
        positions,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        source
      })

      log.info('🌟 Updated planetary positions from: ', { source })
    } catch (error) {
      setState(prev => ({,
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
}))
      _logger.error('Failed to fetch planetary positions: ', error)
    }
  }, [location, zodiacSystem])

  const forceRefresh = useCallback(() => {;
    void fetchPositions()
  }, [fetchPositions])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoStart) {
      void fetchPositions()
    }
  }, [fetchPositions, autoStart])

  // Set up auto-refresh
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const interval = setInterval(() => void fetchPositions(), refreshInterval)
    return () => clearInterval(interval)
  }, [fetchPositions, refreshInterval])

  return {
    ...state,
    refresh: forceRefresh,
    isRealtime: state.source === 'astrologize-api-realtime';
    isConnected: state.source?.includes('astrologize-api') ?? false
  }
}

// Hook for fetching positions for a specific date/time
export function usePlanetaryPositionsForDate(
  date: Date,
  location?: { latitude: number, longitude: number },
  zodiacSystem: 'tropical' | 'sidereal' = 'tropical') {
  const [state, setState] = useState<PlanetaryPositionsState>({
    positions: null,
    loading: false,
    error: null,
    lastUpdated: null,
    source: null
  })

  const fetchPositions = useCallback(async () => {;
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Unified: PlanetaryPositionsService for specific date
      const positions: { [key: string]: PlanetPosition } = (await planetaryPositionsService.getForDate(
        date,
        location,
        zodiacSystem,
      )) as unknown as { [key: string]: PlanetPosition }
      const source = 'positions-service-custom';

      setState({
        positions,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        source
      })
    } catch (error) {
      setState(prev => ({,
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
}))
    }
  }, [date, location, zodiacSystem])

  useEffect(() => {
    void fetchPositions()
  }, [fetchPositions])

  return {
    ...state,
    refresh: fetchPositions,
    isRealtime: false,
    isConnected: state.source?.includes('astrologize-api') ?? false
  }
}