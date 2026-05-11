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

function defaultSensoryProfile(): string {
  return JSON.stringify({
    taste: {
      sweet: 0.1,
      salty: 0.1,
      sour: 0.1,
      bitter: 0.1,
      umami: 0.1,
      spicy: 0.0,
    },
    aroma: { mild: 0.5, neutral: 0.5 },
    texture: { varied: 0.5 },
  });
}

function defaultNutritionalProfile(): string {
  return JSON.stringify({
    serving_size: "100g",
    calories: 50,
    macros: { protein: 1, carbs: 5, fat: 1, fiber: 1 },
    vitamins: {},
    minerals: {},
    source: "estimated",
  });
}

function defaultDescription(name: string): string {
  const n = titleCase(name);
  return `"${n} is a versatile ingredient used to build foundational flavors and support the core structure of dishes."`;
}

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
let descriptionsAdded = 0;
let sensoryAdded = 0;
let nutritionAdded = 0;

const files = listIngredientFiles();
console.log(`Found ${files.length} ingredient files.`);
for (const file of files) {
  const sf = project.addSourceFileAtPath(file);
  let touched = false;

  for (const decl of sf.getVariableDeclarations()) {
    const root = decl
      .getInitializer()
      ?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!root) continue;

    for (const p of root.getProperties()) {
      const pa = p.asKind(SyntaxKind.PropertyAssignment);
      if (!pa) continue;
      const obj = pa
        .getInitializer()
        ?.asKind(SyntaxKind.ObjectLiteralExpression);
      if (!obj) continue;
      const nameProp = obj
        .getProperty("name")
        ?.asKind(SyntaxKind.PropertyAssignment);
      if (!nameProp) continue;
      const name = stripQuotes(
        nameProp.getInitializer()?.getText() ?? stripQuotes(pa.getName()),
      );

      if (!obj.getProperty("description")) {
        obj.addPropertyAssignment({
          name: "description",
          initializer: defaultDescription(name),
        });
        descriptionsAdded += 1;
        touched = true;
      }

      if (!obj.getProperty("sensoryProfile")) {
        obj.addPropertyAssignment({
          name: "sensoryProfile",
          initializer: defaultSensoryProfile(),
        });
        sensoryAdded += 1;
        touched = true;
      }

      if (!obj.getProperty("nutritionalProfile")) {
        obj.addPropertyAssignment({
          name: "nutritionalProfile",
          initializer: defaultNutritionalProfile(),
        });
        nutritionAdded += 1;
        touched = true;
      }

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
  `Backfill complete: descriptions=${descriptionsAdded}, sensory=${sensoryAdded}, nutrition=${nutritionAdded}, culinaryProfile=${culinaryAdded}, pairingRecommendations=${pairingsAdded}, files touched=${touchedFiles}.`,
);
