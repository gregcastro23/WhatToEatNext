import type { 
  ElementalProperties, 
  LunarPhase, 
  ZodiacSign, 
  AstrologicalState 
, Recipe, Ingredient } from '@/types/alchemy';
import { ElementalCalculator } from '@/calculations/elementalcalculations';
import { SpoonacularElementalMapper } from '@/services/SpoonacularElementalMapper';

export class AlchemicalEngine {
  private readonly elementalAffinities: Record<string, string[]> = {
    Fire: ['Air'],
    Air: ['Water'],
    Water: ['Earth'],
    Earth: ['Fire']
  };

  private readonly elementalStrengths: Record<string, number> = {
    Fire: 1,
    Air: 1,
    Water: 1,
    Earth: 1
  };

  private readonly zodiacElements: Record<ZodiacSign, {
    baseElement: keyof ElementalProperties;
    decans: Array<{
      degrees: [number, number];
      element: keyof ElementalProperties;
      ruler: string;
    }>;
  }> = {
    aries: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Mars' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Jupiter' }
      ]
    },
    taurus: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Venus' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Saturn' }
      ]
    },
    leo: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Mars' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Jupiter' }
      ]
    },
    sagittarius: {
      baseElement: 'Fire',
      decans: [
        { degrees: [0, 10], element: 'Fire', ruler: 'Mars' },
        { degrees: [10, 20], element: 'Fire', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Fire', ruler: 'Jupiter' }
      ]
    },
    virgo: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Venus' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Saturn' }
      ]
    },
    capricorn: {
      baseElement: 'Earth',
      decans: [
        { degrees: [0, 10], element: 'Earth', ruler: 'Venus' },
        { degrees: [10, 20], element: 'Earth', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Earth', ruler: 'Saturn' }
      ]
    },
    gemini: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Mercury' },
        { degrees: [10, 20], element: 'Air', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Air', ruler: 'Jupiter' }
      ]
    },
    libra: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Mercury' },
        { degrees: [10, 20], element: 'Air', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Air', ruler: 'Jupiter' }
      ]
    },
    aquarius: {
      baseElement: 'Air',
      decans: [
        { degrees: [0, 10], element: 'Air', ruler: 'Mercury' },
        { degrees: [10, 20], element: 'Air', ruler: 'Sun' },
        { degrees: [20, 30], element: 'Air', ruler: 'Jupiter' }
      ]
    },
    cancer: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Moon' },
        { degrees: [10, 20], element: 'Water', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Water', ruler: 'Saturn' }
      ]
    },
    scorpio: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Moon' },
        { degrees: [10, 20], element: 'Water', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Water', ruler: 'Saturn' }
      ]
    },
    pisces: {
      baseElement: 'Water',
      decans: [
        { degrees: [0, 10], element: 'Water', ruler: 'Moon' },
        { degrees: [10, 20], element: 'Water', ruler: 'Mercury' },
        { degrees: [20, 30], element: 'Water', ruler: 'Saturn' }
      ]
    }
  };

  private readonly lunarPhaseModifiers: Record<LunarPhase, ElementalProperties> = {
    new_moon: { Fire: 0.1, Water: 0.4, Air: 0.3, Earth: 0.2 },
    waxing_crescent: { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },
    first_quarter: { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    waxing_gibbous: { Fire: 0.4, Water: 0.1, Air: 0.3, Earth: 0.2 },
    full_moon: { Fire: 0.4, Water: 0.1, Air: 0.4, Earth: 0.1 },
    waning_gibbous: { Fire: 0.3, Water: 0.2, Air: 0.3, Earth: 0.2 },
    last_quarter: { Fire: 0.2, Water: 0.3, Air: 0.2, Earth: 0.3 },
    waning_crescent: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
  };

  private readonly seasonalModifiers: Record<string, ElementalProperties> = {
    spring: { Fire: 0.3, Water: 0.3, Air: 0.3, Earth: 0.1 },
    summer: { Fire: 0.4, Water: 0.2, Air: 0.3, Earth: 0.1 },
    autumn: { Fire: 0.2, Water: 0.2, Air: 0.3, Earth: 0.3 },
    winter: { Fire: 0.1, Water: 0.4, Air: 0.2, Earth: 0.3 }
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
        const seasonValue = seasonModifiers[element as keyof ElementalProperties];

        const baseHarmony = 1 - Math.abs(value - userValue);
        const astroHarmony = baseHarmony * astroValue;
        const seasonHarmony = baseHarmony * seasonValue;

        harmonyScore += (astroHarmony + seasonHarmony) / 2;
        totalFactors++;
      }
    });

    return totalFactors > 0 ? harmonyScore / totalFactors : 0;
  }

  calculateAstrologicalPower(
    recipeSunSign: ZodiacSign,
    astrologicalState: AstrologicalState
  ): number {
    const currentDecan = this.getCurrentDecan(astrologicalState.sunDegree);
    const decanRuler = this.zodiacElements[recipeSunSign].decans[currentDecan].ruler;
    
    let power = 0.2; // Base power
    
    // Elemental harmony
    const recipeElement = this.zodiacElements[recipeSunSign].baseElement;
    if (recipeElement === astrologicalState.moonSignElement) power += 0.3;
    
    // Decan ruler activation
    if (astroState.activePlanets.includes(decanRuler)) power += 0.25;
    
    // Ingredient-planet synergy
    const ingredientPlanetScore = this.calculateIngredientPlanetAlignment(
      recipe.ingredients,
      decanRuler
    );
    power += Math.min(ingredientPlanetScore * 0.15, 0.2);

    return Math.min(power, 1);
  }

  private calculateIngredientPlanetAlignment(ingredients: string[], planet: string): number {
    return ingredients.filter(ingredient => 
      meats[ingredient]?.astrologicalProfile.rulingPlanets.includes(planet)
    ).length / ingredients.length;
  }

  private getAstrologicalModifiers(astrologicalState: AstrologicalState): ElementalProperties {
    const sunElement = this.zodiacElements[astrologicalState.sunSign].baseElement;
    const moonElement = this.zodiacElements[astrologicalState.moonSign].baseElement;
    const lunarModifiers = this.lunarPhaseModifiers[astrologicalState.lunarPhase];

    const baseModifiers: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Air: 0.25,
      Earth: 0.25
    };

    baseModifiers[sunElement] += 0.2;
    baseModifiers[moonElement] += 0.1;

    Object.entries(lunarModifiers).forEach(([element, value]) => {
      baseModifiers[element as keyof ElementalProperties] *= value;
    });

    const total = Object.values(baseModifiers).reduce((sum, val) => sum + val, 0);
    Object.keys(baseModifiers).forEach(element => {
      baseModifiers[element as keyof ElementalProperties] /= total;
    });

    return baseModifiers;
  }

  getElementalAffinity(element1: keyof ElementalProperties, element2: keyof ElementalProperties): number {
    if (element1 === element2) return 1;
    if (this.elementalAffinities[element1]?.includes(element2)) return 0.5;
    return 0;
  }

  getLunarInfluence(phase: LunarPhase, element: keyof ElementalProperties): number {
    return this.lunarPhaseModifiers[phase][element];
  }

  getSeasonalInfluence(season: string, element: keyof ElementalProperties): number {
    const seasonalModifiers = this.calculator.calculateelementalState(
      ElementalCalculator.getCurrentelementalState(),
      'default',
      'full'
    ).seasonalInfluence;
    return seasonalModifiers[element];
  }

  calculateRecipeHarmony(recipe: Recipe): number {
    if (!recipe?.elementalProperties) return 0;
    
    const dominantElements = this.getDominantElements(recipe);
    const interactions = this.calculateIngredientInteractions(recipe.ingredients);
    
    const baseHarmony = ElementalCalculator.calculateHarmony(recipe.elementalProperties);
    const interactionScore = interactions.synergies.length * 0.1 - interactions.conflicts.length * 0.05;
    const dominanceScore = dominantElements.length > 0 ? 
        dominantElements.reduce((sum, { strength }) => sum + strength, 0) / dominantElements.length : 
        0;

    return Math.min(1, Math.max(0, baseHarmony + interactionScore + dominanceScore * 0.2));
  }

  getDominantElements(recipe: Recipe): Array<{ element: string; strength: number }> {
    const elements = recipe.elementalProperties || 
                    SpoonacularElementalMapper.mapRecipeToElemental(recipe);

    return Object.entries(elements)
      .map(([element, value]) => ({
        element,
        value: value || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 2);
  }

  calculateIngredientInteractions(ingredients: Ingredient[]) {
    const synergies = [];
    const conflicts = [];

    for (let i = 0; i < ingredients.length; i++) {
      for (let j = i + 1; j < ingredients.length; j++) {
        const harmony = this.calculateHarmonyBetween(
          ingredients[i].elementalProperties,
          ingredients[j].elementalProperties
        );
        
        if (harmony > 0.7) {
          synergies.push({ ingredients: [ingredients[i], ingredients[j]], score: harmony });
        } else if (harmony < 0.3) {
          conflicts.push({ ingredients: [ingredients[i], ingredients[j]], score: harmony });
        }
      }
    }

    return { synergies, conflicts };
  }

  getCurrentBalance(season: string, timeOfDay: string): ElementalProperties {
    return ElementalCalculator.getCurrentelementalState();
  }

  checkImbalances(properties: ElementalProperties) {
    const ideal = 0.25;
    return Object.entries(properties)
      .filter(([, value]) => Math.abs(value - ideal) > 0.1)
      .map(([element, value]) => ({
        element,
        deviation: value - ideal,
        severity: Math.abs(value - ideal)
      }));
  }

  getComplementaryRecipes(recipe: Recipe): Recipe[] {
    return [];  // Implementation needed based on available recipes
  }

  rankBySeasonalEffectiveness(recipes: Recipe[], season: string) {
    return recipes.map(recipe => ({
      ...recipe,
      seasonalScore: ElementalCalculator.calculateSeasonalEffectiveness(recipe, season)
    })).sort((a, b) => b.seasonalScore - a.seasonalScore);
  }

  private calculateHarmonyBetween(props1: ElementalProperties, props2: ElementalProperties): number {
    if (!props1 || !props2) return 0;
    
    return 1 - Object.entries(props1).reduce((diff, [element, value]) => {
      return diff + Math.abs(value - (props2[element] || 0)) / 2;
    }, 0);
  }

  private calculateComplementaryProperties(properties: ElementalProperties): ElementalProperties {
    if (!validateElementalProperties(properties)) {
      return DEFAULT_ELEMENTAL_PROPERTIES;
    }

    return Object.entries(properties).reduce((acc, [element, value]) => ({
      ...acc,
      [element]: 1 - value
    }), {} as ElementalProperties);
  }

  setAvailableRecipes(recipes: Recipe[]) {
    this.availableRecipes = recipes.filter(recipe => 
      recipe?.elementalProperties && 
      validateElementalProperties(recipe.elementalProperties)
    );
  }

  calculateelementalState(recipe: Recipe): ElementalProperties {
    if (recipe.elementalProperties) {
      return recipe.elementalProperties;
    }
    
    return SpoonacularElementalMapper.mapRecipeToElemental(recipe);
  }

  private calculateHarmonyScore(elements: ElementalProperties): number {
    const totalElements = Object.values(elements).reduce((sum, val) => sum + val, 0);
    if (totalElements === 0) return 0;
    
    const affinityBonus = this.calculateAffinityBonus(elements);
    return (affinityBonus / totalElements) * 100;
  }

  calculateRecipeEffect(recipe: Recipe) {
    // ... implementation ...
  }
}