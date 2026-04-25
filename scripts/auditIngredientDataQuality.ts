/**
 * Comprehensive ingredient-data audit:
 * - Ingredient card field presence + basic type checks
 * - Generic/placeholder description detection
 * - Recipe ingredient field completeness (name/amount/unit)
 * - Recipe ingredient -> canonical ingredient mapping coverage
 *
 * Outputs:
 * - audit-reports/ingredient-data-quality-audit.json
 * - audit-reports/ingredient-data-quality-audit.md
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  Project,
  PropertyAssignment,
  SyntaxKind,
} from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const INGREDIENTS_DIR = path.join(REPO_ROOT, "src", "data", "ingredients");
const CUISINES_DIR = path.join(REPO_ROOT, "src", "data", "cuisines");
const OUT_DIR = path.join(REPO_ROOT, "audit-reports");

const PLACEHOLDER_DESCRIPTION_SIGNATURES = [
  "A pantry staple,",
  "A fresh plant food,",
  "A protein-rich ingredient,",
  "A dried aromatic spice,",
  "A foundational seasoning,",
  "An acidic condiment,",
  "A culinary fat,",
  "A dairy product,",
  "An aromatic culinary herb,",
  "A cereal or pseudo-cereal product,",
  "A liquid consumable,",
];

const STOPWORDS = new Set([
  "fresh",
  "dried",
  "dry",
  "ground",
  "minced",
  "chopped",
  "sliced",
  "diced",
  "whole",
  "boneless",
  "skinless",
  "large",
  "small",
  "medium",
  "extra",
  "virgin",
  "to",
  "taste",
  "for",
  "garnish",
  "optional",
  "organic",
  "ripe",
  "raw",
  "cooked",
  "warm",
  "cold",
  "split",
  "lightly",
  "toasted",
  "unsalted",
  "salted",
  "full",
  "fat",
]);

interface IngredientIssue {
  slug: string;
  name: string;
  file: string;
  issues: string[];
  hasPlaceholderDescription: boolean;
}

interface CanonicalIngredient {
  slug: string;
  name: string;
  searchTerms: Set<string>;
}

interface RecipeIngredientRef {
  cuisine: string;
  recipeName: string;
  name: string;
  amountMissing: boolean;
  unitMissing: boolean;
}

import { normalize, singularize, MATCH_STOPWORDS, normalizedVariants, stripQuotes } from "../src/utils/ingredientNormalization.js";

function propByName(obj: ObjectLiteralExpression, name: string): PropertyAssignment | undefined {
  for (const p of obj.getProperties()) {
    const pa = p.asKind(SyntaxKind.PropertyAssignment);
    if (!pa) continue;
    if (stripQuotes(pa.getNameNode().getText()) === name) return pa;
  }
  return undefined;
}

function listIngredientSourceFiles(): string[] {
  const files: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (
        entry.isFile() &&
        entry.name.endsWith(".ts") &&
        ![
          "index.ts",
          "types.ts",
          "ingredients.ts",
          "ingredientSummaries.ts",
          "flavorProfiles.ts",
          "elementalProperties.ts",
        ].includes(entry.name)
      ) {
        files.push(p);
      }
    }
  };
  walk(INGREDIENTS_DIR);
  return files;
}

function collectCanonicalAndIngredientIssues(
  project: Project,
): { canonical: CanonicalIngredient[]; ingredientIssues: IngredientIssue[] } {
  const canonical: CanonicalIngredient[] = [];
  const ingredientIssues: IngredientIssue[] = [];
  const seen = new Set<string>();

  for (const file of listIngredientSourceFiles()) {
    const sf = project.addSourceFileAtPath(file);
    for (const decl of sf.getVariableDeclarations()) {
      const rootObj = decl.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!rootObj) continue;

      for (const prop of rootObj.getProperties()) {
        const pa = prop.asKind(SyntaxKind.PropertyAssignment);
        if (!pa) continue;

        const ingObj = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
        if (!ingObj || !propByName(ingObj, "name")) continue;

        const slug = stripQuotes(pa.getName());
        const name = stripQuotes(propByName(ingObj, "name")?.getInitializer()?.getText() ?? slug);
        const issues: string[] = [];

        const requiredProps = [
          "description",
          "elementalProperties",
          "qualities",
          "astrologicalProfile",
          "nutritionalProfile",
          "sensoryProfile",
          "culinaryProfile",
          "pairingRecommendations",
          "storage",
        ];
        for (const req of requiredProps) {
          if (!propByName(ingObj, req)) issues.push(`missing.${req}`);
        }

        const qualitiesInit = propByName(ingObj, "qualities")
          ?.getInitializer()
          ?.asKind(SyntaxKind.ArrayLiteralExpression);
        if (!qualitiesInit || qualitiesInit.getElements().length === 0) {
          issues.push("invalid.qualities");
        }

        const elementalObj = propByName(ingObj, "elementalProperties")
          ?.getInitializer()
          ?.asKind(SyntaxKind.ObjectLiteralExpression);
        if (!elementalObj) {
          issues.push("invalid.elementalProperties");
        } else {
          for (const el of ["Fire", "Water", "Earth", "Air"]) {
            if (!propByName(elementalObj, el)) issues.push(`missing.elementalProperties.${el}`);
          }
        }

        const desc = stripQuotes(propByName(ingObj, "description")?.getInitializer()?.getText() ?? "");
        const hasPlaceholderDescription = PLACEHOLDER_DESCRIPTION_SIGNATURES.some((sig) =>
          desc.includes(sig),
        );
        if (hasPlaceholderDescription) issues.push("quality.placeholderDescription");

        const bannedPhrasing = ["placeholder", "needs description", "todo", "tbd"];
        if (bannedPhrasing.some((p) => desc.toLowerCase().includes(p))) issues.push("quality.bannedPhrasing");
        if (desc.trim().length > 0 && desc.trim().length < 30) issues.push("quality.tooShort");

        if (issues.length > 0) {
          ingredientIssues.push({
            slug,
            name,
            file: path.relative(REPO_ROOT, file),
            issues,
            hasPlaceholderDescription,
          });
        }

        if (!seen.has(slug)) {
          seen.add(slug);
          const terms = new Set<string>();
          terms.add(normalize(slug));
          for (const v of normalizedVariants(slug.replace(/_/g, " "))) terms.add(v);
          for (const v of normalizedVariants(name)) terms.add(v);

          // Keep matching behavior aligned with buildIngredientRecipeIndex.ts:
          // include variety names as aliases when present.
          const varietiesObj = propByName(ingObj, "varieties")
            ?.getInitializer()
            ?.asKind(SyntaxKind.ObjectLiteralExpression);
          if (varietiesObj) {
            for (const vp of varietiesObj.getProperties()) {
              const vpa = vp.asKind(SyntaxKind.PropertyAssignment);
              if (!vpa) continue;
              const vobj = vpa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
              if (!vobj) continue;
              const vname = stripQuotes(propByName(vobj, "name")?.getInitializer()?.getText() ?? "");
              if (!vname) continue;
              for (const v of normalizedVariants(vname)) terms.add(v);
            }
          }

          const aliasesArr = propByName(ingObj, "aliases")
            ?.getInitializer()
            ?.asKind(SyntaxKind.ArrayLiteralExpression);
          if (aliasesArr) {
            for (const el of aliasesArr.getElements()) {
              const alias = stripQuotes(el.getText());
              if (!alias) continue;
              for (const v of normalizedVariants(alias)) terms.add(v);
            }
          }

          canonical.push({ slug, name, searchTerms: terms });
        }
      }
    }
  }

  return { canonical, ingredientIssues };
}

function collectRecipeIngredientRefs(project: Project): RecipeIngredientRef[] {
  const out: RecipeIngredientRef[] = [];
  for (const entry of fs.readdirSync(CUISINES_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;
    if (["index.ts", "culinaryTraditions.ts", "template.ts"].includes(entry.name)) continue;

    const sf = project.addSourceFileAtPath(path.join(CUISINES_DIR, entry.name));
    const cuisine = entry.name.replace(/\.ts$/, "").replace(/-/g, " ");

    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.ObjectLiteralExpression) return;
      const obj = node.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!obj) return;

      const nameProp = propByName(obj, "name");
      const ingredientsProp = propByName(obj, "ingredients");
      if (!nameProp || !ingredientsProp) return;

      const recipeName = stripQuotes(nameProp.getInitializer()?.getText() ?? "");
      if (!recipeName) return;

      const ingArray = ingredientsProp.getInitializer()?.asKind(SyntaxKind.ArrayLiteralExpression);
      if (!ingArray) return;

      for (const el of ingArray.getElements()) {
        const ingObj = el.asKind(SyntaxKind.ObjectLiteralExpression);
        if (!ingObj) continue;

        const n = stripQuotes(propByName(ingObj, "name")?.getInitializer()?.getText() ?? "");
        const amountProp = propByName(ingObj, "amount");
        const unitProp = propByName(ingObj, "unit");

        out.push({
          cuisine,
          recipeName,
          name: n,
          amountMissing: !amountProp,
          unitMissing: !unitProp,
        });
      }
    });
  }
  return out;
}

function findBestSlug(name: string, canonical: CanonicalIngredient[]): string | null {
  const variants = normalizedVariants(name);
  if (variants.size === 0) return null;

  for (const c of canonical) {
    for (const v of variants) {
      if (c.searchTerms.has(v)) return c.slug;
    }
  }

  // whole-word containment fallback
  for (const c of canonical) {
    for (const t of c.searchTerms) {
      if (t.length < 3) continue;
      const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(^|\\s)${escaped}(\\s|$)`);
      for (const v of variants) {
        if (re.test(v)) return c.slug;
      }
    }
  }

  return null;
}

function toMarkdown(report: {
  canonicalCount: number;
  ingredientIssues: IngredientIssue[];
  recipeIngredientRefs: RecipeIngredientRef[];
  unmatched: Array<{ name: string; occurrences: number; sampleRecipes: string[] }>;
}): string {
  const lines: string[] = [];
  const placeholderIssues = report.ingredientIssues.filter((x) => x.hasPlaceholderDescription);
  const recipeMissingAmount = report.recipeIngredientRefs.filter((x) => x.amountMissing);
  const recipeMissingUnit = report.recipeIngredientRefs.filter((x) => x.unitMissing);

  lines.push("# Ingredient Data Quality Audit");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Canonical ingredients: ${report.canonicalCount}`);
  lines.push(`Ingredient cards with issues: ${report.ingredientIssues.length}`);
  lines.push(`Placeholder descriptions: ${placeholderIssues.length}`);
  lines.push(`Recipe ingredient rows: ${report.recipeIngredientRefs.length}`);
  lines.push(`Recipe ingredient rows missing amount: ${recipeMissingAmount.length}`);
  lines.push(`Recipe ingredient rows missing unit: ${recipeMissingUnit.length}`);
  lines.push(`Unmatched recipe ingredient names: ${report.unmatched.length}`);
  lines.push("");

  lines.push("## Placeholder Descriptions (Top 100)");
  lines.push("");
  lines.push("| Slug | Name | File |");
  lines.push("| --- | --- | --- |");
  for (const row of placeholderIssues.slice(0, 100)) {
    lines.push(`| \`${row.slug}\` | ${row.name} | \`${row.file}\` |`);
  }
  lines.push("");

  lines.push("## Unmatched Recipe Ingredient Names (Top 100)");
  lines.push("");
  lines.push("| Ingredient Name | Uses | Sample Recipes |");
  lines.push("| --- | --- | --- |");
  for (const row of report.unmatched.slice(0, 100)) {
    lines.push(`| ${row.name} | ${row.occurrences} | ${row.sampleRecipes.join("; ")} |`);
  }
  lines.push("");

  return lines.join("\n");
}

function main() {
  const project = new Project({
    tsConfigFilePath: path.join(REPO_ROOT, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { noEmit: true, skipLibCheck: true },
  });

  const { canonical, ingredientIssues } = collectCanonicalAndIngredientIssues(project);
  const recipeIngredientRefs = collectRecipeIngredientRefs(project);

  const unmatchedMap = new Map<string, { count: number; sampleRecipes: Set<string> }>();
  for (const ref of recipeIngredientRefs) {
    if (!ref.name) continue;
    const match = findBestSlug(ref.name, canonical);
    if (match) continue;
    const k = normalize(ref.name);
    const current = unmatchedMap.get(k) ?? { count: 0, sampleRecipes: new Set<string>() };
    current.count += 1;
    current.sampleRecipes.add(`${ref.cuisine} / ${ref.recipeName}`);
    unmatchedMap.set(k, current);
  }

  const unmatched = [...unmatchedMap.entries()]
    .map(([name, v]) => ({
      name,
      occurrences: v.count,
      sampleRecipes: [...v.sampleRecipes].slice(0, 3),
    }))
    .sort((a, b) => b.occurrences - a.occurrences);

  const report = {
    generatedAt: new Date().toISOString(),
    canonicalCount: canonical.length,
    ingredientIssues,
    recipeIngredientRefs,
    unmatched,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const jsonPath = path.join(OUT_DIR, "ingredient-data-quality-audit.json");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  const mdPath = path.join(OUT_DIR, "ingredient-data-quality-audit.md");
  fs.writeFileSync(mdPath, toMarkdown(report));

  // eslint-disable-next-line no-console
  console.log(
    `Ingredient quality audit complete: ${ingredientIssues.length} ingredient issues, ${unmatched.length} unmatched recipe ingredient names.`,
  );
  // eslint-disable-next-line no-console
  console.log(`Reports: ${path.relative(process.cwd(), jsonPath)}, ${path.relative(process.cwd(), mdPath)}`);

  if (ingredientIssues.length > 0 || unmatched.length > 0) {
    console.error("Audit failed! Missing fields, placeholder descriptions, or unmatched recipe ingredients detected.");
    process.exit(1);
  }
}

main();
