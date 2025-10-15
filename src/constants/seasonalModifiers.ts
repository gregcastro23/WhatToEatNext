import { zodiacSeasons } from '@/data/zodiacSeasons';
import { ZodiacSign, ElementalProperties } from '@/types/alchemy';

// Create element modifiers based on zodiac sign's element
type ZodiacElementModifiers = {
  [key in ZodiacSign]: ElementalProperties;
}

// Helper function to create elemental modifiers based on dominant element
function createElementalModifiersForZodiac(dominantElement: string): ElementalProperties {
  return {
    Fire: dominantElement === 'Fire'
        ? 0.8
        : dominantElement === 'Air'
          ? 0.6
          : dominantElement === 'Earth'
            ? 0.3
            : 0.2,
    Water: dominantElement === 'Water'
        ? 0.8
        : dominantElement === 'Earth'
          ? 0.6
          : dominantElement === 'Air'
            ? 0.3
            : 0.2,
    Earth: dominantElement === 'Earth'
        ? 0.8
        : dominantElement === 'Water'
          ? 0.6
          : dominantElement === 'Fire'
            ? 0.3
            : 0.2,
    Air: dominantElement === 'Air'
        ? 0.8
        : dominantElement === 'Fire'
          ? 0.6
          : dominantElement === 'Water'
            ? 0.3
            : 0.2
  }
}

// Build the modifiers for each zodiac sign
export const ZODIAC_MODIFIERS: ZodiacElementModifiers = Object.entries(zodiacSeasons).reduce(
  (acc, [sign, data]) => {
    acc[sign as any] = createElementalModifiersForZodiac(data.element);
    return acc;
  },
  {} as ZodiacElementModifiers
);

// Define a type with string index signature for SEASONAL_MODIFIERS
export interface SeasonalModifiers {
  spring: ElementalProperties;
  summer: ElementalProperties;
  autumn: ElementalProperties;
  winter: ElementalProperties;
  [key: string]: ElementalProperties // Allow string indexing for zodiac signs and any other keys
}

// For backward compatibility with the old season names
export const SEASONAL_MODIFIERS: SeasonalModifiers = {
  spring: createElementalModifiersForZodiac('Air'),
  summer: createElementalModifiersForZodiac('Fire'),
  autumn: createElementalModifiersForZodiac('Earth'),
  winter: createElementalModifiersForZodiac('Water'),
  // Add fall as an alias for autumn to maintain backward compatibility
  fall: createElementalModifiersForZodiac('Earth'),
  // Add zodiac signs to the seasonal modifiers for direct access
  ...ZODIAC_MODIFIERS
}

// Influence of seasonal factors on food preferences and energy levels
export const _SEASONAL_INFLUENCE = {
  // Each season's influence strength (0-1)
  strength: {
    spring: 0.7,
    summer: 0.9,
    autumn: 0.6,
    winter: 0.8
  },
  // How seasons affect mood and energy
  energyModifier: {
    spring: { vitality: 0.6, creativity: 0.7, stability: 0.4, adaptability: 0.8 },
    summer: { vitality: 0.9, creativity: 0.8, stability: 0.5, adaptability: 0.6 },
    autumn: { vitality: 0.5, creativity: 0.6, stability: 0.8, adaptability: 0.5 },
    winter: { vitality: 0.4, creativity: 0.5, stability: 0.7, adaptability: 0.4 }
  }
}

export default SEASONAL_MODIFIERS;
