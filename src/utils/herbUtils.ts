import ../data  from 'ingredients ';

// Define seasonalHerbGuide - a simple placeholder implementation
const seasonalHerbGuide: Record<string, { cuisines: Record<string, string[]> }> = {
  spring: { cuisines: {} },
  summer: { cuisines: {} },
  fall: { cuisines: {} },
  winter: { cuisines: {} }
};

export let herbUtils = {
  findByCuisine: (cuisine: string) => {
    return Object.entries(herbs)
      .filter(([_, herb]) => herb.culinary_traditions?.[cuisine])
      .map(([name, _]) => name);
  },

  findComplementary: (herbName: string, cuisine: string) => {
    let herb = herbs[herbName];
    if (!herb?.culinary_traditions?.[cuisine]) return [];
    
    return herb.culinary_traditions[cuisine].pairings;
  },

  getSeasonalRecommendations: (season: string, cuisine: string) => {
    return seasonalHerbGuide[season]?.cuisines[cuisine] || [];
  }
};
