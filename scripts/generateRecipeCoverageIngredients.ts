/**
 * Generate ingredient cards for currently unmatched recipe ingredient names.
 *
 * Input:
 * - src/data/generated/ingredientRecipeUnmatched.summary.json
 * - src/data/ingredients/ingredientSummaries.ts (optional enrichment)
 *
 * Output:
 * - src/data/ingredients/misc/recipeCoverageIngredients.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { Project, SyntaxKind } from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const UNMATCHED_PATH = path.join(
  REPO_ROOT,
  "src",
  "data",
  "generated",
  "ingredientRecipeUnmatched.summary.json",
);
const SUMMARIES_PATH = path.join(
  REPO_ROOT,
  "src",
  "data",
  "ingredients",
  "ingredientSummaries.ts",
);
const OUT_PATH = path.join(
  REPO_ROOT,
  "src",
  "data",
  "ingredients",
  "misc",
  "recipeCoverageIngredients.ts",
);
const AUDIT_REPORT_PATH = path.join(
  REPO_ROOT,
  "audit-reports",
  "ingredient-data-quality-audit.json",
);

interface UnmatchedRow {
  name: string;
  occurrences: number;
  sampleRecipes: string[];
}

import { toSlug, canonicalizeCoverageName, inferCategory } from "../src/utils/ingredientNormalization.js";
import { coverageCurationOverrides } from "../src/data/ingredients/misc/coverageCurationOverrides.js";

function titleCase(input: string): string {
  return input
    .split(" ")
    .filter(Boolean)
    .map((w) => `${w[0]?.toUpperCase() ?? ""}${w.slice(1)}`)
    .join(" ");
}

function elementalForCategory(category: string): { Fire: number; Water: number; Earth: number; Air: number } {
  switch (category) {
    case "spice":
      return { Fire: 0.45, Water: 0.1, Earth: 0.2, Air: 0.25 };
    case "protein":
      return { Fire: 0.35, Water: 0.2, Earth: 0.35, Air: 0.1 };
    case "grain":
      return { Fire: 0.1, Water: 0.15, Earth: 0.6, Air: 0.15 };
    case "dairy":
      return { Fire: 0.1, Water: 0.45, Earth: 0.35, Air: 0.1 };
    case "oil":
      return { Fire: 0.3, Water: 0.15, Earth: 0.35, Air: 0.2 };
    case "vinegar":
      return { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 };
    case "culinary_herb":
      return { Fire: 0.15, Water: 0.25, Earth: 0.25, Air: 0.35 };
    case "vegetable":
      return { Fire: 0.1, Water: 0.35, Earth: 0.4, Air: 0.15 };
    case "fruit":
      return { Fire: 0.15, Water: 0.45, Earth: 0.25, Air: 0.15 };
    default:
      return { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 };
  }
}

function generatedDescription(name: string): string {
  const t = titleCase(name);
  return `${t} is a recipe-linked ingredient captured from live cuisine data to ensure full ingredient-to-recipe coverage in the database. Use it as written in recipe context, then refine handling based on preparation method, concentration, and dish role. This entry includes standardized baseline metadata for compatibility with recommendation, search, and mapping APIs.`;
}

function loadSummaries(): Record<string, string> {
  if (!fs.existsSync(SUMMARIES_PATH)) return {};
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
  });
  const sf = project.addSourceFileAtPath(SUMMARIES_PATH);
  const decl = sf.getVariableDeclaration("ingredientSummaries");
  const obj = decl?.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (!obj) return {};

  const out: Record<string, string> = {};
  for (const p of obj.getProperties()) {
    const pa = p.asKind(SyntaxKind.PropertyAssignment);
    if (!pa) continue;
    const key = pa.getName().replace(/^["'`]|["'`]$/g, "");
    const init = pa.getInitializer()?.getText() ?? "";
    out[key] = init.replace(/^["'`]|["'`]$/g, "");
  }
  return out;
}

function loadExistingCoverageRows(): UnmatchedRow[] {
  if (!fs.existsSync(OUT_PATH)) return [];
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
  });
  const sf = project.addSourceFileAtPath(OUT_PATH);
  const decl = sf.getVariableDeclaration("recipeCoverageIngredients");
  const obj = decl?.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (!obj) return [];
  const rows: UnmatchedRow[] = [];
  for (const p of obj.getProperties()) {
    const pa = p.asKind(SyntaxKind.PropertyAssignment);
    if (!pa) continue;
    const card = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!card) continue;
    const nameProp = card.getProperty("name")?.asKind(SyntaxKind.PropertyAssignment);
    const rawName = nameProp?.getInitializer()?.getText() ?? "";
    const name = rawName.replace(/^["'`]|["'`]$/g, "").trim();
    if (!name) continue;
    rows.push({ name, occurrences: 0, sampleRecipes: [] });
  }
  return rows;
}

function main(): void {
  if (!fs.existsSync(UNMATCHED_PATH)) {
    throw new Error(`Missing unmatched summary: ${UNMATCHED_PATH}. Run yarn build:ingredient-recipe-index first.`);
  }

  const unmatched = JSON.parse(fs.readFileSync(UNMATCHED_PATH, "utf8")) as UnmatchedRow[];
  const auditRows: UnmatchedRow[] = fs.existsSync(AUDIT_REPORT_PATH)
    ? (JSON.parse(fs.readFileSync(AUDIT_REPORT_PATH, "utf8")) as { unmatched?: UnmatchedRow[] }).unmatched ?? []
    : [];
  const existingRows = loadExistingCoverageRows();
  const combined = [...unmatched, ...auditRows, ...existingRows];
  const summaries = loadSummaries();
  const seenSlugs = new Set<string>();

  const lines: string[] = [];
  lines.push('import type { IngredientMapping } from "@/data/ingredients/types";');
  lines.push("");
  lines.push("// Auto-generated by scripts/generateRecipeCoverageIngredients.ts");
  lines.push("// Source: ingredientRecipeUnmatched.summary.json");
  lines.push("export const recipeCoverageIngredients: Record<string, Partial<IngredientMapping>> = {");

  for (const row of combined) {
    const canonicalName = canonicalizeCoverageName(row.name);
    const slug = toSlug(canonicalName);
    if (!slug) continue;
    if (seenSlugs.has(slug)) continue;
    seenSlugs.add(slug);

    const category = coverageCurationOverrides[slug]?.category || inferCategory(canonicalName);
    const elemental = elementalForCategory(category);
    const description = coverageCurationOverrides[slug]?.description || summaries[slug] || generatedDescription(canonicalName);
    const aliasList = new Set<string>(coverageCurationOverrides[slug]?.aliases ?? []);
    const originalName = row.name.replace(/\s+/g, " ").trim().toLowerCase();
    if (originalName && originalName !== canonicalName) {
      aliasList.add(originalName);
    }

    lines.push(`  ${JSON.stringify(slug)}: {`);
    lines.push(`    name: ${JSON.stringify(canonicalName)},`);
    lines.push(`    provenance: "generated",`);
    lines.push(`    description: ${JSON.stringify(description)},`);
    lines.push(`    category: ${JSON.stringify(category)},`);
    lines.push(
      `    elementalProperties: { Fire: ${elemental.Fire}, Water: ${elemental.Water}, Earth: ${elemental.Earth}, Air: ${elemental.Air} },`,
    );
    lines.push(`    qualities: ["recipe-linked", "standardized"],`);
    if (aliasList.size > 0) {
      lines.push(`    aliases: ${JSON.stringify([...aliasList])},`);
    }
    lines.push("    astrologicalProfile: {");
    lines.push('      rulingPlanets: ["Mercury"],');
    lines.push('      favorableZodiac: ["Virgo", "Gemini"],');
    lines.push('      seasonalAffinity: ["all"],');
    lines.push("    },");
    lines.push("    nutritionalProfile: {");
    lines.push('      serving_size: "1 serving",');
    lines.push("      source: \"Recipe-derived coverage entry\",");
    lines.push("    },");
    lines.push("    sensoryProfile: {");
    lines.push("      taste: { sweet: 0.2, salty: 0.2, sour: 0.2, bitter: 0.1, umami: 0.2, spicy: 0.1 },");
    lines.push("      aroma: { neutral: 0.5 },");
    lines.push("      texture: { varied: 0.5 },");
    lines.push("    },");
    lines.push("    culinaryProfile: {");
    lines.push("      flavorProfile: {");
    lines.push('        primary: ["contextual"],');
    lines.push('        secondary: ["supporting"],');
    lines.push("        notes: \"Recipe-derived placeholder profile; refine with domain curation.\",");
    lines.push("      },");
    lines.push('      cookingMethods: ["mix", "simmer", "finish"],');
    lines.push('      cuisineAffinity: ["global"],');
    lines.push('      preparationTips: ["Calibrate quantity to recipe context.", "Prefer explicit measurements in production recipes."],');
    lines.push("    },");
    lines.push("    pairingRecommendations: {");
    lines.push('      complementary: ["salt", "acid", "fat"],');
    lines.push('      contrasting: ["sweetness", "heat"],');
    lines.push("      toAvoid: [],");
    lines.push("    },");
    lines.push("    storage: {");
    lines.push('      pantry: "Store based on ingredient subtype and package guidance.",');
    lines.push('      notes: "Coverage entry generated from recipe corpus; update with specific handling guidance."',);
    lines.push("    },");
    lines.push("  },");
  }

  lines.push("};");
  lines.push("");

  fs.writeFileSync(OUT_PATH, `${lines.join("\n")}\n`);
  // eslint-disable-next-line no-console
  console.log(`Generated ${OUT_PATH} with ${seenSlugs.size} coverage entries.`);
}

main();
