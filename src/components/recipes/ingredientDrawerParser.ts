/**
 * Wire parser for `GET /api/ingredients/[name]`, as `IngredientDrawer` reads it.
 *
 * Producer: `src/app/api/ingredients/[name]/route.ts`. The 200 body is `{ success,
 * ingredient, slug, relatedRecipes, recipesByCuisine, substitutions,
 * totalRecipeMatches }` (route.ts:125-134). The 400 / 500 `{ success: false, error }`
 * bodies (route.ts:96-99, 141-144) are non-2xx; the drawer throws before it parses.
 * With `HONO_API_URL` set the route forwards the Hono gateway body verbatim
 * (route.ts:81-92); this parser reads the Next route's shape, so a differing gateway
 * body fails loudly. `HONO_API_URL` is NOT set in production
 * (docs/adr/009-one-planetary-weight-scale.md:540), so the Next shape is the live one.
 * `ingredient` is `catalogRecord(card)` or `null`, key always set (route.ts:103);
 * `ingredientRecordParser.ts` parses that record. Rows come from
 * `buildRelatedIngredientRecipe` (relatedRecipe.ts:33-64), `groupMatchesByCuisine`
 * (ingredientRecipeIndex.ts:206-214) and `buildSubstitutions` (route.ts:60-70).
 *
 * Only fields the drawer reads are checked (`success`, `slug` never are). The drawer
 * defaults an absent `relatedRecipes`, `substitutions`, `recipesByCuisine` and
 * `totalRecipeMatches`, so absence is tolerated, but a PRESENT wrong-typed container or
 * total THROWS. Bad rows are dropped; if rows arrived and NONE matched, that throws.
 * JSON `null` for a row's `amount` / `unit` reads as absent, as the drawer does. A
 * non-finite number (a hand-crafted `1e999`) is never kept: it drops a row whose
 * `amount` it is, and a `totalRecipeMatches` that is not finite THROWS like any other
 * wrong type. Client-safe.
 *
 * @file src/components/recipes/ingredientDrawerParser.ts
 */

import { isJsonRecord } from "@/lib/api/json";
import { parseIngredient, type IngredientData } from "./ingredientRecordParser";

export type { IngredientData } from "./ingredientRecordParser";

export interface RelatedRecipe {
  id: string;
}

export interface Substitution {
  name: string;
  rationale: string;
  type: string;
}

export interface CuisineMatch {
  recipeId: string;
  recipeName: string;
  amount?: number | string;
  unit?: string;
}

export interface ApiResponse {
  ingredient: IngredientData | null;
  relatedRecipes: RelatedRecipe[];
  recipesByCuisine?: Record<string, CuisineMatch[]>;
  substitutions: Substitution[];
  totalRecipeMatches: number;
}

function parseRelatedRecipe(value: unknown): RelatedRecipe | undefined {
  if (!isJsonRecord(value)) return undefined;
  const { id } = value;
  if (typeof id !== "string") return undefined;
  return { id };
}

function parseSubstitution(value: unknown): Substitution | undefined {
  if (!isJsonRecord(value)) return undefined;
  const { name, rationale, type } = value;
  if (typeof name !== "string") return undefined;
  if (typeof rationale !== "string") return undefined;
  if (typeof type !== "string") return undefined;
  return { name, rationale, type };
}

function parseMatch(value: unknown): CuisineMatch | undefined {
  if (!isJsonRecord(value)) return undefined;
  const { recipeId, recipeName, amount, unit } = value;
  if (typeof recipeId !== "string" || typeof recipeName !== "string") return undefined;
  const amountUsable =
    amount == null || typeof amount === "string" || (typeof amount === "number" && Number.isFinite(amount));
  if (!amountUsable) return undefined;
  if (unit != null && typeof unit !== "string") return undefined;
  return {
    recipeId,
    recipeName,
    ...(typeof amount === "number" || typeof amount === "string" ? { amount } : {}),
    ...(typeof unit === "string" ? { unit } : {}),
  };
}

/** Rows that match (`undefined` reads as none); throws when rows arrived and none matched. */
function parseRows<T>(raw: unknown, what: string, parseRow: (value: unknown) => T | undefined): T[] {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) throw new TypeError(`Ingredient response ${what} was not an array`);
  const list: readonly unknown[] = raw;
  const rows: T[] = [];
  for (const item of list) {
    const row = parseRow(item);
    if (row !== undefined) rows.push(row);
  }
  if (list.length > 0 && rows.length === 0) {
    throw new TypeError(`No ingredient response ${what} row matched`);
  }
  return rows;
}

function parseCuisines(raw: unknown): Record<string, CuisineMatch[]> {
  if (!isJsonRecord(raw)) throw new TypeError("Ingredient response recipesByCuisine was not an object");
  const groups: Array<[string, CuisineMatch[]]> = [];
  for (const [cuisine, rows] of Object.entries(raw)) {
    groups.push([cuisine, parseRows(rows, cuisine, parseMatch)]);
  }
  return Object.fromEntries(groups);
}

/** `parse` for `readJson`. See the header for what is required and what is dropped. */
export function parseIngredientDrawerResponse(value: unknown): ApiResponse {
  if (!isJsonRecord(value)) throw new TypeError("Ingredient response was not a JSON object");
  const { ingredient, relatedRecipes, recipesByCuisine, substitutions, totalRecipeMatches } = value;
  if (ingredient !== null && !isJsonRecord(ingredient)) {
    throw new TypeError("Ingredient response had no ingredient");
  }
  if (
    totalRecipeMatches !== undefined &&
    (typeof totalRecipeMatches !== "number" || !Number.isFinite(totalRecipeMatches))
  ) {
    throw new TypeError("Ingredient response totalRecipeMatches was not a number");
  }
  return {
    ingredient: ingredient === null ? null : parseIngredient(ingredient),
    relatedRecipes: parseRows(relatedRecipes, "relatedRecipes", parseRelatedRecipe),
    substitutions: parseRows(substitutions, "substitutions", parseSubstitution),
    totalRecipeMatches: totalRecipeMatches ?? 0,
    ...(recipesByCuisine !== undefined ? { recipesByCuisine: parseCuisines(recipesByCuisine) } : {}),
  };
}
