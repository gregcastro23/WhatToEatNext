import type { ElementalProperties } from '@/types/alchemy';

/**
 * Calculate simplified alchemical properties for display from elemental properties.
 * Uses a stable mapping consistent with our UI components.
 */
export function calculateAlchemicalPropertiesForDisplay(_elemental: ElementalProperties): {
  spirit: number,
  essence: number,
  matter: number,
  substance: number
} {
  const { Fire, Water, Earth, Air} = elemental;

  return {
    spirit: Fire * 0.7 + Air * 0.3,
    essence: Water * 0.6 + Fire * 0.4,
    matter: Earth * 0.8 + Water * 0.2,
    substance: Earth * 0.5 + Air * 0.5
  };
}

export default {
  calculateAlchemicalPropertiesForDisplay
};
