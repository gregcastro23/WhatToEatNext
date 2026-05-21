import {
  PlanetaryKineticsClient,
  type KineticsLocation,
  type KineticsOptions,
} from '@/services/PlanetaryKineticsClient'
import { logger } from '@/utils/logger'

export interface EnhancedKineticData {
  energy: number
  momentum: number
}

// Agent-keyed kinetics lives on the planetary_agents backend (PA owns the
// KINETICS_STATE cache keyed by agentId and the agent's birth location). PA
// internally fetches raw quantities from alchm.kitchen when needed.
//
// NOTE: the PYTHON backend is at api.agents.alchm.kitchen (and equivalently
// at passionate-vibrancy-production-2e31.up.railway.app). The bare
// agents.alchm.kitchen domain is the Next.js UI and does NOT serve
// /api/agents/{id}/kinetics — would 404 silently if used here.
const PA_URL = (
  process.env.NEXT_PUBLIC_PLANETARY_AGENTS_URL ||
  process.env.NEXT_PUBLIC_PLANETARY_KINETICS_URL ||
  'https://api.agents.alchm.kitchen'
).replace(/\/+$/, '')

const AGENT_KINETICS_TIMEOUT_MS = 3500
const DEFAULT_KINETICS: EnhancedKineticData = { energy: 1.0, momentum: 1.0 }

interface BackendKineticsResponse {
  power?: number
  forceMagnitude?: number
}

export class KineticsIntegration {
  static getInstance() {
    return new KineticsIntegration()
  }

  /**
   * Fetch agent-keyed kinetics from the FastAPI backend
   * (GET /api/agents/{agent_id}/kinetics). Returns DEFAULT_KINETICS if no
   * backend URL is configured or the request fails — callers can treat that
   * as "no signal" without special-casing errors.
   */
  async getAgentKinetics(agentId: string): Promise<EnhancedKineticData> {
    if (!PA_URL || !agentId) return DEFAULT_KINETICS

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), AGENT_KINETICS_TIMEOUT_MS)
    try {
      const res = await fetch(
        `${PA_URL}/api/agents/${encodeURIComponent(agentId)}/kinetics`,
        { signal: controller.signal, cache: 'no-store' },
      )
      if (!res.ok) {
        logger.warn(
          `getAgentKinetics: backend returned ${res.status} for agent ${agentId}`,
        )
        return DEFAULT_KINETICS
      }
      const data = (await res.json()) as BackendKineticsResponse
      return {
        energy: typeof data.power === 'number' ? data.power : DEFAULT_KINETICS.energy,
        momentum:
          typeof data.forceMagnitude === 'number'
            ? data.forceMagnitude
            : DEFAULT_KINETICS.momentum,
      }
    } catch (err) {
      logger.warn(`getAgentKinetics: backend unreachable for agent ${agentId}`, err)
      return DEFAULT_KINETICS
    } finally {
      clearTimeout(timer)
    }
  }

  async getEnhancedKinetics(
    location: KineticsLocation,
    options: KineticsOptions = {}
  ): Promise<EnhancedKineticData> {
    const response = await PlanetaryKineticsClient.getInstance().getEnhancedKinetics(
      location,
      options
    )
    if (!response.success || !response.data) {
      return { energy: 1.0, momentum: 1.0 }
    }
    return {
      energy: response.data.power,
      momentum: response.data.forceMagnitude,
    }
  }
}
