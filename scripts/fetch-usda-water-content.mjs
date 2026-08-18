#!/usr/bin/env node
/**
 * Fetch water content for curated ingredients from USDA FoodData Central.
 *
 * Emits `scripts/data/usda-water-content.json`, which
 * `scripts/apply-usda-water-content.mjs` writes into the ingredient data files
 * as `nutritionalProfile.waterContent`.
 *
 * ── Why a script and not a table typed by hand ──────────────────────────────
 *
 * A water fraction with no stated source is a guess with a decimal point. This
 * repository's standard is that a value names its basis and can be regenerated
 * from it. Running this reproduces every figure, and a figure that stops
 * reproducing is a figure that changed — which is the whole point.
 *
 * ── The ingredient list ─────────────────────────────────────────────────────
 *
 * Chosen by frequency in the recipe corpus (`backend/alchm_kitchen/data/json/
 * recipes.json`, 1,078 recipes) after alias normalisation, intersected with the
 * ingredients that actually exist in `src/data/ingredients`. Each entry pins an
 * explicit FDC query AND the expected description, so a silent re-match to a
 * different food is caught rather than absorbed.
 *
 * ⚠️ `query` is not a guess the script is free to improve on. FDC search is
 * relevance-ranked and unstable across revisions; `expect` is what makes a
 * changed match visible.
 *
 * Usage:
 *   node scripts/fetch-usda-water-content.mjs            # DEMO_KEY, rate limited
 *   FDC_API_KEY=xxx node scripts/fetch-usda-water-content.mjs
 *
 * @file scripts/fetch-usda-water-content.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "data", "usda-water-content.json");

const API_KEY = process.env.FDC_API_KEY ?? "DEMO_KEY";
const ENDPOINT = "https://api.nal.usda.gov/fdc/v1/foods/search";

/**
 * `ingredient` is the exact `name:` value in src/data/ingredients — the key the
 * apply step matches on. `query` and `expect` pin the FDC record.
 *
 * ⚠️ MATCH THE PREPARATION STATE, NOT JUST THE NAME.
 *
 * `[MEASURED 2026-08-18]` Pork and chicken were first matched to RAW records
 * while their profiles describe "roasted loin chop" and "roasted breast".
 * Cooking drives off water and concentrates protein, so the raw figure is a
 * correct number for a different food: closure came out at 1.090 and 1.078.
 *
 * A word-matching heuristic over the FDC description does NOT catch this — it
 * flagged four false positives ("salad or cooking" is a product name) and
 * missed both real cases ("fryers" contains "fry", "chops or roasts" contains
 * "roast"). The closure assertion in
 * `src/__tests__/data/ingredientWaterContent.test.ts` catches it by arithmetic,
 * which is why that test is the gate and this comment is only a warning.
 */
const TARGETS = [
  { ingredient: "Salt", query: "salt table", expect: /^Salt, table/i },
  { ingredient: "Garlic", query: "garlic raw", expect: /^Garlic, raw/i },
  { ingredient: "Olive Oil", query: "oil olive salad or cooking", expect: /olive/i },
  { ingredient: "Water", query: "water bottled generic", expect: /water/i },
  { ingredient: "Egg", query: "egg whole raw fresh", expect: /^Egg, whole, raw/i },
  { ingredient: "Onion", query: "onions raw", expect: /^Onions, raw/i },
  { ingredient: "Sugar", query: "sugars granulated", expect: /^Sugars, granulated/i },
  { ingredient: "Butter", query: "butter without salt", expect: /^Butter, without salt/i },
  { ingredient: "Carrot", query: "carrots raw", expect: /^Carrots, raw/i },
  { ingredient: "All-Purpose Flour", query: "wheat flour white all-purpose enriched bleached", expect: /all-purpose/i },
  { ingredient: "Maple Syrup", query: "syrups maple", expect: /maple/i },
  { ingredient: "Vanilla Extract", query: "vanilla extract", expect: /vanilla extract/i },
  { ingredient: "Soy Sauce", query: "soy sauce made from soy and wheat shoyu", expect: /soy sauce/i },
  { ingredient: "Cinnamon", query: "spices cinnamon ground", expect: /cinnamon/i },
  { ingredient: "Ginger", query: "ginger root raw", expect: /^Ginger root, raw/i },
  { ingredient: "Vegetable Oil", query: "oil soybean salad or cooking", expect: /oil/i },
  { ingredient: "Milk", query: "milk whole 3.25% milkfat", expect: /^Milk, whole/i },
  { ingredient: "Sesame Oil", query: "oil sesame salad or cooking", expect: /sesame/i },
  { ingredient: "Cilantro", query: "coriander leaves cilantro raw", expect: /coriander|cilantro/i },
  { ingredient: "Tomato", query: "tomatoes red ripe raw year round average", expect: /^Tomatoes, red, ripe, raw/i },
  { ingredient: "Fish Sauce", query: "fish sauce ready to serve", expect: /fish sauce/i },
  { ingredient: "Parsley", query: "parsley fresh", expect: /^Parsley, fresh|^Parsley, raw/i },
  { ingredient: "Coconut Milk", query: "nuts coconut milk raw liquid expressed from grated meat", expect: /coconut milk/i },
  { ingredient: "Cumin", query: "spices cumin seed", expect: /cumin/i },
  { ingredient: "Potato", query: "potatoes flesh and skin raw", expect: /^Potatoes/i },
  { ingredient: "Shrimp", query: "crustaceans shrimp raw", expect: /shrimp/i },
  { ingredient: "Tomato Paste", query: "tomato products canned paste without salt added", expect: /paste/i },
  { ingredient: "Thyme", query: "thyme fresh", expect: /^Thyme, fresh/i },
  { ingredient: "Heavy Cream", query: "cream fluid heavy whipping", expect: /heavy whipping/i },
  { ingredient: "Walnuts", query: "nuts walnuts english", expect: /walnuts/i },
  { ingredient: "Nutmeg", query: "spices nutmeg ground", expect: /nutmeg/i },
  { ingredient: "Coconut Oil", query: "oil coconut", expect: /coconut/i },
  { ingredient: "Turmeric", query: "spices turmeric ground", expect: /turmeric/i },
  { ingredient: "Dill", query: "dill weed fresh", expect: /dill/i },
  { ingredient: "Bay Leaf", query: "spices bay leaf", expect: /bay leaf/i },
  { ingredient: "Chives", query: "chives raw", expect: /^Chives, raw/i },
  { ingredient: "Sesame Seeds", query: "seeds sesame seeds whole dried", expect: /sesame/i },
  { ingredient: "Lemon Juice", query: "lemon juice raw", expect: /lemon juice/i },
  { ingredient: "Lime Juice", query: "lime juice raw", expect: /lime juice/i },
  { ingredient: "Scallion", query: "onions spring or scallions includes tops and bulb raw", expect: /scallion|spring/i },
  // ⚠️ COOKED. The profile's serving is "3 oz (85g) roasted loin chop", so the raw
  // record is the wrong food: roasting drives off water and concentrates protein.
  { ingredient: "Pork", query: "pork fresh loin center rib chops bone-in cooked roasted", expect: /pork.*roasted/i },
  // ⚠️ COOKED. The profile's serving is "5 oz (150g) roasted breast, skin-off".
  { ingredient: "Chicken", query: "chicken broilers or fryers breast meat only roasted", expect: /chicken.*breast.*roasted/i },
  { ingredient: "Pepper", query: "spices pepper black", expect: /pepper, black/i },
];

const NUTRIENTS = {
  water: "Water",
  protein: "Protein",
  fat: "Total lipid (fat)",
  carbohydrate: "Carbohydrate, by difference",
  ash: "Ash",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Pull the named nutrient's value (g per 100 g) from an FDC food record. */
function nutrient(food, label) {
  const hit = (food.foodNutrients ?? []).find((n) => n.nutrientName === label);
  return hit && typeof hit.value === "number" ? hit.value : null;
}

/**
 * ⚠️ SR Legacy is requested ALONE and first, never alongside Foundation.
 *
 * `[MEASURED 2026-08-18]` Asking for both let FDC rank a Foundation record
 * first for garlic — 63.1 % water, against SR Legacy's 58.6 %. Both are real
 * USDA figures; they are not interchangeable. The macros already sitting in our
 * ingredient profiles follow SR Legacy's proximate accounting, so a Foundation
 * water figure beside them broke closure: water + protein + fat + carbohydrate
 * summed to 1.031 of the serving mass. Mixing the two datasets produces a value
 * that is individually defensible and jointly wrong, which is the hardest kind
 * to notice.
 *
 * Foundation is used only when SR Legacy has nothing, and the dataset is
 * recorded either way so a mixed basis stays visible.
 */
const DATA_TYPES = ["SR Legacy", "Foundation"];

async function lookupIn(target, dataType) {
  const url =
    `${ENDPOINT}?query=${encodeURIComponent(target.query)}` +
    `&dataType=${encodeURIComponent(dataType)}&pageSize=5&api_key=${API_KEY}`;

  // DEMO_KEY is capped per hour and per day, and a 429 is not a fact about the
  // ingredient — retrying is correct. A non-429 error is a fact, and is not.
  let res = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    res = await fetch(url);
    if (res.status !== 429) break;
    const backoff = 2000 * 2 ** attempt;
    console.error(`    · rate limited, waiting ${backoff / 1000}s (attempt ${attempt + 1}/4)`);
    await sleep(backoff);
  }
  if (!res.ok) throw new Error(`FDC ${res.status} for "${target.query}"`);
  const body = await res.json();
  const foods = body.foods ?? [];
  if (foods.length === 0) return null;

  // Prefer the first result that BOTH matches the expected description and
  // actually reports water. A record with no Water nutrient is useless here,
  // and silently taking foods[0] is how a wrong food gets a right-looking
  // number.
  const food =
    foods.find((f) => target.expect.test(f.description) && nutrient(f, NUTRIENTS.water) !== null) ??
    null;
  if (!food) return null;

  const waterG = nutrient(food, NUTRIENTS.water);
  return {
    ingredient: target.ingredient,
    fraction: Number((waterG / 100).toFixed(4)),
    fdcId: food.fdcId,
    fdcDescription: food.description,
    dataType,
    // Carried for the Choi–Okos layer that comes next. Not written into the
    // ingredient files by the apply step, which only handles water.
    companions: {
      proteinG: nutrient(food, NUTRIENTS.protein),
      fatG: nutrient(food, NUTRIENTS.fat),
      carbohydrateG: nutrient(food, NUTRIENTS.carbohydrate),
      ashG: nutrient(food, NUTRIENTS.ash),
    },
  };
}

/** Try each dataset in preference order; the first with a real match wins. */
async function lookup(target) {
  for (const dataType of DATA_TYPES) {
    const row = await lookupIn(target, dataType);
    if (row) return row;
  }
  return { ...target, error: `no ${DATA_TYPES.join("/")} result matched ${target.expect}` };
}

const retrieved = new Date().toISOString().slice(0, 10);

// RESUMABLE. DEMO_KEY allows ~30 lookups an hour, so a full sweep of the target
// list cannot complete in one run without a key. Re-running merges rather than
// overwrites: anything already resolved is kept and skipped, so repeated runs
// accumulate instead of trading one set of failures for another.
//
// Set FDC_API_KEY (free, instant) and the whole list completes in one pass.
const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { results: [] };
const alreadyResolved = new Map((previous.results ?? []).map((r) => [r.ingredient, r]));

const results = [...alreadyResolved.values()];
const failures = [];

/**
 * Write what we have so far.
 *
 * Called after EVERY resolved lookup, not once at the end. A rate-limited run
 * can take longer than the caller is willing to wait, and a "resumable" script
 * that only persists on clean exit loses every value it just paid for when the
 * run is interrupted. Checkpointing is what makes the resume above real.
 */
function checkpoint() {
  // Deterministic order, so a re-run's diff shows changed VALUES, not reshuffling.
  const sorted = [...results].sort((a, b) => a.ingredient.localeCompare(b.ingredient));
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    `${JSON.stringify(
      {
        _comment:
          "GENERATED by scripts/fetch-usda-water-content.mjs from USDA FoodData Central. " +
          "`fraction` is water as a MASS FRACTION of the edible portion (g per 100 g / 100). " +
          "Applied to src/data/ingredients by scripts/apply-usda-water-content.mjs.",
        source: "USDA FoodData Central, SR Legacy / Foundation",
        retrieved,
        resolved: sorted.length,
        outstanding: TARGETS.length - sorted.length,
        results: sorted,
        failures,
      },
      null,
      2,
    )}\n`,
  );
}

for (const target of TARGETS) {
  if (alreadyResolved.has(target.ingredient)) {
    console.log(`  · ${target.ingredient.padEnd(20)} cached, skipping`);
    continue;
  }
  try {
    const row = await lookup(target);
    if (row.error) {
      failures.push(row);
      console.error(`  ✗ ${row.ingredient}: ${row.error}`);
    } else {
      results.push({ ...row, retrieved });
      checkpoint();
      console.log(
        `  ✓ ${row.ingredient.padEnd(20)} ${String(row.fraction).padEnd(7)} ` +
          `fdc:${row.fdcId}  ${row.fdcDescription}`,
      );
    }
  } catch (err) {
    failures.push({ ingredient: target.ingredient, error: String(err) });
    console.error(`  ✗ ${target.ingredient}: ${err}`);
  }
  // DEMO_KEY is rate limited; be a good citizen either way.
  await sleep(API_KEY === "DEMO_KEY" ? 1200 : 150);
}

checkpoint();

console.log(`\n${results.length} resolved, ${failures.length} failed → ${OUT}`);
if (failures.length > 0) process.exitCode = 1;
