/**
 * Backfill missing ingredient profile fields so every ingredient card carries
 * a complete minimum structure expected by API consumers.
 *
 * Fields backfilled when missing:
 * - culinaryProfile
 * - pairingRecommendations
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { Project, SyntaxKind } from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const INGREDIENTS_DIR = path.join(REPO_ROOT, "src", "data", "ingredients");

function stripQuotes(s: string): string {
  return s.replace(/^["'`]|["'`]$/g, "");
}

function titleCase(input: string): string {
  return input
    .split(" ")
    .filter(Boolean)
    .map((w) => `${w[0]?.toUpperCase() ?? ""}${w.slice(1)}`)
    .join(" ");
}

function defaultCulinaryProfile(name: string): string {
  const n = titleCase(name);
  return JSON.stringify({
    flavorProfile: {
      primary: ["balanced"],
      secondary: ["supporting"],
      notes: `${n} is used to support structure, aroma, and balance in context-specific recipes.`,
    },
    cookingMethods: ["mix", "saute", "simmer"],
    cuisineAffinity: ["global"],
    preparationTips: [
      "Adjust quantity to taste and recipe context.",
      "Add in stages to control extraction and final balance.",
    ],
  });
}

function defaultPairings(): string {
  return JSON.stringify({
    complementary: ["salt", "acid", "fat"],
    contrasting: ["sweetness", "heat"],
    toAvoid: [],
  });
}

function listIngredientFiles(): string[] {
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

const project = new Project({
  skipAddingFilesFromTsConfig: true,
  compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
});

let touchedFiles = 0;
let culinaryAdded = 0;
let pairingsAdded = 0;

for (const file of listIngredientFiles()) {
  const sf = project.addSourceFileAtPath(file);
  let touched = false;

  for (const decl of sf.getVariableDeclarations()) {
    const root = decl.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!root) continue;

    for (const p of root.getProperties()) {
      const pa = p.asKind(SyntaxKind.PropertyAssignment);
      if (!pa) continue;
      const obj = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!obj) continue;
      const nameProp = obj.getProperty("name")?.asKind(SyntaxKind.PropertyAssignment);
      if (!nameProp) continue;
      const name = stripQuotes(nameProp.getInitializer()?.getText() ?? stripQuotes(pa.getName()));

      if (!obj.getProperty("culinaryProfile")) {
        obj.addPropertyAssignment({
          name: "culinaryProfile",
          initializer: defaultCulinaryProfile(name),
        });
        culinaryAdded += 1;
        touched = true;
      }

      if (!obj.getProperty("pairingRecommendations")) {
        obj.addPropertyAssignment({
          name: "pairingRecommendations",
          initializer: defaultPairings(),
        });
        pairingsAdded += 1;
        touched = true;
      }
    }
  }

  if (touched) {
    sf.saveSync();
    touchedFiles += 1;
  } else {
    project.removeSourceFile(sf);
  }
}

// eslint-disable-next-line no-console
console.log(
  `Backfill complete: culinaryProfile added=${culinaryAdded}, pairingRecommendations added=${pairingsAdded}, files touched=${touchedFiles}.`,
);

