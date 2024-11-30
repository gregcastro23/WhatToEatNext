import type { ElementalProperties, CombinationEffect } from '@/types/alchemy';
import { ingredientMappings } from '@/utils/elementalMappings/ingredients';
import { ELEMENT_COMBINATIONS } from '@/utils/constants/elements';

interface CombinationRule {
  ingredients: string[];
  effect: 'enhance' | 'diminish' | 'transmute';
  modifier: number;
  elements?: Partial<ElementalProperties>;
  conditions?: {
    cookingMethod?: string[];
    season?: string[];
    temperature?: 'hot' | 'cold';
  };
  notes?: string;
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
  {
    ingredients: ['mint', 'cucumber'],
    effect: 'enhance',
    modifier: 1.2,
    elements: { Water: 0.2, Air: 0.1 },
    notes: 'Cooling combination'
  },
  // Traditional Medicine Combinations
  {
    ingredients: ['ginger', 'turmeric'],
    effect: 'enhance',
    modifier: 1.5,
    elements: { Fire: 0.3 },
    conditions: {
      cookingMethod: ['simmered', 'infused'],
      temperature: 'hot'
    },
    notes: 'Anti-inflammatory pair'
  },
  {
    ingredients: ['mushroom', 'seaweed'],
    effect: 'enhance',
    modifier: 1.3,
    elements: { Water: 0.2, Earth: 0.2 },
    notes: 'Mineral-rich umami combination'
  },
  // Antagonistic Combinations
  {
    ingredients: ['dairy', 'fish'],
    effect: 'diminish',
    modifier: 0.7,
    notes: 'Traditional conflict'
  },
  {
    ingredients: ['mint', 'bitter greens'],
    effect: 'diminish',
    modifier: 0.8,
    notes: 'Competing cooling properties'
  }
];

export const calculateCombinationEffects = (
  ingredients: string[],
  cookingMethod?: string,
  season?: string
): CombinationEffect[] => {
  const effects: CombinationEffect[] = [];

  // Check for known combinations
  COMBINATION_RULES.forEach(rule => {
    if (hasIngredientCombination(ingredients, rule.ingredients)) {
      // Verify conditions if they exist
      if (rule.conditions) {
        if (rule.conditions.cookingMethod && 
            !rule.conditions.cookingMethod.includes(cookingMethod || '')) {
          return;
        }
        if (rule.conditions.season && 
            !rule.conditions.season.includes(season || '')) {
          return;
        }
      }

      effects.push({
        ingredients: rule.ingredients,
        effect: rule.effect,
        modifier: rule.modifier,
        notes: rule.notes
      });
    }
  });

  // Check elemental interactions
  effects.push(...calculateElementalInteractions(ingredients));

  return effects;
};

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

    // Check for harmonious combinations
    if (isHarmoniousCombination(elem1, elem2)) {
      effects.push({
        ingredients: [ing1, ing2],
        effect: 'enhance',
        modifier: 1.2,
        notes: 'Harmonious elemental combination'
      });
    }

    // Check for antagonistic combinations
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

const getDominantElement = (elements: ElementalProperties): string => {
  return Object.entries(elements)
    .sort(([, a], [, b]) => b - a)[0][0];
};

export const suggestComplementaryIngredients = (
  currentIngredients: string[],
  season?: string
): string[] => {
  const suggestions: string[] = [];
  const currentElements = calculateCombinedElements(currentIngredients);
  const dominantElement = getDominantElement(currentElements);

  // Find ingredients that would balance the dominant element
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

  return suggestions.slice(0, 5); // Return top 5 suggestions
};

const calculateCombinedElements = (
  ingredients: string[]
): ElementalProperties => {
  const combined = {
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

const isHarmoniousWith = (element1: string, element2: string): boolean => {
  return ELEMENT_COMBINATIONS.harmonious.some(([e1, e2]) =>
    (element1 === e1 && element2 === e2) ||
    (element1 === e2 && element2 === e1)
  );
};
