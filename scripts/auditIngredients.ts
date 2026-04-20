/**
 * Ingredient Data Completeness Audit (AST-based)
 *
 * Uses ts-morph to walk every ingredient file under `src/data/ingredients/**`
 * and scores every `name:` / slug-keyed object against a completeness rubric.
 *
 * Does NOT execute app code — works purely on the source AST, so it runs
 * regardless of the app's module-resolution setup.
 *
 * Outputs:
 *   - audit-reports/ingredient-audit.json  (machine)
 *   - audit-reports/ingredient-audit.md    (human)
 *
 * Run with:
 *   node --loader ts-node/esm --no-warnings scripts/auditIngredients.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { Project, SyntaxKind, ObjectLiteralExpression, PropertyAssignment } from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const INGREDIENTS_DIR = path.join(REPO_ROOT, "src", "data", "ingredients");
const OUT_DIR = path.join(REPO_ROOT, "audit-reports");

interface RubricCheck {
  key: string;
  label: string;
  weight: number;
  test: (props: Map<string, PropertyAssignment>) => boolean;
}

const CHECKS: RubricCheck[] = [
  {
    key: "description",
    label: "Description",
    weight: 2,
    test: (props) => {
      const p = props.get("description");
      if (!p) return false;
      const init = p.getInitializer();
      const text = init?.getText() ?? "";
      // Strip quotes/backticks and measure length
      const cleaned = text.replace(/^["'`]|["'`]$/g, "").replace(/\\n/g, " ");
      return cleaned.length >= 40;
    },
  },
  {
    key: "elemental",
    label: "Elemental properties",
    weight: 2,
    test: (props) => {
      const p = props.get("elementalProperties");
      if (!p) return false;
      const obj = p.getInitializer() as ObjectLiteralExpression | undefined;
      if (!obj || obj.getKind() !== SyntaxKind.ObjectLiteralExpression) return false;
      const keys = obj.getProperties().map((x) => (x as PropertyAssignment).getName?.());
      return ["Fire", "Water", "Earth", "Air"].every((k) => keys.includes(k));
    },
  },
  {
    key: "qualities",
    label: "Qualities array (≥3)",
    weight: 1,
    test: (props) => {
      const p = props.get("qualities");
      const init = p?.getInitializer();
      if (!init) return false;
      const arr = init.asKind(SyntaxKind.ArrayLiteralExpression);
      return !!arr && arr.getElements().length >= 3;
    },
  },
  {
    key: "astrology",
    label: "Astrological profile",
    weight: 1,
    test: (props) => {
      const p = props.get("astrologicalProfile");
      const init = p?.getInitializer() as ObjectLiteralExpression | undefined;
      if (!init) return false;
      const rulers = init.getProperty("rulingPlanets");
      return !!rulers;
    },
  },
  {
    key: "sensory",
    label: "Sensory profile",
    weight: 1,
    test: (props) => !!props.get("sensoryProfile"),
  },
  {
    key: "nutrition_basic",
    label: "Nutrition (calories + macros)",
    weight: 2,
    test: (props) => {
      const np = props.get("nutritionalProfile")?.getInitializer() as ObjectLiteralExpression | undefined;
      if (!np) return false;
      return !!np.getProperty("calories") && !!np.getProperty("macros");
    },
  },
  {
    key: "nutrition_micros",
    label: "Nutrition (vitamins + minerals)",
    weight: 1,
    test: (props) => {
      const np = props.get("nutritionalProfile")?.getInitializer() as ObjectLiteralExpression | undefined;
      if (!np) return false;
      return !!np.getProperty("vitamins") && !!np.getProperty("minerals");
    },
  },
  {
    key: "culinary",
    label: "Culinary profile (methods + cuisines)",
    weight: 2,
    test: (props) => {
      const cp = props.get("culinaryProfile")?.getInitializer() as ObjectLiteralExpression | undefined;
      if (cp && cp.getProperty("cookingMethods")) return true;
      // Fallback — some older files use top-level cookingMethods + cuisineAffinity
      return !!props.get("cookingMethods");
    },
  },
  {
    key: "pairings",
    label: "Pairings",
    weight: 1,
    test: (props) => {
      if (props.get("pairings")) return true;
      const pr = props.get("pairingRecommendations")?.getInitializer() as ObjectLiteralExpression | undefined;
      return !!pr && !!pr.getProperty("complementary");
    },
  },
  {
    key: "storage",
    label: "Storage guidance",
    weight: 1,
    test: (props) => !!props.get("storage"),
  },
];

const MAX_SCORE = CHECKS.reduce((s, c) => s + c.weight, 0);

interface IngredientReport {
  slug: string;
  name: string;
  category: string;
  file: string;
  score: number;
  scorePct: number;
  missing: string[];
}

function categoryFromFile(file: string): string {
  const rel = path.relative(INGREDIENTS_DIR, file).split(path.sep);
  // Top-level folder is the category (e.g. "proteins", "vegetables")
  return rel[0].replace(/\.ts$/, "");
}

function propMap(obj: ObjectLiteralExpression): Map<string, PropertyAssignment> {
  const m = new Map<string, PropertyAssignment>();
  for (const p of obj.getProperties()) {
    const pa = p.asKind(SyntaxKind.PropertyAssignment);
    if (pa) m.set(pa.getName(), pa);
  }
  return m;
}

function findRawIngredientObjects(obj: ObjectLiteralExpression): Array<{ slug: string; obj: ObjectLiteralExpression }> {
  // Each raw* record declares its ingredients as top-level PropertyAssignments
  // whose initializer is another object literal (the ingredient card).
  const out: Array<{ slug: string; obj: ObjectLiteralExpression }> = [];
  for (const prop of obj.getProperties()) {
    const pa = prop.asKind(SyntaxKind.PropertyAssignment);
    if (!pa) continue;
    const init = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!init) continue;
    // Filter to entries that look like ingredient cards (have a `name` property)
    if (init.getProperty("name")) {
      out.push({ slug: pa.getName().replace(/^['"`]|['"`]$/g, ""), obj: init });
    }
  }
  return out;
}

function audit(): IngredientReport[] {
  const project = new Project({
    tsConfigFilePath: path.join(REPO_ROOT, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { noEmit: true, skipLibCheck: true },
  });

  // Walk all .ts files under ingredients/ (excluding index.ts, types.ts, summaries, etc.)
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith(".ts") && !["index.ts", "types.ts", "ingredients.ts", "ingredientSummaries.ts", "flavorProfiles.ts", "elementalProperties.ts"].includes(entry.name)) {
        files.push(p);
      }
    }
  };
  walk(INGREDIENTS_DIR);

  const rows: IngredientReport[] = [];

  for (const file of files) {
    const sf = project.addSourceFileAtPath(file);
    const category = categoryFromFile(file);

    // Find every top-level object literal declared as a VariableStatement initializer
    for (const decl of sf.getVariableDeclarations()) {
      const init = decl.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!init) continue;

      for (const { slug, obj } of findRawIngredientObjects(init)) {
        const props = propMap(obj);
        const nameProp = props.get("name");
        const name = nameProp?.getInitializer()?.getText().replace(/^["'`]|["'`]$/g, "") ?? slug;

        let score = 0;
        const missing: string[] = [];
        for (const check of CHECKS) {
          try {
            if (check.test(props)) score += check.weight;
            else missing.push(check.label);
          } catch {
            missing.push(check.label);
          }
        }

        rows.push({
          slug,
          name,
          category,
          file: path.relative(REPO_ROOT, file),
          score,
          scorePct: Math.round((score / MAX_SCORE) * 100),
          missing,
        });
      }
    }
  }

  return rows.sort((a, b) => a.scorePct - b.scorePct);
}

function writeReports(rows: IngredientReport[]) {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const jsonPath = path.join(OUT_DIR, "ingredient-audit.json");
  fs.writeFileSync(jsonPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    maxScore: MAX_SCORE,
    rubric: CHECKS.map(({ key, label, weight }) => ({ key, label, weight })),
    rows,
  }, null, 2));

  const byCategory = new Map<string, IngredientReport[]>();
  for (const r of rows) {
    const list = byCategory.get(r.category) ?? [];
    list.push(r);
    byCategory.set(r.category, list);
  }

  const lines: string[] = [];
  lines.push("# Ingredient Data Audit");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`**Total ingredients:** ${rows.length}`);
  lines.push(`**Max score per ingredient:** ${MAX_SCORE}`);
  lines.push("");
  lines.push("## Category Summary");
  lines.push("");
  lines.push("| Category | Count | Avg % | < 50% | ≥ 80% |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const [cat, list] of [...byCategory.entries()].sort()) {
    const avg = Math.round(list.reduce((s, r) => s + r.scorePct, 0) / list.length);
    const weak = list.filter((r) => r.scorePct < 50).length;
    const strong = list.filter((r) => r.scorePct >= 80).length;
    lines.push(`| ${cat} | ${list.length} | ${avg} | ${weak} | ${strong} |`);
  }
  lines.push("");

  lines.push("## Worst-scoring (bottom 50)");
  lines.push("");
  lines.push("| Slug | Name | Category | % | Missing |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const r of rows.slice(0, 50)) {
    lines.push(`| \`${r.slug}\` | ${r.name} | ${r.category} | ${r.scorePct}% | ${r.missing.join(", ")} |`);
  }
  lines.push("");

  lines.push("## All ingredients by category");
  lines.push("");
  for (const [cat, list] of [...byCategory.entries()].sort()) {
    lines.push(`### ${cat} (${list.length})`);
    lines.push("");
    lines.push("| Slug | Name | % | Missing |");
    lines.push("| --- | --- | --- | --- |");
    for (const r of list.sort((a, b) => a.scorePct - b.scorePct)) {
      lines.push(`| \`${r.slug}\` | ${r.name} | ${r.scorePct}% | ${r.missing.join(", ") || "—"} |`);
    }
    lines.push("");
  }

  const mdPath = path.join(OUT_DIR, "ingredient-audit.md");
  fs.writeFileSync(mdPath, lines.join("\n"));

  return { jsonPath, mdPath };
}

const rows = audit();
const { jsonPath, mdPath } = writeReports(rows);
const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.scorePct, 0) / rows.length) : 0;
const weak = rows.filter((r) => r.scorePct < 50).length;
const strong = rows.filter((r) => r.scorePct >= 80).length;
// eslint-disable-next-line no-console
console.log(`Audited ${rows.length} ingredients — avg ${avg}%, ${weak} below 50%, ${strong} at or above 80%.`);
// eslint-disable-next-line no-console
console.log(`Reports: ${path.relative(process.cwd(), jsonPath)}, ${path.relative(process.cwd(), mdPath)}`);
