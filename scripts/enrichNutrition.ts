#!/usr/bin/env bun
/**
 * Replace placeholder/default ingredient nutrition with researched best-estimate
 * values from scripts/data/nutritionEstimates.json (keyed by ingredient slug).
 *
 * Idempotent + non-destructive: only fills a nutritionalProfile that is missing
 * or carries a placeholder source ("category default" / "Recipe-derived coverage
 * entry" / "category estimate"). Genuinely-real nutrition (any other source) is
 * NEVER overwritten. Grows per category batch — extend the JSON, re-run.
 *
 *   bun run scripts/enrichNutrition.ts            # apply
 *   bun run scripts/enrichNutrition.ts --dry-run  # report only
 */
import fs from "fs";
import path from "path";
import { Project, SyntaxKind, ObjectLiteralExpression } from "ts-morph";

const ROOT = path.resolve(import.meta.dir, "..");
const INGREDIENTS_DIR = path.join(ROOT, "src", "data", "ingredients");
const MAP_PATH = path.join(ROOT, "scripts", "data", "nutritionEstimates.json");
const PLACEHOLDER_SOURCE = /category default|Recipe-derived coverage entry|category estimate/i;
const SKIP_FILES = new Set([
  "index.ts",
  "types.ts",
  "ingredients.ts",
  "ingredientSummaries.ts",
  "flavorProfiles.ts",
  "elementalProperties.ts",
]);

const dryRun = process.argv.includes("--dry-run");
const estimates: Record<string, unknown> = JSON.parse(
  fs.readFileSync(MAP_PATH, "utf8"),
).estimates;

/** Emit a TS object literal with bare identifier keys (matches the catalog style). */
function toLiteral(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.map(toLiteral).join(", ")}]`;
  if (v && typeof v === "object") {
    const parts = Object.entries(v).map(([k, val]) => {
      const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return `${key}: ${toLiteral(val)}`;
    });
    return `{ ${parts.join(", ")} }`;
  }
  return "null";
}

function walk(dir: string, out: string[]) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".ts") && !SKIP_FILES.has(e.name)) out.push(p);
  }
}

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
});
const files: string[] = [];
walk(INGREDIENTS_DIR, files);

let filled = 0;
let skippedReal = 0;
const touched: string[] = [];

for (const file of files) {
  const sf = project.addSourceFileAtPath(file);
  let modified = false;
  for (const decl of sf.getVariableDeclarations()) {
    const root = decl.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!root) continue;
    for (const prop of root.getProperties()) {
      const pa = prop.asKind(SyntaxKind.PropertyAssignment);
      if (!pa) continue;
      const card = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!card || !card.getProperty("name")) continue;
      const slug = pa.getName().replace(/^["'`]|["'`]$/g, "");
      const est = estimates[slug];
      if (!est) continue;

      const npProp = card.getProperty("nutritionalProfile")?.asKind(SyntaxKind.PropertyAssignment);
      if (npProp) {
        const npObj = npProp.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
        const source =
          (npObj?.getProperty("source") as ObjectLiteralExpression | undefined) &&
          npObj!
            .getProperty("source")!
            .asKind(SyntaxKind.PropertyAssignment)!
            .getInitializer()
            ?.getText();
        // Only overwrite a placeholder/default profile — never real data.
        if (!source || PLACEHOLDER_SOURCE.test(source)) {
          if (!dryRun) npProp.setInitializer(toLiteral(est));
          filled++;
          touched.push(slug);
          modified = true;
        } else {
          skippedReal++;
        }
      } else {
        if (!dryRun) card.addPropertyAssignment({ name: "nutritionalProfile", initializer: toLiteral(est) });
        filled++;
        touched.push(slug);
        modified = true;
      }
    }
  }
  if (modified && !dryRun) sf.saveSync();
}

console.log(`Nutrition estimates in map: ${Object.keys(estimates).length}`);
console.log(`${dryRun ? "[dry-run] would fill" : "Filled"} ${filled} placeholder/missing nutritionalProfiles; skipped ${skippedReal} already-real.`);
const missed = Object.keys(estimates).filter((s) => !touched.includes(s));
if (missed.length) console.log(`  Not found in catalog (or already real): ${missed.join(", ")}`);
