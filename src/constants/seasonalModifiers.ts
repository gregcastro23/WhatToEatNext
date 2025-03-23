import { ZodiacSign, ElementalProperties } from '@/types/alchemy';
import { zodiacSeasons } from '@/data/zodiacSeasons';

// Create element modifiers based on zodiac sign's element
type ZodiacElementModifiers = {
  [key in ZodiacSign]: ElementalProperties;
};

// Helper function to create elemental modifiers based on dominant element
function createElementalModifiersForZodiac(dominantElement: string): ElementalProperties {
  return {
    Fire: dominantElement === 'Fire' ? 0.8 : dominantElement === 'Air' ? 0.6 : dominantElement === 'Earth' ? 0.3 : 0.2,
    Water: dominantElement === 'Water' ? 0.8 : dominantElement === 'Earth' ? 0.6 : dominantElement === 'Air' ? 0.3 : 0.2,
    Earth: dominantElement === 'Earth' ? 0.8 : dominantElement === 'Water' ? 0.6 : dominantElement === 'Fire' ? 0.3 : 0.2,
    Air: dominantElement === 'Air' ? 0.8 : dominantElement === 'Fire' ? 0.6 : dominantElement === 'Water' ? 0.3 : 0.2
  };
}

// Build the modifiers for each zodiac sign
export const ZODIAC_MODIFIERS: ZodiacElementModifiers = Object.entries(zodiacSeasons).reduce(
  (acc, [sign, data]) => {
    acc[sign as ZodiacSign] = createElementalModifiersForZodiac(data.element);
    return acc;
  }, 
  {} as ZodiacElementModifiers
);

// Define a type with string index signature for SEASONAL_MODIFIERS
export interface SeasonalModifiers {
  spring: ElementalProperties;
  summer: ElementalProperties;
  fall: ElementalProperties;
  winter: ElementalProperties;
  [key: string]: ElementalProperties; // Allow string indexing for zodiac signs and any other keys
}

// For backward compatibility with the old season names
export const SEASONAL_MODIFIERS: SeasonalModifiers = {
  spring: createElementalModifiersForZodiac('Air'),
  summer: createElementalModifiersForZodiac('Fire'),
  fall: createElementalModifiersForZodiac('Earth'),
  winter: createElementalModifiersForZodiac('Water'),
  // Add zodiac signs to the seasonal modifiers for direct access
  ...ZODIAC_MODIFIERS
};

export default SEASONAL_MODIFIERS; 