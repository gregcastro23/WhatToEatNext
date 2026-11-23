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
import { resolveIngredientSlugMatch } from "@/data/ingredientRecipeIndex";
import { getIngredientCatalog } from "@/lib/ingredients/ingredientCatalog";
import { ingredientRecords } from "@/lib/search/catalogRecords";
import { buildIngredientKeyResolver } from "@/lib/search/ingredientKeys";
import { createLineAuditor, summarizeLineAudits, type LineAudit, type LineFlag } from "@/lib/search/lineAudit";
import { AUDIT_FLAG_ALLOWLIST, auditAllowlistGaps } from "@/lib/search/lineAuditAllowlist";

const FLAGS: readonly LineFlag[] = ["unit-word", "generic", "modifier"];

function outPath(argv: readonly string[]): string | null {
  const at = argv.indexOf("--out");
  return at === -1 ? null : (argv[at + 1] ?? null);
}

async function main(): Promise<void> {
  const recipes = await getServerRecipes();
  const ingredients = ingredientRecords(getIngredientCatalog().entries);
  const keyOf = buildIngredientKeyResolver(ingredients, resolveIngredientSlugMatch);
  const audit = createLineAuditor(ingredients, keyOf);
  const lines = [...new Set(recipes.flatMap((r) => r.ingredients.map((i) => i.name)).filter(Boolean))].sort();
  const audits: LineAudit[] = lines.map(audit);

  const summary = summarizeLineAudits(audits);
  const { unruled, stale } = auditAllowlistGaps(audits, AUDIT_FLAG_ALLOWLIST);
  const unruledSet = new Set(unruled.map((a) => a.line));
  console.log(
    `\n${recipes.length} recipes, ${summary.lines} distinct lines, ${summary.unresolved} resolve to no card, ${summary.derived} carry derived attribution (${unruled.length} unruled flags, ${stale.length} stale allowlist rows)`,
  );
  for (const flag of FLAGS) {
    const hits = audits.filter((a) => a.flags.includes(flag));
    console.log(`\n${flag}: ${hits.length}`);
    for (const a of hits) {
      const derivedTag = a.derived.length > 0 ? ` (derived: ${a.derived.join(", ")})` : "";
      const ruleTag = unruledSet.has(a.line) ? "[UNRULED]" : "[ruled]";
      console.log(`  ${ruleTag} ${a.line}  →  ${a.keys.join(", ")}${derivedTag}`);
    }
  }
  if (stale.length > 0) {
    console.log(`\nstale allowlist rows: ${stale.length}`);
    for (const row of stale) {
      console.log(`  ${row.line} (${row.flags.join(",")}) → ${row.keys.join(", ")}`);
    }
  }

  const out = outPath(process.argv);
  if (out !== null) {
    const rows = audits.map((a) => [a.line, a.keys.join(","), a.derived.join(","), a.flags.join(",")].join("\t"));
    writeFileSync(out, `line\tkeys\tderived\tflags\n${rows.join("\n")}\n`);
    console.log(`\nwrote ${audits.length} lines to ${out}`);
  }
}

await main();
