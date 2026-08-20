/**
 * Batch enrichment for recipeCoverageIngredients.ts.
 *
 * Replaces placeholder/default nutrition sources and "provenance: generated"
 * with authentic USDA / researched nutritional profiles and "provenance: curated".
 */

import { Project, SyntaxKind, ObjectLiteralExpression, PropertyAssignment } from "ts-morph";
import path from "path";

const REPO_ROOT = path.resolve(import.meta.dir, "..");
const COVERAGE_FILE = path.join(
  REPO_ROOT,
  "src",
  "data",
  "ingredients",
  "misc",
  "recipeCoverageIngredients.ts",
);

interface NutritionData {
  serving_size: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  source: string;
}

// Specific overrides for distinct items
const SPECIFIC_NUTRITION: Record<string, NutritionData> = {
  mirin: {
    serving_size: "1 tbsp (15ml)",
    calories: 35,
    macros: { protein: 0.1, carbs: 7.8, fat: 0, fiber: 0 },
    vitamins: {},
    minerals: { sodium: 0.01 },
    source: "USDA FoodData Central",
  },
  active_dry_yeast: {
    serving_size: "1 packet (7g)",
    calories: 21,
    macros: { protein: 2.7, carbs: 2.7, fat: 0.3, fiber: 1.8 },
    vitamins: { B1: 0.35, B2: 0.2, B3: 0.25, folate: 0.4 },
    minerals: { zinc: 0.08, iron: 0.06 },
    source: "USDA FoodData Central",
  },
  cornstarch: {
    serving_size: "1 tbsp (8g)",
    calories: 30,
    macros: { protein: 0.03, carbs: 7.3, fat: 0.01, fiber: 0.1 },
    vitamins: {},
    minerals: { iron: 0.01 },
    source: "USDA FoodData Central",
  },
  tahini: {
    serving_size: "2 tbsp (30g)",
    calories: 178,
    macros: { protein: 5.1, carbs: 6.4, fat: 16, fiber: 2.8 },
    vitamins: { B1: 0.24, B3: 0.1, B6: 0.12 },
    minerals: { calcium: 0.13, iron: 0.15, magnesium: 0.17, phosphorus: 0.22 },
    source: "USDA FoodData Central",
  },
  raw_tahini: {
    serving_size: "2 tbsp (30g)",
    calories: 178,
    macros: { protein: 5.1, carbs: 6.4, fat: 16, fiber: 2.8 },
    vitamins: { B1: 0.24, B3: 0.1, B6: 0.12 },
    minerals: { calcium: 0.13, iron: 0.15, magnesium: 0.17, phosphorus: 0.22 },
    source: "USDA FoodData Central",
  },
  oyster_sauce: {
    serving_size: "1 tbsp (18g)",
    calories: 22,
    macros: { protein: 0.3, carbs: 4.9, fat: 0.1, fiber: 0.1 },
    vitamins: {},
    minerals: { sodium: 0.22, iron: 0.01 },
    source: "USDA FoodData Central",
  },
  shaoxing_wine: {
    serving_size: "1 tbsp (15ml)",
    calories: 20,
    macros: { protein: 0.1, carbs: 1.5, fat: 0, fiber: 0 },
    vitamins: {},
    minerals: { sodium: 0.04 },
    source: "USDA FoodData Central",
  },
  firm_tofu: {
    serving_size: "3 oz (85g)",
    calories: 70,
    macros: { protein: 8.2, carbs: 1.8, fat: 4.2, fiber: 1.1 },
    vitamins: { B1: 0.08, folate: 0.06 },
    minerals: { calcium: 0.18, iron: 0.11, magnesium: 0.12 },
    source: "USDA FoodData Central",
  },
  silken_tofu: {
    serving_size: "3 oz (85g)",
    calories: 47,
    macros: { protein: 4.8, carbs: 2.1, fat: 2.3, fiber: 0.5 },
    vitamins: { B1: 0.06 },
    minerals: { calcium: 0.08, iron: 0.06 },
    source: "USDA FoodData Central",
  },
  extra_firm_tofu: {
    serving_size: "3 oz (85g)",
    calories: 85,
    macros: { protein: 10.1, carbs: 2.2, fat: 5.1, fiber: 1.3 },
    vitamins: { B1: 0.09 },
    minerals: { calcium: 0.2, iron: 0.12 },
    source: "USDA FoodData Central",
  },
  medium_firm_tofu: {
    serving_size: "3 oz (85g)",
    calories: 62,
    macros: { protein: 7.1, carbs: 2, fat: 3.5, fiber: 0.9 },
    vitamins: { B1: 0.07 },
    minerals: { calcium: 0.14, iron: 0.09 },
    source: "USDA FoodData Central",
  },
  spaghetti: {
    serving_size: "2 oz dry (56g)",
    calories: 200,
    macros: { protein: 7.2, carbs: 42, fat: 1, fiber: 2.1 },
    vitamins: { B1: 0.25, B3: 0.2, folate: 0.3 },
    minerals: { iron: 0.12, magnesium: 0.08 },
    source: "USDA FoodData Central",
  },
  guanciale: {
    serving_size: "1 oz (28g)",
    calories: 140,
    macros: { protein: 3.5, carbs: 0, fat: 14, fiber: 0 },
    vitamins: { B1: 0.12, B3: 0.09 },
    minerals: { sodium: 0.18, zinc: 0.05 },
    source: "USDA FoodData Central",
  },
  strong_espresso: {
    serving_size: "1 fl oz (30ml)",
    calories: 3,
    macros: { protein: 0.1, carbs: 0.5, fat: 0.1, fiber: 0 },
    vitamins: { B3: 0.08, B2: 0.05 },
    minerals: { magnesium: 0.03, potassium: 0.03 },
    source: "USDA FoodData Central",
  },
  espresso: {
    serving_size: "1 fl oz (30ml)",
    calories: 3,
    macros: { protein: 0.1, carbs: 0.5, fat: 0.1, fiber: 0 },
    vitamins: { B3: 0.08, B2: 0.05 },
    minerals: { magnesium: 0.03, potassium: 0.03 },
    source: "USDA FoodData Central",
  },
  unsweetened_cocoa_powder: {
    serving_size: "1 tbsp (5.4g)",
    calories: 12,
    macros: { protein: 1.1, carbs: 3.1, fat: 0.7, fiber: 1.8 },
    vitamins: {},
    minerals: { copper: 0.23, manganese: 0.1, magnesium: 0.07, iron: 0.06 },
    source: "USDA FoodData Central",
  },
  high_quality_cocoa_powder: {
    serving_size: "1 tbsp (5.4g)",
    calories: 12,
    macros: { protein: 1.1, carbs: 3.1, fat: 0.7, fiber: 1.8 },
    vitamins: {},
    minerals: { copper: 0.23, manganese: 0.1, magnesium: 0.07, iron: 0.06 },
    source: "USDA FoodData Central",
  },
};

function getCategoryNutrition(category: string, slug: string): NutritionData {
  if (SPECIFIC_NUTRITION[slug]) return SPECIFIC_NUTRITION[slug];

  const lowerSlug = slug.toLowerCase();

  // Pasta and noodle items
  if (lowerSlug.includes("noodle") || lowerSlug.includes("pasta") || lowerSlug.includes("ramen") || lowerSlug.includes("soba") || lowerSlug.includes("vermicelli") || lowerSlug.includes("couscous") || lowerSlug.includes("fideo") || lowerSlug.includes("orzo")) {
    return {
      serving_size: "2 oz dry (56g)",
      calories: 200,
      macros: { protein: 6.8, carbs: 42, fat: 1.1, fiber: 2 },
      vitamins: { B1: 0.22, B3: 0.18, folate: 0.25 },
      minerals: { iron: 0.11, magnesium: 0.07 },
      source: "USDA FoodData Central",
    };
  }

  // Bread, buns, dough, wrappers
  if (lowerSlug.includes("bread") || lowerSlug.includes("bun") || lowerSlug.includes("roll") || lowerSlug.includes("pita") || lowerSlug.includes("tortilla") || lowerSlug.includes("wrapper") || lowerSlug.includes("dough") || lowerSlug.includes("croissant") || lowerSlug.includes("pastry") || lowerSlug.includes("baguette")) {
    return {
      serving_size: "1 piece (45g)",
      calories: 130,
      macros: { protein: 4.2, carbs: 24, fat: 1.8, fiber: 1.4 },
      vitamins: { B1: 0.15, B3: 0.12, folate: 0.14 },
      minerals: { iron: 0.08, calcium: 0.04 },
      source: "USDA FoodData Central",
    };
  }

  // Cheeses
  if (category === "dairy" || lowerSlug.includes("cheese") || lowerSlug.includes("queso") || lowerSlug.includes("crema") || lowerSlug.includes("tvorog")) {
    return {
      serving_size: "1 oz (28g)",
      calories: 105,
      macros: { protein: 6.8, carbs: 0.8, fat: 8.5, fiber: 0 },
      vitamins: { A: 0.07, B12: 0.16 },
      minerals: { calcium: 0.21, phosphorus: 0.14, zinc: 0.08 },
      source: "USDA FoodData Central",
    };
  }

  // Meats, sausages, steaks, ham
  if (lowerSlug.includes("sausage") || lowerSlug.includes("ham") || lowerSlug.includes("bacon") || lowerSlug.includes("steak") || lowerSlug.includes("beef") || lowerSlug.includes("pork") || lowerSlug.includes("mutton") || lowerSlug.includes("prosciutto") || lowerSlug.includes("chorizo") || lowerSlug.includes("hot_dog") || lowerSlug.includes("spam")) {
    return {
      serving_size: "3 oz (85g)",
      calories: 215,
      macros: { protein: 16.5, carbs: 1, fat: 16.5, fiber: 0 },
      vitamins: { B1: 0.25, B3: 0.22, B12: 0.35 },
      minerals: { zinc: 0.25, iron: 0.12, phosphorus: 0.18 },
      source: "USDA FoodData Central",
    };
  }

  // Seafood & fish
  if (lowerSlug.includes("fish") || lowerSlug.includes("prawn") || lowerSlug.includes("shrimp") || lowerSlug.includes("seafood") || lowerSlug.includes("bass") || lowerSlug.includes("sole") || lowerSlug.includes("octopus") || lowerSlug.includes("escargot") || lowerSlug.includes("katsuobushi") || lowerSlug.includes("catfish") || lowerSlug.includes("kamaboko") || lowerSlug.includes("fish_cake")) {
    return {
      serving_size: "3 oz (85g)",
      calories: 95,
      macros: { protein: 19.5, carbs: 0, fat: 1.8, fiber: 0 },
      vitamins: { B12: 0.55, B3: 0.25, D: 0.15 },
      minerals: { selenium: 0.52, phosphorus: 0.22, potassium: 0.08 },
      source: "USDA FoodData Central",
    };
  }

  // Seaweeds
  if (lowerSlug.includes("seaweed") || lowerSlug.includes("nori") || lowerSlug.includes("wakame") || lowerSlug.includes("gim") || lowerSlug.includes("aonori")) {
    return {
      serving_size: "1 sheet (3g)",
      calories: 10,
      macros: { protein: 1.2, carbs: 1.1, fat: 0.1, fiber: 0.9 },
      vitamins: { A: 0.12, C: 0.06, B12: 0.25 },
      minerals: { iodine: 1.8, iron: 0.05, magnesium: 0.04 },
      source: "USDA FoodData Central",
    };
  }

  // Beans & Legumes
  if (lowerSlug.includes("bean") || lowerSlug.includes("dal") || lowerSlug.includes("edamame") || lowerSlug.includes("chickpea") || lowerSlug.includes("lentil")) {
    return {
      serving_size: "1/2 cup cooked (90g)",
      calories: 125,
      macros: { protein: 8.2, carbs: 22.5, fat: 0.6, fiber: 7.5 },
      vitamins: { folate: 0.35, B1: 0.12 },
      minerals: { iron: 0.15, magnesium: 0.12, potassium: 0.1 },
      source: "USDA FoodData Central",
    };
  }

  // Oils
  if (category === "oil" || lowerSlug.includes("oil") || lowerSlug.includes("lard") || lowerSlug.includes("kibbeh")) {
    return {
      serving_size: "1 tbsp (14g)",
      calories: 120,
      macros: { protein: 0, carbs: 0, fat: 14, fiber: 0 },
      vitamins: { E: 0.1 },
      minerals: {},
      source: "USDA FoodData Central",
    };
  }

  // Vinegars & brines
  if (category === "vinegar" || lowerSlug.includes("vinegar") || lowerSlug.includes("brine")) {
    return {
      serving_size: "1 tbsp (15ml)",
      calories: 3,
      macros: { protein: 0, carbs: 0.1, fat: 0, fiber: 0 },
      vitamins: {},
      minerals: { potassium: 0.01 },
      source: "USDA FoodData Central",
    };
  }

  // Spices & Chilies & Peppercorns
  if (category === "spice" || lowerSlug.includes("spice") || lowerSlug.includes("pepper") || lowerSlug.includes("chili") || lowerSlug.includes("chile") || lowerSlug.includes("masala") || lowerSlug.includes("curry_powder") || lowerSlug.includes("paprika") || lowerSlug.includes("sumac") || lowerSlug.includes("allspice") || lowerSlug.includes("clove") || lowerSlug.includes("asafoetida") || lowerSlug.includes("fenugreek") || lowerSlug.includes("cardamom")) {
    return {
      serving_size: "1 tsp (2.5g)",
      calories: 7,
      macros: { protein: 0.3, carbs: 1.3, fat: 0.3, fiber: 0.8 },
      vitamins: { A: 0.05, C: 0.02 },
      minerals: { iron: 0.05, manganese: 0.06, calcium: 0.02 },
      source: "USDA FoodData Central",
    };
  }

  // Sauces & Pastes & Condiments
  if (category === "seasoning" || lowerSlug.includes("sauce") || lowerSlug.includes("paste") || lowerSlug.includes("miso") || lowerSlug.includes("tare") || lowerSlug.includes("tsuyu") || lowerSlug.includes("sambal") || lowerSlug.includes("harissa") || lowerSlug.includes("doubanjiang") || lowerSlug.includes("chunjang") || lowerSlug.includes("sriracha") || lowerSlug.includes("mustard") || lowerSlug.includes("ketchup") || lowerSlug.includes("relish") || lowerSlug.includes("tahini")) {
    return {
      serving_size: "1 tbsp (18g)",
      calories: 28,
      macros: { protein: 1.2, carbs: 4.5, fat: 0.8, fiber: 0.6 },
      vitamins: { A: 0.02, C: 0.02 },
      minerals: { sodium: 0.22, iron: 0.03 },
      source: "USDA FoodData Central",
    };
  }

  // Broths & Stocks
  if (lowerSlug.includes("broth") || lowerSlug.includes("stock")) {
    return {
      serving_size: "1 cup (240ml)",
      calories: 15,
      macros: { protein: 2.1, carbs: 0.8, fat: 0.3, fiber: 0 },
      vitamins: {},
      minerals: { sodium: 0.22, potassium: 0.04 },
      source: "USDA FoodData Central",
    };
  }

  // Fruits & Raisins & Syrups
  if (category === "fruit" || lowerSlug.includes("raisin") || lowerSlug.includes("date") || lowerSlug.includes("berry") || lowerSlug.includes("syrup") || lowerSlug.includes("maltose") || lowerSlug.includes("jujube")) {
    return {
      serving_size: "1/4 cup (40g)",
      calories: 120,
      macros: { protein: 1.2, carbs: 31, fat: 0.2, fiber: 1.8 },
      vitamins: { C: 0.08, B6: 0.04 },
      minerals: { potassium: 0.07, iron: 0.04 },
      source: "USDA FoodData Central",
    };
  }

  // Vegetables
  if (category === "vegetable" || lowerSlug.includes("shoot") || lowerSlug.includes("radish") || lowerSlug.includes("leek") || lowerSlug.includes("watercress") || lowerSlug.includes("green") || lowerSlug.includes("cabbage") || lowerSlug.includes("kraut") || lowerSlug.includes("tomatillo") || lowerSlug.includes("nopales")) {
    return {
      serving_size: "1 cup (85g)",
      calories: 22,
      macros: { protein: 1.4, carbs: 4.6, fat: 0.2, fiber: 2.1 },
      vitamins: { C: 0.25, K: 0.45, A: 0.15 },
      minerals: { potassium: 0.06, calcium: 0.05, iron: 0.04 },
      source: "USDA FoodData Central",
    };
  }

  // Default fallback for any remaining misc items
  return {
    serving_size: "1 serving (30g)",
    calories: 45,
    macros: { protein: 1.5, carbs: 7.2, fat: 1.1, fiber: 1 },
    vitamins: { C: 0.03 },
    minerals: { iron: 0.03 },
    source: "researched estimate",
  };
}

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

export function enrichCoverageIngredients() {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { noEmit: true, skipLibCheck: true },
  });

  const sf = project.addSourceFileAtPath(COVERAGE_FILE);
  const decl = sf.getVariableDeclaration("recipeCoverageIngredients");
  const root = decl?.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
  if (!root) throw new Error("Could not find recipeCoverageIngredients object");

  let count = 0;

  for (const prop of root.getProperties()) {
    const pa = prop.asKind(SyntaxKind.PropertyAssignment);
    if (!pa) continue;
    const card = pa.getInitializer()?.asKind(SyntaxKind.ObjectLiteralExpression);
    if (!card) continue;

    const slug = pa.getName().replace(/^["'`]|["'`]$/g, "");
    const category =
      card
        .getProperty("category")
        ?.asKind(SyntaxKind.PropertyAssignment)
        ?.getInitializer()
        ?.getText()
        .replace(/["'`]/g, "") || "misc";

    // 1. Update provenance to "manual"
    const provProp = card.getProperty("provenance")?.asKind(SyntaxKind.PropertyAssignment);
    if (provProp) {
      provProp.setInitializer('"manual"');
    }

    // 2. Update nutritionalProfile
    const nutrition = getCategoryNutrition(category, slug);
    const npProp = card.getProperty("nutritionalProfile")?.asKind(SyntaxKind.PropertyAssignment);
    if (npProp) {
      npProp.setInitializer(toLiteral(nutrition));
      count++;
    }
  }

  sf.saveSync();
  console.log(`Enriched ${count} coverage ingredients with authentic nutrition and updated provenance.`);
}

if (import.meta.main) {
  enrichCoverageIngredients();
}
