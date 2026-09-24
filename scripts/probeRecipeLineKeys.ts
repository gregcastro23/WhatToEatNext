/**
 * Probe: every distinct ingredient line of the static recipe catalog → the
 * catalog key(s) the omnibar's reverse index files it under, with head-noun
 * flags (see src/lib/search/lineAudit.ts for what each flag means).
 *
 * The resolver is the one production uses (lib/search/loader). The recipes are
 * the static catalog, as in src/lib/search/__tests__/corpus.test.ts; the live
 * catalog has different ids but the same lines.
 *
 * Usage:
 *   bun scripts/probeRecipeLineKeys.ts                 # counts + flagged lines
 *   bun scripts/probeRecipeLineKeys.ts --out lines.tsv # also every line as TSV
 */
import { writeFileSync } from "node:fs";

import { getServerRecipes } from "@/actions/recipes";
import { resolveIngredientSlug } from "@/data/ingredientRecipeIndex";
import { getIngredientCatalog } from "@/lib/ingredients/ingredientCatalog";
import { ingredientRecords } from "@/lib/search/catalogRecords";
import { buildIngredientKeyResolver } from "@/lib/search/ingredientKeys";
import { createLineAuditor, summarizeLineAudits, type LineAudit, type LineFlag } from "@/lib/search/lineAudit";

const FLAGS: readonly LineFlag[] = ["unit-word", "generic", "modifier"];

function outPath(argv: readonly string[]): string | null {
  const at = argv.indexOf("--out");
  return at === -1 ? null : (argv[at + 1] ?? null);
}

async function main(): Promise<void> {
  const recipes = await getServerRecipes();
  const ingredients = ingredientRecords(getIngredientCatalog().entries);
  const keyOf = buildIngredientKeyResolver(ingredients, resolveIngredientSlug);
  const audit = createLineAuditor(ingredients, keyOf);
  const lines = [...new Set(recipes.flatMap((r) => r.ingredients.map((i) => i.name)).filter(Boolean))].sort();
  const audits: LineAudit[] = lines.map(audit);

  const summary = summarizeLineAudits(audits);
  console.log(`\n${recipes.length} recipes, ${summary.lines} distinct lines, ${summary.unresolved} resolve to no card`);
  for (const flag of FLAGS) {
    const hits = audits.filter((a) => a.flags.includes(flag));
    console.log(`\n${flag}: ${hits.length}`);
    for (const a of hits) console.log(`  ${a.line}  →  ${a.keys.join(", ")}`);
  }

  const out = outPath(process.argv);
  if (out !== null) {
    const rows = audits.map((a) => [a.line, a.keys.join(","), a.flags.join(",")].join("\t"));
    writeFileSync(out, `line\tkeys\tflags\n${rows.join("\n")}\n`);
    console.log(`\nwrote ${audits.length} lines to ${out}`);
  }
}

await main();
