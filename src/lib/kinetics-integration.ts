import {
  PlanetaryKineticsClient,
  type KineticsLocation,
  type KineticsOptions,
} from '@/services/PlanetaryKineticsClient'

export interface EnhancedKineticData {
  energy: number
  momentum: number
}

export class KineticsIntegration {
  static getInstance() {
    return new KineticsIntegration()
  }

  // TODO: no agent-aware kinetics path exists yet. PlanetaryKineticsClient is
  // location-based, and there is no agent→location/context mapping. Returns
  // unit values until that data path is designed.
  async getAgentKinetics(_agentId: string): Promise<EnhancedKineticData> {
    return { energy: 1.0, momentum: 1.0 }
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
