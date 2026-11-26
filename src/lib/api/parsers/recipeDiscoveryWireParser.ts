/**
 * Pure runtime wire parser for `/api/recipes/[recipeId]/discover`.
 *
 * @file src/lib/api/parsers/recipeDiscoveryWireParser.ts
 */

import { isPlainObject, readFiniteNumber, readString } from "./wirePrimitives";

export interface DiscoveryRecipe {
  id: string;
  name: string;
  description?: string;
  cuisine?: string;
  elementalProperties?: { Fire?: number; Water?: number; Earth?: number; Air?: number };
  spirit?: number;
  essence?: number;
  matter?: number;
  substance?: number;
  monicaScore?: number;
  monicaScoreLabel?: string;
  prepTime?: string;
  cookTime?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
}

export interface DiscoveryData {
  similarElemental: DiscoveryRecipe[];
  similarAlchemical: DiscoveryRecipe[];
  sameCuisine: DiscoveryRecipe[];
}

function parseElementalProps(
  raw: unknown,
): DiscoveryRecipe["elementalProperties"] | undefined {
  if (!isPlainObject(raw)) return undefined;
  const out: NonNullable<DiscoveryRecipe["elementalProperties"]> = {};
  const fire = readFiniteNumber(raw.Fire);
  const water = readFiniteNumber(raw.Water);
  const earth = readFiniteNumber(raw.Earth);
  const air = readFiniteNumber(raw.Air);
  if (fire !== undefined) out.Fire = fire;
  if (water !== undefined) out.Water = water;
  if (earth !== undefined) out.Earth = earth;
  if (air !== undefined) out.Air = air;
  return out;
}

function applyOptionalNumbers(
  raw: Record<string, unknown>,
  recipe: DiscoveryRecipe,
): void {
  const spirit = readFiniteNumber(raw.spirit);
  const essence = readFiniteNumber(raw.essence);
  const matter = readFiniteNumber(raw.matter);
  const substance = readFiniteNumber(raw.substance);
  const monicaScore = readFiniteNumber(raw.monicaScore);
  if (spirit !== undefined) recipe.spirit = spirit;
  if (essence !== undefined) recipe.essence = essence;
  if (matter !== undefined) recipe.matter = matter;
  if (substance !== undefined) recipe.substance = substance;
  if (monicaScore !== undefined) recipe.monicaScore = monicaScore;
}

function applyOptionalStringsAndFlags(
  raw: Record<string, unknown>,
  recipe: DiscoveryRecipe,
): void {
  if (typeof raw.description === "string") recipe.description = raw.description;
  if (typeof raw.cuisine === "string") recipe.cuisine = raw.cuisine;
  if (typeof raw.monicaScoreLabel === "string") recipe.monicaScoreLabel = raw.monicaScoreLabel;
  if (typeof raw.prepTime === "string") recipe.prepTime = raw.prepTime;
  if (typeof raw.cookTime === "string") recipe.cookTime = raw.cookTime;
  if (typeof raw.isVegetarian === "boolean") recipe.isVegetarian = raw.isVegetarian;
  if (typeof raw.isVegan === "boolean") recipe.isVegan = raw.isVegan;
  if (typeof raw.isGlutenFree === "boolean") recipe.isGlutenFree = raw.isGlutenFree;
}

function parseDiscoveryRecipe(raw: unknown): DiscoveryRecipe | null {
  if (!isPlainObject(raw)) return null;
  const id = readString(raw.id);
  const name = readString(raw.name);
  if (!id || !name) return null;
  const recipe: DiscoveryRecipe = { id, name };
  const elemental = parseElementalProps(raw.elementalProperties);
  if (elemental) recipe.elementalProperties = elemental;
  applyOptionalNumbers(raw, recipe);
  applyOptionalStringsAndFlags(raw, recipe);
  return recipe;
}

function parseDiscoveryList(raw: unknown): DiscoveryRecipe[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(parseDiscoveryRecipe)
    .filter((item): item is DiscoveryRecipe => item !== null);
}

/** Producer: `src/app/api/recipes/[recipeId]/discover/route.ts:131-178` */
export function parseRecipeDiscoveryResponse(raw: unknown): {
  success: boolean;
  data?: DiscoveryData;
} {
  if (!isPlainObject(raw) || raw.success !== true) {
    return { success: false };
  }
  return {
    success: true,
    data: {
      similarElemental: parseDiscoveryList(raw.similarElemental),
      similarAlchemical: parseDiscoveryList(raw.similarAlchemical),
      sameCuisine: parseDiscoveryList(raw.sameCuisine),
    },
  };
}
