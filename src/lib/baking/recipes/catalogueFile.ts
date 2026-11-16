/**
 * The generated recipe catalogue file — public/data/baking-recipe-catalogue.json,
 * fetched by the lab when it opens —
 * its builder, and the parser the lab reads it through.
 *
 * The builder is the defence: scripts/generate-baking-catalogue.ts runs it
 * over getServerRecipes(), and recipeCatalogue.test.ts fails whenever the
 * committed file is not exactly what it builds from today's served recipes,
 * so the catalogue cannot silently drift from the site.
 *
 * @file src/lib/baking/recipes/catalogueFile.ts
 */
import { z } from "zod";
import type { Recipe } from "@/types/recipe";
import { selectSources, type SkippedRecipe } from "./selectSources";
import type { GoodCategory, RecipeSource } from "./sourceTypes";

export const GOOD_CATEGORIES: readonly [GoodCategory, ...GoodCategory[]] = [
  "bread",
  "enriched-bread",
  "flatbread",
  "quick-bread",
  "muffin",
  "biscuit-scone",
  "cookie",
  "bar",
  "cake",
  "cracker",
  "pastry",
  "pie-tart",
];

export interface CatalogueFile {
  /** How the file was made. */
  source: string;
  servedRecipes: number;
  /** Served recipes with no baking method: counted, not listed. */
  notBaked: number;
  sources: RecipeSource[];
  skipped: SkippedRecipe[];
}

const lineSchema = z.object({ name: z.string(), amount: z.number(), unit: z.string(), notes: z.string().nullable(), optional: z.boolean() });

const sourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  cuisine: z.string(),
  category: z.enum(GOOD_CATEGORIES),
  servings: z.number().nullable(),
  cookMinutes: z.number().nullable(),
  lines: z.array(lineSchema),
  steps: z.array(z.string()),
});

const skippedSchema = z.object({
  id: z.string(),
  name: z.string(),
  reason: z.enum(["no-structure-line", "not-a-baked-good"]),
  structureShare: z.number().nullable(),
});

const fileSchema = z.object({
  source: z.string(),
  servedRecipes: z.number(),
  notBaked: z.number(),
  sources: z.array(sourceSchema),
  skipped: z.array(skippedSchema),
});

/** The catalogue file, validated: a malformed file is an error, never a partial catalogue. */
export function parseCatalogueFile(json: unknown): CatalogueFile {
  return fileSchema.parse(json);
}

/** The file the generator writes, built from the served recipes. */
export function buildCatalogueFile(recipes: readonly Recipe[]): CatalogueFile {
  const selection = selectSources(recipes);
  return {
    source: "scripts/generate-baking-catalogue.ts over getServerRecipes() (the served static catalogue)",
    servedRecipes: recipes.length,
    notBaked: selection.notBaked,
    sources: selection.sources,
    skipped: selection.skipped,
  };
}
