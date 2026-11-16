#!/usr/bin/env bun
/**
 * Generate `public/data/baking-recipe-catalogue.json`: the served recipes that are
 * bakeable goods, and why each other baked recipe is not.
 *
 * Reads getServerRecipes() — the static catalogue the site serves — with the
 * database unset, so the output does not depend on which copies a live
 * database happens to hide. The selection lives in
 * src/lib/baking/recipes/catalogueFile.ts; recipeCatalogue.test.ts fails if
 * the committed file is not exactly its output.
 *
 * Usage:
 *   env -u DATABASE_URL bun run generate:baking-catalogue
 *
 * @file scripts/generate-baking-catalogue.ts
 */
import { writeFileSync } from "fs";
import { join } from "path";
import { getServerRecipes } from "../src/actions/recipes";
import { buildCatalogueFile } from "../src/lib/baking/recipes/catalogueFile";

const OUT = join(import.meta.dir, "..", "public", "data", "baking-recipe-catalogue.json");

if (process.env.DATABASE_URL !== undefined && process.env.DATABASE_URL !== "") {
  console.error("Unset DATABASE_URL first: the catalogue is built from the static served recipes only.");
  process.exit(1);
}

const file = buildCatalogueFile(await getServerRecipes());
writeFileSync(OUT, `${JSON.stringify(file, null, 1)}\n`);
console.log(`${file.servedRecipes} served · ${file.notBaked} not baked · ${file.sources.length} bakeable goods · ${file.skipped.length} baked but skipped → ${OUT}`);
