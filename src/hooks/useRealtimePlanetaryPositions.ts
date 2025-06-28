import { useState, useEffect, useCallback } from 'react';
import { PlanetPosition } from '@/utils/astrologyUtils';
import { getCurrentPlanetaryPositions, getPlanetaryPositionsForDateTime, testAstrologizeApi } from '@/services/astrologizeApi';

interface PlanetaryPositionsState {
  positions: { [key: string]: PlanetPosition } | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  source: string | null;
}

interface UseRealtimePlanetaryPositionsOptions {
  /** Auto-refresh interval in milliseconds (default: 5 minutes) */
  refreshInterval?: number;
  /** Custom location for calculations */
  location?: { latitude: number; longitude: number };
  /** Whether to start fetching immediately */
  autoStart?: boolean;
  /** Zodiac system to use (tropical or sidereal) */
  zodiacSystem?: 'tropical' | 'sidereal';
  /** Whether to test API connection on initialization */
  testConnection?: boolean;
}

export function useRealtimePlanetaryPositions(
  options: UseRealtimePlanetaryPositionsOptions = {}
) {
  const {
    refreshInterval = 30 * 60 * 1000, // 30 minutes to reduce API load
    location,
    autoStart = false, // Disabled by default to prevent unnecessary API calls
    zodiacSystem = 'tropical',
    testConnection = false
  } = options;

  const [state, setState] = useState<PlanetaryPositionsState>({
    positions: null,
    loading: false,
    error: null,
    lastUpdated: null,
    source: null
  });

  const fetchPositions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Try using astrologize API first for real calculations
      let positions: { [key: string]: PlanetPosition };
      let source = 'astrologize-api-realtime';

      try {
        positions = await getCurrentPlanetaryPositions(location, zodiacSystem);
        console.log('🌟 Successfully fetched real-time positions from astrologize API using', zodiacSystem, 'zodiac');
      } catch (astrologizeError) {
        console.warn('Astrologize API failed, falling back to API endpoint:', astrologizeError);
        
        // Fallback to our API endpoint
        const params = new URLSearchParams();
        if (location?.latitude) params.set('latitude', location.latitude.toString());
        if (location?.longitude) params.set('longitude', location.longitude.toString());

        const url = `/api/planetary-positions${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch planetary positions: ${response.statusText}`);
        }

        const data = await response.json();
        positions = data.positions;
        source = data.source || 'api-fallback';
      }

      setState({
        positions,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        source
      });

      console.log('🌟 Updated planetary positions from:', source);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      console.error('Failed to fetch planetary positions:', error);
    }
  }, [location, zodiacSystem]);

  const forceRefresh = useCallback(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoStart) {
      fetchPositions();
    }
  }, [fetchPositions, autoStart]);

  // Set up auto-refresh
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const interval = setInterval(fetchPositions, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPositions, refreshInterval]);

  return {
    ...state,
    refresh: forceRefresh,
    isRealtime: state.source === 'astrologize-api-realtime',
    isConnected: state.source?.includes('astrologize-api') ?? false
  };
}

// Hook for fetching positions for a specific date/time
export function usePlanetaryPositionsForDate(
  date: Date,
  location?: { latitude: number; longitude: number },
  zodiacSystem: 'tropical' | 'sidereal' = 'tropical'
) {
  const [state, setState] = useState<PlanetaryPositionsState>({
    positions: null,
    loading: false,
    error: null,
    lastUpdated: null,
    source: null
  });

  const fetchPositions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Try astrologize API first for specific date/time calculations
      let positions: { [key: string]: PlanetPosition };
      let source = 'astrologize-api-custom';

      try {
        positions = await getPlanetaryPositionsForDateTime(date, location, zodiacSystem);
        console.log('🌟 Successfully fetched positions for specific date from astrologize API using', zodiacSystem, 'zodiac');
      } catch (astrologizeError) {
        console.warn('Astrologize API failed for custom date, falling back to API endpoint:', astrologizeError);
        
        // Fallback to our API endpoint
        const body: any = { date: date.toISOString() };
        if (location) {
          body.latitude = location.latitude;
          body.longitude = location.longitude;
        }

        const response = await fetch('/api/planetary-positions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch planetary positions: ${response.statusText}`);
        }

        const data = await response.json();
        positions = data.positions;
        source = data.source || 'api-fallback';
      }

      setState({
        positions,
        loading: false,
        error: null,
        lastUpdated: new Date(),
        source
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [date, location, zodiacSystem]);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  return {
    ...state,
    refresh: fetchPositions,
    isRealtime: false,
    isConnected: state.source?.includes('astrologize-api') ?? false
  };
} 