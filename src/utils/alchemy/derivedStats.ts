import type { IngredientCategory } from '@/data/ingredients/types';
import type { MonicaOptimizedRecipe } from '@/data/unified/recipeBuilding';
import type { AlchemicalProperties, AstrologicalState } from '@/types/alchemy';
import type { Ingredient } from '@/types/ingredient';
import { PLANETARY_ALCHEMY } from '@/utils/planetaryAlchemyMapping';

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
        // Boundary view: RecipeIngredient declares `category?: string` and carries an index
        // signature (`[key: string]: unknown`) but does not declare `qualities`/`alchemicalProperties`.
        // Double-assert (`unknown` first) because `category`'s `string` is not assignable to the
        // narrower `IngredientCategory` union; captures only the three fields read below.
        const ing = ingredient as unknown as {
            category?: IngredientCategory;
            qualities?: string[];
            alchemicalProperties?: AlchemicalProperties;
        };
        const fullIngredient: Ingredient = {
            name: ingredient.name,
            elementalProperties: ingredient.elementalProperties || { Fire: 0, Water: 0, Earth: 0, Air: 0 },
            alchemicalProperties: ing.alchemicalProperties,
            // `category`/`qualities` are required on Ingredient but optional/undeclared on the source;
            // the original `as any` silently passed through whatever was present (often undefined).
            // `!` preserves that exact runtime value (incl. undefined) without adding a default.
            // getIngredientKAlchm only reads `.alchemicalProperties`, so these are inert at runtime.
            category: ing.category!,
            qualities: ing.qualities!,
        };
        return sum + getIngredientKAlchm(fullIngredient);
    }, 0);

    return totalKAlchm / recipe.ingredients.length;
}

/**
 * Sum the ESMS each active planet contributes, per PLANETARY_ALCHEMY.
 *
 * Returns null when no recognized planet is active — callers must fall back to a
 * neutral value rather than invent quantities, since there is nothing here to
 * derive them from.
 */
function quantitiesFromActivePlanets(
  activePlanets: string[] | undefined,
): AlchemicalProperties | null {
  if (!Array.isArray(activePlanets) || activePlanets.length === 0) return null;

  const totals: AlchemicalProperties = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  let matched = 0;
  for (const name of activePlanets) {
    // PLANETARY_ALCHEMY is keyed by capitalized planet names.
    const key = String(name).charAt(0).toUpperCase() + String(name).slice(1).toLowerCase();
    const contribution = PLANETARY_ALCHEMY[key as keyof typeof PLANETARY_ALCHEMY];
    if (!contribution) continue;
    matched++;
    totals.Spirit += contribution.Spirit;
    totals.Essence += contribution.Essence;
    totals.Matter += contribution.Matter;
    totals.Substance += contribution.Substance;
  }

  return matched > 0 ? totals : null;
}

/**
 * Calculates the user's target KAlchm based on their current state.
 * This is the inverse of their current state's KAlchm to promote balance.
 * @param astroState - The user's current astrological state.
 * @returns The user's target KAlchm.
 */
export function getUserTargetKAlchm(astroState: AstrologicalState): number {
    // Quantities come from WHICH PLANETS are present — never from the dominant
    // elements, which are a separate reading taken from the signs those planets
    // occupy (see the header of `@/utils/planetaryAlchemyMapping`). This used to
    // build Spirit from (Air + Fire) / 2 and so on, which the engine forbids.
    //
    // Only planet names are available here (the menu-planner bridge supplies
    // `activePlanets` without signs), so this is PLANETARY_ALCHEMY's base layer:
    // correct in kind, but without the sect, dignity and aspect refinements that
    // callers holding real positions get from calculateEnhancedAlchemicalFromPlanets.
    const alchemicalProps = quantitiesFromActivePlanets(astroState.activePlanets);
    if (!alchemicalProps) {
        return 1.0;
    }

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
