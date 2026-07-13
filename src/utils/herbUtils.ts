import { herbs } from "../data/ingredients/herbs";

// `culinary_traditions` is not part of the formal IngredientMapping shape
// (only a handful of spice entries define it); narrow via the mapping's
// catch-all index signature rather than widening to `any`.
interface HerbCulinaryTradition {
  pairings?: string[];
  [key: string]: unknown;
}

// Define seasonalHerbGuide - a simple placeholder implementation
const seasonalHerbGuide: Record<
  string,
  { cuisines: Record<string, string[]> }
> = {
  _spring: { cuisines: {} },
  _summer: { cuisines: {} },
  _fall: { cuisines: {} },
  _winter: { cuisines: {} },
};

export const _herbUtils = {
  findByCuisine: (cuisine: string) =>
    Object.entries(herbs)
      .filter(([_, herb]) => {
        const traditions = herb.culinary_traditions as
          | Record<string, HerbCulinaryTradition>
          | undefined;
        return traditions?.[cuisine];
      })
      .map(([name]) => name),
  _findComplementary: (herbName: string, cuisine: string) => {
    const herb = herbs[herbName];
    const traditions = herb.culinary_traditions as
      | Record<string, HerbCulinaryTradition>
      | undefined;
    const tradition = traditions?.[cuisine];
    if (!tradition) return [];
    return tradition.pairings;
  },
  _getSeasonalRecommendations: (season: string, cuisine: string) =>
    seasonalHerbGuide[season].cuisines[cuisine] || [],
};
