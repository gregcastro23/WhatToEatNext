// scripts/generateHscaCuisine.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ingredientsMap } from "../src/data/ingredients/index.ts";
import {
  calculateRecipeAlchemicalQuantities,
  calculateRecipeElementalFromIngredients
} from "../src/utils/recipeAlchemicalQuantities.ts";
import {
  calculateThermodynamics,
  calculateKalchm,
  calculateMonica,
} from "../src/data/unified/alchemicalCalculations.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawRecipe {
  id: string;
  name: string;
  title: string;
  description: string;
  yield_amount: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  elementalProperties: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  ingredients: string[];
  instructions: string[];
  categories: string[];
  cuisine: string;
  season: string[];
}

// Robust ingredient parser
function parseIngredientString(ingStr: string) {
  ingStr = ingStr.trim();
  let amount = 1;
  let unit = "piece";
  let name = "";
  let notes = "";

  // Strip leading words like "approximately", "about", "around"
  let cleanStr = ingStr.replace(/^(approximately|about|around)\s+/i, "");

  // Match mixed numbers like "1 1/2" or "2 3/4"
  const mixedMatch = cleanStr.match(/^(\d+)\s+(\d+)\/(\d+)\s*(.*)$/);
  // Match fractions like "1/2" or "3/4"
  const fracMatch = cleanStr.match(/^(\d+)\/(\d+)\s*(.*)$/);
  // Match decimals like "1.5" or "0.25"
  const decMatch = cleanStr.match(/^(\d+\.\d+)\s*(.*)$/);
  // Match simple integers like "6"
  const intMatch = cleanStr.match(/^(\d+)\s*(.*)$/);
  // Match textual numbers
  const textNumMatch = cleanStr.match(/^(one|two|three|four|five|six|seven|eight|nine|ten)\s*(.*)$/i);

  let remaining = cleanStr;

  if (mixedMatch) {
    amount = parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
    remaining = mixedMatch[4];
  } else if (fracMatch) {
    amount = parseInt(fracMatch[1]) / parseInt(fracMatch[2]);
    remaining = fracMatch[3];
  } else if (decMatch) {
    amount = parseFloat(decMatch[1]);
    remaining = decMatch[2];
  } else if (intMatch) {
    amount = parseInt(intMatch[1]);
    remaining = intMatch[2];
  } else if (textNumMatch) {
    const word = textNumMatch[1].toLowerCase();
    const wordMap: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };
    amount = wordMap[word] || 1;
    remaining = textNumMatch[2];
  }

  // Unit patterns
  const units = [
    "cups?", "teaspoons?", "tsps?", "tablespoons?", "tbsps?", "ounces?", "ozs?", "pounds?", "lbs?", "grams?", "g",
    "cloves?", "cans?", "pinches?", "sprigs?", "stalks?", "pieces?", "slices?", "fillets?", "heads?", "bunches?",
    "pints?", "quarts?", "gallons?", "bottles?", "jars?", "packages?", "bags?", "handfuls?", "cans?"
  ];

  const unitRegex = new RegExp(`^(${units.join("|")})\\s*(.*)$`, "i");
  const unitMatch = remaining.match(unitRegex);

  if (unitMatch) {
    unit = unitMatch[1].toLowerCase();
    remaining = unitMatch[2];
  }

  // Split on first comma for notes
  const commaIdx = remaining.indexOf(",");
  if (commaIdx !== -1) {
    notes = remaining.substring(commaIdx + 1).trim();
    name = remaining.substring(0, commaIdx).trim();
  } else {
    name = remaining.trim();
  }

  // Extract parentheses in name to notes
  const parenMatch = name.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const parenContent = parenMatch[1];
    notes = notes ? `${parenContent}; ${notes}` : parenContent;
    name = name.replace(/\([^)]+\)/g, "").trim();
  }

  // Final sanitization of ingredient name
  name = name.toLowerCase().replace(/\s+/g, " ").trim();

  // Try to clean common adjectives for better matching
  let cleanName = name
    .replace(/^(organic|fresh|large|medium|small|dry|dried|powdered|raw|extra-virgin|sifted)\s+/gi, "")
    .trim();

  return { amount, unit, name: cleanName, rawName: name, notes };
}

// Parse prep/cook time strings
function parseTimeMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)\s*(minute|hour)/i);
  if (!match) return 0;
  const val = parseInt(match[1], 10);
  if (match[2].toLowerCase().startsWith("hour")) {
    return val * 60;
  }
  return val;
}

async function run() {
  console.log("📖 Reading recipes_database.json...");
  const rawData = fs.readFileSync(path.join(process.cwd(), "recipes_database.json"), "utf8");
  const recipes: RawRecipe[] = JSON.parse(rawData);
  console.log(`Loaded ${recipes.length} raw HSCA recipes!`);

  // Organise by mealType and season
  const dishes: any = {
    breakfast: { all: [], spring: [], summer: [], autumn: [], winter: [] },
    lunch: { all: [], spring: [], summer: [], autumn: [], winter: [] },
    dinner: { all: [], spring: [], summer: [], autumn: [], winter: [] },
    dessert: { all: [], spring: [], summer: [], autumn: [], winter: [] },
  };

  let matchedIngredientsCount = 0;
  let totalIngredientsCount = 0;

  for (const r of recipes) {
    const recipeName = r.name || r.title || "Unnamed Recipe";
    totalIngredientsCount += r.ingredients.length;

    // Heuristics for mealType
    let mealType = "dinner"; // fallback
    const cats = r.categories.map(c => c.toLowerCase());
    const title = r.title ? r.title.toLowerCase() : "";

    if (
      cats.some(c => ["breakfast", "brunch", "waffles", "pancakes", "muffins", "porridge", "crepes", "beverage"].includes(c)) ||
      title.includes("breakfast") || title.includes("pancake") || title.includes("waffle") || title.includes("porridge")
    ) {
      mealType = "breakfast";
    } else if (
      cats.some(c => ["dessert", "cookies", "cake", "tart", "pastry", "chocolate", "brownies", "ice cream", "truffles", "pie", "sweets"].includes(c)) ||
      title.includes("cookie") || title.includes("cake") || title.includes("truffle") || title.includes("chocolate")
    ) {
      mealType = "dessert";
    } else if (
      cats.some(c => ["salad", "sandwich", "soup", "dressing", "appetizer", "snack", "dip", "spread", "pate", "sauce", "marinade", "condiment"].includes(c)) ||
      title.includes("soup") || title.includes("salad") || title.includes("sandwich") || title.includes("dip")
    ) {
      mealType = "lunch";
    } else if (
      cats.some(c => ["main course", "pasta", "stew", "casserole", "poultry", "seafood", "fish", "chicken", "burger", "pizza", "curry", "entree"].includes(c))
    ) {
      mealType = "dinner";
    } else {
      // Deterministic hash fallback to distribute evenly between lunch and dinner
      let hash = 0;
      for (let i = 0; i < recipeName.length; i++) {
        hash = recipeName.charCodeAt(i) + ((hash << 5) - hash);
      }
      mealType = Math.abs(hash) % 2 === 0 ? "lunch" : "dinner";
    }

    // Heuristics for Season mapping
    const seasons = Array.isArray(r.season) && r.season.length > 0 ? r.season : ["all"];

    // Parse ingredients to extract names
    const parsedIngredients = r.ingredients.map(ingStr => {
      const parsed = parseIngredientString(ingStr);
      let category = "seasoning";
      let element = "Earth";

      // Lookup category and element signature in consolidated ingredients registry
      const matched = ingredientsMap[parsed.name] || ingredientsMap[parsed.name.replace(/\s+/g, "_")];
      if (matched) {
        category = matched.category || "seasoning";
        if (matched.elementalProperties) {
          const sortedElems = Object.entries(matched.elementalProperties)
            .sort((a: any, b: any) => b[1] - a[1]);
          if (sortedElems.length > 0) {
            element = sortedElems[0][0];
          }
        }
      }

      return {
        amount: parsed.amount,
        unit: parsed.unit,
        name: parsed.name,
        notes: parsed.notes,
        rawName: parsed.rawName,
        category,
        element,
      };
    });

    const cleanedIngredientNames = parsedIngredients.map(i => i.name);

    // Call unified alchemical calculations
    const alchSummary = calculateRecipeAlchemicalQuantities(cleanedIngredientNames);
    const elemSummary = calculateRecipeElementalFromIngredients(cleanedIngredientNames);

    // Track matched ingredient rate
    const matchedCount = alchSummary.perIngredient.filter(i => !i.isDefaultValue).length;
    matchedIngredientsCount += matchedCount;

    // 1. CONSERVATION OF ANUMBER:
    // Recipe Spirit = Σ Spirit_ingredient (and E, M, S)
    const alchemicalProperties = {
      Spirit: parseFloat(alchSummary.totalSpirit.toFixed(2)),
      Essence: parseFloat(alchSummary.totalEssence.toFixed(2)),
      Matter: parseFloat(alchSummary.totalMatter.toFixed(2)),
      Substance: parseFloat(alchSummary.totalSubstance.toFixed(2)),
    };

    // Calculate elements from ingredients (renormalized) or use recipe precalculated values
    const Fire = elemSummary?.elementalProperties.Fire ?? r.elementalProperties?.Fire ?? 0.25;
    const Water = elemSummary?.elementalProperties.Water ?? r.elementalProperties?.Water ?? 0.25;
    const Earth = elemSummary?.elementalProperties.Earth ?? r.elementalProperties?.Earth ?? 0.25;
    const Air = elemSummary?.elementalProperties.Air ?? r.elementalProperties?.Air ?? 0.25;

    // Thermodynamic Calculations — CANONICAL engine (§17c). This was a SIXTH
    // forked engine deriving thermo from elements alone with bespoke bounded
    // heuristics (heat = 0.5 + (Fire−Water)·0.5, kalchm = 0.5 − Σ|el−0.25|, …).
    // Now uses the real ESMS-based formulas from data/unified, the same ones the
    // live engine uses. Values are finite by the totality contract.
    const r5 = (n: number) => parseFloat(n.toFixed(4));
    const thermo = calculateThermodynamics(alchemicalProperties, {
      Fire, Water, Air, Earth,
    });
    const heat = r5(thermo.heat);
    const entropy = r5(thermo.entropy);
    const reactivity = r5(thermo.reactivity);
    const gregsEnergy = r5(thermo.gregsEnergy);
    const kalchm = r5(calculateKalchm(alchemicalProperties));
    const monica = r5(calculateMonica(thermo.gregsEnergy, thermo.reactivity, kalchm));

    const thermodynamicProperties = {
      heat,
      entropy,
      reactivity,
      gregsEnergy,
      kalchm,
      monica,
    };

    // Astrological influences (heuristics)
    const dominantElement = Fire > Water && Fire > Earth && Fire > Air ? "Fire"
      : Water > Earth && Water > Air ? "Water"
      : Earth > Air ? "Earth" : "Air";

    let planets = ["Moon"];
    let signs = ["Taurus"];
    let lunarPhases = ["New Moon"];

    if (dominantElement === "Fire") {
      planets = ["Sun", "Mars"];
      signs = ["Aries", "Leo"];
      lunarPhases = ["Full Moon"];
    } else if (dominantElement === "Water") {
      planets = ["Moon", "Neptune"];
      signs = ["Cancer", "Pisces"];
      lunarPhases = ["First Quarter"];
    } else if (dominantElement === "Earth") {
      planets = ["Saturn", "Mercury"];
      signs = ["Virgo", "Capricorn"];
      lunarPhases = ["New Moon"];
    } else {
      planets = ["Mercury", "Uranus"];
      signs = ["Gemini", "Aquarius"];
      lunarPhases = ["Last Quarter"];
    }

    const prepTimeMinutes = parseTimeMinutes(r.prepTime);
    const cookTimeMinutes = parseTimeMinutes(r.cookTime);

    // Yield parse
    let servings = 4;
    if (r.yield_amount && typeof r.yield_amount === "string") {
      const servMatch = r.yield_amount.match(/(\d+)/);
      if (servMatch) {
        servings = parseInt(servMatch[1], 10);
      }
    }

    // Nutrition fallback calculation
    // Holistic recipes: generally 150-400 calories per serving, low saturated fat, high fiber
    let baseCalories = 250;
    if (mealType === "dessert") baseCalories = 320;
    else if (mealType === "breakfast") baseCalories = 280;
    else if (mealType === "dinner") baseCalories = 380;

    const nutritionPerServing = {
      calories: baseCalories,
      proteinG: Math.round(5 + (Earth * 15)),
      carbsG: Math.round(20 + (Air * 30)),
      fatG: Math.round(5 + (Fire * 12)),
      fiberG: Math.round(2 + (Earth * 8)),
      sodiumMg: Math.round(150 + (Water * 400)),
      sugarG: Math.round(2 + (Air * 15)),
      vitamins: ["Vitamin A", "Vitamin C", "Folate"],
      minerals: ["Calcium", "Iron", "Magnesium"],
    };

    // Cleaned up output ingredients list
    const finalIngredients = parsedIngredients.map(i => ({
      amount: i.amount,
      unit: i.unit,
      name: i.rawName,
      notes: i.notes,
    }));

    const instructions = Array.isArray(r.instructions) && r.instructions.length > 0
      ? r.instructions
      : ["Prepare according to clean holistic macrobiotic guidelines."];

    const cookingMethods = ["steaming", "simmering"];
    if (cookTimeMinutes === 0) cookingMethods.push("raw");
    else if (cookTimeMinutes > 40) cookingMethods.push("slow-cooking");
    if (r.instructions.some(s => s.toLowerCase().includes("bake"))) cookingMethods.push("baking");

    // Standardized dish object
    const dish = {
      name: recipeName,
      description: r.description,
      details: {
        cuisine: "HSCA",
        prepTimeMinutes: prepTimeMinutes || 15,
        cookTimeMinutes: cookTimeMinutes || 15,
        baseServingSize: servings,
        spiceLevel: r.categories.some(c => c.toLowerCase().includes("spicy")) ? "Medium" : "None",
        season: seasons,
      },
      ingredients: finalIngredients,
      instructions: instructions,
      classifications: {
        mealType: [mealType],
        cookingMethods: cookingMethods,
      },
      elementalProperties: {
        Fire,
        Water,
        Earth,
        Air,
      },
      astrologicalAffinities: {
        planets,
        signs,
        lunarPhases,
      },
      nutritionPerServing,
      alchemicalProperties,
      thermodynamicProperties,
      substitutions: [
        {
          originalIngredient: finalIngredients[0]?.name || "seasoning",
          substituteOptions: ["sea salt", "chickpea miso"],
        },
      ],
    };

    // Append to every matched season (excluding 'all' to prevent duplicates)
    seasons.forEach((s: string) => {
      const seasonKey = s.toLowerCase();
      if (seasonKey !== "all" && dishes[mealType][seasonKey]) {
        dishes[mealType][seasonKey].push(dish);
      }
    });

    // Also always append to the 'all' category for the dynamic load
    dishes[mealType].all.push(dish);
  }

  const matchRate = (matchedIngredientsCount / totalIngredientsCount) * 100;
  console.log(`🎯 Ingredient Match Rate: ${matchRate.toFixed(2)}% (${matchedIngredientsCount}/${totalIngredientsCount})`);

  // Write Cuisine output to src/data/cuisines/hsca.ts
  const outputFilePath = path.join(process.cwd(), "src/data/cuisines/hsca.ts");

  const fileContent = `// src/data/cuisines/hsca.ts
import type { Cuisine } from "@/types/cuisine";

export const cuisine: Cuisine = {
  id: "hsca",
  name: "HSCA",
  description: "Holistic Health and Macrobiotic clean cuisine focusing on energetic harmony, thermodynamic equilibrium, and restorative elemental balance.",
  motherSauces: {},
  traditionalSauces: {},
  sauceRecommender: {
    forProtein: {},
    forVegetable: {},
    forCookingMethod: {},
    byAstrological: {},
    byRegion: {},
    byDietary: {},
  },
  cookingTechniques: [],
  regionalCuisines: {},
  dishes: ${JSON.stringify(dishes, null, 2)},
  elementalProperties: {
    Fire: 0.25,
    Earth: 0.35,
    Water: 0.25,
    Air: 0.15,
  },
  astrologicalInfluences: ["Moon", "Saturn", "Venus"],
};

export default cuisine;
`;

  fs.writeFileSync(outputFilePath, fileContent, "utf8");
  console.log(`✅ Completed! Ingested ${recipes.length} recipes and saved to: ${outputFilePath}`);
}

run().catch(console.error);

