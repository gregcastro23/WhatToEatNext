/**
 * Remove the fabricated `{ protein: 1, carbs: 10, fat: 1, fiber: 1 }` macro
 * template (usually paired with `calories: 100`) from the static ingredient
 * catalog.
 *
 * Background: an earlier generation pass stamped that exact macro template onto
 * 208 `unifiedIngredients` entries. It is not just cosmetic — the recipe
 * nutrition aggregator (`computeRecipeNutritionFromIngredients`, #555) reads
 * `calories`/`macros`, so every recipe that used a stubbed ingredient was
 * silently credited fabricated calories/macros per serving instead of the
 * contribution being skipped.
 *
 * The template fingerprint is the macros `{ protein: 1, carbs: 10, fat: 1 }`
 * (the companion `calories` is sometimes 100, sometimes a real value with only
 * the macros faked). This script eliminates it per entry type:
 *  - GRAINS: real per-100g nutrition, derived from the real `calories_per_100g`
 *    / `protein_g` / `fiber_g` already present on each entry (carbs/fat from
 *    standard whole-grain composition).
 *  - DRIED HERBS: a real per-teaspoon dried-leaf-herb profile (~3 cal/tsp).
 *  - FRESH/AROMATIC HERBS: a real per-tablespoon fresh-herb profile (~1 cal).
 *  - SQUASH/GOURDS: real macros (the existing calories are already real — only
 *    the macros were faked).
 *  - COVERAGE ENTRIES (recipeCoverageIngredients): honest-null — the fabricated
 *    `calories`/`macros` are removed, leaving `serving_size`/`source` so the
 *    aggregator skips them and browse shows no badge. Real nutrition for the
 *    genuinely-real coverage ingredients is curated separately with the staples.
 *
 * Herb macro contribution is uniform and negligible at this granularity; the
 * point is to kill the false claim (a teaspoon of dried basil is not 100 cal).
 *
 * Idempotent: only entries still carrying the template macros are touched.
 *
 *   bun scripts/fixStubIngredientNutrition.ts
 */
import * as path from "path";
import { fileURLToPath } from "url";
import {
  Project,
  SyntaxKind,
  type ObjectLiteralExpression,
  type PropertyAssignment,
} from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const ING = path.join(REPO_ROOT, "src", "data", "ingredients");

type Mode = "grain" | "driedHerb" | "freshHerb" | "squash" | "coverage";
interface Target {
  file: string;
  varName: string;
  mode: Mode;
}

const TARGETS: Target[] = [
  { file: path.join(ING, "grains", "wholeGrains.ts"), varName: "rawWholeGrains", mode: "grain" },
  { file: path.join(ING, "herbs", "driedHerbs.ts"), varName: "rawDriedHerbs", mode: "driedHerb" },
  { file: path.join(ING, "herbs", "aromatic.ts"), varName: "rawAromaticHerbs", mode: "freshHerb" },
  { file: path.join(ING, "vegetables", "squash.ts"), varName: "rawSquash", mode: "squash" },
  { file: path.join(ING, "misc", "recipeCoverageIngredients.ts"), varName: "recipeCoverageIngredients", mode: "coverage" },
];

// Standard whole-grain carbs/fat per 100g dry (calories/protein/fiber come from
// the real `_per_100g` values already on each entry).
const GRAIN_CARBS_FAT: Record<string, { carbs: number; fat: number }> = {
  kamut: { carbs: 70.4, fat: 2.2 },
  spelt_berries: { carbs: 70.2, fat: 2.4 },
  einkorn: { carbs: 68.6, fat: 2.5 },
  rye_berries: { carbs: 75.9, fat: 1.6 },
  wild_rice: { carbs: 74.9, fat: 1.1 },
  triticale: { carbs: 72.1, fat: 2.0 },
  barley: { carbs: 73.5, fat: 2.3 },
};

// Real macros per 100g raw (calories on each entry are already real).
const SQUASH_MACROS: Record<string, { protein: number; carbs: number; fat: number; fiber: number }> = {
  zucchini: { protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1.0 },
  "butternut squash": { protein: 1.0, carbs: 11.7, fat: 0.1, fiber: 2.0 },
  pumpkin: { protein: 1.0, carbs: 6.5, fat: 0.1, fiber: 0.5 },
  "acorn squash": { protein: 1.1, carbs: 15.0, fat: 0.1, fiber: 2.1 },
};

const DRIED_HERB = {
  serving_size: "1 tsp (1 g)",
  calories: 3,
  macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 },
};
const FRESH_HERB = {
  serving_size: "1 tbsp (2 g)",
  calories: 1,
  macros: { protein: 0.1, carbs: 0.2, fat: 0.02, fiber: 0.1 },
};

function getPA(obj: ObjectLiteralExpression, name: string): PropertyAssignment | undefined {
  return obj.getProperty(name)?.asKind(SyntaxKind.PropertyAssignment);
}
function numOf(pa: PropertyAssignment | undefined): number | undefined {
  if (!pa) return undefined;
  const n = Number(pa.getInitializer()?.getText());
  return Number.isFinite(n) ? n : undefined;
}

/** True iff this nutritionalProfile carries the fabricated macro template. */
function hasTemplateMacros(np: ObjectLiteralExpression): boolean {
  const macros = getPA(np, "macros")?.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (!macros) return false;
  return (
    numOf(getPA(macros, "protein")) === 1 &&
    numOf(getPA(macros, "carbs")) === 10 &&
    numOf(getPA(macros, "fat")) === 1
  );
}

function setServingSize(np: ObjectLiteralExpression, value: string): void {
  const existing = getPA(np, "serving_size");
  if (existing) existing.setInitializer(JSON.stringify(value));
  else np.insertPropertyAssignment(0, { name: "serving_size", initializer: JSON.stringify(value) });
}
function setCalories(np: ObjectLiteralExpression, value: number): void {
  const existing = getPA(np, "calories");
  if (existing) existing.setInitializer(String(value));
  else np.addPropertyAssignment({ name: "calories", initializer: String(value) });
}
function setMacros(np: ObjectLiteralExpression, m: Record<string, number>): void {
  const inner = Object.entries(m).map(([k, v]) => `${k}: ${v}`).join(", ");
  getPA(np, "macros")!.setInitializer(`{ ${inner} }`);
}

const counts: Record<Mode, number> = { grain: 0, driedHerb: 0, freshHerb: 0, squash: 0, coverage: 0 };

for (const target of TARGETS) {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
  });
  const sf = project.addSourceFileAtPath(target.file);
  const obj = sf
    .getVariableDeclaration(target.varName)
    ?.getInitializer()
    ?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (!obj) throw new Error(`Could not find ${target.varName} object in ${target.file}`);

  for (const prop of obj.getProperties()) {
    const pa = prop.asKind(SyntaxKind.PropertyAssignment);
    if (!pa) continue;
    const slug = pa.getName().replace(/^["'`]|["'`]$/g, "");
    const entry = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!entry) continue;
    const np = getPA(entry, "nutritionalProfile")?.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!np || !hasTemplateMacros(np)) continue;

    switch (target.mode) {
      case "grain": {
        const cal = numOf(getPA(np, "calories_per_100g"));
        const protein = numOf(getPA(np, "protein_g"));
        const fiber = numOf(getPA(np, "fiber_g"));
        const cf = GRAIN_CARBS_FAT[slug];
        if (cal == null || protein == null || fiber == null || !cf) {
          throw new Error(`Grain ${slug} missing real _per_100g data or carbs/fat map entry`);
        }
        setServingSize(np, "100 g dry");
        setCalories(np, cal);
        setMacros(np, { protein, carbs: cf.carbs, fat: cf.fat, fiber });
        break;
      }
      case "driedHerb":
        setServingSize(np, DRIED_HERB.serving_size);
        setCalories(np, DRIED_HERB.calories);
        setMacros(np, DRIED_HERB.macros);
        break;
      case "freshHerb":
        setServingSize(np, FRESH_HERB.serving_size);
        setCalories(np, FRESH_HERB.calories);
        setMacros(np, FRESH_HERB.macros);
        break;
      case "squash": {
        const m = SQUASH_MACROS[slug];
        if (!m) throw new Error(`Squash ${slug} missing macros map entry`);
        setServingSize(np, "100 g raw");
        setMacros(np, m); // calories already real — leave it
        break;
      }
      case "coverage":
        getPA(np, "calories")?.remove();
        getPA(np, "macros")?.remove();
        break;
    }
    counts[target.mode]++;
  }

  sf.saveSync();
}

console.log(
  `Fixed template-macro nutrition — grains: ${counts.grain}, dried herbs: ${counts.driedHerb}, ` +
    `fresh herbs: ${counts.freshHerb}, squash: ${counts.squash}, coverage(honest-null): ${counts.coverage}`,
);
