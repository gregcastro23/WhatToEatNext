import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { Project, SyntaxKind } from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const CURATION_FILE = path.join(
  REPO_ROOT,
  "src",
  "data",
  "ingredients",
  "misc",
  "coverageDescriptionCuration.ts",
);

// High-quality manual overrides
const NUTRITION_OVERRIDES: Record<
  string,
  { serving_size: string; calories: number; macros: { protein: number; carbs: number; fat: number; fiber?: number } }
> = {
  bitterleaves: {
    serving_size: "1 cup",
    calories: 15,
    macros: { protein: 1.5, carbs: 3, fat: 0.1, fiber: 2 },
  },
  ndol_leaves_bitterleaf: {
    serving_size: "1 cup",
    calories: 15,
    macros: { protein: 1.5, carbs: 3, fat: 0.1, fiber: 2 },
  },
  molokhia_leaves: {
    serving_size: "1 cup cooked",
    calories: 35,
    macros: { protein: 3, carbs: 6, fat: 0.2, fiber: 2.5 },
  },
  golden_raisins: {
    serving_size: "1 oz",
    calories: 85,
    macros: { protein: 1, carbs: 22, fat: 0.1, fiber: 1.5 },
  },
};

// Category defaults
function getCategoryNutrition(category: string): {
  serving_size: string;
  calories: number;
  macros: { protein: number; carbs: number; fat: number; fiber?: number };
} {
  switch (category) {
    case "grain":
    case "grains":
      return {
        serving_size: "1/2 cup cooked",
        calories: 120,
        macros: { protein: 3, carbs: 25, fat: 0.5, fiber: 2 },
      };
    case "vegetable":
    case "vegetables":
      return {
        serving_size: "1 cup",
        calories: 40,
        macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 },
      };
    case "culinary_herb":
    case "herb":
    case "herbs":
      return {
        serving_size: "1 tbsp fresh",
        calories: 1,
        macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 },
      };
    case "spice":
    case "spices":
      return {
        serving_size: "1 tsp",
        calories: 6,
        macros: { protein: 0.2, carbs: 1.3, fat: 0.2, fiber: 0.6 },
      };
    case "seasoning":
    case "seasonings":
      return {
        serving_size: "1 tsp",
        calories: 10,
        macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 },
      };
    case "oil":
    case "oils":
      return {
        serving_size: "1 tbsp",
        calories: 120,
        macros: { protein: 0, carbs: 0, fat: 14, fiber: 0 },
      };
    case "vinegar":
    case "vinegars":
      return {
        serving_size: "1 tbsp",
        calories: 3,
        macros: { protein: 0, carbs: 0.1, fat: 0, fiber: 0 },
      };
    case "dairy":
      return {
        serving_size: "1 oz",
        calories: 90,
        macros: { protein: 5, carbs: 3, fat: 7, fiber: 0 },
      };
    case "fruit":
    case "fruits":
      return {
        serving_size: "1 cup",
        calories: 70,
        macros: { protein: 1, carbs: 18, fat: 0.3, fiber: 3 },
      };
    case "protein":
    case "proteins":
      return {
        serving_size: "3 oz",
        calories: 180,
        macros: { protein: 22, carbs: 0, fat: 10, fiber: 0 },
      };
    default:
      return {
        serving_size: "1 tbsp",
        calories: 40,
        macros: { protein: 0.5, carbs: 8, fat: 1, fiber: 0.2 },
      };
  }
}

function main(): void {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { noEmit: true, skipLibCheck: true, target: 99 },
  });

  const sourceFile = project.addSourceFileAtPath(CURATION_FILE);
  const declaration = sourceFile.getVariableDeclaration("coverageDescriptionCuration");
  const obj = declaration?.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (!obj) {
    throw new Error("Could not find coverageDescriptionCuration object");
  }

  let count = 0;
  for (const prop of obj.getProperties()) {
    const pa = prop.asKind(SyntaxKind.PropertyAssignment);
    if (!pa) continue;

    const key = pa.getName().replace(/^["'`]|["'`]$/g, "");
    const valueNode = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!valueNode) continue;

    // Read category from the property assignment
    const categoryProp = valueNode.getProperty("category")?.asKind(SyntaxKind.PropertyAssignment);
    const category = categoryProp?.getInitializer()?.getText().replace(/^["'`]|["'`]$/g, "") || "misc";

    // Recompute or find the nutritional profile
    const nutrition = NUTRITION_OVERRIDES[key] || getCategoryNutrition(category);

    const existingNutrition = valueNode.getProperty("nutritionalProfile");
    if (existingNutrition) {
      existingNutrition.remove();
    }

    valueNode.addPropertyAssignment({
      name: "nutritionalProfile",
      initializer: JSON.stringify(nutrition),
    });
    count++;
  }

  sourceFile.saveSync();
  console.log(`Backfilled nutritionalProfile for ${count} curated coverage ingredients.`);
}

main();
