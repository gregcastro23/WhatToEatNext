import type {
  ElementalProperties,
  LunarPhase,
  LunarPhaseWithSpaces,
  Season,
  ZodiacSign,
} from "@/types/alchemy";
import type { Recipe } from "@/types/recipe";

// type Rating = 'optimal' | 'favorable' | 'neutral' | 'suboptimal'
type Element = "Fire" | "Water" | "Earth" | "Air";

const SEASONAL_ELEMENTS: Record<Season, Record<Element, number>> = {
  spring: { Air: 0.3, Fire: 0.3, Water: 0.3, Earth: 0.1 },
  summer: { Fire: 0.4, Air: 0.3, Earth: 0.1, Water: 0.2 },
  autumn: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
  fall: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
  winter: { Water: 0.4, Earth: 0.3, Fire: 0.1, Air: 0.2 },
  all: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
};

// Map seasons to zodiac signs
const seasonToZodiac: Record<Season, ZodiacSign[]> = {
  spring: ["aries", "taurus", "gemini"],
  summer: ["cancer", "leo", "virgo"],
  autumn: ["libra", "scorpio", "sagittarius"],
  fall: ["libra", "scorpio", "sagittarius"],
  winter: ["capricorn", "aquarius", "pisces"],
  all: [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ],
};

const ZODIAC_ELEMENTS: Record<ZodiacSign, Element> = {
  aries: "Fire",
  leo: "Fire",
  sagittarius: "Fire",
  taurus: "Earth",
  virgo: "Earth",
  capricorn: "Earth",
  gemini: "Air",
  libra: "Air",
  aquarius: "Air",
  cancer: "Water",
  scorpio: "Water",
  pisces: "Water",
};

// Map lunar phases to elemental influences
const LUNAR_PHASE_ELEMENTS: Record<
  LunarPhaseWithSpaces,
  Record<Element, number>
> = {
  "new moon": { Air: 0.4, Fire: 0.3, Water: 0.2, Earth: 0.1 },
  "waxing crescent": { Fire: 0.3, Air: 0.3, Water: 0.2, Earth: 0.2 },
  "first quarter": { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
  "waxing gibbous": { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
  "full moon": { Fire: 0.4, Water: 0.4, Air: 0.1, Earth: 0.1 },
  "waning gibbous": { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
  "last quarter": { Water: 0.3, Earth: 0.3, Air: 0.2, Fire: 0.2 },
  "waning crescent": { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
};

// Map lunar phases to recommended foods
const LUNAR_FOOD_ASSOCIATIONS: Record<LunarPhaseWithSpaces, string[]> = {
  "new moon": ["seeds", "sprouts", "beginnings", "light meals", "detox"],
  "waxing crescent": ["greens", "sprouts", "fresh herbs", "light proteins"],
  "first quarter": ["grains", "nuts", "hearty vegetables", "proteins"],
  "waxing gibbous": ["proteins", "complex meals", "hearty dishes"],
  "full moon": ["celebration foods", "rich meals", "festive dishes"],
  "waning gibbous": ["fermented foods", "rich broths", "hearty stews"],
  "last quarter": ["root vegetables", "soups", "healing foods"],
  "waning crescent": ["cleansing foods", "simple meals", "light broths"],
};

export interface SeasonalEffectiveness {
  rating: "excellent" | "good" | "neutral" | "poor";
  score: number;
  elementalBreakdown: ElementalProperties;
  breakdown: {
    elementalAlignment: number;
    ingredientSuitability: number;
    seasonalBonus: number;
    zodiacAlignment?: number;
    lunarPhaseAlignment?: number;
  };
}

const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];

export const _SEASONAL_MODIFIERS = {
  spring: { Air: 0.4, Water: 0.3, Earth: 0.2, Fire: 0.1 },
  summer: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
  autumn: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
  winter: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
} as const satisfies Record<
  Exclude<Season, "fall" | "all">,
  ElementalProperties
>;

const getDefaultElementalProps = (): ElementalProperties => ({
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
});

// Interface definition for AstrologicalProperties used in this file
interface AstrologicalProperties {
  favorable: string[];
  unfavorable: string[];
  neutral: string[];
}

const getSeasonalElementalInfluenceInternal = (
  season: Season,
): ElementalProperties =>
  (SEASONAL_ELEMENTS[season] as ElementalProperties) ||
  getDefaultElementalProps();

const _getRating = (score: number): SeasonalEffectiveness["rating"] => {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "neutral";
  return "poor";
};

export const _getSeasonalEffectiveness = async (
  recipe: Recipe,
  _season: Season,
  currentZodiac?: ZodiacSign | null,
  currentLunarPhase?: LunarPhase | null,
): Promise<SeasonalEffectiveness> => {
  if (!recipe || !_season) {
    return {
      rating: "poor",
      score: 0,
      elementalBreakdown: getDefaultElementalProps(),
      breakdown: {
        elementalAlignment: 0,
        ingredientSuitability: 0,
        seasonalBonus: 0,
      },
    };
  }

  const elementalAlignment = await calculateRecipeSeasonalAlignment(
    recipe,
    _season,
  );
  const ingredientSuitability = await _calculateIngredientSuitability(
    recipe,
    _season,
  );
  const seasonalBonus = await _calculateSeasonalBonus(recipe, _season);

  const zodiacAlignment = currentZodiac
    ? await _calculateZodiacAlignment(recipe, currentZodiac)
    : 0;
  const lunarPhaseAlignment = currentLunarPhase
    ? _calculateLunarPhaseAlignment(recipe, currentLunarPhase)
    : 0;

  const totalScore =
    elementalAlignment +
    ingredientSuitability +
    seasonalBonus +
    zodiacAlignment +
    lunarPhaseAlignment;
  const elementalBreakdown = calculateElementalBreakdown(recipe, _season);

  return {
    rating: _getRating(totalScore),
    score: totalScore,
    elementalBreakdown,
    breakdown: {
      elementalAlignment,
      ingredientSuitability,
      seasonalBonus,
      zodiacAlignment,
      lunarPhaseAlignment,
    },
  };
};

export const calculateRecipeSeasonalAlignment = async (
  recipe: Recipe,
  season: Season,
): Promise<number> => {
  if (!recipe.elementalProperties || !season) return 0;
  let alignmentScore = 0;
  const seasonalModifier = getSeasonalElementalInfluenceInternal(season);

  (
    Object.entries(recipe.elementalProperties) as Array<[Element, number]>
  ).forEach(([element, value]) => {
    const modifierValue = seasonalModifier[element] || 0;
    const numericValue = typeof value === "number" ? value : 0;
    alignmentScore += numericValue * modifierValue;
  });

  return Math.round(alignmentScore * 100);
};

const _calculateIngredientSuitability = async (
  recipe: Recipe,
  _season: Season,
): Promise<number> => {
  let suitabilityScore = 30; // Base score
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    let seasonalIngredientCount = 0;
    recipe.ingredients.forEach((ingredient) => {
      const { seasonality } = ingredient as unknown as {
        seasonality?: Season[];
      };
      if (
        seasonality &&
        Array.isArray(seasonality) &&
        seasonality.includes(_season)
      ) {
        seasonalIngredientCount++;
      }
    });
    if (recipe.ingredients.length > 0) {
      const seasonalProportion =
        seasonalIngredientCount / recipe.ingredients.length;
      suitabilityScore += Math.round(seasonalProportion * 20); // Boost by up to 20 points
    }
  }
  return suitabilityScore;
};

const _calculateSeasonalBonus = async (
  recipe: Recipe,
  _season: Season,
): Promise<number> => {
  let bonus = 15; // Base bonus
  const recipeSeasonsRaw = (recipe as unknown as { season?: Season | Season[] })
    .season;
  if (recipeSeasonsRaw) {
    const recipeSeasons = Array.isArray(recipeSeasonsRaw)
      ? recipeSeasonsRaw
      : [recipeSeasonsRaw];
    if (recipeSeasons.some((s) => s.toLowerCase() === _season.toLowerCase())) {
      bonus += 15; // Additional bonus for explicitly seasonal recipes
    }
  }
  return bonus;
};

// Calculate zodiac alignment
const _calculateZodiacAlignment = async (
  recipe: Recipe,
  currentZodiac: ZodiacSign,
): Promise<number> => {
  if (!recipe || !currentZodiac) return 0;
  let alignmentScore = 0;
  const zodiacElement = ZODIAC_ELEMENTS[currentZodiac];
  if (recipe.elementalProperties && zodiacElement) {
    const recipeElementValues = Object.entries(
      recipe.elementalProperties,
    ) as Array<[Element, number]>;
    recipeElementValues.sort((a, b) => b[1] - a[1]);
    const dominantElement = recipeElementValues[0]?.[0];
    if (dominantElement === zodiacElement) {
      alignmentScore += 15; // Bonus for matching element
    }
  }
  const { zodiacInfluences } = recipe as unknown as {
    zodiacInfluences?: ZodiacSign[];
  };
  if (
    zodiacInfluences &&
    Array.isArray(zodiacInfluences) &&
    zodiacInfluences.includes(currentZodiac)
  ) {
    alignmentScore += 10; // Bonus for explicit zodiac match
  }
  return alignmentScore;
};

// Calculate lunar phase alignment
const _calculateLunarPhaseAlignment = (
  recipe: Recipe,
  lunarPhase: LunarPhase,
): number => {
  if (!recipe || !lunarPhase) return 0;
  let alignmentScore = 0;

  // Elemental affinity with lunar phase
  const lunarKey = lunarPhase as LunarPhaseWithSpaces;
  const phaseMap = LUNAR_PHASE_ELEMENTS[lunarKey];
  if (recipe.elementalProperties && phaseMap) {
    let phaseAlignmentScore = 0;
    (
      Object.entries(recipe.elementalProperties) as Array<[Element, number]>
    ).forEach(([element, value]) => {
      const lunarElementValue = phaseMap[element] || 0;
      phaseAlignmentScore += (value || 0) * lunarElementValue;
    });
    alignmentScore += Math.round(phaseAlignmentScore * 10);
  }

  // Explicit lunar phase influence
  const lunarInfluences = (
    recipe as unknown as { lunarPhaseInfluences?: LunarPhaseWithSpaces[] }
  ).lunarPhaseInfluences;
  if (
    lunarInfluences &&
    Array.isArray(lunarInfluences) &&
    lunarInfluences.includes(lunarKey)
  ) {
    alignmentScore += 25;
  }

  return alignmentScore;
};

const _getSeasonalModifier = (_season: Season, element: Element): number => {
  const modifiers: Record<Exclude<Season, "all">, Record<Element, number>> = {
    spring: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
    summer: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    fall: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 },
  };
  return (modifiers[_season] && modifiers[_season][element]) || 0.25;
};

function _getElementalBreakdown(
  _season: Season,
): Record<Season, ElementalProperties> {
  const baseElements = getDefaultElementalProps();
  const seasonalModifiers: Record<Season, ElementalProperties> = {
    spring: { Fire: 0.3, Water: 0.3, Air: 0.25, Earth: 0.15 },
    summer: { Fire: 0.4, Water: 0.2, Air: 0.25, Earth: 0.15 },
    autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    fall: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    winter: { Fire: 0.15, Water: 0.35, Air: 0.15, Earth: 0.35 },
    all: { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 },
  };
  return {
    spring: { ...baseElements, ...seasonalModifiers.spring },
    summer: { ...baseElements, ...seasonalModifiers.summer },
    autumn: { ...baseElements, ...seasonalModifiers.autumn },
    fall: { ...baseElements, ...seasonalModifiers.fall },
    winter: { ...baseElements, ...seasonalModifiers.winter },
    all: { ...baseElements, ...seasonalModifiers.all },
  };
}

function _calculateSeasonalScores(
  recipe: Recipe,
  currentZodiac?: ZodiacSign | null,
  lunarPhase?: LunarPhase | null,
): {
  seasonalScores: Record<Season, number>;
  elementalBreakdown: Record<Season, ElementalProperties>;
  astrologicalInfluence: Record<Season, AstrologicalProperties>;
} {
  const scores: Record<Season, number> = {
    spring: 0,
    summer: 0,
    autumn: 0,
    fall: 0,
    winter: 0,
    all: 0,
  };
  const elementalBreakdown: Record<Season, ElementalProperties> = {
    spring: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    summer: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    autumn: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    fall: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    winter: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    all: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
  };
  const astrologicalInfluence: Record<Season, AstrologicalProperties> = {
    spring: { favorable: [], unfavorable: [], neutral: [] },
    summer: { favorable: [], unfavorable: [], neutral: [] },
    autumn: { favorable: [], unfavorable: [], neutral: [] },
    fall: { favorable: [], unfavorable: [], neutral: [] },
    winter: { favorable: [], unfavorable: [], neutral: [] },
    all: { favorable: [], unfavorable: [], neutral: [] },
  };

  // Base seasonal score (20% of total)
  const recipeSeason = ((): Season[] => {
    const value = (recipe as unknown as { season?: Season | Season[] }).season;
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  })();
  recipeSeason.forEach((season) => {
    if (season in scores) scores[season] += 20;
  });

  // Ingredient seasonality (20% of total)
  (recipe.ingredients || []).forEach((ingredient) => {
    const { seasonality } = ingredient as unknown as { seasonality?: Season[] };
    if (seasonality && Array.isArray(seasonality)) {
      seasonality.forEach((season) => {
        if (season in scores)
          scores[season] += 20 / (recipe.ingredients.length || 1);
      });
    }
  });

  // Elemental alignment (30% of total)
  if (recipe.elementalProperties) {
    SEASONS.forEach((season) => {
      let elementalScore = 0;
      const seasonElements = SEASONAL_ELEMENTS[season];
      (
        Object.entries(recipe.elementalProperties) as Array<[Element, number]>
      ).forEach(([element, value]) => {
        const seasonalInfluence = seasonElements[element] || 0;
        const alignmentScore = (value || 0) * seasonalInfluence * 30;
        elementalScore += alignmentScore;
        elementalBreakdown[season][element] = alignmentScore;
      });
      scores[season] += elementalScore;
    });
  }

  // Astrological influence (20% of total)
  if (currentZodiac) {
    SEASONS.forEach((season) => {
      const seasonZodiacs = seasonToZodiac[season];
      const zodiacElement = ZODIAC_ELEMENTS[currentZodiac];
      let astroScore = 0;
      seasonZodiacs.forEach((zodiac) => {
        const zodiacElementalMatch = ZODIAC_ELEMENTS[zodiac] === zodiacElement;
        if (zodiacElementalMatch) {
          astroScore += 6.67; // 20% / 3 signs per season
          astrologicalInfluence[season].favorable.push(zodiac);
        } else {
          astrologicalInfluence[season].neutral.push(zodiac);
        }
      });
      scores[season] += astroScore;
    });
  }

  // Lunar phase influence (10% of total)
  if (lunarPhase) {
    const lunarKey = lunarPhase as LunarPhaseWithSpaces;
    const lunarElements = LUNAR_PHASE_ELEMENTS[lunarKey];
    SEASONS.forEach((season) => {
      const seasonElements = SEASONAL_ELEMENTS[season];
      let lunarScore = 0;
      (Object.entries(seasonElements) as Array<[Element, number]>).forEach(
        ([element, value]) => {
          const lunarElementValue = lunarElements[element] || 0;
          lunarScore += value * lunarElementValue * 10;
        },
      );
      scores[season] += lunarScore;
    });
  }

  return { seasonalScores: scores, elementalBreakdown, astrologicalInfluence };
}

function _isComplementaryElement(
  element1: Element,
  element2: Element,
): boolean {
  const complementaryPairs: Array<[Element, Element]> = [
    ["Fire", "Air"],
    ["Water", "Earth"],
  ];
  return complementaryPairs.some(
    ([a, b]) =>
      (element1 === a && element2 === b) || (element1 === b && element2 === a),
  );
}

// Helper function to get seasonal elemental influence
export function getSeasonalElementalInfluence(
  season: Season,
): ElementalProperties {
  return getSeasonalElementalInfluenceInternal(season);
}

function calculateElementalBreakdown(
  recipe: Recipe,
  season: Season,
): ElementalProperties {
  if (!recipe.elementalProperties) return getDefaultElementalProps();
  const seasonalInfluence = getSeasonalElementalInfluenceInternal(season);
  const result: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  (
    Object.entries(recipe.elementalProperties) as Array<[Element, number]>
  ).forEach(([element, value]) => {
    const seasonalModifier = seasonalInfluence[element] || 0.25;
    result[element] = (value || 0) * seasonalModifier;
  });
  return normalizeElementalValues(result);
}

export const _calculateSeasonalModifiers = (
  recipe: Recipe,
  season: Season,
): ElementalProperties => {
  if (!recipe.elementalProperties) return getDefaultElementalProps();
  const seasonalInfluence = getSeasonalElementalInfluenceInternal(season);
  const result: ElementalProperties = { ...recipe.elementalProperties };
  (Object.keys(result) as Element[]).forEach((element) => {
    const seasonalModifier = seasonalInfluence[element] || 0.25;
    result[element] = (result[element] || 0) * seasonalModifier;
  });
  return normalizeElementalValues(result);
};

// Add seasonal influence to elemental properties
export function applySeasonalInfluence(
  elements: ElementalProperties,
  season: Season,
): ElementalProperties {
  const seasonalModifiers = SEASONAL_ELEMENTS[season];
  const result: ElementalProperties = { ...elements };
  (Object.entries(elements) as Array<[Element, number]>).forEach(
    ([element, value]) => {
      const modifier = seasonalModifiers[element] || 0.25;
      result[element] = (value || 0) * modifier;
    },
  );
  return normalizeElementalValues(result);
}

// Normalize elemental values to ensure they sum to 1.0
function normalizeElementalValues(
  elements: ElementalProperties,
): ElementalProperties {
  const sum = Object.values(elements).reduce((acc, val) => acc + (val || 0), 0);
  if (sum <= 0) return getDefaultElementalProps();
  const normalized: ElementalProperties = { ...elements };
  (Object.keys(normalized) as Element[]).forEach((key) => {
    normalized[key] = (normalized[key] || 0) / sum;
  });
  return normalized;
}

// New function to calculate recipe compatibility with lunar phase
export function calculateLunarPhaseCompatibility(
  recipe: Recipe,
  lunarPhase: LunarPhase,
): { score: number; elementalAlignment: number; recipeTypeAlignment: number } {
  if (!recipe || !lunarPhase) {
    return { score: 0, elementalAlignment: 0, recipeTypeAlignment: 0 };
  }

  // Elemental alignment
  let elementalAlignment = 0;
  const lunarKey = lunarPhase as LunarPhaseWithSpaces;
  if (recipe.elementalProperties && LUNAR_PHASE_ELEMENTS[lunarKey]) {
    (
      Object.entries(recipe.elementalProperties) as Array<[Element, number]>
    ).forEach(([element, value]) => {
      const lunarElementValue = LUNAR_PHASE_ELEMENTS[lunarKey][element] || 0;
      elementalAlignment += (value || 0) * lunarElementValue;
    });
    elementalAlignment = Math.round(elementalAlignment * 50);
  }

  // Recipe type alignment (heuristic based on keywords)
  let recipeTypeAlignment = 0;
  const lunarRecipeTypes = LUNAR_FOOD_ASSOCIATIONS[lunarKey];
  const mealTypesRaw = (recipe as unknown as { mealType?: string | string[] })
    .mealType;
  if (mealTypesRaw && lunarRecipeTypes) {
    const recipeMealTypes = Array.isArray(mealTypesRaw)
      ? mealTypesRaw
      : [mealTypesRaw];
    recipeMealTypes.forEach((mealType) => {
      if (
        lunarRecipeTypes.some((type) =>
          mealType.toLowerCase().includes(type.toLowerCase()),
        )
      ) {
        recipeTypeAlignment += 25;
      }
    });
  }

  // Explicit lunar phase influence
  const lunarInfluences = (
    recipe as unknown as { lunarPhaseInfluences?: LunarPhaseWithSpaces[] }
  ).lunarPhaseInfluences;
  if (
    lunarInfluences &&
    Array.isArray(lunarInfluences) &&
    lunarInfluences.includes(lunarKey)
  ) {
    recipeTypeAlignment += 25;
  }

  const score = elementalAlignment + recipeTypeAlignment;
  return { score, elementalAlignment, recipeTypeAlignment };
}
