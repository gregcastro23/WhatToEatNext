#!/usr/bin/env node
/**
 * Fetch the USDA FoodData Central records behind the Butcher Shop's cuts and
 * emit them as a typed module.
 *
 * Writes:
 *   scripts/data/usda-butcher.json            the evidence: every value as FDC returned it
 *   src/data/butcher/usdaButcherRecords.ts    the generated module fdcButcherRecords.ts reads
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * The first Butcher Shop table (PR #1049) cited FDC ids by hand. An audit on
 * 2026-11-21 found that only 3 of its 51 ids named the cut they claimed, and
 * those 3 carried drifted values. The other 48 named a different food (ground
 * beef, turkey skin, crayfish), a cooked record, or a salmon region SR Legacy
 * does not have. This script is the fix: each target names an exact fdcId AND the
 * exact description it must carry, so a wrong id fails here, loudly, instead
 * of reaching the page.
 *
 * Which record stands behind which cut (and whether it is the cut itself or a
 * stated proxy) is decided in src/data/butcher/fdcButcherRecords.ts. This file
 * only fetches.
 *
 * Usage:
 *   node scripts/fetch-usda-butcher.mjs              # fetch (DEMO_KEY: 10 req/h) + emit
 *   FDC_API_KEY=xxx node scripts/fetch-usda-butcher.mjs
 *   node scripts/fetch-usda-butcher.mjs --emit-only  # regenerate the .ts from the JSON
 *
 * @file scripts/fetch-usda-butcher.mjs
 */
import { writeFileSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_JSON = join(HERE, "data", "usda-butcher.json");
const OUT_TS = join(HERE, "..", "src", "data", "butcher", "usdaButcherRecords.ts");
const API_KEY = process.env.FDC_API_KEY ?? "DEMO_KEY";
const ENDPOINT = "https://api.nal.usda.gov/fdc/v1/foods";
const BATCH = 20;

/** `expect` must equal FDC's description exactly. */
const TARGETS = [
  // Beef
  { fdcId: 170834, expect: 'Beef, chuck eye steak, boneless, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 168707, expect: 'Beef, shoulder top blade steak, boneless, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 171214, expect: 'Beef, chuck, under blade center steak, boneless, Denver Cut, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 168668, expect: 'Beef, chuck, arm pot roast, separable lean and fat, trimmed to 1/8" fat, choice, raw' },
  { fdcId: 173403, expect: 'Beef, rib eye steak, boneless, lip off, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 174699, expect: 'Beef, ribeye cap steak, boneless, separable lean only, trimmed to 0" fat, choice, raw' },
  { fdcId: 172152, expect: 'Beef, rib eye steak/roast, bone-in, lip-on, separable lean and fat, trimmed to 1/8" fat, choice, raw' },
  { fdcId: 169439, expect: "Beef, rib, shortribs, separable lean and fat, choice, raw" },
  { fdcId: 171751, expect: 'Beef, loin, top loin steak, boneless, lip off, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 173989, expect: 'Beef, loin, tenderloin steak, boneless, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 168715, expect: 'Beef, short loin, porterhouse steak, separable lean and fat, trimmed to 1/8" fat, choice, raw' },
  { fdcId: 168717, expect: 'Beef, short loin, t-bone steak, separable lean and fat, trimmed to 1/8" fat, choice, raw' },
  { fdcId: 168728, expect: 'Beef, top sirloin, steak, separable lean and fat, trimmed to 1/8" fat, choice, raw' },
  { fdcId: 168736, expect: 'Beef, bottom sirloin, tri-tip roast, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 174707, expect: 'Beef, loin, top sirloin cap steak, boneless, separable lean and fat, trimmed to 1/8" fat, choice, raw' },
  { fdcId: 171746, expect: 'Beef, round, eye of round roast, boneless, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 173980, expect: 'Beef, round, top round steak, boneless, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 172128, expect: 'Beef, round, outside round, bottom round, steak, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 168743, expect: 'Beef, brisket, flat half, boneless, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 169489, expect: 'Beef, brisket, point half, separable lean and fat, trimmed to 1/8" fat, all grades, raw' },
  { fdcId: 169441, expect: 'Beef, shank crosscuts, separable lean only, trimmed to 1/4" fat, choice, raw' },
  { fdcId: 172162, expect: 'Beef, plate steak, boneless, outside skirt, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 172159, expect: 'Beef, plate steak, boneless, inside skirt, separable lean and fat, trimmed to 0" fat, choice, raw' },
  { fdcId: 169433, expect: 'Beef, flank, steak, separable lean and fat, trimmed to 0" fat, choice, raw' },
  // Pork
  { fdcId: 167849, expect: "Pork, fresh, shoulder, (Boston butt), blade (steaks), separable lean and fat, raw" },
  { fdcId: 168255, expect: "Pork, fresh, shoulder, arm picnic, separable lean and fat, raw" },
  { fdcId: 168238, expect: "Pork, fresh, loin, center loin (chops), bone-in, separable lean and fat, raw" },
  { fdcId: 168312, expect: "Pork, fresh, loin, tenderloin, separable lean and fat, raw" },
  { fdcId: 168299, expect: "Pork, fresh, backribs, separable lean and fat, raw" },
  { fdcId: 167853, expect: "Pork, fresh, spareribs, separable lean and fat, raw" },
  { fdcId: 167812, expect: "Pork, fresh, belly, raw" },
  { fdcId: 168222, expect: "Pork, fresh, leg (ham), whole, separable lean and fat, raw" },
  { fdcId: 168226, expect: "Pork, fresh, leg (ham), shank half, separable lean and fat, raw" },
  // Lamb (SR Legacy names domestic lamb without the word "domestic")
  { fdcId: 172553, expect: 'Lamb, shoulder, whole (arm and blade), separable lean and fat, trimmed to 1/8" fat, choice, raw' },
  { fdcId: 174377, expect: 'Lamb, rib, separable lean and fat, trimmed to 1/8" fat, choice, raw' },
  { fdcId: 172551, expect: 'Lamb, loin, separable lean and fat, trimmed to 1/8" fat, choice, raw' },
  { fdcId: 174372, expect: 'Lamb, leg, whole (shank and sirloin), separable lean and fat, trimmed to 1/8" fat, choice, raw' },
  { fdcId: 172547, expect: 'Lamb, foreshank, separable lean and fat, trimmed to 1/8" fat, choice, raw' },
  { fdcId: 172631, expect: "Lamb, New Zealand, imported, flap, boneless, separable lean and fat, raw" },
  // Chicken
  { fdcId: 171077, expect: "Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw" },
  { fdcId: 172385, expect: "Chicken, broilers or fryers, thigh, meat and skin, raw" },
  { fdcId: 172373, expect: "Chicken, broilers or fryers, drumstick, meat and skin, raw" },
  { fdcId: 172390, expect: "Chicken, broilers or fryers, wing, meat and skin, raw" },
  { fdcId: 171073, expect: "Chicken, broilers or fryers, back, meat only, raw" },
  { fdcId: 171469, expect: "Chicken, broilers or fryers, back, meat and skin, raw" },
  // Finfish
  { fdcId: 175167, expect: "Fish, salmon, Atlantic, farmed, raw" },
];

/** SR Legacy nutrient numbers: 255 water, 203 protein, 204 total lipid, 207 ash. */
const NUTRIENTS = { 255: "waterG", 203: "proteinG", 204: "fatG", 207: "ashG" };
const FIELDS = ["waterG", "proteinG", "fatG", "ashG"];

async function fetchBatch(ids) {
  const res = await fetch(`${ENDPOINT}?api_key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // `full` carries the published precision (abridged rounds to ~3 significant figures).
    body: JSON.stringify({ fdcIds: ids, format: "full", nutrients: [203, 204, 207, 255] }),
  });
  console.log(`FDC ${res.status}; rate limit remaining ${res.headers.get("x-ratelimit-remaining")}`);
  if (!res.ok) throw new Error(`FDC ${res.status} for ids ${ids.join(",")}`);
  return res.json();
}

function toRecord(target, food) {
  if (food.description !== target.expect) {
    throw new Error(`fdcId ${target.fdcId} is "${food.description}" — expected "${target.expect}"`);
  }
  const per100g = {};
  for (const n of food.foodNutrients ?? []) {
    const field = NUTRIENTS[n.nutrient?.number ?? n.number];
    if (field !== undefined && typeof n.amount === "number") per100g[field] = n.amount;
  }
  for (const f of FIELDS) {
    if (typeof per100g[f] !== "number") throw new Error(`fdcId ${target.fdcId} reports no ${f}`);
  }
  return {
    fdcId: food.fdcId,
    ndbNumber: Number(food.ndbNumber),
    description: food.description,
    dataType: food.dataType,
    publicationDate: food.publicationDate ?? null,
    per100g,
  };
}

async function fetchAll() {
  const byId = new Map();
  for (let i = 0; i < TARGETS.length; i += BATCH) {
    const slice = TARGETS.slice(i, i + BATCH);
    const foods = await fetchBatch(slice.map((t) => t.fdcId));
    for (const target of slice) {
      const food = foods.find((f) => f.fdcId === target.fdcId);
      if (!food) throw new Error(`fdcId ${target.fdcId} missing from FDC response`);
      byId.set(target.fdcId, toRecord(target, food));
    }
  }
  return {
    _comment: "Generated by scripts/fetch-usda-butcher.mjs. Values are g per 100 g as FDC reports them.",
    source: "USDA FoodData Central API v1 (SR Legacy), format full",
    retrieved: new Date().toISOString().slice(0, 10),
    records: TARGETS.map((t) => byId.get(t.fdcId)),
  };
}

function emitTs(evidence) {
  const lines = evidence.records.map((r) => {
    const values = FIELDS.map((f) => `${f}: ${r.per100g[f]}`).join(", ");
    return `  ${r.fdcId}: { fdcId: ${r.fdcId}, ndbNumber: ${r.ndbNumber}, dataType: ${JSON.stringify(r.dataType)}, description: ${JSON.stringify(r.description)}, ${values} },`;
  });
  const body = [
    "// GENERATED by scripts/fetch-usda-butcher.mjs — do not edit by hand.",
    `// Source: ${evidence.source}, retrieved ${evidence.retrieved}. g per 100 g.`,
    'import type { UsdaProximateRecord } from "@/lib/butcher/types";',
    "",
    `export const USDA_RETRIEVED = ${JSON.stringify(evidence.retrieved)};`,
    "",
    "export const USDA_BUTCHER_RECORDS: Readonly<Record<number, UsdaProximateRecord>> = {",
    ...lines,
    "};",
    "",
  ].join("\n");
  writeFileSync(OUT_TS, body);
}

const emitOnly = process.argv.includes("--emit-only");
const evidence = emitOnly ? JSON.parse(readFileSync(OUT_JSON, "utf8")) : await fetchAll();
if (!emitOnly) writeFileSync(OUT_JSON, `${JSON.stringify(evidence, null, 2)}\n`);
emitTs(evidence);
console.log(`${evidence.records.length} records → ${OUT_TS}`);
