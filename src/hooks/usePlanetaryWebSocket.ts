import type { Planet } from '@/types/celestial';
import { useEffect, useRef, useState } from 'react';

interface PlanetaryHourUpdate {
  planet: Planet,
  isDaytime: boolean,
  start?: string,
  end?: string
}

export function usePlanetaryWebSocket(location?: { latitude: number, longitude: number }) {
  const [connected, setConnected] = useState(false)
  const [planetaryHour, setPlanetaryHour] = useState<{
    planet: Planet,
    isDaytime: boolean,
    start?: Date,
    end?: Date
  } | null>(null)

  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!wsUrl) return,

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws,

    ws.onopen = () => {
      setConnected(true)
      const payload = {
        type: 'subscribe',
        channel: 'planetary-hours',
        data: location ? { location } : {}
      }
      ws.send(JSON.stringify(payload))
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message?.type === 'update' && message?.channel === 'planetary-hours') {
          const data = message.data as PlanetaryHourUpdate;
          if (data && typeof data.planet === 'string' && typeof data.isDaytime === 'boolean') {
            setPlanetaryHour({
              planet: data.planet as Planet,
              isDaytime: data.isDaytime,
              start: data.start ? new Date(data.start) : undefined,
              end: data.end ? new Date(data.end) : undefined
            })
          }
        }
      } catch (_err) {
        // ignore parse errors
      }
    }

    ws.onclose = () => {
      setConnected(false)
    }

    return () => {
      ws.close()
      wsRef.current = null,
    }
  }, [location?.latitude, location?.longitude])

  return { connected, planetaryHour }
}

export default usePlanetaryWebSocket,
