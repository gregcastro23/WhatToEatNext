import { herbs } from '../data/ingredients/herbs';

// Define seasonalHerbGuide - a simple placeholder implementation
const seasonalHerbGuide: Record<string, { cuisines: Record<string, string[]> }> = {
  spring: { cuisines: {} },
  summer: { cuisines: {} },
  fall: { cuisines: {} },
  winter: { cuisines: {} },
};

export const _herbUtils = {
  findByCuisine: (cuisine: string) => {
    return Object.entries(herbs)
      .filter(([_, herb]) => herb.culinary_traditions?.[cuisine])
      .map(([name_]) => name);
  },

  findComplementary: (herbName: string, cuisine: string) => {
    const herb = herbs[herbName];
    if (!herb.culinary_traditions?.[cuisine]) return [];

    return herb.culinary_traditions[cuisine].pairings;
  },

  getSeasonalRecommendations: (season: string, cuisine: string) => {
    return seasonalHerbGuide[season].cuisines[cuisine] || [];
  },
};
