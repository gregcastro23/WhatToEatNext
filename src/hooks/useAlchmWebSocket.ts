import { useEffect, useState } from 'react';
import { alchmWs, type PlanetaryHourUpdate, type EnergyUpdate, type CelestialEvent } from '@/lib/websocket/alchm-websocket';
import { logger } from '@/lib/logger';

export interface WebSocketState {
  isConnected: boolean,
  lastPlanetaryHour: PlanetaryHourUpdate | null,
  lastEnergyUpdate: EnergyUpdate | null,
  lastCelestialEvent: CelestialEvent | null,
}

export function useAlchmWebSocket(): WebSocketState {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    lastPlanetaryHour: null,
    lastEnergyUpdate: null,
    lastCelestialEvent: null,
  })

  useEffect(() => {
    // Extend the WebSocket class with custom handlers for this hook
    const originalUpdatePlanetaryHour = alchmWs['updatePlanetaryHour'];
    const originalUpdateEnergy = alchmWs['updateEnergy'];
    const originalUpdateCelestial = alchmWs['updateCelestial'];

    // Override handlers to update local state
    alchmWs['updatePlanetaryHour'] = (data: PlanetaryHourUpdate) => {
      setState(prev => ({ ...prev, lastPlanetaryHour: data }))
      logger.debug('WebSocket planetary hour update', data)
    }

    alchmWs['updateEnergy'] = (data: EnergyUpdate) => {
      setState(prev => ({ ...prev, lastEnergyUpdate: data }))
      logger.debug('WebSocket energy update', data)
    }

    alchmWs['updateCelestial'] = (data: CelestialEvent) => {
      setState(prev => ({ ...prev, lastCelestialEvent: data }))
      logger.debug('WebSocket celestial event', data)
    }

    // Connect to WebSocket
    try {
      alchmWs.connect()
      setState(prev => ({ ...prev, isConnected: true }))
      logger.info('WebSocket connection initiated')
    } catch (error) {
      logger.error('Failed to connect to WebSocket', error)
    }

    // Cleanup on unmount
    return () => {
      alchmWs['updatePlanetaryHour'] = originalUpdatePlanetaryHour,
      alchmWs['updateEnergy'] = originalUpdateEnergy,
      alchmWs['updateCelestial'] = originalUpdateCelestial,
      setState(prev => ({ ...prev, isConnected: false }))
    }
  }, [])

  return state,
}