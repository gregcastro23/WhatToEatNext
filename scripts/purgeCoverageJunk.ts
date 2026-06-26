#!/usr/bin/env bun
/**
 * One-shot purge of non-ingredient junk from the auto-generated coverage set
 * (src/data/ingredients/misc/recipeCoverageIngredients.ts).
 *
 * Driven by scripts/data/coverageClassification.json (a research-assisted
 * classification of all 427 coverage entries, committed as provenance). The
 * decision rules below were confirmed by the catalog owner — see
 * project_ingredient_quality_campaign memory.
 *
 * Removes:
 *   - corrupted_duplicate  (diacritic-stripped corruptions, e.g. thit_kho_t_u)
 *   - variant_merge        (spelling/plural dup → canonical kept, e.g. ancho_chilies→ancho_chiles)
 *   - dish_or_composite    EXCEPT the composites that function as ingredients (KEEP_COMPOSITES)
 *   - EXPLICIT_JUNK        (equipment / app pseudo-ingredients / orphan adjective fragments)
 *
 * Keeps every real_ingredient and the listed composites. Idempotent: a slug
 * already absent is simply skipped.
 *
 *   bun run scripts/purgeCoverageJunk.ts            # apply
 *   bun run scripts/purgeCoverageJunk.ts --dry-run  # report only
 */
import fs from "fs";
import path from "path";
import { Project, SyntaxKind } from "ts-morph";

const ROOT = path.resolve(import.meta.dir, "..");
const COVERAGE_FILE = path.join(
  ROOT,
  "src/data/ingredients/misc/recipeCoverageIngredients.ts",
);
const CLASSIFICATION_FILE = path.join(
  ROOT,
  "scripts/data/coverageClassification.json",
);
const EXCLUSIONS_FILE = path.join(
  ROOT,
  "src/data/generated/coverageExclusions.json",
);

// Composites that other recipes legitimately reference AS an ingredient — keep.
const KEEP_COMPOSITES = new Set([
  "pico_de_gallo",
  "salsa_roja",
  "salsa_verde",
  "chiltomate_sauce",
  "b_u00e9chamel_sauce",
  "liver_pate",
  "piperade",
]);

// Classified real_ingredient but not actually a food ingredient — remove.
const EXPLICIT_JUNK = new Set([
  "bamboo_skewers",
  "wooden_skewers",
  "cedar_grilling_plank",
  "kitchen_towel",
  "alchemical_binding_agent",
  "aromatic_catalyst",
  "alchemical_spice",
  "fresh",
  "torn",
  "beaten",
  "finely_sliced",
  "filling",
  "for_glaze",
  "garni",
]);

interface Row {
  slug: string;
  name: string;
  classification: string;
  canonical: string | null;
  confidence: string;
}

const dryRun = process.argv.includes("--dry-run");

const rows: Row[] = JSON.parse(fs.readFileSync(CLASSIFICATION_FILE, "utf8"));
const bySlug = new Map(rows.map((r) => [r.slug, r]));
const keptSlugs = new Set(
  rows
    .filter((r) => {
      if (EXPLICIT_JUNK.has(r.slug)) return false;
      if (r.classification === "corrupted_duplicate") return false;
      if (r.classification === "variant_merge") return false;
      if (r.classification === "dish_or_composite")
        return KEEP_COMPOSITES.has(r.slug);
      return true; // real_ingredient
    })
    .map((r) => r.slug),
);

const toDelete = new Map<string, string>(); // slug -> reason
for (const r of rows) {
  if (keptSlugs.has(r.slug)) continue;
  let reason: string;
  if (EXPLICIT_JUNK.has(r.slug)) reason = "non-ingredient (equipment/pseudo/fragment)";
  else if (r.classification === "corrupted_duplicate")
    reason = `corrupted duplicate of ${r.canonical}`;
  else if (r.classification === "variant_merge") {
    // Safety: only merge-delete when the canonical survives.
    if (!r.canonical || !keptSlugs.has(r.canonical)) {
      console.warn(`  ! skip merge ${r.slug}: canonical '${r.canonical}' not kept`);
      keptSlugs.add(r.slug);
      continue;
    }
    reason = `variant of ${r.canonical}`;
  } else reason = "standalone dish/composite";
  toDelete.set(r.slug, reason);
}

console.log(`Classification: ${rows.length} entries → delete ${toDelete.size}, keep ${rows.length - toDelete.size}`);

// Remove the matching property assignments from the coverage object literal.
const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
});
const sf = project.addSourceFileAtPath(COVERAGE_FILE);
let removed = 0;
const removedNames: string[] = [];
const notFound: string[] = [];

for (const decl of sf.getVariableDeclarations()) {
  const obj = decl.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (!obj) continue;
  for (const prop of [...obj.getProperties()]) {
    const pa = prop.asKind(SyntaxKind.PropertyAssignment);
    if (!pa) continue;
    const slug = pa.getName().replace(/^["'`]|["'`]$/g, "");
    if (toDelete.has(slug)) {
      removedNames.push(slug);
      pa.remove();
      removed++;
    }
  }
}
for (const slug of toDelete.keys())
  if (!removedNames.includes(slug)) notFound.push(slug);

console.log(`Removed ${removed} entries from coverage file.`);
if (notFound.length)
  console.log(`  (already absent: ${notFound.length} — ${notFound.slice(0, 8).join(", ")}${notFound.length > 8 ? "…" : ""})`);

// Exclusion list so the generator can't re-add purged junk.
const exclusions = {
  note: "Slugs+names purged from the coverage set as non-ingredients/duplicates. generateRecipeCoverageIngredients.ts must skip these. See project_ingredient_quality_campaign.",
  slugs: [...toDelete.keys()].sort(),
  names: [...toDelete.keys()].map((s) => bySlug.get(s)?.name ?? s).sort(),
};

if (dryRun) {
  console.log("\n--dry-run: no files written. Sample of deletions:");
  for (const [slug, reason] of [...toDelete].slice(0, 20))
    console.log(`  - ${slug}: ${reason}`);
} else {
  sf.saveSync();
  fs.mkdirSync(path.dirname(EXCLUSIONS_FILE), { recursive: true });
  fs.writeFileSync(EXCLUSIONS_FILE, JSON.stringify(exclusions, null, 2) + "\n");
  console.log(`Wrote exclusion list (${exclusions.slugs.length}) → ${path.relative(ROOT, EXCLUSIONS_FILE)}`);
}
