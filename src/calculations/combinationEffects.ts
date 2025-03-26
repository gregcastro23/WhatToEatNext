import type { 
  ElementalProperties, 
  CombinationEffect, 
  EffectType, 
  Element 
} from '@/types/alchemy';
import { ingredientMappings } from '@/utils/elementalMappings/ingredients';
import { ELEMENT_COMBINATIONS } from '@/utils/constants/elements';

type CookingMethod = 'simmered' | 'infused' | 'raw' | 'baked' | 'fried' | 'grilled';
type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';
type Temperature = 'hot' | 'cold' | 'neutral';

interface CombinationRule {
  ingredients: string[];
  effect: EffectType;
  modifier: number;
  elements?: Partial<ElementalProperties>;
  conditions?: {
    cookingMethod?: CookingMethod[];
    season?: Season[];
    temperature?: Temperature;
  };
  notes?: string;
}

interface CalculateEffectsParams {
  ingredients: string[];
  elementalProperties: ElementalProperties;
  cookingMethod?: CookingMethod;
  season?: Season;
  temperature?: Temperature;
}

// Classic flavor combinations and their effects
const COMBINATION_RULES: CombinationRule[] = [
  {
    ingredients: ['ginger', 'garlic'],
    effect: 'enhance',
    modifier: 1.3,
    elements: { Fire: 0.2 },
    notes: 'Classic warming combination'
  },
  {
    ingredients: ['cinnamon', 'cardamom', 'clove'],
    effect: 'enhance',
    modifier: 1.4,
    elements: { Fire: 0.3, Air: 0.1 },
    notes: 'Warming spice blend'
  },
  // ... other rules remain the same
];

export function calculateCombinationEffects({
  ingredients,
  elementalProperties,
  cookingMethod,
  season,
  temperature
}: CalculateEffectsParams): CombinationEffect[] {
  const effects: CombinationEffect[] = [];

  try {
    // Check for known combinations
    COMBINATION_RULES.forEach(rule => {
      if (hasIngredientCombination(ingredients, rule.ingredients)) {
        // Verify conditions if they exist
        if (rule.conditions) {
          const meetsConditions = (
            (!rule.conditions.cookingMethod || !cookingMethod || rule.conditions.cookingMethod.includes(cookingMethod)) &&
            (!rule.conditions.season || !season || rule.conditions.season.includes(season)) &&
            (!rule.conditions.temperature || !temperature || rule.conditions.temperature === temperature)
          );

          if (!meetsConditions) return;
        }

        const effect: CombinationEffect = {
          ingredients: rule.ingredients,
          effect: rule.effect,
          modifier: rule.modifier,
          notes: rule.notes,
          elements: rule.elements
        };

        effects.push(effect);
      }
    });

    // Check elemental interactions
    effects.push(...calculateElementalInteractions(ingredients));

    return effects.sort((a, b) => b.modifier - a.modifier);
  } catch (error) {
    console.error('Error calculating combination effects:', error);
    return [];
  }
}

const hasIngredientCombination = (
  recipeIngredients: string[],
  combinationIngredients: string[]
): boolean => {
  return combinationIngredients.every(ingredient =>
    recipeIngredients.some(recipeIng =>
      recipeIng.toLowerCase().includes(ingredient.toLowerCase())
    )
  );
};

const calculateElementalInteractions = (
  ingredients: string[]
): CombinationEffect[] => {
  const effects: CombinationEffect[] = [];
  const ingredientPairs = getPairs(ingredients);

  ingredientPairs.forEach(([ing1, ing2]) => {
    const elem1 = ingredientMappings[ing1]?.elementalProperties;
    const elem2 = ingredientMappings[ing2]?.elementalProperties;

    if (!elem1 || !elem2) return;

    if (isHarmoniousCombination(elem1, elem2)) {
      effects.push({
        ingredients: [ing1, ing2],
        effect: 'enhance',
        modifier: 1.2,
        notes: 'Harmonious elemental combination'
      });
    }

    if (isAntagonisticCombination(elem1, elem2)) {
      effects.push({
        ingredients: [ing1, ing2],
        effect: 'diminish',
        modifier: 0.8,
        notes: 'Conflicting elemental combination'
      });
    }
  });

  return effects;
};

const getPairs = <T>(array: T[]): [T, T][] => {
  const pairs: [T, T][] = [];
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      pairs.push([array[i], array[j]]);
    }
  }
  return pairs;
};

const isHarmoniousCombination = (
  elem1: ElementalProperties,
  elem2: ElementalProperties
): boolean => {
  return ELEMENT_COMBINATIONS.harmonious.some(([e1, e2]) =>
    (getDominantElement(elem1) === e1 && getDominantElement(elem2) === e2) ||
    (getDominantElement(elem1) === e2 && getDominantElement(elem2) === e1)
  );
};

const isAntagonisticCombination = (
  elem1: ElementalProperties,
  elem2: ElementalProperties
): boolean => {
  return ELEMENT_COMBINATIONS.antagonistic.some(([e1, e2]) =>
    (getDominantElement(elem1) === e1 && getDominantElement(elem2) === e2) ||
    (getDominantElement(elem1) === e2 && getDominantElement(elem2) === e1)
  );
};

const getDominantElement = (elements: ElementalProperties): Element => {
  return Object.entries(elements)
    .sort(([, a], [, b]) => b - a)[0][0] as Element;
};

export const suggestComplementaryIngredients = (
  currentIngredients: string[],
  season?: Season
): string[] => {
  const suggestions: string[] = [];
  const currentElements = calculateCombinedElements(currentIngredients);
  const dominantElement = getDominantElement(currentElements);

  Object.entries(ingredientMappings).forEach(([ingredient, mapping]) => {
    if (currentIngredients.includes(ingredient)) return;

    const ingElements = mapping.elementalProperties;
    const ingDominant = getDominantElement(ingElements);

    if (isHarmoniousWith(dominantElement, ingDominant)) {
      if (!season || mapping.season?.includes(season)) {
        suggestions.push(ingredient);
      }
    }
  });

  return suggestions.slice(0, 5);
};

const calculateCombinedElements = (
  ingredients: string[]
): ElementalProperties => {
  const combined: ElementalProperties = {
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0
  };

  ingredients.forEach(ing => {
    const elements = ingredientMappings[ing]?.elementalProperties;
    if (elements) {
      Object.entries(elements).forEach(([element, value]) => {
        combined[element as keyof ElementalProperties] += value;
      });
    }
  });

  // Normalize
  const total = Object.values(combined).reduce((a, b) => a + b, 0);
  if (total > 0) {
    Object.keys(combined).forEach(key => {
      combined[key as keyof ElementalProperties] /= total;
    });
  }

  return combined;
};

const isHarmoniousWith = (element1: Element, element2: Element): boolean => {
  return ELEMENT_COMBINATIONS.harmonious.some(([e1, e2]) =>
    (element1 === e1 && element2 === e2) ||
    (element1 === e2 && element2 === e1)
  );
};