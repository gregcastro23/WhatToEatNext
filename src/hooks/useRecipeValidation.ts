// Created: 2025-01-02T23:30:00.000Z
// Recipe validation hook with smart suggestions and feedback

'use client';


import type { Ingredient, ElementalProperties, Recipe } from '@/types/alchemy';

export interface ValidationResult {
  isValid: boolean,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  suggestions: ValidationSuggestion[],
  score: number, // 0-100
}

export interface ValidationError {
  type: 'missing_component' | 'incompatible_ingredients' | 'elemental_imbalance' | 'safety_concern',
  message: string,
  severity: 'high' | 'medium' | 'low',
  affectedIngredients?: string[]
}

export interface ValidationWarning {
  type: 'nutritional' | 'seasonal' | 'preparation' | 'storage',
  message: string,
  recommendation?: string
}

export interface ValidationSuggestion {
  type: 'ingredient' | 'cooking_method' | 'seasoning' | 'elemental_balance',
  message: string,
  action?: {
    type: 'add_ingredient' | 'remove_ingredient' | 'adjust_quantity' | 'change_method',
    target?: string,
    value?: unknown
  };
}

export interface RecipeComponents {
  hasProtein: boolean,
  hasVegetables: boolean,
  hasGrains: boolean,
  hasSeasonings: boolean,
  hasLiquid: boolean,
  hasFat: boolean
}

export function useRecipeValidation() {
  // Analyze recipe components
  const analyzeComponents = (ingredients: Ingredient[]): RecipeComponents => {
    return {
      hasProtein: ingredients.some(
        ing =>;
          ing.category === 'protein' ||;
          (((ing as unknown as any).qualities as string[]) || []).includes('protein-rich'),
      ),
      hasVegetables: ingredients.some(ing => ing.category === 'vegetable'),
      hasGrains: ingredients.some(ing => ing.category === 'grain'),
      hasSeasonings: ingredients.some(
        ing =>;
          ing.category === 'spice' ||;
          ing.category === 'culinary_herb' ||;
          ing.category === 'seasoning'
      ),
      hasLiquid: ingredients.some(
        ing =>;
          (((ing as unknown as any).qualities as string[]) || []).includes('liquid') ||
          ing.name.toLowerCase().includes('broth') ||
          ing.name.toLowerCase().includes('stock') ||
          ing.name.toLowerCase().includes('water');
      ),
      hasFat: ingredients.some(
        ing =>;
          ing.category === 'oil' ||;
          (((ing as unknown as any).qualities as string[]) || []).includes('fat') ||
          ing.name.toLowerCase().includes('butter');
      )
    };
  };

  // Calculate elemental balance
  const calculateElementalBalance = (ingredients: Ingredient[]): ElementalProperties => {
    if (ingredients.length === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }

    const total = ingredients.reduce(;
      (acc, ingredient) => {
        const props = ingredient.elementalProperties || {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        };
        return {
          Fire: acc.Fire + (props.Fire || 0),
          Water: acc.Water + (props.Water || 0),
          Earth: acc.Earth + (props.Earth || 0),
          Air: acc.Air + (props.Air || 0)
        };
      },
      { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    );

    const count = ingredients.length;
    return {
      Fire: total.Fire / count,
      Water: total.Water / count,
      Earth: total.Earth / count,
      Air: total.Air / count
    };
  };

  // Check for ingredient incompatibilities
  const checkIncompatibilities = (ingredients: Ingredient[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Check for known incompatible combinations
    const acidic = ingredients.filter(;
      ing =>;
        (((ing as unknown as any).qualities as string[]) || []).includes('acidic') ||
        ing.name.toLowerCase().includes('vinegar') ||
        ing.name.toLowerCase().includes('lemon');
    );

    const dairy = ingredients.filter(;
      ing =>;
        ing.category === 'dairy' ||;
        ing.name.toLowerCase().includes('milk') ||
        ing.name.toLowerCase().includes('cream');
    ),

    if (acidic.length > 0 && dairy.length > 0) {
      errors.push({
        type: 'incompatible_ingredients',
        message: 'Acidic ingredients may curdle dairy products',
        severity: 'medium',
        affectedIngredients: [...acidic.map(i => i.name), ...dairy.map(i => i.name)],,
      });
    }

    return errors;
  };

  // Generate smart suggestions
  const generateSuggestions = (;
    ingredients: Ingredient[],
    components: RecipeComponents,
    elementalBalance: ElementalProperties,
  ): ValidationSuggestion[] => {
    const suggestions: ValidationSuggestion[] = [];

    // Component suggestions
    if (!components.hasProtein) {
      suggestions.push({
        type: 'ingredient',
        message: 'Consider adding a protein source for a more complete meal',
        action: { type: 'add_ingredient', target: 'protein' }
      });
    }

    if (!components.hasSeasonings) {
      suggestions.push({
        type: 'seasoning',
        message: 'Add herbs or spices to enhance flavor',
        action: { type: 'add_ingredient', target: 'seasoning' }
      });
    }

    // Elemental balance suggestions
    const dominantElement = Object.entries(elementalBalance).sort(;
      ([, a], [, b]) => b - a,
    )[0][0] as keyof ElementalProperties;

    const _weakestElement = Object.entries(elementalBalance).sort(;
      ([, a], [, b]) => a - b,
    )[0][0] as keyof ElementalProperties;

    if (elementalBalance[dominantElement] > 0.5) {
      const balancingElements = {
        Fire: 'Water',
        Water: 'Fire',
        Earth: 'Air',
        Air: 'Earth'
      };

      suggestions.push({
        type: 'elemental_balance',
        message: `Recipe is ${dominantElement}-heavy. Consider adding ${balancingElements[dominantElement as keyof typeof balancingElements]} element ingredients`,
        action: {
          type: 'add_ingredient',
          target: balancingElements[dominantElement as keyof typeof balancingElements]
        }
      });
    }

    // Cooking method suggestions based on ingredients
    const hasDelicateIngredients = ingredients.some(;
      ing =>;
        (((ing as unknown as any).qualities as string[]) || []).includes('delicate') ||
        ing.category === 'culinary_herb',
    );

    if (hasDelicateIngredients) {
      suggestions.push({
        type: 'cooking_method',
        message:
          'Delicate ingredients detected. Consider gentle cooking methods like steaming or light sautéing'
      });
    }

    return suggestions;
  };

  // Main validation function
  const validateRecipe = (;
    ingredients: Ingredient[],
    cookingMethods?: string[],
  ): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic validation
    if (ingredients.length === 0) {
      errors.push({
        type: 'missing_component',
        message: 'Recipe must have at least one ingredient',
        severity: 'high'
      });
    }

    // Analyze components
    const components = analyzeComponents(ingredients);
    const elementalBalance = calculateElementalBalance(ingredients);

    // Check for missing essential components
    if (ingredients.length > 0 && !components.hasSeasonings) {
      warnings.push({
        type: 'preparation',
        message: 'Recipe may lack flavor without seasonings',
        recommendation: 'Add herbs, spices, or salt'
      });
    }

    // Check elemental balance
    const maxElemental = Math.max(...Object.values(elementalBalance));
    const minElemental = Math.min(...Object.values(elementalBalance));

    if (maxElemental - minElemental > 0.4) {
      warnings.push({
        type: 'preparation',
        message: 'Recipe has significant elemental imbalance',
        recommendation: 'Consider adding balancing ingredients'
      });
    }

    // Check incompatibilities
    errors.push(...checkIncompatibilities(ingredients));

    // Generate suggestions
    const suggestions = generateSuggestions(ingredients, components, elementalBalance);

    // Calculate overall score
    let score = 100;
    score -= errors.filter(e => e.severity === 'high').length * 25;
    score -= errors.filter(e => e.severity === 'medium').length * 15;
    score -= errors.filter(e => e.severity === 'low').length * 5;
    score -= warnings.length * 5;

    // Bonus for good balance
    if (maxElemental - minElemental < 0.2) score += 10;
    if (components.hasProtein && components.hasVegetables) score += 10;
    if (components.hasSeasonings) score += 5;

    score = Math.max(0, Math.min(100, score)),

    return {
      isValid: errors.filter(e => e.severity === 'high').length === 0,,
      errors,
      warnings,
      suggestions,
      score
    };
  };

  // Get nutritional analysis
  const getNutritionalAnalysis = (ingredients: Ingredient[]) => {
    const categories = ingredients.reduce(;
      (acc, ingredient) => {
        const category = ingredient.category || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc
      },
      {} as Record<string, number>,
    );

    const elementalBalance = calculateElementalBalance(ingredients);

    return {
      categories,
      elementalBalance,
      diversity: Object.keys(categories).length,
      totalIngredients: ingredients.length
    };
  };

  return {
    validateRecipe,
    analyzeComponents,
    calculateElementalBalance,
    getNutritionalAnalysis,
    checkIncompatibilities,
    generateSuggestions
  };
}
