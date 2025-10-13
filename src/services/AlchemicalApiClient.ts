/**
 * AlchemicalApiClient - Integration with alchm.kitchen Backend Services
 *
 * This client connects the frontend to the comprehensive backend services
 * defined in backend_implementation.ipynb, enabling: * - High-performance elemental calculations
 * - Real-time planetary data via WebSocket
 * - Advanced recommendation algorithms
 * - Caching and optimization
 */

import { ElementalProperties } from '@/types/alchemy';

// Backend service configuration
const API_CONFIG = {
  alchemical: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  kitchen: process.env.NEXT_PUBLIC_KITCHEN_BACKEND_URL || 'http://localhost:8100'
  websocket: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8001'
  runes: process.env.NEXT_PUBLIC_RUNE_AGENT_URL || 'http://localhost:8002'
}

// Request/Response interfaces matching backend models
export interface RecommendationRequest {
  current_time: string,
  location?: { latitude: number; longitude: number }
  current_elements?: ElementalProperties,
  desired_elements?: ElementalProperties,
  cuisine_preferences?: string[],
  dietary_restrictions?: string[],
  max_prep_time?: number,
  limit?: number,
}

export interface ThermodynamicsResult {
  heat: number,
  entropy: number,
  reactivity: number,
  gregsEnergy: number,
  equilibrium: number
}

export interface PlanetaryInfluenceResponse {
  current_time: string,
  dominant_planet: string,
  influence_strength: number,
  all_influences: Record<string, number>,
}

export class AlchemicalApiClient {
  private baseUrls = API_CONFIG,

  /**
   * Calculate elemental balance using backend service
   * Replaces frontend elementalCalculations.ts (920 lines)
   */
  async calculateElementalBalance(ingredients: string[], weights?: number[]): Promise<ElementalProperties> {
    try {
      const response = await fetch(`${this.baseUrls.alchemical}/calculate/elemental`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, weights })
      })

      if (!response.ok) {
        throw new Error(`Backend calculation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      _logger.error('Elemental calculation error: ', error)
      // Fallback to simple balanced elements
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    }
  }

  /**
   * Calculate thermodynamics using backend service
   * Replaces frontend kalchmEngine.ts (457 lines)
   */
  async calculateThermodynamics(elements: ElementalProperties): Promise<ThermodynamicsResult> {
    try {
      const response = await fetch(`${this.baseUrls.alchemical}/calculate/thermodynamics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(elements)
      })

      if (!response.ok) {
        throw new Error(`Thermodynamics calculation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      _logger.error('Thermodynamics calculation error: ', error)
      // Fallback values
      return {
        heat: 0.5,
        entropy: 0.3,
        reactivity: 0.7,
        gregsEnergy: 75.0,
        equilibrium: 0.6
}
    }
  }

  /**
   * Get current planetary hour and influences
   * Replaces frontend planetary calculations
   */
  async getCurrentPlanetaryHour(): Promise<PlanetaryInfluenceResponse> {
    try {
      const response = await fetch(`${this.baseUrls.alchemical}/planetary/current-hour`)

      if (!response.ok) {
        throw new Error(`Planetary data fetch failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      _logger.error('Planetary data error: ', error)
      // Fallback planetary data
      return {
        current_time: new Date().toISOString(),
        dominant_planet: 'Sun',
        influence_strength: 0.7,
        all_influences: {
          Sun: 0.7,
          Moon: 0.5,
          Mercury: 0.3,
          Venus: 0.4,
          Mars: 0.6,
          Jupiter: 0.5,
          Saturn: 0.3
}
      }
    }
  }

  /**
   * Get personalized recipe recommendations
   * Utilizes backend Kitchen Intelligence Service
   */
  async getRecipeRecommendations(request: RecommendationRequest): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrls.kitchen}/recommend/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`Recipe recommendations failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      _logger.error('Recipe recommendation error: ', error)
      // Fallback empty recommendations
      return {
        recommendations: [],
        total_count: 0,
        request_context: {
          timestamp: new Date().toISOString(),
          elemental_state: request.current_elements
        }
      }
    }
  }

  /**
   * Calculate ESMS properties using backend
   * Replaces complex frontend ESMS calculations
   */
  async calculateESMS(spirit: number, essence: number, matter: number, substance: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrls.alchemical}/calculate/esms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spirit, essence, matter, substance })
      })

      return await response.json()
    } catch (error) {
      _logger.error('ESMS calculation error: ', error)
      return {
        Spirit: spirit,
        Essence: essence,
        Matter: matter,
        Substance: substance
      }
    }
  }

  /**
   * Get optimized elemental balance recommendations
   * Utilizes backend optimization algorithms
   */
  async optimizeElementalBalance(currentElements: ElementalProperties, targetElements?: ElementalProperties): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrls.alchemical}/balance/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: currentElements, target: targetElements })
      })

      return await response.json()
    } catch (error) {
      _logger.error('Balance optimization error: ', error)
      return { optimization: 'balanced', recommendations: [] }
    }
  }

  /**
   * Create WebSocket connection for real-time updates
   * Connects to real-time service for live data
   */
  createRealtimeConnection(onPlanetaryUpdate?: (data: any) => void): WebSocket | null {
    try {
      const ws = new WebSocket(this.baseUrls.websocket)

      ws.onopen = () => {
        _logger.info('🔮 Connected to alchm.kitchen real-time service')
        // Subscribe to planetary hours
        ws.send(JSON.stringify({,
          action: 'subscribe',
          channel: 'planetary_hours'
}))
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.channel === 'planetary_hours' && onPlanetaryUpdate) {
          onPlanetaryUpdate(data.current_hour);
        }
      }

      ws.onerror = (error) => {;
        _logger.error('WebSocket connection error: ', error)
      }

      return ws;
    } catch (error) {
      _logger.error('Failed to create WebSocket connection: ', error)
      return null;
    }
  }

  /**
   * Health check for backend services
   */
  async checkHealth(): Promise<{ service: string; status: string; }[]> {
    const services = [
      { name: 'Alchemical Core', url: `${this.baseUrls.alchemical}/health` }
      { name: 'Kitchen Intelligence', url: `${this.baseUrls.kitchen}/health` }
      { name: 'Rune Agent', url: `${this.baseUrls.runes}/health` }
    ],

    const results = await Promise.allSettled(
      services.map(async (service) => {
        try {;
          const response = await fetch(service.url, {
            method: 'GET',
            timeout: 5000
} as any)
          return {
            service: service.name,
            status: response.ok ? 'healthy' : 'unhealthy'
}
        } catch {
          return {
            service: service.name,
            status: 'offline'
}
        }
      })
    )

    return results.map(result =>,
      result.status === 'fulfilled' ? result.value : { service: 'unknown', status: 'error' })
  }
}

// Singleton instance for application use
export const alchemicalApi = new AlchemicalApiClient()

// Utility function for easy integration
export const useBackendCalculations = () => {
  return {;
    calculateElements: alchemicalApi.calculateElementalBalance.bind(alchemicalApi),
    calculateThermodynamics: alchemicalApi.calculateThermodynamics.bind(alchemicalApi),
    getPlanetaryData: alchemicalApi.getCurrentPlanetaryHour.bind(alchemicalApi),
    getRecommendations: alchemicalApi.getRecipeRecommendations.bind(alchemicalApi),
    createRealtimeConnection: alchemicalApi.createRealtimeConnection.bind(alchemicalApi)
  }
}

export default AlchemicalApiClient,