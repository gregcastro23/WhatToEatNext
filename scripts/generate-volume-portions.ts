#!/usr/bin/env bun
/**
 * Generate `src/data/cooking/measuredPortions.ts` from the USDA portions that
 * `scripts/fetch-usda-portions.mjs` recorded in `scripts/data/usda-portions.json`.
 * Offline and deterministic; the rules live in
 * `scripts/lib/volumePortionsSource.ts`, and
 * `scripts/lib/__tests__/volumePortionsSource.test.ts` fails if the committed
 * file is not exactly its output.
 *
 * Usage:
 *   bun run generate:volume-portions
 *
 * @file scripts/generate-volume-portions.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { renderVolumePortions } from "./lib/volumePortionsSource";

const ROOT = join(import.meta.dir, "..");
const readJson = (...path: string[]): unknown => JSON.parse(readFileSync(join(ROOT, ...path), "utf8"));
const OUT = join(ROOT, "src", "data", "cooking", "measuredPortions.ts");

writeFileSync(
  OUT,
  renderVolumePortions(readJson("scripts", "data", "usda-portions.json"), readJson("scripts", "data", "usda-composition.json")),
);
console.log(`→ ${OUT}`);
