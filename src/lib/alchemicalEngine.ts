import type {
  ElementalProperties,
  LunarPhase,
  ZodiacSign,
  AstrologicalState,
  Recipe,
  Ingredient,
} from "@/types/alchemy";
import { ElementalCalculator } from "@/services/ElementalCalculator";
import { SpoonacularElementalMapper } from "@/services/SpoonacularElementalMapper";
import { proteins } from "@/data/ingredients";
import { getAccuratePlanetaryPositions } from "@/utils/accurateAstronomy";

// Default balanced elemental properties
export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

/**
 * Validates that elemental properties are properly structured and normalized
 */
export function validateElementalProperties(
  properties?: ElementalProperties
): boolean {
  if (!properties) return false;

  // Check if all required elements exist
  if (
    typeof properties.Fire !== 'number' ||
    typeof properties.Water !== 'number' ||
    typeof properties.Earth !== 'number' ||
    typeof properties.Air !== 'number'
  ) {
    return false;
  }

  // Check if values are in valid range (0-1)
  if (
    properties.Fire < 0 ||
    properties.Fire > 1 ||
    properties.Water < 0 ||
    properties.Water > 1 ||
    properties.Earth < 0 ||
    properties.Earth > 1 ||
    properties.Air < 0 ||
    properties.Air > 1
  ) {
    return false;
  }

  // Check if sum is approximately 1 (allowing for floating point error)
  const sum =
    properties.Fire + properties.Water + properties.Earth + properties.Air;
  return Math.abs(sum - 1) < 0.001;
}

export class AlchemicalEngineBase {
  private readonly elementalAffinities: Record<string, string[]> = {
    Fire: ['Air'],
    Air: ['Water'],
    Water: ['Earth'],
    Earth: ['Fire'],
  };

  private readonly elementalStrengths: Record<string, number> = {
    Fire: 1,
    Air: 1,
    Water: 1,
    Earth: 1,
  };

  private readonly zodiacElements: Record<
    ZodiacSign,
    {
      baseElement: keyof ElementalProperties;
      decans: Array<{
        degrees: [number, number];
        element: keyof ElementalProperties;
        ruler: string;
      }>;
    }
  > = {
    aries: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Mars' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Jupiter' },
      ],
    },
    taurus: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Venus' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Saturn' },
      ],
    },
    leo: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Mars' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Jupiter' },
      ],
    },
    sagittarius: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Mars' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Jupiter' },
      ],
    },
    virgo: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Venus' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Saturn' },
      ],
    },
    capricorn: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Venus' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Saturn' },
      ],
    },
    gemini: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Mercury' },
        { degrees: [10, 20], element: 'Air', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Air', ruler: 'Jupiter' },
      ],
    },
    libra: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Mercury' },
        { degrees: [10, 20], element: 'Air', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Air', ruler: 'Jupiter' },
      ],
    },
    aquarius: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Mercury' },
        { degrees: [10, 20], element: 'Air', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Air', ruler: 'Jupiter' },
      ],
    },
    cancer: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Moon' },
        { degrees: [10, 20], element: 'Water', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Water', ruler: 'Saturn' },
      ],
    },
    scorpio: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Moon' },
        { degrees: [10, 20], element: 'Water', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Water', ruler: 'Saturn' },
      ],
    },
    pisces: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Moon' },
        { degrees: [10, 20], element: 'Water', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Water', ruler: 'Saturn' },
      ],
    },
  };

  private readonly lunarPhaseModifiers: Record<
    LunarPhase,
    ElementalProperties
  > = {
    'new moon': { Fire: 0.1, Water: 0.4, Air: 0.3, Earth: 0.2 },
    'waxing crescent': { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
    'first quarter': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    'waxing gibbous': { Fire: 0.4, Water: 0.1, Air: 0.3, Earth: 0.2 },
    'full moon': { Fire: 0.4, Water: 0.1, Air: 0.4, Earth: 0.1 },
    'waning gibbous': { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    'last quarter': { Fire: 0.2, Water: 0.3, Air: 0.2, Earth: 0.3 },
    'waning crescent': { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 },
  };

  private readonly seasonalModifiers: Record<string, ElementalProperties> = {
    spring: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
    summer: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    fall: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 },
  };

  private calculator: ElementalCalculator;
  private availableRecipes: Recipe[] = [];

  constructor() {
    this.calculator = ElementalCalculator.getInstance();
  }

  calculateElementalHarmony(
    recipeElements: ElementalProperties,
    userElements: ElementalProperties,
    astrologicalState: AstrologicalState,
    season: string
  ): number {
    const astroModifiers = this.getAstrologicalModifiers(astrologicalState);
    const seasonModifiers = this.seasonalModifiers[season];
    let harmonyScore = 0;
    let totalFactors = 0;

    Object.entries(recipeElements).forEach(([element, value]) => {
      if (userElements[element as keyof ElementalProperties]) {
        const userValue = userElements[element as keyof ElementalProperties];
        const astroValue = astroModifiers[element as keyof ElementalProperties];
        const seasonValue =
          seasonModifiers[element as keyof ElementalProperties];

        const baseHarmony = 1 - Math.abs(value - userValue);
        const astroHarmony = baseHarmony * astroValue;
        const seasonHarmony = baseHarmony * seasonValue;

        harmonyScore += (astroHarmony + seasonHarmony) / 2;
        totalFactors++;
      }
    });

    return totalFactors > 0 ? harmonyScore / (totalFactors || 1) : 0;
  }

  calculateAstrologicalPower(
    recipeSunSign: ZodiacSign,
    astrologicalState: AstrologicalState
  ): number {
    const getCurrentDecan = (degree: number): number => {
      if (degree < 10) return 0;
      if (degree < 20) return 1;
      return 2;
    };

    const astroStateData = astrologicalState as unknown;
    const sunDegree = astroStateData?.sunDegree || 15;
    const currentDecan = getCurrentDecan(sunDegree);

    if (
      !this.zodiacElements[recipeSunSign] ||
      !this.zodiacElements[recipeSunSign].decans
    ) {
      return 0.2;
    }

    const decanRuler =
      this.zodiacElements[recipeSunSign].decans[currentDecan]?.ruler || '';

    let power = 0.2;

    const recipeElement = this.zodiacElements[recipeSunSign].baseElement;
    const moonSignElementData = astrologicalState as unknown;
    if (recipeElement === moonSignElementData?.moonSignElement) power += 0.3;

    if (astrologicalState.activePlanets?.includes(decanRuler)) power += 0.25;

    return Math.min(power, 1);
  }

  private calculateIngredientPlanetAlignment(
    ingredients: string[],
    planet: string
  ): number {
    if (!ingredients || ingredients.length === 0) return 0;

    const matchCount = ingredients.filter((ingredient) =>
      proteins[ingredient]?.astrologicalProfile?.rulingPlanets?.includes(planet)
    ).length;

    return ingredients.length > 0 ? matchCount / ingredients.length : 0;
  }

  private getAstrologicalModifiers(
    astrologicalState: AstrologicalState
  ): ElementalProperties {
    const sunElement =
      this.zodiacElements[astrologicalState.sunSign].baseElement;
    const moonElement =
      this.zodiacElements[astrologicalState.moonSign].baseElement;
    const lunarModifiers =
      this.lunarPhaseModifiers[astrologicalState.lunarPhase];

    const baseModifiers: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25,
    };

    baseModifiers[sunElement] += 0.2;
    baseModifiers[moonElement] += 0.1;

    Object.entries(lunarModifiers).forEach(([element, value]) => {
      baseModifiers[element as keyof ElementalProperties] *= value;
    });

    const total = Object.values(baseModifiers).reduce(
      (sum, val) => sum + val,
      0
    );
    Object.keys(baseModifiers).forEach((element) => {
      baseModifiers[element as keyof ElementalProperties] /= total;
    });

    return baseModifiers;
  }

  getElementalAffinity(
    element1: keyof ElementalProperties,
    element2: keyof ElementalProperties
  ): number {
    if (element1 === element2) return 1;
    if (this.elementalAffinities[element1]?.includes(element2 as string))
      return 0.5;
    return 0;
  }

  getLunarInfluence(
    phase: LunarPhase,
    element: keyof ElementalProperties
  ): number {
    return this.lunarPhaseModifiers[phase][element];
  }

  getSeasonalInfluence(
    season: string,
    element: keyof ElementalProperties
  ): number {
    const seasonalModifiersData = this.calculator.calculateElementalState(
      ElementalCalculator.getCurrentElementalState()
    ) as unknown;
    const seasonalInfluence = seasonalModifiersData?.seasonalInfluence || {};
    return seasonalInfluence[element] || 0.25;
  }

  calculateRecipeHarmony(recipe: Recipe): number {
    if (!recipe?.elementalProperties) return 0;

    const dominantElements = this.getDominantElements(recipe);
    const interactions = this.calculateIngredientInteractions(
      recipe.ingredients as any // Pattern VVV: Array Type Interface Resolution (RecipeIngredient[] to Ingredient[])
    );

    // Use our own calculation instead of calling ElementalCalculator.calculateHarmony
    const baseHarmony = this.calculateHarmonyScore(recipe.elementalProperties);
    const interactionScore =
      interactions.synergies.length * 0.1 -
      interactions.conflicts.length * 0.05;
    const dominanceScore =
      dominantElements.length > 0
        ? dominantElements.reduce((sum, { strength }) => sum + strength, 0) /
          dominantElements.length
        : 0;

    return Math.min(
      1,
      Math.max(0, baseHarmony + interactionScore + dominanceScore * 0.2)
    );
  }

  getDominantElements(
    recipe: Recipe
  ): Array<{ element: string; strength: number }> {
    const elements =
      recipe.elementalProperties ||
      SpoonacularElementalMapper.mapRecipeToElemental(recipe as unknown); // Pattern VVV: Array Type Interface Resolution

    return Object.entries(elements)
      .map(([element, value]) => ({
        element,
        strength: value || 0,
      }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 2);
  }

  calculateIngredientInteractions(ingredients: Ingredient[]) {
    const synergies = [];
    const conflicts = [];

    for (let i = 0; i < ingredients.length; i++) {
      for (let j = i + 1; j < ingredients.length; j++) {
        const harmony = this.calculateHarmonyBetween(
          (ingredients[i] as unknown).elementalProperties, // Pattern VVV: Array Type Interface Resolution
          (ingredients[j] as unknown).elementalProperties  // Pattern VVV: Array Type Interface Resolution
        );

        if (harmony > 0.7) {
          synergies.push({
            ingredients: [ingredients[i], ingredients[j]],
            score: harmony,
          });
        } else if (harmony < 0.3) {
          conflicts.push({
            ingredients: [ingredients[i], ingredients[j]],
            score: harmony,
          });
        }
      }
    }

    return { synergies, conflicts };
  }

  getCurrentBalance(season: string, timeOfDay: string): ElementalProperties {
    return ElementalCalculator.getCurrentElementalState();
  }

  checkImbalances(properties: ElementalProperties) {
    const ideal = 0.25;
    return Object.entries(properties)
      .filter(([, value]) => Math.abs(value - ideal) > 0.1)
      .map(([element, value]) => ({
        element,
        deviation: value - ideal,
        severity: Math.abs(value - ideal),
      }));
  }

  getComplementaryRecipes(recipe: Recipe): Recipe[] {
    return []; // Implementation needed based on available recipes
  }

  rankBySeasonalEffectiveness(recipes: Recipe[], season: string) {
    return recipes
      .map((recipe) => ({
        ...recipe,
        seasonalScore: (() => {
          const calculatorData = ElementalCalculator as unknown;
          if (calculatorData?.calculateSeasonalEffectiveness) {
            return calculatorData.calculateSeasonalEffectiveness(recipe, _season);
          }
          // Fallback calculation using recipe's elemental properties
          const seasonalBonus = this.getSeasonalInfluence(season, 'Fire');
          return (recipe.elementalProperties?.Fire || 0.25) * seasonalBonus;
        })(),
      }))
      .sort((a, b) => b.seasonalScore - a.seasonalScore);
  }

  private calculateHarmonyBetween(
    props1: ElementalProperties,
    props2: ElementalProperties
  ): number {
    if (!props1 || !props2) return 0;

    return (
      1 -
      Object.entries(props1).reduce((diff, [element, value]) => {
        return diff + Math.abs(value - (props2[element] || 0)) / 2;
      }, 0)
    );
  }

  private calculateComplementaryProperties(
    properties: ElementalProperties
  ): ElementalProperties {
    if (!validateElementalProperties(properties)) {
      return DEFAULT_ELEMENTAL_PROPERTIES;
    }

    return Object.entries(properties).reduce(
      (acc, [element, value]) => ({
        ...acc,
        [element]: 1 - value,
      }),
      {} as ElementalProperties
    );
  }

  setAvailableRecipes(recipes: Recipe[]) {
    this.availableRecipes = recipes.filter(
      (recipe) =>
        recipe?.elementalProperties &&
        validateElementalProperties(recipe.elementalProperties)
    );
  }

  calculateElementalState(recipe: Recipe): ElementalProperties {
    if (recipe.elementalProperties) {
      return recipe.elementalProperties;
    }

    return SpoonacularElementalMapper.mapRecipeToElemental(recipe as unknown); // Pattern VVV: Array Type Interface Resolution
  }

  private calculateHarmonyScore(elements: ElementalProperties): number {
    const totalElements = Object.values(elements).reduce(
      (sum, val) => sum + val,
      0
    );
    if (totalElements === 0) return 0;

    const affinityBonus = this.calculateAffinityBonus(elements);
    return (affinityBonus / (totalElements || 1)) * 100;
  }

  /**
   * Calculate the affinity bonus based on elemental properties
   * Higher scores for balanced elements or complementary combinations
   */
  private calculateAffinityBonus(elements: ElementalProperties): number {
    // Basic implementation - reward balance
    const values = Object.values(elements);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Calculate deviation from perfect balance
    const deviation =
      values.reduce((sum, val) => sum + Math.abs(val - avg), 0) / values.length;

    // Check for complementary elements
    let complementaryBonus = 0;
    if (elements.Fire > 0.2 && elements.Air > 0.2) complementaryBonus += 0.1;
    if (elements.Water > 0.2 && elements.Earth > 0.2) complementaryBonus += 0.1;

    // Return score (1 - deviation) + bonus, normalized to 0-1 range
    return Math.min(1, Math.max(0, 1 - deviation + complementaryBonus));
  }

  calculateRecipeEffect(recipe: Recipe) {
    // ... implementation ...
  }

  /**
   * Finds optimal recipes based on the current elemental state
   * @param recipes Array of recipes to consider
   * @returns Array of recipes with scores and elemental properties
   */
  findOptimalRecipes(
    recipes: unknown[]
  ): { recipe: unknown; score: number; elements: ElementalProperties }[] {
    if (!recipes || recipes.length === 0) {
      return [];
    }

    // Simple implementation - return recipes with default scores
    return recipes.slice(0, 3).map((recipe) => ({
      recipe,
      score: 80, // Default score
      elements: {
        Fire: 0.25,
        Water: 0.25,
        Air: 0.25,
        Earth: 0.25,
      },
    }));
  }

  /**
   * Calculates current planetary positions using accurate astronomy calculations
   * @returns A record of planetary positions
   */
  async calculateCurrentPlanetaryPositions(): Promise<Record<string, unknown>> {
    try {
      // Use the accurate astronomy utility to get planetary positions
      const positions = await getAccuratePlanetaryPositions();
      return positions;
    } catch (error) {
      // console.error('Error calculating planetary positions:', error);
      // Return empty object as fallback
      return {};
    }
  }
}
