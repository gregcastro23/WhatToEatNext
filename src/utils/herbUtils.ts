import { herbs } from '../data/ingredients/herbs';
import { CuisineType } from '@/types/alchemy';

export const herbUtils = {
  findByCuisine: (cuisine: CuisineType) => {
    return Object.entries(herbs)
      .filter(([_, herb]) => herb.culinary_traditions?.[cuisine])
      .map(([name, _]) => name);
  },

  findComplementary: (herbName: string, cuisine: CuisineType) => {
    const herb = herbs[herbName];
    if (!herb?.culinary_traditions?.[cuisine]) return [];
    
    return herb.culinary_traditions[cuisine].pairings;
  },

  getSeasonalRecommendations: (season: string, cuisine: CuisineType) => {
    return seasonalHerbGuide[season]?.cuisines[cuisine] || [];
  }
};
