export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  category: string;
  energyProfile: {
    zodiac?: ZodiacSign[];
    lunar?: LunarPhase[];
    planetary?: PlanetaryAlignment[];
  };
  // ... other properties
} 