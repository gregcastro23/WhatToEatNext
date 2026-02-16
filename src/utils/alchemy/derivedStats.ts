import type { Ingredient } from '@/types/ingredient';
import type { AlchemicalProperties, AstrologicalState } from '@/types/alchemy';
import type { MonicaOptimizedRecipe } from '@/data/unified/recipeBuilding';

/**
 * Calculates the KAlchm (The Equilibrium Constant) for a given ingredient.
 * Formula: KAlchm = (Spirit^Spirit * Essence^Essence) / (Matter^Matter * Substance^Substance)
 * @param ingredient - The ingredient to calculate the KAlchm for.
 * @returns The KAlchm value.
 */
export function getIngredientKAlchm(ingredient: Ingredient): number {
  const alchemicalProps = ingredient.alchemicalProperties;

  if (!alchemicalProps) {
    // Return a neutral default if alchemical properties are not defined
    return 1.0;
  }

  const { Spirit, Essence, Matter, Substance } = alchemicalProps as { Spirit: number; Essence: number; Matter: number; Substance: number; };

  // Handle edge cases where values might be 0 or null
  const safeSpirit = Math.max(Spirit || 0, 0.01);
  const safeEssence = Math.max(Essence || 0, 0.01);
  const safeMatter = Math.max(Matter || 0, 0.01);
  const safeSubstance = Math.max(Substance || 0, 0.01);

  const numerator = Math.pow(safeSpirit, safeSpirit) * Math.pow(safeEssence, safeEssence);
  const denominator = Math.pow(safeMatter, safeMatter) * Math.pow(safeSubstance, safeSubstance);

  if (denominator === 0) {
    // Avoid division by zero, return a large number to indicate high spirit/essence
    return 1_000_000;
  }

  return numerator / denominator;
}

/**
 * Calculates the aggregated KAlchm for a recipe.
 * This is a simple average of the KAlchm of its ingredients.
 * @param recipe - The recipe to calculate the KAlchm for.
 * @returns The aggregated KAlchm value.
 */
export function getRecipeKAlchm(recipe: MonicaOptimizedRecipe): number {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
        return 1.0;
    }

    const totalKAlchm = recipe.ingredients.reduce((sum, ingredient) => {
        // We need to get the full ingredient object to pass to getIngredientKAlchm
        // This is a simplification and assumes the ingredient name is enough to fetch the full ingredient data.
        // In a real scenario, you'd fetch the ingredient from a data source.
        const fullIngredient: Ingredient = {
            name: ingredient.name,
            elementalProperties: ingredient.elementalProperties || { Fire: 0, Water: 0, Earth: 0, Air: 0 },
            alchemicalProperties: (ingredient as any).alchemicalProperties,
            category: (ingredient as any).category,
            qualities: (ingredient as any).qualities,
        };
        return sum + getIngredientKAlchm(fullIngredient);
    }, 0);

    return totalKAlchm / recipe.ingredients.length;
}

/**
 * Calculates the user's target KAlchm based on their current state.
 * This is the inverse of their current state's KAlchm to promote balance.
 * @param astroState - The user's current astrological state.
 * @returns The user's target KAlchm.
 */
export function getUserTargetKAlchm(astroState: AstrologicalState): number {
    // This is a simplified heuristic. A more complex model would be needed for a real application.
    if (!astroState.domElements) {
        return 1.0;
    }
    const { domElements } = astroState;

    const alchemicalProps: AlchemicalProperties = {
        Spirit: (domElements.Air + domElements.Fire) / 2,
        Essence: (domElements.Water + domElements.Fire) / 2,
        Matter: (domElements.Earth) / 2,
        Substance: (domElements.Earth + domElements.Water) / 2,
    };
    
    const { Spirit, Essence, Matter, Substance } = alchemicalProps as { Spirit: number; Essence: number; Matter: number; Substance: number; };

    const safeSpirit = Math.max(Spirit || 0, 0.01);
    const safeEssence = Math.max(Essence || 0, 0.01);
    const safeMatter = Math.max(Matter || 0, 0.01);
    const safeSubstance = Math.max(Substance || 0, 0.01);

    const numerator = Math.pow(safeSpirit, safeSpirit) * Math.pow(safeEssence, safeEssence);
    const denominator = Math.pow(safeMatter, safeMatter) * Math.pow(safeSubstance, safeSubstance);

    if (denominator === 0) {
        return 0.0001;
    }

    const currentKAlchm = numerator / denominator;

    // Return the inverse for balance
    return 1 / currentKAlchm;
}
