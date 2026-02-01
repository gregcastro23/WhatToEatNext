#!/usr/bin/env ts-node
/**
 * Analyze unmapped ingredients and cooking methods
 *
 * Usage:
 *   npx ts-node scripts/analyzeUnmappedIngredients.ts [--cuisine <name>]
 *
 * Examples:
 *   npx ts-node scripts/analyzeUnmappedIngredients.ts              # All cuisines
 *   npx ts-node scripts/analyzeUnmappedIngredients.ts --cuisine french  # French only
 */

import * as fs from "fs";
import * as path from "path";

// Full ingredient elemental mappings (synchronized with writeEnrichedData.ts)
const INGREDIENT_ELEMENTAL_MAP: Record<string, boolean> = {
  // Spicy/Hot ingredients
  chili: true, pepper: true, cayenne: true, jalapeno: true, ginger: true, garlic: true,
  onion: true, mustard: true, curry: true, paprika: true, cinnamon: true, clove: true,
  turmeric: true, cumin: true, sriracha: true, horseradish: true, wasabi: true,

  // Watery/Hydrating ingredients
  water: true, broth: true, stock: true, milk: true, cream: true, yogurt: true, coconut: true,
  cucumber: true, tomato: true, wine: true, vinegar: true, lemon: true, lime: true, orange: true,
  fish: true, seafood: true, shrimp: true, salmon: true, tuna: true, soup: true, sauce: true,
  watermelon: true, melon: true, lettuce: true, celery: true, zucchini: true, sake: true,
  squid: true,

  // Grounding/Heavy ingredients
  potato: true, rice: true, bread: true, pasta: true, noodle: true, flour: true, wheat: true,
  oat: true, corn: true, bean: true, lentil: true, chickpea: true, mushroom: true, carrot: true,
  cheese: true, beef: true, pork: true, lamb: true, meat: true, tofu: true, nut: true, egg: true,
  butter: true, chicken: true, duck: true, quinoa: true, barley: true, beet: true, turnip: true,
  tempeh: true, turkey: true,

  // Light/Aromatic ingredients
  herb: true, basil: true, mint: true, cilantro: true, parsley: true, dill: true, thyme: true,
  rosemary: true, oregano: true, sage: true, lemongrass: true, scallion: true, spinach: true,
  kale: true, cabbage: true, broccoli: true, arugula: true, sprout: true,

  // Oils and fats
  oil: true, olive: true, sesame: true, ghee: true,

  // Sweeteners
  sugar: true, honey: true, maple: true, chocolate: true,

  // Sauces and condiments
  soy: true, miso: true, tahini: true,

  // Coffee and tea
  coffee: true, espresso: true, tea: true, matcha: true,

  // Fruits
  apple: true, banana: true, berry: true, mango: true, papaya: true, pineapple: true,

  // Thai/Southeast Asian ingredients
  galangal: true, pandan: true, shallot: true, tamarind: true, "nam prik pao": true,
  "morning glory": true, jackfruit: true, "palm sugar": true, "star anise": true,
  "five spice": true, cardamom: true, kabocha: true, pumpkin: true, squash: true,

  // French ingredients
  shallots: true, "crème fraîche": true, brioche: true, baguette: true, croissant: true,
  anchovy: true, anchovies: true, cognac: true, brandy: true, sole: true, "sea bass": true,
  bacon: true, pancetta: true, lardons: true, ham: true, pastry: true, "choux pastry": true,
  shortcrust: true, "bay leaf": true, "bouquet garni": true, yeast: true,

  // Common seasonings
  salt: true, "sea salt": true,

  // Ice/frozen ingredients
  ice: true, "shaved ice": true, "crushed ice": true,

  // Syrups and jellies
  syrup: true, "grass jelly": true,

  // Additional seafood
  prawn: true, prawns: true, "tiger prawns": true, crab: true, lobster: true,
  mussel: true, mussels: true, clam: true, oyster: true, scallop: true,

  // Vinaigrettes and dressings
  vinaigrette: true, dressing: true,
};

// Cooking method mappings (synchronized with writeEnrichedData.ts)
const METHOD_ELEMENTAL_MAP: Record<string, boolean> = {
  // High heat methods
  roasting: true, roast: true, grilling: true, grill: true, grilled: true,
  charring: true, broiling: true, searing: true,

  // Pan/Oil cooking
  frying: true, fry: true, fried: true, "deep-frying": true, "deep-fried": true,
  sauteing: true, saute: true, sautéing: true, sauté: true, "stir-frying": true,
  "stir-fry": true, "pan-frying": true, toasting: true,

  // Oven methods
  baking: true, bake: true, baked: true,

  // Wet cooking methods
  boiling: true, boil: true, boiled: true, steaming: true, steam: true, steamed: true,
  simmering: true, simmer: true, simmered: true, poaching: true, poach: true, poached: true,
  blanching: true, blanch: true, "water bath": true,

  // Mixed methods
  braising: true, braise: true, braised: true, stewing: true, stew: true,

  // Pressure/Slow cooking
  pressure_cooking: true, "pressure cooking": true, sous_vide: true, "sous vide": true,
  "slow-cooking": true,

  // Smoking/Curing
  smoking: true, smoke: true, smoked: true, curing: true, cured: true,
  drying: true, dehydrating: true,

  // Fermentation
  fermenting: true, ferment: true, fermented: true, pickling: true, pickled: true,

  // Raw/Cold methods
  raw: true, chilling: true, freezing: true, marinating: true, marinate: true,

  // Mixing/Preparation
  whipping: true, whip: true, mixing: true, blending: true, folding: true,
  kneading: true, whisking: true,

  // Specialty methods
  caramelizing: true, reducing: true, deglazing: true, infusing: true,
  brewing: true, warming: true, reheating: true,

  // Cutting/Prep
  chopping: true, slicing: true, dicing: true, mincing: true,
  grinding: true, pureeing: true, mashing: true,

  // Additional culinary methods
  "sauce-making": true, soaking: true, assembling: true, "pastry-making": true,
  piping: true, glazing: true, coating: true, stuffing: true, layering: true,
  resting: true, tempering: true, emulsifying: true,
};

function findIngredientMatch(name: string): boolean {
  const lname = name.toLowerCase();
  if (INGREDIENT_ELEMENTAL_MAP[lname]) return true;
  for (const key of Object.keys(INGREDIENT_ELEMENTAL_MAP)) {
    if (lname.includes(key) || key.includes(lname)) return true;
  }
  return false;
}

function findMethodMatch(name: string): boolean {
  const lname = name.toLowerCase().trim();
  if (METHOD_ELEMENTAL_MAP[lname]) return true;
  const hyphenated = lname.replace(/\s+/g, "-");
  if (METHOD_ELEMENTAL_MAP[hyphenated]) return true;
  for (const key of Object.keys(METHOD_ELEMENTAL_MAP)) {
    if (lname.includes(key) || key.includes(lname)) return true;
  }
  return false;
}

// Parse command line arguments
const args = process.argv.slice(2);
const cuisineIndex = args.findIndex(a => a === "--cuisine");
const filterCuisine = cuisineIndex !== -1 && args[cuisineIndex + 1] ? args[cuisineIndex + 1] : null;

const cuisinesDir = path.join(process.cwd(), "src", "data", "cuisines");

// Get all cuisine files
let cuisineFiles = fs.readdirSync(cuisinesDir).filter(f =>
  f.endsWith(".ts") && f !== "index.ts" && f !== "template.ts" && f !== "culinaryTraditions.ts"
);

// Filter by cuisine if specified
if (filterCuisine) {
  cuisineFiles = cuisineFiles.filter(f => f.toLowerCase().includes(filterCuisine.toLowerCase()));
}

console.log("=" + "=".repeat(79));
console.log("UNMAPPED INGREDIENTS & COOKING METHODS ANALYSIS");
console.log("=".repeat(80));
console.log(`Analyzing ${cuisineFiles.length} cuisine file(s)${filterCuisine ? ` (filtered: ${filterCuisine})` : ""}`);
console.log(`Ingredient mappings: ${Object.keys(INGREDIENT_ELEMENTAL_MAP).length}`);
console.log(`Method mappings: ${Object.keys(METHOD_ELEMENTAL_MAP).length}`);
console.log("");

const unmappedIngredients: Record<string, number> = {};
const unmappedMethods: Record<string, number> = {};
let totalIngredients = 0;
let totalMethods = 0;
let mappedIngredients = 0;
let mappedMethods = 0;

for (const file of cuisineFiles) {
  const content = fs.readFileSync(path.join(cuisinesDir, file), "utf-8");

  // Find ingredient names
  const ingredientPattern = /{\s*name:\s*["']([^"']+)["']/g;
  let match;
  while ((match = ingredientPattern.exec(content)) !== null) {
    const name = match[1];
    // Skip dish names (usually longer than ingredient names or in title case for dishes)
    if (name.length > 30 || (name[0] === name[0].toUpperCase() && name.includes(" "))) continue;

    totalIngredients++;
    if (findIngredientMatch(name)) {
      mappedIngredients++;
    } else {
      unmappedIngredients[name] = (unmappedIngredients[name] || 0) + 1;
    }
  }

  // Find cooking methods (from cookingMethods arrays)
  const methodsArrayMatch = content.match(/cookingMethods:\s*\[([\s\S]*?)\]/g);
  if (methodsArrayMatch) {
    for (const methodsArray of methodsArrayMatch) {
      // Check if it's already enriched (contains objects)
      if (methodsArray.includes("{") && methodsArray.includes("name:")) {
        // Extract method names from objects
        const methodNamePattern = /name:\s*["']([^"']+)["']/g;
        let methodMatch;
        while ((methodMatch = methodNamePattern.exec(methodsArray)) !== null) {
          const methodName = methodMatch[1];
          totalMethods++;
          if (findMethodMatch(methodName)) {
            mappedMethods++;
          } else {
            unmappedMethods[methodName] = (unmappedMethods[methodName] || 0) + 1;
          }
        }
      } else {
        // Extract method strings
        const stringMethodPattern = /["']([^"']+)["']/g;
        let methodMatch;
        while ((methodMatch = stringMethodPattern.exec(methodsArray)) !== null) {
          const methodName = methodMatch[1];
          totalMethods++;
          if (findMethodMatch(methodName)) {
            mappedMethods++;
          } else {
            unmappedMethods[methodName] = (unmappedMethods[methodName] || 0) + 1;
          }
        }
      }
    }
  }
}

// Sort and display results
const sortedIngredients = Object.entries(unmappedIngredients).sort((a, b) => b[1] - a[1]);
const sortedMethods = Object.entries(unmappedMethods).sort((a, b) => b[1] - a[1]);

console.log("UNMAPPED INGREDIENTS (top 50):");
console.log("-".repeat(50));
if (sortedIngredients.length === 0) {
  console.log("  ✓ All ingredients are mapped!");
} else {
  for (const [name, count] of sortedIngredients.slice(0, 50)) {
    console.log("  " + name.padEnd(35) + " " + count + "x");
  }
}
console.log(`\nTotal unique unmapped ingredients: ${sortedIngredients.length}`);
console.log(`Coverage: ${mappedIngredients}/${totalIngredients} (${((mappedIngredients / totalIngredients) * 100).toFixed(1)}%)`);

console.log("\n" + "=".repeat(80));
console.log("UNMAPPED COOKING METHODS (top 30):");
console.log("-".repeat(50));
if (sortedMethods.length === 0) {
  console.log("  ✓ All cooking methods are mapped!");
} else {
  for (const [name, count] of sortedMethods.slice(0, 30)) {
    console.log("  " + name.padEnd(35) + " " + count + "x");
  }
}
console.log(`\nTotal unique unmapped methods: ${sortedMethods.length}`);
console.log(`Coverage: ${mappedMethods}/${totalMethods} (${((mappedMethods / totalMethods) * 100).toFixed(1)}%)`);

console.log("\n" + "=".repeat(80));
console.log("SUMMARY");
console.log("=".repeat(80));
console.log(`Ingredient coverage: ${((mappedIngredients / totalIngredients) * 100).toFixed(1)}%`);
console.log(`Method coverage: ${((mappedMethods / totalMethods) * 100).toFixed(1)}%`);

if (sortedIngredients.length > 0 || sortedMethods.length > 0) {
  console.log("\nSuggestion: Add the most common unmapped items to INGREDIENT_ELEMENTAL_MAP or METHOD_ELEMENTAL_MAP");
}
