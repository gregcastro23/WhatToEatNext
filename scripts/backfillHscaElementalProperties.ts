/**
 * Backfill `read_model.elemental_properties` for the 499 new HSCA recipes.
 *
 * Reads each recipe's denormalized ingredient list from `read_model.ingredients`,
 * matches each name against the unified ingredient catalog (which includes misc,
 * beverages, dairy, herbs, fruits, vegetables, etc.), aggregates and normalizes
 * the per-ingredient Fire/Water/Earth/Air, then writes the result back into
 * `read_model.elemental_properties` as the legacy lowercase-key shape.
 *
 * Run:
 *   bun scripts/backfillHscaElementalProperties.ts
 *
 * Idempotent: re-running overwrites with freshly computed values. Pass
 *   --only-missing  to skip recipes that already have elemental_properties.
 */

import pkg from "pg";
import { unifiedIngredients } from "../src/data/unified/ingredients";
import {
  normalize,
  normalizedVariants,
  singularize,
  stripQuotes,
} from "../src/utils/ingredientNormalization";

const { Pool } = pkg;

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:PsVTYtMbsWtMhykqZbzgzJUpMmrzKKoD@tramway.proxy.rlwy.net:35670/railway";

const onlyMissing = process.argv.includes("--only-missing");

interface ElementalProps {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

interface IndexedEntry {
  key: string;
  elemental: ElementalProps;
}

// ── Build a fat lookup map keyed by every reasonable variant of each ingredient ──

const lookupMap = new Map<string, IndexedEntry>();

function indexUnder(variantKey: string, entry: IndexedEntry) {
  if (!variantKey) return;
  // Earlier insertions win — equally-valid variants from later entries don't clobber
  if (!lookupMap.has(variantKey)) lookupMap.set(variantKey, entry);
}

function tokenize(s: string): string[] {
  return normalize(s)
    .split(" ")
    .filter((t) => t.length > 1);
}

function buildVariants(text: string): Set<string> {
  // 1. raw normalized variants (handles "fresh", "frozen", etc.)
  const set = normalizedVariants(text);
  // 2. singularized whole-string variant
  const tokens = tokenize(text).map((t) => singularize(t));
  if (tokens.length) {
    set.add(tokens.join(" "));
    // 3. last-token-only (e.g. "raspberries" from "fresh raspberries")
    set.add(tokens[tokens.length - 1]);
    // 4. first-token-only (e.g. "agave" from "agave nectar")
    set.add(tokens[0]);
  }
  return set;
}

for (const [key, ing] of Object.entries(unifiedIngredients)) {
  const ep = ing?.elementalProperties as Partial<ElementalProps> | undefined;
  if (
    !ep ||
    typeof ep.Fire !== "number" ||
    typeof ep.Water !== "number" ||
    typeof ep.Earth !== "number" ||
    typeof ep.Air !== "number"
  ) {
    continue;
  }
  const elemental: ElementalProps = {
    Fire: ep.Fire,
    Water: ep.Water,
    Earth: ep.Earth,
    Air: ep.Air,
  };
  const entry: IndexedEntry = { key, elemental };

  const display = (ing as any).name as string | undefined;
  for (const v of buildVariants(key)) indexUnder(v, entry);
  if (display) for (const v of buildVariants(display)) indexUnder(v, entry);
}

console.log(`[backfill] lookup map size: ${lookupMap.size}`);

function lookup(rawName: string): IndexedEntry | null {
  const cleaned = stripQuotes(rawName);
  const variants = buildVariants(cleaned);
  for (const v of variants) {
    const hit = lookupMap.get(v);
    if (hit) return hit;
  }
  // Last-resort: longest-shared-token Jaccard ≥ 0.5 over the indexed keys
  const queryTokens = new Set(tokenize(cleaned).map((t) => singularize(t)));
  if (queryTokens.size === 0) return null;
  let best: IndexedEntry | null = null;
  let bestScore = 0;
  for (const [k, v] of lookupMap.entries()) {
    const keyTokens = k.split(" ");
    let shared = 0;
    for (const t of keyTokens) if (queryTokens.has(t)) shared++;
    const union = new Set([...keyTokens, ...queryTokens]).size;
    const score = union > 0 ? shared / union : 0;
    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      best = v;
    }
  }
  return best;
}

function aggregate(names: string[]): ElementalProps | null {
  let f = 0,
    w = 0,
    e = 0,
    a = 0,
    matched = 0;
  for (const n of names) {
    const ent = lookup(n);
    if (!ent) continue;
    f += ent.elemental.Fire;
    w += ent.elemental.Water;
    e += ent.elemental.Earth;
    a += ent.elemental.Air;
    matched++;
  }
  if (matched === 0) return null;
  const total = f + w + e + a;
  if (total <= 0) return null;
  return { Fire: f / total, Water: w / total, Earth: e / total, Air: a / total };
}

interface Row {
  id: string;
  name: string;
  ingredient_names: string[];
}

async function main() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 4,
  });

  const where = onlyMissing
    ? `AND NOT (read_model ? 'elemental_properties')`
    : ``;

  const { rows } = await pool.query<Row>(
    `SELECT id, name,
            ARRAY(SELECT jsonb_array_elements(read_model->'ingredients')->>'name') AS ingredient_names
       FROM recipes
      WHERE created_at::date = '2026-05-24'
      ${where}`,
  );

  console.log(`[backfill] candidates: ${rows.length}`);

  let updated = 0;
  let zeroMatches = 0;
  const zeroMatchSamples: string[] = [];

  for (const row of rows) {
    const names = (row.ingredient_names || []).filter(
      (n): n is string => typeof n === "string" && n.length > 0,
    );
    if (names.length === 0) continue;

    const ep = aggregate(names);
    if (!ep) {
      zeroMatches++;
      if (zeroMatchSamples.length < 5) {
        zeroMatchSamples.push(`${row.name}: [${names.join(" | ")}]`);
      }
      continue;
    }

    await pool.query(
      `UPDATE recipes
          SET read_model = jsonb_set(read_model, '{elemental_properties}', $2::jsonb, true),
              updated_at = NOW()
        WHERE id = $1`,
      [
        row.id,
        JSON.stringify({
          fire: ep.Fire,
          water: ep.Water,
          earth: ep.Earth,
          air: ep.Air,
        }),
      ],
    );
    updated++;
    if (updated % 100 === 0) {
      console.log(`[backfill] ${updated}/${rows.length} written`);
    }
  }

  console.log(
    `[backfill] done: updated=${updated}, zero-matches=${zeroMatches}, total=${rows.length}`,
  );
  if (zeroMatchSamples.length) {
    console.log(`[backfill] sample zero-match recipes:`);
    for (const s of zeroMatchSamples) console.log(`  - ${s}`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error("[backfill] FAILED:", err);
  process.exit(1);
});
