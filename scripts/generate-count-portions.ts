#!/usr/bin/env bun
/**
 * Generate `src/data/cooking/measuredCountPortions.ts` from the USDA portions
 * that `scripts/fetch-usda-portions.mjs` recorded in
 * `scripts/data/usda-portions.json`. Offline and deterministic; the rendering
 * lives in `scripts/lib/countPortionsSource.ts`, and
 * `scripts/lib/__tests__/countPortionsSource.test.ts` fails if the committed
 * file is not exactly its output.
 *
 * Usage:
 *   bun run generate:count-portions
 *
 * @file scripts/generate-count-portions.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { renderCountPortions } from "./lib/countPortionsSource";

const ROOT = join(import.meta.dir, "..");
const SOURCE = join(ROOT, "scripts", "data", "usda-portions.json");
const OUT = join(ROOT, "src", "data", "cooking", "measuredCountPortions.ts");

const { source, records, portions } = renderCountPortions(JSON.parse(readFileSync(SOURCE, "utf8")));
writeFileSync(OUT, source);
console.log(`${records} records, ${portions} count portions → ${OUT}`);
