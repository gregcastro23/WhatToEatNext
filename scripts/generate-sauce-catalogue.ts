#!/usr/bin/env bun
/**
 * Generate `public/data/sauce-catalogue.json` from the public cuisine modules.
 *
 * Keeps full recipe files out of client bundles while exposing all 15
 * traditions, 80+ native sauces, regional dialects, pairing maps, and
 * ingredient dossier slugs. `sauceCatalogue.test.ts` fails if the committed
 * file drifts from this builder.
 *
 * Usage:
 *   bun run generate:sauce-catalogue
 *
 * @file scripts/generate-sauce-catalogue.ts
 */
import { writeFileSync } from "fs";
import { join } from "path";
import { parseSauceCatalogueFile } from "../src/lib/sauces/catalogueFile";
import { buildSauceCatalogueFile } from "./lib/buildSauceCatalogue";

const OUT = join(import.meta.dir, "..", "public", "data", "sauce-catalogue.json");

const file = parseSauceCatalogueFile(await buildSauceCatalogueFile());
writeFileSync(OUT, `${JSON.stringify(file, null, 1)}\n`);
console.log(
  `${file.cuisineCount} cuisines · ${file.sauceCount} native sauces · ${Object.keys(file.ingredientSlugs).length} ingredient slugs → ${OUT}`,
);
