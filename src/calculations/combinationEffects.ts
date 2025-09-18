import type {
  ElementalProperties,
  CombinationEffect,
  EffectType,
  LunarPhase
} from '@/types/alchemy';
import type { Element } from '@/types/celestial';
import { ELEMENT_COMBINATIONS } from '@/utils/constants/elements';
import { ingredientMappings } from '@/utils/elementalMappings/ingredients';

type CookingMethod = 'simmered' | 'infused' | 'raw' | 'baked' | 'fried' | 'grilled';
type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all';
type Temperature = 'hot' | 'cold' | 'neutral';

interface CombinationRule {
  ingredients: string[],
  effect: EffectType,
  modifier: number,
  elements?: Partial<ElementalProperties>,
  conditions?: {
    cookingMethod?: CookingMethod[],
    season?: Season[],
    temperature?: Temperature
  };
  notes?: string;
}

interface CalculateEffectsParams {
  ingredients: string[],
  elementalProperties: ElementalProperties,
  cookingMethod?: CookingMethod,
  season?: Season,
  temperature?: Temperature,
  lunarPhase?: LunarPhase
}

// Classic flavor combinations and their effects
const COMBINATION_RULES: CombinationRule[] = [
  {
    ingredients: ['ginger', 'garlic'],
    effect: 'amplify' as EffectType,
    modifier: 1.3,
    elements: { Fire: 0.2 },
    notes: 'Classic warming combination'
  },
  {
    ingredients: ['cinnamon', 'cardamom', 'clove'],
    effect: 'amplify' as EffectType,
    modifier: 1.4,
    elements: { Fire: 0.3, Air: 0.1 },
    notes: 'Warming spice blend'
  },
  // ... other rules remain the same
];

// Create a normalization function at the top of the file
const normalizeLunarPhase = (phase: LunarPhase): string => {
  // Convert spaces to underscores for consistent lookup
  return phase.replace(/\s+/g, '_')
};

export function calculateCombinationEffects({
  ingredients,
  elementalProperties: _elementalProperties,
  cookingMethod,
  season,
  temperature,
  lunarPhase
}: CalculateEffectsParams): CombinationEffect[] {
  const effects: CombinationEffect[] = [];

  try {
    // Apply lunar phase influences
    if (lunarPhase) {
      const lunarEffect = calculateLunarEffect(ingredients, lunarPhase),
      if (lunarEffect) {
        effects.push(lunarEffect);
      }
    }

    // Check for known combinations
    COMBINATION_RULES.forEach(rule => {
      if (hasIngredientCombination(ingredients, rule.ingredients)) {
        // Verify conditions if they exist
        if (rule.conditions) {
          const meetsConditions =
            (!rule.conditions.cookingMethod ||;
              !cookingMethod ||
              rule.conditions.cookingMethod.includes(cookingMethod)) &&
            (!rule.conditions.season || !season || rule.conditions.season.includes(season)) &&
            (!rule.conditions.temperature ||
              !temperature ||
              rule.conditions.temperature === temperature);

          if (!meetsConditions) return
        }

        const effect: CombinationEffect = {
          type: rule.effect,
          strength: rule.modifier,
          description: rule.notes || '',
          elements: rule.elements ? (Object.keys(rule.elements) as Element[]) : []
        };

        effects.push(effect);
      }
    });

    // Check elemental interactions
    effects.push(...calculateElementalInteractions(ingredients));

    return effects.sort((a, b) => {
      const aValue =
        (a as { modifier?: number, strength?: number })?.modifier ||;
        (a as { strength?: number })?.strength ||
        0;
      const bValue =
        (b as { modifier?: number, strength?: number })?.modifier ||;
        (b as { strength?: number })?.strength ||
        0;
      return bValue - aValue;
    });
  } catch (error) {
    console.error('Error calculating combination effects:', error),
    return []
  }
}

const hasIngredientCombination = (;
  recipeIngredients: string[],
  combinationIngredients: string[],
): boolean => {
  return combinationIngredients.every(ingredient =>;
    recipeIngredients.some(recipeIng => recipeIng.toLowerCase().includes(ingredient.toLowerCase())),,
  )
};

const calculateElementalInteractions = (ingredients: string[]): CombinationEffect[] => {
  const effects: CombinationEffect[] = [];
  const ingredientPairs = getPairs(ingredients);

  ingredientPairs.forEach(([ing1, ing2]) => {
    const elem1 = ingredientMappings[ing1]?.elementalProperties;
    const elem2 = ingredientMappings[ing2]?.elementalProperties;

    if (!elem1 || !elem2) return,

    if (isHarmoniousCombination(elem1, elem2)) {
      effects.push({
        ingredients: [ing1, ing2],
        type: 'synergy' as EffectType,
        strength: 1.2,
        elements: ['Fire'] as Element[],
        description: 'Harmonious elemental combination'
      } as CombinationEffect);
    }

    if (isAntagonisticCombination(elem1, elem2)) {
      effects.push({
        ingredients: [ing1, ing2],
        type: 'conflict' as EffectType,
        strength: 0.8,
        elements: ['Water'] as Element[],
        description: 'Conflicting elemental combination'
      } as CombinationEffect);
    }
  });

  return effects;
};

const getPairs = <T>(array: T[]): [T, T][] => {
  const pairs: [T, T][] = [];
  for (let i = 0, i < array.length, i++) {
    for (let j = i + 1, j < array.length, j++) {
      pairs.push([array[i], array[j]])
    }
  }
  return pairs
},

const isHarmoniousCombination = (;
  elem1: ElementalProperties,
  elem2: ElementalProperties,
): boolean => {
  return ELEMENT_COMBINATIONS.harmonious.some(
    ([e1, e2]) =>
      (getDominantElement(elem1) === e1 && getDominantElement(elem2) === e2) ||
      (getDominantElement(elem1) === e2 && getDominantElement(elem2) === e1);
  )
};

const isAntagonisticCombination = (;
  elem1: ElementalProperties,
  elem2: ElementalProperties,
): boolean => {
  const antagonistic =
    (ELEMENT_COMBINATIONS as { antagonistic?: Array<[string, string]> })?.antagonistic || [];
  return antagonistic.some(
    ([e1, e2]: [unknown, unknown]) =>
      (getDominantElement(elem1) === e1 && getDominantElement(elem2) === e2) ||
      (getDominantElement(elem1) === e2 && getDominantElement(elem2) === e1);
  );
};

const getDominantElement = (elements: ElementalProperties): Element => {
  return Object.entries(elements).sort(([, a], [, b]) => b - a)[0][0] as Element
};

export const _suggestComplementaryIngredients = (;
  currentIngredients: string[],
  season?: Season,
): string[] => {
  const suggestions: string[] = [];
  const currentElements = calculateCombinedElements(currentIngredients);
  const dominantElement = getDominantElement(currentElements);

  Object.entries(ingredientMappings).forEach(([ingredient, mapping]) => {
    if (currentIngredients.includes(ingredient)) return;

    const ingElements = mapping.elementalProperties;
    const ingDominant = getDominantElement(ingElements);

    if (isHarmoniousWith(dominantElement, ingDominant)) {
      const seasonData = mapping.season;
      if (!season || (Array.isArray(seasonData) && seasonData.includes(season))) {
        suggestions.push(ingredient);
      }
    }
  });

  return suggestions.slice(0, 5);
};

const calculateCombinedElements = (ingredients: string[]): ElementalProperties => {
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
        // Pattern KK-1: Safe arithmetic with type validation
        const numericValue = typeof value === 'number' ? value : 0;
        combined[element as unknown] += numericValue;
      });
    }
  });

  // Normalize
  const total = Object.values(combined).reduce((a, b) => a + b, 0);
  if (total > 0) {
    Object.keys(combined).forEach(key => {
      combined[key as unknown] /= total;
    });
  }

  return combined;
};

const isHarmoniousWith = (element1: Element, element2: Element): boolean => {
  return ELEMENT_COMBINATIONS.harmonious.some(
    ([e1, e2]) => (element1 === e1 && element2 === e2) || (element1 === e2 && element2 === e1),,
  )
};

const calculateLunarEffect = (;
  ingredients: string[],
  lunarPhase: LunarPhase,
): CombinationEffect | null => {
  const lunarModifiers = {
    new_moon: { modifier: 0.9, effect: 'neutralize' as EffectType },
    full_moon: { modifier: 1.2, effect: 'amplify' as EffectType },
    first_quarter: { modifier: 1.1, effect: 'synergy' as EffectType },
    last_quarter: { modifier: 1.1, effect: 'synergy' as EffectType },
    waxing_crescent: { modifier: 1.05, effect: 'amplify' as EffectType },
    waning_crescent: { modifier: 0.95, effect: 'neutralize' as EffectType },
    waxing_gibbous: { modifier: 1.15, effect: 'amplify' as EffectType },
    waning_gibbous: { modifier: 1.05, effect: 'synergy' as EffectType }
  };

  // Use the normalized lunar phase for lookup
  const normalizedPhase = normalizeLunarPhase(lunarPhase);
  const modifier = lunarModifiers[normalizedPhase as keyof typeof lunarModifiers];

  if (!modifier) return null;

  return {
    type: 'amplify' as EffectType,
    strength: modifier.modifier,
    description: `Lunar phase (${lunarPhase}) influence`,
    elements: ['Water'] as Element[]
  };
};
