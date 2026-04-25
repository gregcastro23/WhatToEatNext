/**
 * Ingredient → Recipe Index Generator (AST-based)
 *
 * Walks every cuisine file under `src/data/cuisines/**` to collect recipes,
 * then walks every ingredient card under `src/data/ingredients/**` to collect
 * canonical slugs + display names, and builds a reverse map:
 *
 *   { [ingredientSlug]: Array<{ recipeId, recipeName, cuisine, rawIngredientName }> }
 *
 * Uses ts-morph so it doesn't depend on the app's module-resolution setup.
 *
 * Matching (case-insensitive, normalized):
 *   1. Exact match of normalized recipe ingredient name to slug or canonical name
 *   2. Whole-word containment (canonical name/alias appears as a word)
 *
 * Outputs:
 *   - src/data/generated/ingredientRecipeIndex.json        (full map)
 *   - src/data/generated/ingredientRecipeIndex.summary.json (slug → count)
 *
 * Run with:
 *   node --loader ts-node/esm --no-warnings scripts/buildIngredientRecipeIndex.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { Project, SyntaxKind, ObjectLiteralExpression, PropertyAssignment, ArrayLiteralExpression } from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const INGREDIENTS_DIR = path.join(REPO_ROOT, "src", "data", "ingredients");
const CUISINES_DIR = path.join(REPO_ROOT, "src", "data", "cuisines");
const OUT_DIR = path.join(REPO_ROOT, "src", "data", "generated");

interface CanonicalIngredient {
  slug: string;
  name: string;
  category: string;
  searchTerms: Set<string>;
}

interface RecipeMatch {
  recipeId: string;
  recipeName: string;
  cuisine: string;
  rawIngredientName: string;
  amount?: number | string;
  unit?: string;
}

interface UnmatchedIngredientUsage {
  name: string;
  occurrences: number;
  sampleRecipes: string[];
}

import { normalize, singularize, MATCH_STOPWORDS, normalizedVariants, stripQuotes } from "../src/utils/ingredientNormalization.js";

// --- Pass 1: collect canonical ingredients ---
function collectCanonical(project: Project): CanonicalIngredient[] {
  const out: CanonicalIngredient[] = [];
  const seen = new Set<string>();

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith(".ts") && !["index.ts", "types.ts", "ingredients.ts", "ingredientSummaries.ts", "flavorProfiles.ts", "elementalProperties.ts"].includes(entry.name)) {
        parseIngredientFile(project, p, out, seen);
      }
    }
  };
  walk(INGREDIENTS_DIR);
  return out;
}

function parseIngredientFile(project: Project, file: string, out: CanonicalIngredient[], seen: Set<string>): void {
  const sf = project.addSourceFileAtPath(file);
  const rel = path.relative(INGREDIENTS_DIR, file).split(path.sep);
  const category = rel[0].replace(/\.ts$/, "");

  for (const decl of sf.getVariableDeclarations()) {
    const init = decl.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!init) continue;

    for (const prop of init.getProperties()) {
      const pa = prop.asKind(SyntaxKind.PropertyAssignment);
      if (!pa) continue;
      const card = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!card || !card.getProperty("name")) continue;

      const slug = stripQuotes(pa.getName());
      if (seen.has(slug)) continue;
      seen.add(slug);

      const nameProp = card.getProperty("name")?.asKind(SyntaxKind.PropertyAssignment);
      const name = stripQuotes(nameProp?.getInitializer()?.getText() ?? slug);

      const terms = new Set<string>();
      terms.add(normalize(slug.replace(/_/g, " ")));
      for (const v of normalizedVariants(name)) terms.add(v);
      for (const v of normalizedVariants(slug.replace(/_/g, " "))) terms.add(v);

      // Add varieties as aliases
      const varsProp = card.getProperty("varieties")?.asKind(SyntaxKind.PropertyAssignment);
      const varsObj = varsProp?.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (varsObj) {
        for (const v of varsObj.getProperties()) {
          const va = v.asKind(SyntaxKind.PropertyAssignment);
          if (!va) continue;
          const vo = va.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
          if (!vo) continue;
          const vnProp = vo.getProperty("name")?.asKind(SyntaxKind.PropertyAssignment);
          if (vnProp) {
            for (const v of normalizedVariants(stripQuotes(vnProp.getInitializer()?.getText() ?? ""))) {
              terms.add(v);
            }
          }
        }
      }

      // Add explicit aliases if authored on ingredient card.
      const aliasesProp = card.getProperty("aliases")?.asKind(SyntaxKind.PropertyAssignment);
      const aliasesArr = aliasesProp?.getInitializer()?.asKind(SyntaxKind.ArrayLiteralExpression);
      if (aliasesArr) {
        for (const el of aliasesArr.getElements()) {
          const txt = stripQuotes(el.getText());
          for (const v of normalizedVariants(txt)) terms.add(v);
        }
      }

      out.push({ slug, name, category, searchTerms: terms });
    }
  }
}

// --- Pass 2: collect recipes ---
interface RawRecipe {
  id: string;
  name: string;
  cuisine: string;
  ingredients: Array<{ name: string; amount?: number | string; unit?: string }>;
}

function collectRecipes(project: Project): RawRecipe[] {
  const out: RawRecipe[] = [];
  for (const entry of fs.readdirSync(CUISINES_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".ts")) continue;
    if (["index.ts", "culinaryTraditions.ts", "template.ts"].includes(entry.name)) continue;

    const file = path.join(CUISINES_DIR, entry.name);
    const cuisineName = entry.name.replace(/\.ts$/, "").replace(/-/g, " ");

    const sf = project.addSourceFileAtPath(file);
    // Helper: pull PropertyAssignment by name, handling both identifier and string-literal keys
    const propByName = (obj: ObjectLiteralExpression, name: string): PropertyAssignment | undefined => {
      for (const p of obj.getProperties()) {
        const pa = p.asKind(SyntaxKind.PropertyAssignment);
        if (!pa) continue;
        const nameNode = pa.getNameNode();
        const raw = nameNode.getText();
        const stripped = stripQuotes(raw);
        if (stripped === name) return pa;
      }
      return undefined;
    };

    // Walk every ObjectLiteralExpression that has both `name` and `ingredients`
    sf.forEachDescendant((node) => {
      if (node.getKind() !== SyntaxKind.ObjectLiteralExpression) return;
      const obj = node as ObjectLiteralExpression;

      const nameProp = propByName(obj, "name");
      const ingProp = propByName(obj, "ingredients");
      if (!nameProp || !ingProp) return;

      const recipeName = stripQuotes(nameProp.getInitializer()?.getText() ?? "");
      if (!recipeName) return;

      const ingArr = ingProp.getInitializer()?.asKind(SyntaxKind.ArrayLiteralExpression);
      if (!ingArr) return;

      const ingredients: RawRecipe["ingredients"] = [];
      for (const el of ingArr.getElements()) {
        const io = el.asKind(SyntaxKind.ObjectLiteralExpression);
        if (!io) continue;
        const inProp = propByName(io, "name");
        if (!inProp) continue;
        const iname = stripQuotes(inProp.getInitializer()?.getText() ?? "");
        if (!iname) continue;

        const amtProp = propByName(io, "amount");
        const unitProp = propByName(io, "unit");
        const rawAmount = amtProp ? stripQuotes(amtProp.getInitializer()?.getText() ?? "") : undefined;
        const parsedAmount = rawAmount && /^-?\d+(\.\d+)?$/.test(rawAmount) ? Number(rawAmount) : rawAmount;
        ingredients.push({
          name: iname,
          amount: parsedAmount,
          unit: unitProp ? stripQuotes(unitProp.getInitializer()?.getText() ?? "") : undefined,
        });
      }

      if (ingredients.length === 0) return;

      const id = `${cuisineName.toLowerCase().replace(/\s+/g, "-")}-${recipeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
      out.push({ id, name: recipeName, cuisine: cuisineName, ingredients });
    });
  }
  return out;
}

// --- Pass 3: build the index ---
function buildIndex(
  canonical: CanonicalIngredient[],
  recipes: RawRecipe[],
): { index: Record<string, RecipeMatch[]>; unmatched: UnmatchedIngredientUsage[] } {
  const index: Record<string, RecipeMatch[]> = {};
  for (const c of canonical) index[c.slug] = [];
  const unmatched = new Map<string, { count: number; recipes: Set<string> }>();

  // Pre-compile regex for each search term
  const termRegexByCanonical = new Map<string, RegExp[]>();
  for (const c of canonical) {
    const regexes: RegExp[] = [];
    for (const term of c.searchTerms) {
      if (!term || term.length < 3) continue;
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      regexes.push(new RegExp(`(^|\\s)${escaped}(\\s|$)`));
    }
    termRegexByCanonical.set(c.slug, regexes);
  }

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const variants = normalizedVariants(ing.name);
      if (variants.size === 0) continue;
      let matchedAtLeastOne = false;

      for (const c of canonical) {
        const regexes = termRegexByCanonical.get(c.slug) ?? [];
        let matched = false;
        for (const re of regexes) {
          for (const variant of variants) {
            if (re.test(variant)) {
              matched = true;
              break;
            }
          }
          if (matched) break;
        }
        if (matched) {
          matchedAtLeastOne = true;
          index[c.slug].push({
            recipeId: recipe.id,
            recipeName: recipe.name,
            cuisine: recipe.cuisine,
            rawIngredientName: ing.name,
            amount: ing.amount,
            unit: ing.unit,
          });
        }
      }

      if (!matchedAtLeastOne) {
        const normName = [...variants][0];
        const current = unmatched.get(normName) ?? { count: 0, recipes: new Set<string>() };
        current.count += 1;
        current.recipes.add(`${recipe.cuisine} / ${recipe.name}`);
        unmatched.set(normName, current);
      }
    }
  }

  const unmatchedRows: UnmatchedIngredientUsage[] = [...unmatched.entries()]
    .map(([name, v]) => ({
      name,
      occurrences: v.count,
      sampleRecipes: [...v.recipes].slice(0, 3),
    }))
    .sort((a, b) => b.occurrences - a.occurrences);

  return { index, unmatched: unmatchedRows };
}

const project = new Project({
  tsConfigFilePath: path.join(REPO_ROOT, "tsconfig.json"),
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { noEmit: true, skipLibCheck: true },
});

const canonical = collectCanonical(project);
// eslint-disable-next-line no-console
console.log(`Canonical ingredients: ${canonical.length}`);

const recipes = collectRecipes(project);
// eslint-disable-next-line no-console
console.log(`Recipes with ingredients: ${recipes.length}`);

const { index, unmatched } = buildIndex(canonical, recipes);

fs.mkdirSync(OUT_DIR, { recursive: true });
const fullPath = path.join(OUT_DIR, "ingredientRecipeIndex.json");
fs.writeFileSync(fullPath, JSON.stringify(index, null, 2));

const summary = Object.fromEntries(Object.entries(index).map(([k, v]) => [k, v.length]));
const summaryPath = path.join(OUT_DIR, "ingredientRecipeIndex.summary.json");
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

const unmatchedPath = path.join(OUT_DIR, "ingredientRecipeUnmatched.summary.json");
fs.writeFileSync(unmatchedPath, JSON.stringify(unmatched, null, 2));

const nonEmpty = Object.values(index).filter((v) => v.length > 0).length;
const totalRefs = Object.values(index).reduce((s, v) => s + v.length, 0);
// eslint-disable-next-line no-console
console.log(`Index: ${nonEmpty}/${canonical.length} ingredients matched by ≥1 recipe; ${totalRefs} total references.`);
// eslint-disable-next-line no-console
console.log(`Written: ${path.relative(process.cwd(), fullPath)}`);
// eslint-disable-next-line no-console
console.log(`Unmatched recipe ingredient names: ${unmatched.length} (summary: ${path.relative(process.cwd(), unmatchedPath)})`);
