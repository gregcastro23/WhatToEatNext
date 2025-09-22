import { usePlanetaryWebSocket } from '@/hooks/usePlanetaryWebSocket';
import { planetaryHoursClient } from '@/services/PlanetaryHoursClient';
import type { Planet } from '@/types/celestial';
import { useEffect, useMemo, useState } from 'react';

interface UseUnifiedPlanetaryHourOptions {
  latitude?: number,
  longitude?: number,
  useRealtime?: boolean
}

export function useUnifiedPlanetaryHour(options: UseUnifiedPlanetaryHourOptions = {}) {
  const { latitude, longitude, useRealtime = true } = options;
  const location = useMemo(
    () => (latitude !== undefined && longitude !== undefined ? { latitude, longitude } : undefined),
    [latitude, longitude],
  )

  const { connected, planetaryHour: wsHour } = usePlanetaryWebSocket(location)

  const [state, setState] = useState<{
    planet: Planet | null,
    isDaytime: boolean,
    start?: Date,
    end?: Date,
    loading: boolean,
    error: string | null,
    source: 'ws' | 'backend' | 'local' | null
  }>({ planet: null, isDaytime: false, loading: true, error: null, source: null })

  // Seed from backend/local on mount and when coords change
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await planetaryHoursClient.getCurrentPlanetaryHour({
          datetime: new Date(),
          location,
        })
        if (cancelled) return;
        setState({
          planet: result.planet,
          isDaytime: result.isDaytime,
          start: result.start,
          end: result.end,
          loading: false,
          error: null,
          source: (String(process.env.NEXT_PUBLIC_PLANETARY_HOURS_BACKEND).toLowerCase() === 'true' && process.env.NEXT_PUBLIC_BACKEND_URL)
            ? 'backend'
            : 'local'
        })
      } catch (err) {
        if (cancelled) return;
        setState(prev => ({ ...prev, loading: false, error: err instanceof Error ? err.message : 'Unknown error' }))
      }
    })()
    return () => { cancelled = true };
  }, [location?.latitude, location?.longitude])

  // Realtime override when available
  useEffect(() => {
    if (!useRealtime) return;
    if (!wsHour) return;
    setState(prev => ({
      planet: wsHour.planet,
      isDaytime: wsHour.isDaytime,
      start: wsHour.start,
      end: wsHour.end,
      loading: false,
      error: null,
      source: 'ws'
    }))
  }, [useRealtime, wsHour?.planet, wsHour?.isDaytime, wsHour?.start?.getTime(), wsHour?.end?.getTime(), connected])

  return {
    planet: state.planet,
    isDaytime: state.isDaytime,
    start: state.start,
    end: state.end,
    loading: state.loading,
    error: state.error,
    source: state.source,
    connected
  };
}

export default useUnifiedPlanetaryHour;
