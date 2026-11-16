#!/usr/bin/env node
/**
 * Fetch the USDA FoodData Central records behind the Baking Lab's ingredient
 * vectors, and emit them as a typed module.
 *
 * Writes:
 *   scripts/data/usda-baking.json      the evidence: every value as FDC returned it
 *   src/data/baking/fdcRecords.ts      the generated module the vectors import
 *
 * ── Why pinned ids and not a search ─────────────────────────────────────────
 *
 * FDC search is relevance-ranked and drifts between releases. Each target names
 * an exact fdcId AND the description it must carry, so a record that changes
 * identity fails loudly instead of being absorbed. (The first pass of this list
 * was found by search, 2026-11-15; this script is what makes it reproducible.)
 *
 * ── Absence is not zero ─────────────────────────────────────────────────────
 *
 * FDC omits nutrients that were never analysed. Flour has no sugar speciation
 * and cornstarch reports no starch line. Those come out as `null`, never `0`:
 * an unmeasured glucose fraction is a different claim from a measured zero, and
 * the vectors that consume this file say which one they are making.
 *
 * Usage:
 *   node scripts/fetch-usda-baking.mjs              # fetch (DEMO_KEY: 10 req/h) + emit
 *   FDC_API_KEY=xxx node scripts/fetch-usda-baking.mjs
 *   node scripts/fetch-usda-baking.mjs --emit-only  # regenerate the .ts from the JSON
 *
 * @file scripts/fetch-usda-baking.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_JSON = join(HERE, "data", "usda-baking.json");
const OUT_TS = join(HERE, "..", "src", "data", "baking", "fdcRecords.ts");
const API_KEY = process.env.FDC_API_KEY ?? "DEMO_KEY";
const ENDPOINT = "https://api.nal.usda.gov/fdc/v1/foods";
const BATCH = 20;

/** `key` is the Baking Lab ingredient id; `expect` must match FDC's description exactly. */
const TARGETS = [
  { key: "bread-flour", fdcId: 168896, expect: /^Wheat flour, white, bread, enriched$/ },
  { key: "all-purpose-flour", fdcId: 168894, expect: /^Wheat flour, white, all-purpose, enriched, bleached$/ },
  { key: "cake-flour", fdcId: 169723, expect: /^Wheat flour, white, cake, enriched$/ },
  { key: "whole-wheat-flour", fdcId: 168893, expect: /^Wheat flour, whole-grain/ },
  { key: "almond-flour", fdcId: 170568, expect: /^Nuts, almonds, blanched$/ },
  { key: "cassava-flour", fdcId: 2512377, expect: /^Flour, cassava$/ },
  { key: "cornstarch", fdcId: 169698, expect: /^Cornstarch$/ },
  { key: "butter", fdcId: 173430, expect: /^Butter, without salt$/ },
  { key: "coconut-oil", fdcId: 171412, expect: /^Oil, coconut$/ },
  { key: "olive-oil", fdcId: 171413, expect: /^Oil, olive, salad or cooking$/ },
  { key: "vegetable-shortening", fdcId: 173584, expect: /^Shortening, vegetable, household, composite$/ },
  { key: "lard", fdcId: 171401, expect: /^Lard$/ },
  { key: "granulated-sugar", fdcId: 746784, expect: /^Sugars, granulated$/ },
  { key: "brown-sugar", fdcId: 168833, expect: /^Sugars, brown$/ },
  { key: "powdered-sugar", fdcId: 169656, expect: /^Sugars, powdered$/ },
  { key: "honey", fdcId: 169640, expect: /^Honey$/ },
  { key: "maple-syrup", fdcId: 169661, expect: /^Syrups, maple$/ },
  { key: "water", fdcId: 174158, expect: /^Water, bottled, generic$/ },
  { key: "whole-milk", fdcId: 171265, expect: /^Milk, whole, 3\.25% milkfat, with added vitamin D$/ },
  { key: "buttermilk", fdcId: 170874, expect: /^Milk, buttermilk, fluid, cultured, lowfat$/ },
  { key: "heavy-cream", fdcId: 170859, expect: /^Cream, fluid, heavy whipping$/ },
  { key: "lemon-juice", fdcId: 167747, expect: /^Lemon juice, raw$/ },
  { key: "whole-egg", fdcId: 171287, expect: /^Egg, whole, raw, fresh$/ },
  { key: "egg-white", fdcId: 172183, expect: /^Egg, white, raw, fresh$/ },
  { key: "egg-yolk", fdcId: 172184, expect: /^Egg, yolk, raw, fresh$/ },
  { key: "baking-soda", fdcId: 175040, expect: /^Leavening agents, baking soda$/ },
  { key: "baking-powder", fdcId: 172803, expect: /^Leavening agents, baking powder, double-acting, sodium aluminum sulfate$/ },
  { key: "cream-of-tartar", fdcId: 175041, expect: /^Leavening agents, cream of tartar$/ },
  { key: "instant-yeast", fdcId: 175043, expect: /^Leavening agents, yeast, baker's, active dry$/ },
  { key: "salt", fdcId: 173468, expect: /^Salt, table$/ },
  { key: "cocoa-natural", fdcId: 169593, expect: /^Cocoa, dry powder, unsweetened$/ },
  { key: "cocoa-dutch", fdcId: 169594, expect: /^Cocoa, dry powder, unsweetened, processed with alkali$/ },
  { key: "dark-chocolate-70", fdcId: 170273, expect: /^Chocolate, dark, 70-85% cacao solids$/ },
  { key: "semisweet-chocolate", fdcId: 167976, expect: /^Candies, semisweet chocolate$/ },
  { key: "vanilla-extract", fdcId: 173471, expect: /^Vanilla extract$/ },
];

/** FDC nutrient NUMBER → field. Foundation reports total sugars as 269.3. */
const NUTRIENTS = {
  255: "water", 203: "protein", 204: "fat", 205: "carbohydrate", 207: "ash",
  291: "fiber", 269: "sugars", "269.3": "sugars", 210: "sucrose", 211: "glucose",
  212: "fructose", 213: "lactose", 214: "maltose", 287: "galactose", 209: "starch",
  307: "sodiumMg", 221: "ethanol",
};
const FIELDS = [...new Set(Object.values(NUTRIENTS))];

async function fetchBatch(ids) {
  const res = await fetch(`${ENDPOINT}?api_key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fdcIds: ids, format: "abridged" }),
  });
  if (!res.ok) throw new Error(`FDC ${res.status} for ids ${ids.join(",")}`);
  return res.json();
}

function toRecord(target, food) {
  if (!target.expect.test(food.description)) {
    throw new Error(`fdcId ${target.fdcId} is now "${food.description}" — expected ${target.expect}`);
  }
  const per100g = Object.fromEntries(FIELDS.map((f) => [f, null]));
  for (const n of food.foodNutrients ?? []) {
    const field = NUTRIENTS[n.number];
    if (field !== undefined && typeof n.amount === "number") per100g[field] = n.amount;
  }
  return {
    key: target.key,
    fdcId: food.fdcId,
    description: food.description,
    dataType: food.dataType,
    publicationDate: food.publicationDate ?? null,
    per100g,
  };
}

async function fetchAll() {
  const records = [];
  for (let i = 0; i < TARGETS.length; i += BATCH) {
    const slice = TARGETS.slice(i, i + BATCH);
    const foods = await fetchBatch(slice.map((t) => t.fdcId));
    for (const target of slice) {
      const food = foods.find((f) => f.fdcId === target.fdcId);
      if (!food) throw new Error(`fdcId ${target.fdcId} (${target.key}) missing from FDC response`);
      records.push(toRecord(target, food));
    }
  }
  return {
    _comment: "Generated by scripts/fetch-usda-baking.mjs. Values are g per 100 g as FDC reports them (sodium in mg); null = not reported by FDC.",
    source: "USDA FoodData Central API v1 (SR Legacy / Foundation)",
    retrieved: new Date().toISOString().slice(0, 10),
    records,
  };
}

function emitTs(evidence) {
  const lines = evidence.records.map((r) => {
    const values = FIELDS.map((f) => `${f}: ${r.per100g[f] === null ? "null" : String(r.per100g[f])}`).join(", ");
    return [
      `  {`,
      `    key: ${JSON.stringify(r.key)}, fdcId: ${r.fdcId}, dataType: ${JSON.stringify(r.dataType)},`,
      `    description: ${JSON.stringify(r.description)},`,
      `    per100g: { ${values} },`,
      `  },`,
    ].join("\n");
  });
  const body = [
    "// GENERATED by scripts/fetch-usda-baking.mjs — do not edit by hand.",
    `// Source: ${evidence.source}, retrieved ${evidence.retrieved}. g per 100 g; sodium in mg; null = not reported.`,
    'import type { FdcBakingRecord } from "@/lib/baking/types";',
    "",
    `export const FDC_RETRIEVED = ${JSON.stringify(evidence.retrieved)};`,
    "",
    "export const FDC_BAKING_RECORDS: readonly FdcBakingRecord[] = [",
    ...lines,
    "];",
    "",
  ].join("\n");
  writeFileSync(OUT_TS, body);
}

const emitOnly = process.argv.includes("--emit-only");
const evidence = emitOnly ? JSON.parse(readFileSync(OUT_JSON, "utf8")) : await fetchAll();
if (!emitOnly) writeFileSync(OUT_JSON, `${JSON.stringify(evidence, null, 2)}\n`);
emitTs(evidence);
console.log(`${evidence.records.length} records → ${OUT_TS}`);
