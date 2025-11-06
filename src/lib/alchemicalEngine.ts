import { proteins } from "@/data/ingredients";
import { _logger } from "@/lib/logger";
import { ElementalCalculator } from "@/services/ElementalCalculator";
import type {
  AstrologicalState,
  ElementalProperties,
  Ingredient,
  LunarPhase,
  Recipe,
  ZodiacSign,
} from "@/types/alchemy";
import { getAccuratePlanetaryPositions } from "@/utils/accurateAstronomy";

/**
 * Validates that elemental properties are properly structured and normalized
 */
export function validateElementalProperties(
  properties?: ElementalProperties,
): boolean {
  if (!properties) return false;
  // Check if all required elements exist
  if (
    typeof properties.Fire !== "number" ||
    typeof properties.Water !== "number" ||
    typeof properties.Earth !== "number" ||
    typeof properties.Air !== "number"
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
      baseElement: "Fire",
      decans: [
        { degrees: [0, 10], element: "Fire", ruler: "Mars" },
        { degrees: [10, 20], element: "Fire", ruler: "Sun" },
        { degrees: [20, 30], element: "Fire", ruler: "Jupiter" },
      ],
    },
    taurus: {
      baseElement: "Earth",
      decans: [
        { degrees: [0, 10], element: "Earth", ruler: "Venus" },
        { degrees: [10, 20], element: "Earth", ruler: "Mercury" },
        { degrees: [20, 30], element: "Earth", ruler: "Saturn" },
      ],
    },
    gemini: {
      baseElement: "Air",
      decans: [
        { degrees: [0, 10], element: "Air", ruler: "Mercury" },
        { degrees: [10, 20], element: "Air", ruler: "Venus" },
        { degrees: [20, 30], element: "Air", ruler: "Saturn" },
      ],
    },
    cancer: {
      baseElement: "Water",
      decans: [
        { degrees: [0, 10], element: "Water", ruler: "Moon" },
        { degrees: [10, 20], element: "Water", ruler: "Mars" },
        { degrees: [20, 30], element: "Water", ruler: "Jupiter" },
      ],
    },
    leo: {
      baseElement: "Fire",
      decans: [
        { degrees: [0, 10], element: "Fire", ruler: "Sun" },
        { degrees: [10, 20], element: "Fire", ruler: "Jupiter" },
        { degrees: [20, 30], element: "Fire", ruler: "Mars" },
      ],
    },
    virgo: {
      baseElement: "Earth",
      decans: [
        { degrees: [0, 10], element: "Earth", ruler: "Mercury" },
        { degrees: [10, 20], element: "Earth", ruler: "Saturn" },
        { degrees: [20, 30], element: "Earth", ruler: "Venus" },
      ],
    },
    libra: {
      baseElement: "Air",
      decans: [
        { degrees: [0, 10], element: "Air", ruler: "Venus" },
        { degrees: [10, 20], element: "Air", ruler: "Saturn" },
        { degrees: [20, 30], element: "Air", ruler: "Mercury" },
      ],
    },
    scorpio: {
      baseElement: "Water",
      decans: [
        { degrees: [0, 10], element: "Water", ruler: "Pluto" },
        { degrees: [10, 20], element: "Water", ruler: "Neptune" },
        { degrees: [20, 30], element: "Water", ruler: "Moon" },
      ],
    },
    sagittarius: {
      baseElement: "Fire",
      decans: [
        { degrees: [0, 10], element: "Fire", ruler: "Jupiter" },
        { degrees: [10, 20], element: "Fire", ruler: "Mars" },
        { degrees: [20, 30], element: "Fire", ruler: "Sun" },
      ],
    },
    capricorn: {
      baseElement: "Earth",
      decans: [
        { degrees: [0, 10], element: "Earth", ruler: "Saturn" },
        { degrees: [10, 20], element: "Earth", ruler: "Venus" },
        { degrees: [20, 30], element: "Earth", ruler: "Mercury" },
      ],
    },
    aquarius: {
      baseElement: "Air",
      decans: [
        { degrees: [0, 10], element: "Air", ruler: "Uranus" },
        { degrees: [10, 20], element: "Air", ruler: "Mercury" },
        { degrees: [20, 30], element: "Air", ruler: "Venus" },
      ],
    },
    pisces: {
      baseElement: "Water",
      decans: [
        { degrees: [0, 10], element: "Water", ruler: "Neptune" },
        { degrees: [10, 20], element: "Water", ruler: "Moon" },
        { degrees: [20, 30], element: "Water", ruler: "Pluto" },
      ],
    },
  };

  private readonly lunarPhaseModifiers: Record<
    LunarPhase,
    ElementalProperties
  > = {
    "new moon": { Fire: 0.1, Water: 0.4, Air: 0.3, Earth: 0.2 },
    "waxing crescent": { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
    "first quarter": { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    "waxing gibbous": { Fire: 0.4, Water: 0.1, Air: 0.3, Earth: 0.2 },
    "full moon": { Fire: 0.4, Water: 0.1, Air: 0.4, Earth: 0.1 },
    "waning gibbous": { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    "last quarter": { Fire: 0.2, Water: 0.3, Air: 0.2, Earth: 0.3 },
    "waning crescent": { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 },
  };

  private readonly seasonalModifiers: Record<string, ElementalProperties> = {
    spring: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
    summer: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    fall: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 },
  };

  private readonly calculator: ElementalCalculator;
  private availableRecipes: Recipe[] = [];

  constructor() {
    this.calculator = ElementalCalculator.getInstance();
  }

  calculateElementalHarmony(
    recipeElements: ElementalProperties,
    userElements: ElementalProperties,
    astrologicalState: AstrologicalState,
    season: string,
  ): number {
    const astroModifiers = this.getAstrologicalModifiers(astrologicalState);
    const seasonModifiers = this.seasonalModifiers[season] || {
      Fire: 1,
      Water: 1,
      Air: 1,
      Earth: 1,
    };
    let harmonyScore = 0;
    let totalFactors = 0;

    (
      Object.entries(recipeElements) as Array<
        [keyof ElementalProperties, number]
      >
    ).forEach(([element, value]) => {
      const userValue = userElements[element];
      const astroValue = astroModifiers[element];
      const seasonValue = seasonModifiers[element];

      const baseHarmony = 1 - Math.abs(value - userValue);
      const astroHarmony = baseHarmony * astroValue;
      const seasonHarmony = baseHarmony * seasonValue;

      harmonyScore += (astroHarmony + seasonHarmony) / 2;
      totalFactors++;
    });

    return totalFactors > 0 ? harmonyScore / totalFactors : 0;
  }

  calculateAstrologicalPower(
    recipeSunSign: ZodiacSign,
    astrologicalState: AstrologicalState,
  ): number {
    const getCurrentDecan = (degree: number): number => {
      if (degree < 10) return 0;
      if (degree < 20) return 1;
      return 2;
    };

    const sunDegree =
      Number(
        (astrologicalState as unknown as { sunDegree?: number }).sunDegree,
      ) || 15;
    const currentDecan = getCurrentDecan(sunDegree);

    if (
      !this.zodiacElements[recipeSunSign] ||
      !this.zodiacElements[recipeSunSign].decans
    ) {
      return 0.2;
    }

    const decanRuler =
      this.zodiacElements[recipeSunSign].decans[currentDecan]?.ruler || "";

    let power = 0.2;

    const recipeElement = this.zodiacElements[recipeSunSign].baseElement;
    const { moonSignElement } = astrologicalState as unknown as {
      moonSignElement?: keyof ElementalProperties;
    };
    if (recipeElement === moonSignElement) power += 0.3;

    if (astrologicalState.activePlanets?.includes(decanRuler)) power += 0.25;

    return Math.min(1, power);
  }

  private calculateIngredientPlanetAlignment(
    ingredients: string[],
    planet: string,
  ): number {
    if (!ingredients || ingredients.length === 0) return 0;

    const matchCount = ingredients.filter((ingredient) =>
      proteins[ingredient]?.astrologicalProfile?.rulingPlanets?.includes(
        planet,
      ),
    ).length;

    return ingredients.length > 0 ? matchCount / ingredients.length : 0;
  }

  private getAstrologicalModifiers(
    astrologicalState: AstrologicalState,
  ): ElementalProperties {
    const sunElement =
      this.zodiacElements[astrologicalState.sunSign || "aries"].baseElement;
    const moonElement =
      this.zodiacElements[astrologicalState.moonSign || "aries"].baseElement;
    const lunarModifiers =
      this.lunarPhaseModifiers[
        astrologicalState.lunarPhase || ("new moon" as LunarPhase)
      ];

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
      0,
    );
    (Object.keys(baseModifiers) as Array<keyof ElementalProperties>).forEach(
      (element) => {
        baseModifiers[element] = baseModifiers[element] / (total || 1);
      },
    );

    return baseModifiers;
  }

  getElementalAffinity(
    element1: keyof ElementalProperties,
    element2: keyof ElementalProperties,
  ): number {
    // Elements reinforce themselves; all combinations work well
    if (element1 === element2) return 0.9;
    return 0.7;
  }

  getLunarInfluence(
    phase: LunarPhase,
    element: keyof ElementalProperties,
  ): number {
    return this.lunarPhaseModifiers[phase][element];
  }

  getSeasonalInfluence(
    season: string,
    element: keyof ElementalProperties,
  ): number {
    const seasonalInfluence = this.seasonalModifiers[season] || {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25,
    };
    return seasonalInfluence[element];
  }

  calculateRecipeHarmony(recipe: Recipe): number {
    if (!recipe.elementalProperties) return 0;
    const dominantElements = this.getDominantElements(recipe);
    const interactions = this.calculateIngredientInteractions(
      (recipe.ingredients || []) as Ingredient[],
    );

    // Use our own calculation instead of calling ElementalCalculator.calculateHarmony
    const baseHarmony = this.calculateHarmonyScore(recipe.elementalProperties);
    const interactionScore =
      (interactions.synergies.length || 0) * 0.2 -
      (interactions.conflicts.length || 0) * 0.2;
    const dominanceScore =
      dominantElements.length > 0
        ? dominantElements.reduce((sum, { strength }) => sum + strength, 0) /
          dominantElements.length
        : 0;

    return Math.min(
      1,
      Math.max(0, baseHarmony + interactionScore + dominanceScore * 0.2),
    );
  }

  getDominantElements(
    recipe: Recipe,
  ): Array<{ element: string; strength: number }> {
    const elements = recipe.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    }; // Fallback elemental balance

    return Object.entries(elements)
      .map(([element, value]) => ({
        element,
        strength: value || 0,
      }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 2);
  }

  calculateIngredientInteractions(ingredients: Ingredient[]) {
    const synergies: Array<{ ingredients: Ingredient[]; score: number }> = [];
    const conflicts: Array<{ ingredients: Ingredient[]; score: number }> = [];

    for (let i = 0; i < ingredients.length; i++) {
      for (let j = i + 1; j < ingredients.length; j++) {
        const ingA = ingredients[i] as unknown as {
          elementalProperties?: ElementalProperties;
        };
        const ingB = ingredients[j] as unknown as {
          elementalProperties?: ElementalProperties;
        };
        const harmony = this.calculateHarmonyBetween(
          ingA.elementalProperties || ({} as ElementalProperties),
          ingB.elementalProperties || ({} as ElementalProperties),
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

  getCurrentBalance(_season: string, _timeOfDay: string): ElementalProperties {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
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

  getComplementaryRecipes(_recipe: Recipe): Recipe[] {
    return []; // Implementation placeholder
  }

  rankBySeasonalEffectiveness(recipes: Recipe[], season: string) {
    return recipes
      .map((_recipe) => ({
        ..._recipe,
        seasonalScore: (() => {
          const calculatorData = ElementalCalculator as unknown as {
            calculateSeasonalEffectiveness?: (r: Recipe, s: string) => number;
          };
          if (calculatorData.calculateSeasonalEffectiveness) {
            return calculatorData.calculateSeasonalEffectiveness(
              _recipe,
              season,
            );
          }
          // Fallback calculation using recipe's elemental properties
          const seasonalBonus = this.getSeasonalInfluence(season, "Fire");
          return (_recipe.elementalProperties.Fire || 0.25) * seasonalBonus;
        })(),
      }))
      .sort(
        (a, b) =>
          (b as unknown as { seasonalScore: number }).seasonalScore -
          (a as unknown as { seasonalScore: number }).seasonalScore,
      );
  }

  private calculateHarmonyBetween(
    props1: ElementalProperties,
    props2: ElementalProperties,
  ): number {
    if (!props1 || !props2) return 0;
    const p1 = props1 as Partial<ElementalProperties>;
    const p2 = props2 as Partial<ElementalProperties>;
    return (
      1 -
      (
        ["Fire", "Water", "Air", "Earth"] as Array<keyof ElementalProperties>
      ).reduce((diff, key) => {
        const v1 = typeof p1[key] === "number" ? (p1[key] as number) : 0;
        const v2 = typeof p2[key] === "number" ? (p2[key] as number) : 0;
        return diff + Math.abs(v1 - v2) / 2;
      }, 0)
    );
  }

  private calculateComplementaryProperties(
    properties: ElementalProperties,
  ): ElementalProperties {
    if (!validateElementalProperties(properties)) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }

    return (
      Object.entries(properties) as Array<[keyof ElementalProperties, number]>
    ).reduce(
      (acc, [element, value]) => ({
        ...acc,
        [element]: 1 - value,
      }),
      {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      } as ElementalProperties,
    );
  }

  setAvailableRecipes(recipes: Recipe[]) {
    this.availableRecipes = recipes.filter(
      (_recipe) =>
        _recipe.elementalProperties &&
        validateElementalProperties(_recipe.elementalProperties),
    );
  }

  calculateElementalState(recipe: Recipe): ElementalProperties {
    if (recipe.elementalProperties) {
      return recipe.elementalProperties;
    }

    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }; // Fallback elemental balance
  }

  private calculateHarmonyScore(elements: ElementalProperties): number {
    const totalElements = Object.values(elements).reduce(
      (sum, val) => sum + val,
      0,
    );
    if (totalElements === 0) return 0;
    const affinityBonus = this.calculateAffinityBonus(elements);
    return Math.min(1, Math.max(0, affinityBonus));
  }

  /**
   * Calculate the affinity bonus based on elemental properties
   * Higher scores for balanced elements or high same-element presence
   */
  private calculateAffinityBonus(elements: ElementalProperties): number {
    const values = Object.values(elements);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

    // Deviation from average (balance)
    const deviation =
      values.reduce((sum, val) => sum + Math.abs(val - avg), 0) / values.length;

    // Reward same-element dominance slightly
    const maxVal = Math.max(...values);
    const dominanceBonus = (maxVal - avg) * 0.1;

    return Math.min(1, Math.max(0, 1 - deviation + dominanceBonus));
  }

  // Placeholder for future implementation
   
  calculateRecipeEffect(_recipe: Recipe): void {}

  /**
   * Finds optimal recipes based on the current elemental state
   * @param recipes Array of recipes to consider
   * @returns Array of recipes with scores and elemental properties
   */
  findOptimalRecipes(
    recipes: unknown[],
  ): Array<{ recipe: unknown; score: number; elements: ElementalProperties }> {
    if (!recipes || recipes.length === 0) {
      return [];
    }

    // Simple implementation - return recipes with default scores
    return (recipes as Recipe[]).slice(0, 3).map((_recipe) => ({
      recipe: _recipe,
      score: 80, // Default score
      elements: {
        Fire: _recipe.elementalProperties.Fire ?? 0.25,
        Water: _recipe.elementalProperties.Water ?? 0.25,
        Air: _recipe.elementalProperties.Air ?? 0.25,
        Earth: _recipe.elementalProperties.Earth ?? 0.25,
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
      return positions as Record<string, unknown>;
    } catch (error) {
      _logger.error("Error calculating planetary positions: ", error);
      // Return empty object as fallback
      return {};
    }
  }
}
