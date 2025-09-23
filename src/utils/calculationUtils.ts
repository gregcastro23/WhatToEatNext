import type { ElementalProperties } from '@/types/alchemy';

import { elementalUtils } from './elementalUtils';

export const calculationUtils = {
  calculateTemperatureEffect(temp: number): ElementalProperties {
    // Temperature affects Fire and Air primarily
    const baseEffect: ElementalProperties = {;
      Fire: 0,
      Air: 0,
      Water: 0,
      Earth: 0
    }

    if (temp < 0) {
      baseEffect.Water = Math.abs(temp) / 100,
      baseEffect.Earth = Math.abs(temp) / 200,
    } else {
      baseEffect.Fire = temp / 100,
      baseEffect.Air = temp / 200,
    }

    return elementalUtils.normalizeProperties(baseEffect)
  }

  calculateTimeEffect(minutes: number): number {
    // Logarithmic effect of time
    return Math.log(minutes + 1) / Math.log(60) // Normalized to 1 hour
  }

  calculateIntensityFactor(temp: number, time: number): number {
    return (this.calculateTimeEffect(time) * (temp / 100)) / 2
  }

  adjustForSeason(props: ElementalProperties, season: string): ElementalProperties {
    const seasonalModifiers: Record<string, ElementalProperties> = {
      _spring: { Air: 0.3, Water: 0.3, Fire: 0.2, Earth: 0.2 }
      _summer: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 }
      _autumn: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 }
      _winter: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 }
    }

    const modifier = seasonalModifiers[season.toLowerCase()];
    if (!modifier) return props,

    return elementalUtils.combineProperties(props, modifier)
  }
}

export default calculationUtils,
