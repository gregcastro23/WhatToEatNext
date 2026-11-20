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
 *   FDC_RAW_DIR=/tmp/fdc node scripts/fetch-usda-baking.mjs
 *       # keep each raw batch response there and re-read it instead of
 *       # refetching: a parsing fix then costs no DEMO_KEY request
 *
 * ── Portions ────────────────────────────────────────────────────────────────
 *
 * Each record also carries FDC's own measured household PORTIONS ("1 cup =
 * 125 g", "1 large = 50 g") for the same fdcId, so a recipe's cups and eggs
 * convert to grams against the record the vector is built on, never at water
 * density. That needs `format: "full"`: the abridged format has no portions.
 *
 * @file scripts/fetch-usda-baking.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "fs";
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
  // Added 2026-11-16 for the recipe catalogue: the most frequent unmatched
  // ingredients of the served baked recipes, found by FDC search (SR Legacy).
  { key: "whole-wheat-pastry-flour", fdcId: 168944, expect: /^Wheat flour, whole-grain, soft wheat$/ },
  { key: "spelt-flour", fdcId: 169745, expect: /^Spelt, uncooked$/ },
  { key: "semolina", fdcId: 169715, expect: /^Semolina, enriched$/ },
  { key: "cornmeal", fdcId: 169697, expect: /^Cornmeal, whole-grain, yellow$/ },
  { key: "rolled-oats", fdcId: 173904, expect: /^Cereals, oats, regular and quick, not fortified, dry$/ },
  { key: "rice-flour", fdcId: 169714, expect: /^Rice flour, white, unenriched$/ },
  { key: "tapioca-starch", fdcId: 169717, expect: /^Tapioca, pearl, dry$/ },
  { key: "vegetable-oil", fdcId: 172336, expect: /^Oil, canola$/ },
  { key: "maple-sugar", fdcId: 169658, expect: /^Sugars, maple$/ },
  { key: "molasses", fdcId: 168820, expect: /^Molasses$/ },
  { key: "sour-cream", fdcId: 171257, expect: /^Cream, sour, cultured$/ },
  { key: "plain-yogurt", fdcId: 171284, expect: /^Yogurt, plain, whole milk$/ },
  { key: "apple-juice", fdcId: 173933, expect: /^Apple juice, canned or bottled, unsweetened, without added ascorbic acid$/ },
  { key: "walnuts", fdcId: 170187, expect: /^Nuts, walnuts, english$/ },
  { key: "pecans", fdcId: 170182, expect: /^Nuts, pecans$/ },
  { key: "raisins", fdcId: 168165, expect: /^Raisins, dark, seedless/ },
  { key: "almond-milk", fdcId: 174832, expect: /^Beverages, almond milk, unsweetened, shelf stable$/ },
  { key: "soy-milk", fdcId: 172446, expect: /^Soymilk, original and vanilla, unfortified$/ },
  { key: "orange-juice", fdcId: 169098, expect: /^Orange juice, raw/ },
  { key: "applesauce", fdcId: 171695, expect: /^Applesauce, canned, unsweetened, without added ascorbic acid/ },
  { key: "banana", fdcId: 173944, expect: /^Bananas, raw$/ },
  { key: "peanut-butter", fdcId: 172470, expect: /^Peanut butter, smooth style, without salt$/ },
  { key: "corn-syrup", fdcId: 168837, expect: /^Syrups, corn, light$/ },
  { key: "dried-cranberries", fdcId: 171723, expect: /^Cranberries, dried, sweetened/ },
  // Added 2026-11-19 to unlock the remaining single-batter recipes across
  // quick-bread, muffin, bar, cracker, flatbread, cookie, bread, and cake.
  { key: "sorghum-flour", fdcId: 168943, expect: /^Sorghum flour, whole-grain$/ },
  { key: "buckwheat-flour", fdcId: 170687, expect: /^Buckwheat flour, whole-groat$/ },
  { key: "brown-rice-flour", fdcId: 168898, expect: /^Rice flour, brown$/ },
  { key: "sweet-rice-flour", fdcId: 168883, expect: /^Rice, white, glutinous, unenriched, uncooked$/ },
  { key: "barley-flour", fdcId: 169739, expect: /^Barley flour or meal$/ },
  { key: "rye-flour", fdcId: 168886, expect: /^Rye flour, medium$/ },
  { key: "arrowroot-starch", fdcId: 170684, expect: /^Arrowroot flour$/ },
  { key: "bulgur", fdcId: 170688, expect: /^Bulgur, dry$/ },
  { key: "ghee", fdcId: 173412, expect: /^Butter oil, anhydrous$/ },
  { key: "oat-milk", fdcId: 2257046, expect: /^Oat milk, unsweetened, plain, refrigerated$/ },
  { key: "coconut-milk", fdcId: 170172, expect: /^Nuts, coconut milk, raw/ },
  { key: "blueberries", fdcId: 171711, expect: /^Blueberries, raw$/ },
  { key: "fresh-cranberries", fdcId: 171722, expect: /^Cranberries, raw$/ },
  { key: "shredded-coconut", fdcId: 170169, expect: /^Nuts, coconut meat, raw$/ },
  { key: "grated-carrot", fdcId: 170393, expect: /^Carrots, raw$/ },
  { key: "zucchini", fdcId: 169291, expect: /^Squash, summer, zucchini, includes skin, raw$/ },
  { key: "apple", fdcId: 171688, expect: /^Apples, raw, with skin/ },
  { key: "pear", fdcId: 169118, expect: /^Pears, raw$/ },
  { key: "potato", fdcId: 170026, expect: /^Potatoes, flesh and skin, raw$/ },
  { key: "dried-figs", fdcId: 174665, expect: /^Figs, dried, uncooked$/ },
  { key: "pitted-dates", fdcId: 171726, expect: /^Dates, deglet noor$/ },
  { key: "dried-apricots", fdcId: 173941, expect: /^Apricots, dried, sulfured, uncooked$/ },
  { key: "olives", fdcId: 169094, expect: /^Olives, ripe, canned/ },
  { key: "poppy-seeds", fdcId: 171330, expect: /^Spices, poppy seed$/ },
  { key: "sesame-seeds", fdcId: 170150, expect: /^Seeds, sesame seeds, whole, dried$/ },
  { key: "sunflower-seeds", fdcId: 170562, expect: /^Seeds, sunflower seed kernels, dried$/ },
  { key: "flaxseed", fdcId: 169414, expect: /^Seeds, flaxseed$/ },
  { key: "pistachios", fdcId: 170184, expect: /^Nuts, pistachio nuts, raw$/ },
  { key: "cashews", fdcId: 170571, expect: /^Nuts, cashew nuts, dry roasted, without salt added$/ },
];

/** FDC nutrient NUMBER → field. Foundation reports total sugars as 269.3. */
const NUTRIENTS = {
  255: "water", 203: "protein", 204: "fat", 205: "carbohydrate", 207: "ash",
  291: "fiber", 269: "sugars", "269.3": "sugars", 210: "sucrose", 211: "glucose",
  212: "fructose", 213: "lactose", 214: "maltose", 287: "galactose", 209: "starch",
  307: "sodiumMg", 221: "ethanol",
};
const FIELDS = [...new Set(Object.values(NUTRIENTS))];

const RAW_DIR = process.env.FDC_RAW_DIR ?? null;

async function fetchBatch(ids) {
  const cache = RAW_DIR === null ? null : join(RAW_DIR, `batch-${ids.join("-")}.json`);
  if (cache !== null && existsSync(cache)) return JSON.parse(readFileSync(cache, "utf8"));
  const res = await fetch(`${ENDPOINT}?api_key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fdcIds: ids, format: "full" }),
  });
  console.log(`FDC ${res.status}; rate limit remaining ${res.headers.get("x-ratelimit-remaining")}`);
  if (!res.ok) throw new Error(`FDC ${res.status} for ids ${ids.join(",")}`);
  const body = await res.json();
  if (cache !== null) writeFileSync(cache, JSON.stringify(body));
  return body;
}

/**
 * FDC's measured household portions, verbatim. SR Legacy splits the label
 * across `measureUnit.name` (often literally "undetermined") and `modifier`
 * ("cup", "large", "stick"); Foundation names the unit and may leave the
 * modifier empty. The reader (src/lib/baking/recipes) decides which measure a
 * portion is.
 */
function portionsOf(food) {
  return (food.foodPortions ?? [])
    .filter((p) => typeof p.gramWeight === "number" && typeof p.amount === "number" && p.amount > 0)
    .map((p) => ({
      amount: p.amount,
      unit: (p.measureUnit?.name ?? "").toLowerCase(),
      modifier: p.modifier ?? "",
      description: p.portionDescription ?? "",
      gramWeight: p.gramWeight,
    }));
}

function toRecord(target, food) {
  if (!target.expect.test(food.description)) {
    throw new Error(`fdcId ${target.fdcId} is now "${food.description}" — expected ${target.expect}`);
  }
  const per100g = Object.fromEntries(FIELDS.map((f) => [f, null]));
  for (const n of food.foodNutrients ?? []) {
    // `full` nests the nutrient's identity; `abridged` flattens it.
    const field = NUTRIENTS[n.nutrient?.number ?? n.number];
    if (field !== undefined && typeof n.amount === "number") per100g[field] = n.amount;
  }
  return {
    key: target.key,
    fdcId: food.fdcId,
    description: food.description,
    dataType: food.dataType,
    publicationDate: food.publicationDate ?? null,
    per100g,
    portions: portionsOf(food),
  };
}

async function fetchAll() {
  const existing = !process.argv.includes("--refetch") && existsSync(OUT_JSON)
    ? new Map((JSON.parse(readFileSync(OUT_JSON, "utf8")).records ?? []).map((r) => [r.fdcId, r]))
    : new Map();
  const missing = TARGETS.filter((t) => !existing.has(t.fdcId));
  const fetched = new Map();
  for (let i = 0; i < missing.length; i += BATCH) {
    const slice = missing.slice(i, i + BATCH);
    const foods = await fetchBatch(slice.map((t) => t.fdcId));
    for (const target of slice) {
      const food = foods.find((f) => f.fdcId === target.fdcId);
      if (!food) throw new Error(`fdcId ${target.fdcId} (${target.key}) missing from FDC response`);
      fetched.set(target.fdcId, toRecord(target, food));
    }
  }
  const records = TARGETS.map((t) => {
    const rec = fetched.get(t.fdcId) ?? existing.get(t.fdcId);
    if (!rec) throw new Error(`Missing record for ${t.key}`);
    if (!t.expect.test(rec.description)) {
      throw new Error(`fdcId ${t.fdcId} is "${rec.description}" — expected ${t.expect}`);
    }
    return { ...rec, key: t.key };
  });
  return {
    _comment: "Generated by scripts/fetch-usda-baking.mjs. Values are g per 100 g as FDC reports them (sodium in mg); null = not reported by FDC.",
    source: "USDA FoodData Central API v1 (SR Legacy / Foundation), format full (nutrients + foodPortions)",
    retrieved: new Date().toISOString().slice(0, 10),
    records,
  };
}

function portionsTs(portions) {
  return portions
    .map((p) => `{ amount: ${p.amount}, unit: ${JSON.stringify(p.unit)}, modifier: ${JSON.stringify(p.modifier)}, description: ${JSON.stringify(p.description)}, grams: ${p.gramWeight} }`)
    .join(", ");
}

function emitTs(evidence) {
  const lines = evidence.records.map((r) => {
    const values = FIELDS.map((f) => `${f}: ${r.per100g[f] === null ? "null" : String(r.per100g[f])}`).join(", ");
    // Two lines per record keeps the module under the 300-line lint ceiling as the list grows.
    return [
      `  { key: ${JSON.stringify(r.key)}, fdcId: ${r.fdcId}, dataType: ${JSON.stringify(r.dataType)}, description: ${JSON.stringify(r.description)}, per100g: { ${values} },`,
      `    portions: [${portionsTs(r.portions ?? [])}] },`,
    ].join("\n");
  });
  const body = [
    "// GENERATED by scripts/fetch-usda-baking.mjs — do not edit by hand.",
    `// Source: ${evidence.source}, retrieved ${evidence.retrieved}. g per 100 g; sodium in mg; null = not reported.`,
    "// portions: FDC's measured household measures for the same fdcId (grams per `amount` of the measure).",
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
