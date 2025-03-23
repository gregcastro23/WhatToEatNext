export interface RecipeElementalMapping {
  elementalProperties: ElementalProperties;
  astrologicalProfile: {
    rulingPlanets: string[];
    favorableZodiac: ZodiacSign[];
    optimalAspects: string[];
    techniqueEnhancers: AstrologicalInfluence[];
  };
  cuisine: CuisineProfile;
  ingredientBalance: {
    base: string[];
    earth?: string[];
    fire?: string[];
    water?: string[];
    air?: string[];
  };
  astrologicalInfluences?: string[];
} 