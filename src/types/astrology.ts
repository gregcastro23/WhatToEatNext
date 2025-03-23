import type { ElementalProperties, Element, ZodiacSign, LunarPhase, Planet } from '@/types/alchemy';

// Define ElementalCharacter if not already defined in alchemy.ts
type ElementalCharacter = 'Fire' | 'Water' | 'Earth' | 'Air';

export interface PlanetaryAlignment {
  sun: string;
  moon: string;
  mercury: string;
  venus: string;
  mars: string;
  jupiter: string;
  saturn: string;
  uranus: string;
  neptune: string;
  pluto: string;
  timestamp: string;
}

export interface BirthChart {
    elementalState: Record<ElementalCharacter, number>;
    planetaryPositions: Record<Planet, number>;
    ascendant: string;
    lunarPhase: LunarPhase;
    aspects: AstrologicalAspect[];
}

export interface AstrologicalAspect {
    planet1: Planet;
    planet2: Planet;
    aspectType: 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile';
    orb: number;
}

/* Example code - commented out to avoid type errors
import { FoodAlchemySystem } from '@/services/FoodAlchemySystem';
import { thermodynamicCalculator } from '@/calculations/gregsEnergy';

// Example usage
const foodSystem = new FoodAlchemySystem();
const compatibility = foodSystem.calculateFoodCompatibility(
    foodItem,
    birthChart,
    currentPlanetaryHour
); 
*/

// Export the LunarPhase type if not already defined in alchemy.ts
export type AstrologyLunarPhase = 
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent'; 