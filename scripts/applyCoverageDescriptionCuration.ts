/**
 * Apply curated descriptions to the auto-generated recipe-coverage ingredients.
 *
 * Background: scripts/generateRecipeCoverageIngredients.ts emitted ~354 coverage
 * entries with boilerplate copy + placeholder nutrition. #527 hides any entry
 * whose description still carries the boilerplate marker
 * (isBoilerplateCoverageIngredient). This script swaps in real, human-curated
 * descriptions (from coverageDescriptionCuration.ts) for the subset that are
 * genuine ingredients — removing the marker so they surface in browse again —
 * and clears the fabricated placeholder nutrition (calories/macros) so the cards
 * honestly show no nutrition rather than fake numbers (the browse UI's
 * extractNutrition() then yields null and omits the badge).
 *
 * Dish names, recipe-instruction fragments, and corrupted strings are NOT in the
 * curation map and stay hidden — that's intended.
 *
 * Idempotent: only entries that still carry the boilerplate marker AND have a
 * curation entry are touched. Patches in place; run after editing the curation.
 *
 *   bun scripts/applyCoverageDescriptionCuration.ts
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { coverageDescriptionCuration } from "../src/data/ingredients/misc/coverageDescriptionCuration";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const COV = path.join(
  REPO_ROOT,
  "src",
  "data",
  "ingredients",
  "misc",
  "recipeCoverageIngredients.ts",
);

const MARKER = "recipe-linked ingredient captured from live cuisine data";

function escape(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function main(): void {
  const txt = fs.readFileSync(COV, "utf8");
  const re = /\n {2}([a-z0-9_]+): \{/g;
  const matches = [...txt.matchAll(re)];

  let result = matches.length ? txt.slice(0, matches[0].index) : txt;
  let patched = 0;
  let hiddenAfter = 0;

  for (let i = 0; i < matches.length; i++) {
    const slug = matches[i][1];
    const start = matches[i].index as number;
    const end = i + 1 < matches.length ? (matches[i + 1].index as number) : txt.length;
    let block = txt.slice(start, end);

    const cur = coverageDescriptionCuration[slug];
    if (cur && block.includes(MARKER)) {
      // Replace the (possibly multi-line) description string value.
      block = block.replace(
        /description:\s*"(?:[^"\\]|\\.)*",/,
        `description: "${escape(cur.description)}",`,
      );
      // Tighten the category.
      block = block.replace(/category:\s*"[^"]*",/, `category: "${cur.category}",`);
      // Drop the fabricated placeholder nutrition (no invented calorie/macro values).
      block = block.replace(/\n[ \t]*calories:\s*\d+(?:\.\d+)?,/, "");
      block = block.replace(/\n[ \t]*macros:\s*\{[^}]*\},/, "");
      patched++;
    }

    if (block.includes(MARKER)) hiddenAfter++;
    result += block;
  }

  fs.writeFileSync(COV, result);
  console.log(
    `Patched ${patched} coverage entries with curated descriptions; ` +
      `${hiddenAfter} entries remain hidden (dish names / fragments / corrupted).`,
  );
}

main();
