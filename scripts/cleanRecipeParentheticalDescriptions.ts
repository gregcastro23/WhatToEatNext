/**
 * Clean junk parenthetical "descriptions" and recover the real data they hide.
 *
 * 64 public recipes carry a description that is nothing but a parenthetical
 * season/dietary tag — "(FALL/WINTER)", "(Spring/Summer)", "(Vegan)",
 * "(Gluten-Free)". These render as the recipe's description (e.g. the detail
 * page shows "(FALL/WINTER)" where prose should be), and the *real* season they
 * encode is NOT in the structured fields: every one of these recipes has a
 * uniform all-four-seasons placeholder in read_model.contexts[].seasonal.
 *
 * This script parses the parenthetical, writes the recovered season into
 * read_model.contexts[].seasonal (replacing the all-seasons placeholder for the
 * season-specific ones) and any dietary flag into dietary_tags, then clears the
 * junk from both `description` and `read_model.description` (honest empty, which
 * the recipe view already omits gracefully).
 *
 * Idempotent: once cleared, a recipe no longer matches the candidate filter.
 *
 * Run:
 *   DATABASE_URL=postgresql://... bun scripts/cleanRecipeParentheticalDescriptions.ts --dry-run
 *   DATABASE_URL=postgresql://... bun scripts/cleanRecipeParentheticalDescriptions.ts
 */

import pkg from "pg";

const { Pool } = pkg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required — set it in the environment before running this script.",
  );
}

const dryRun = process.argv.includes("--dry-run");

const ALL_SEASONS = ["spring", "summer", "autumn", "winter"] as const;

interface Parsed {
  seasons: string[] | null; // null = leave seasonal untouched (year-round / none)
  dietary: string[];
}

/** Parse a parenthetical tag into recovered seasons + dietary flags. */
function parseParenthetical(desc: string): Parsed {
  const t = desc.toLowerCase().replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  const seasons = new Set<string>();
  if (/\bspring\b/.test(t)) seasons.add("spring");
  if (/\bsummer\b/.test(t)) seasons.add("summer");
  if (/\b(fall|autumn)\b/.test(t)) seasons.add("autumn");
  if (/\bwinter\b/.test(t)) seasons.add("winter");

  // Map to canonical `dietary_restriction` enum labels (capitalized, spaced).
  // Tags without a matching enum value (e.g. "wheat-free") are dropped rather
  // than coerced — the junk description is still cleared, just no false tag.
  const dietary: string[] = [];
  if (/\bvegan\b/.test(t)) dietary.push("Vegan");
  if (/\bvegetarian\b/.test(t)) dietary.push("Vegetarian");
  if (/gluten[\s-]?free\b/.test(t)) dietary.push("Gluten Free");
  if (/dairy[\s-]?free\b/.test(t)) dietary.push("Dairy Free");

  // "year-round" → genuinely all seasons (the existing placeholder is correct);
  // leave seasonal untouched. Season-specific tags override the placeholder.
  const isYearRound = /year[\s-]?round/.test(t);
  const orderedSeasons = ALL_SEASONS.filter((s) => seasons.has(s));
  return {
    seasons: orderedSeasons.length > 0 && !isYearRound ? orderedSeasons : null,
    dietary,
  };
}

interface Row {
  id: string;
  name: string;
  description: string;
  read_model: Record<string, unknown>;
  dietary_tags: string[] | null;
}

async function main() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 4,
  });

  const { rows } = await pool.query<Row>(
    `SELECT id, name, description, read_model, dietary_tags
       FROM recipes
      WHERE is_public = true
        AND description ~ '^\\s*\\('
        AND length(description) < 30`,
  );

  console.log(
    `[clean-parens] candidates: ${rows.length}${dryRun ? " (DRY RUN)" : ""}`,
  );

  let cleared = 0;
  let seasonsRecovered = 0;
  let dietaryRecovered = 0;
  const samples: string[] = [];

  for (const row of rows) {
    const parsed = parseParenthetical(row.description);
    const rm = (row.read_model ?? {}) as Record<string, unknown>;

    // Recover season into every context's seasonal array.
    if (parsed.seasons && Array.isArray(rm.contexts)) {
      rm.contexts = (rm.contexts as Array<Record<string, unknown>>).map((c) => ({
        ...c,
        seasonal: parsed.seasons,
      }));
      seasonsRecovered++;
    }

    // Merge dietary flags (dedup) into both the column and read_model.
    let dietaryTags = Array.isArray(row.dietary_tags) ? [...row.dietary_tags] : [];
    if (parsed.dietary.length > 0) {
      const existing = new Set(dietaryTags.map((d) => d.toLowerCase()));
      for (const d of parsed.dietary) {
        if (!existing.has(d.toLowerCase())) dietaryTags.push(d);
      }
      rm.dietary_tags = dietaryTags;
      dietaryRecovered++;
    }

    // Clear the junk description everywhere it's read from.
    rm.description = "";

    if (samples.length < 8) {
      samples.push(
        `${row.name}: "${row.description}" → seasons=${parsed.seasons?.join("/") ?? "(unchanged)"} dietary=${parsed.dietary.join(",") || "—"}`,
      );
    }

    if (!dryRun) {
      await pool.query(
        `UPDATE recipes
            SET description = '',
                dietary_tags = $2::dietary_restriction[],
                read_model = $3::jsonb,
                updated_at = NOW()
          WHERE id = $1`,
        [row.id, dietaryTags, JSON.stringify(rm)],
      );
    }
    cleared++;
  }

  console.log(
    `[clean-parens] done: cleared=${cleared}, seasons_recovered=${seasonsRecovered}, dietary_recovered=${dietaryRecovered}`,
  );
  for (const s of samples) console.log(`  ${s}`);

  await pool.end();
}

main().catch((err) => {
  console.error("[clean-parens] FAILED:", err);
  process.exit(1);
});
