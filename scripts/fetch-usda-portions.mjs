#!/usr/bin/env node
/**
 * Fetch measured household-measure weights from USDA FoodData Central.
 *
 * Reads the fdcIds already resolved by `fetch-usda-composition.mjs` and pulls
 * each record's `foodPortions` — USDA's own measured "1 cup = N grams" figures.
 * It also pulls the {@link COUNT_TARGETS}: records fetched only for their COUNT
 * portions ("1 large", "1 stalk", "1 fruit").
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `src/utils/unitConversion.ts` converts every volume unit as if the ingredient
 * were water: 1 cup = 240 g for flour, oil and honey alike. `[MEASURED]` USDA
 * says a cup of all-purpose flour is 125.0 g (fdc 168894). That is a 1.92x
 * error on the single most common dry ingredient in the recipe corpus.
 *
 * ── Why composition alone cannot fix it ─────────────────────────────────────
 *
 * Choi & Okos gives TRUE density — the density of the material itself. A cup of
 * flour is mostly the air between particles. Flour's true density works out
 * near 1450 kg/m3, while a scooped cup is about 530 kg/m3: roughly 64 % air.
 * For a liquid the two coincide and composition is enough; for anything
 * granular it is not, and the gap has to be MEASURED rather than modelled.
 * That measurement is what this script fetches.
 *
 * ── Count portions ──────────────────────────────────────────────────────────
 *
 * A recipe line of "2 large eggs" or "3 stalks celery" has no volume at all.
 * Since the 2026-09-26 nutrition gate such a line is unknown mass, so the
 * recipe publishes no computed total. USDA weighs those units too; this script
 * records them, and `scripts/generate-count-portions.ts` turns them into
 * `src/data/cooking/measuredCountPortions.ts`.
 *
 * Usage:
 *   FDC_API_KEY=xxx bun run fetch:portions   # fetch, then regenerate the table
 *
 * @file scripts/fetch-usda-portions.mjs
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, "data", "usda-composition.json");
const OUT = join(HERE, "data", "usda-portions.json");

const API_KEY = process.env.FDC_API_KEY ?? "DEMO_KEY";
/** FDC's `/foods` endpoint accepts at most 20 ids per request. */
const BATCH = 20;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Records outside the composition set, fetched for their count portions.
 *
 * `ingredient` is the exact catalog `name:` in src/data/ingredients, the key the
 * conversion looks up. The `fdcId` is pinned and `expect` must match FDC's
 * description, so a record that changes under us fails instead of being
 * absorbed. Each was checked against the catalog profile it serves: the
 * catalog's own serving figures are these records' (egg yolk 17 g, egg white
 * 33 g, lemon 58 g, lime 67 g, orange 131 g, banana 118 g, avocado ½ fruit =
 * 100 g, beet cup 136 g, celery cup 101 g, mango cup 165 g, corn ear 102 g).
 *
 * `[MEASURED 2026-09-26]` Chosen by the count-unit lines they carry across
 * `getServerRecipes()` (1,084 recipes).
 */
const COUNT_TARGETS = [
  { ingredient: "Egg Yolk", fdcId: 172184, expect: /^Egg, yolk, raw, fresh$/ },
  { ingredient: "Egg White (Albumen)", fdcId: 172183, expect: /^Egg, white, raw, fresh$/ },
  { ingredient: "Lemon", fdcId: 167746, expect: /^Lemons, raw, without peel$/ },
  { ingredient: "Lime", fdcId: 168155, expect: /^Limes, raw$/ },
  { ingredient: "Orange", fdcId: 169097, expect: /^Oranges, raw, all commercial varieties$/ },
  { ingredient: "Banana", fdcId: 173944, expect: /^Bananas, raw$/ },
  { ingredient: "Apple", fdcId: 171688, expect: /^Apples, raw, with skin\b/ },
  { ingredient: "Avocado", fdcId: 171705, expect: /^Avocados, raw, all commercial varieties$/ },
  { ingredient: "Mango", fdcId: 169910, expect: /^Mangos, raw$/ },
  { ingredient: "Kiwi", fdcId: 168153, expect: /^Kiwifruit, green, raw$/ },
  { ingredient: "cucumber", fdcId: 168409, expect: /^Cucumber, with peel, raw$/ },
  { ingredient: "zucchini", fdcId: 169291, expect: /^Squash, summer, zucchini, includes skin, raw$/ },
  { ingredient: "eggplant", fdcId: 169228, expect: /^Eggplant, raw$/ },
  { ingredient: "celery", fdcId: 169988, expect: /^Celery, raw$/ },
  { ingredient: "Beet", fdcId: 169145, expect: /^Beets, raw$/ },
  { ingredient: "radishes", fdcId: 169276, expect: /^Radishes, raw$/ },
  { ingredient: "cabbage", fdcId: 169975, expect: /^Cabbage, raw$/ },
  { ingredient: "jalapenos", fdcId: 168576, expect: /^Peppers, jalapeno, raw$/ },
  { ingredient: "corn", fdcId: 169998, expect: /^Corn, sweet, yellow, raw$/ },
];

const composition = JSON.parse(readFileSync(SOURCE, "utf8"));
const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { results: [] };
const cached = new Map((previous.results ?? []).map((r) => [r.ingredient, r]));

const retrieved = new Date().toISOString().slice(0, 10);
const results = [...cached.values()];
const failures = [];

function checkpoint() {
  const sorted = [...results].sort((a, b) => a.ingredient.localeCompare(b.ingredient));
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    `${JSON.stringify(
      {
        _comment:
          "GENERATED by scripts/fetch-usda-portions.mjs. `portions` are USDA's own MEASURED " +
          "household-measure weights in grams for the same fdcId the composition came from. " +
          "These are what a volume->mass conversion should use for granular ingredients, " +
          "because composition gives TRUE density and a cup of flour is mostly air.",
        source: "USDA FoodData Central, foodPortions",
        retrieved,
        results: sorted,
        failures,
      },
      null,
      2,
    )}\n`,
  );
}

/** FDC's portion list, keeping every weighed portion. */
function portionsOf(food) {
  return (food.foodPortions ?? [])
    .map((p) => ({
      // FDC splits the label across `measureUnit.name` and `modifier`, and for
      // most SR Legacy records the unit is literally "undetermined" while the
      // modifier carries the real word ("cup", "tbsp"). Taking measureUnit
      // alone would silently discard every usable portion.
      amount: p.amount ?? null,
      unit: (p.measureUnit?.name ?? "").toLowerCase(),
      modifier: p.modifier ?? null,
      gramWeight: p.gramWeight ?? null,
    }))
    .filter((p) => p.gramWeight !== null && p.amount !== null);
}

/** Record one fetched food against its target, or say why it was refused. */
function record(target, food) {
  const fail = (error) => {
    failures.push({ ingredient: target.ingredient, fdcId: target.fdcId, error });
    console.error(`  ✗ ${target.ingredient}: ${error}`);
  };
  if (!food) return fail("not returned by FDC");
  if (target.expect && !target.expect.test(food.description)) {
    return fail(`description changed: "${food.description}" does not match ${target.expect}`);
  }
  const portions = portionsOf(food);
  if (portions.length === 0) return fail("no usable portions");
  results.push({
    ingredient: target.ingredient,
    fdcId: target.fdcId,
    fdcDescription: target.fdcDescription ?? food.description,
    portions,
    retrieved,
  });
  console.log(
    `  ✓ ${target.ingredient.padEnd(20)} ${portions.length} portion(s): ` +
      portions
        .slice(0, 3)
        .map((p) => `${p.amount} ${p.modifier ?? p.unit} = ${p.gramWeight} g`)
        .join(", "),
  );
}

const targets = [...composition.results, ...COUNT_TARGETS];
for (const t of targets.filter((t) => cached.has(t.ingredient))) {
  console.log(`  · ${t.ingredient.padEnd(20)} cached`);
}
const pending = targets.filter((t) => !cached.has(t.ingredient));
for (let i = 0; i < pending.length; i += BATCH) {
  const batch = pending.slice(i, i + BATCH);
  try {
    const ids = batch.map((t) => t.fdcId).join(",");
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods?fdcIds=${ids}&format=full&api_key=${API_KEY}`,
    );
    if (!res.ok) throw new Error(`FDC ${res.status}`);
    const foods = new Map((await res.json()).map((f) => [f.fdcId, f]));
    for (const t of batch) record(t, foods.get(t.fdcId));
  } catch (err) {
    for (const t of batch) {
      failures.push({ ingredient: t.ingredient, fdcId: t.fdcId, error: String(err) });
      console.error(`  ✗ ${t.ingredient}: ${err}`);
    }
  }
  checkpoint();
  await sleep(API_KEY === "DEMO_KEY" ? 1200 : 120);
}

checkpoint();
console.log(`\n${results.length} with portions, ${failures.length} without → ${OUT}`);
