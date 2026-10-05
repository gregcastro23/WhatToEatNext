/**
 * Builds one HSCA cuisine dish from a recipes_database.json record.
 *
 * Shared by generateHscaCuisine.ts, which rewrites the whole cuisine file, and
 * syncHscaCuisine.ts, which updates only the dishes whose source changed. The
 * computed alchemy (elements, ESMS, thermodynamics) is derived from the
 * ingredient list with the live engine, so a rebuilt dish is current.
 */
import { ingredientsMap } from "../../src/data/ingredients/index";
import { fileHscaRecipe } from "../../src/lib/recipes/hscaMealFiling";
import {
  calculateRecipeAlchemicalQuantities,
  calculateRecipeElementalFromIngredients
} from "../../src/utils/recipeAlchemicalQuantities";
import {
  calculateThermodynamics,
  calculateKalchm,
  calculateMonica,
} from "../../src/data/unified/alchemicalCalculations";
import { servingsFromYield } from "./hscaYield";

/** Every live HSCA row carries 4 servings until its yield says otherwise. */
export const PLACEHOLDER_SERVINGS = 4;

export interface RawRecipe {
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
//
// The first version of this parser (see hscaLegacyParse.ts) read only a plain leading number and a
// unit; it mangled everything else the archive writes: "¾ cup flour" (1 piece named "¾ cup
// flour"), "8-10 sheets rice paper" (8 pieces of "-10 sheets rice paper"), "14-ounce can tomatoes"
// (14 pieces of "-ounce can tomatoes"), "1 (14 oz.) can coconut milk", "Salt to taste" (the
// ingredient "salt to taste"), "1/4 cup of oil" (the ingredient "of oil"), and "toasted, chopped
// walnuts" (the ingredient "toasted"). Whatever it sets aside lands in `notes`, so no word of the
// source line is dropped. A range keeps its lower bound as the amount, as the old parser did by
// accident; both bounds are in the notes.

const VULGAR_FRACTIONS: Record<string, string> = {
  "½": "1/2", "¼": "1/4", "¾": "3/4", "⅓": "1/3", "⅔": "2/3", "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8",
};

/** "1 ½" -> "1 1/2", "¾" -> "3/4", "2 – 3" -> "2-3". */
function normalizeNumerals(text: string): string {
  return text
    .replace(/(\d)\s*[–—]\s*(?=\d)/g, "$1-")
    .replace(/(\d)\s*([½¼¾⅓⅔⅛⅜⅝⅞])/g, (_whole, digit: string, fraction: string) => `${digit} ${VULGAR_FRACTIONS[fraction] ?? fraction}`)
    .replace(/[½¼¾⅓⅔⅛⅜⅝⅞]/g, (fraction) => VULGAR_FRACTIONS[fraction] ?? fraction);
}

const NUMBER = String.raw`\d+\s+\d+\/\d+|\d+\/\d+|\d+\.\d+|\d+`;
const QUANTITY = new RegExp(String.raw`^(${NUMBER})(?:(?:\s*-\s*|\s+to\s+)(${NUMBER}))?(?![\d/.])`, "i");
const SIZE_UNITS = String.raw`(?:ounce|oz|inch|pound|lb|gram|g|quart|pint|liter|litre|ml|cup)s?`;
const HYPHEN_SIZE = new RegExp(String.raw`^-(${SIZE_UNITS})(?![a-z])\.?\s*`, "i");
const LEADING_SIZE = new RegExp(String.raw`^((?:${NUMBER})-${SIZE_UNITS})(?![a-z])\.?\s*`, "i");

/** Volume units in teaspoons, so "1 gallon + 2 quarts" can be added up. */
const TEASPOONS: Record<string, number> = {
  teaspoon: 1, teaspoons: 1, tsp: 1, tsps: 1, tablespoon: 3, tablespoons: 3, tbsp: 3, tbsps: 3,
  cup: 48, cups: 48, pint: 96, pints: 96, quart: 192, quarts: 192, gallon: 768, gallons: 768,
};
const NUMBER_WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

function numberValue(token: string): number {
  const mixed = token.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed?.[1] && mixed[2] && mixed[3]) return parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / parseInt(mixed[3], 10);
  const fraction = token.match(/^(\d+)\/(\d+)$/);
  if (fraction?.[1] && fraction[2]) return parseInt(fraction[1], 10) / parseInt(fraction[2], 10);
  return parseFloat(token);
}

const ADJECTIVE_HEAD = /^(skinless|boneless|toasted|cold|organic|ripe|firm|hot|warm|plain|unsweetened|sweetened|coarse|fine|extra|raw|roasted|dry|dried|fresh|frozen|canned|thin|thick|soft|hard|lean|light|dark|young|baby|sweet|sour|mild|spicy|crisp|crusty|large|small|medium|whole)$/i;
const PURPOSE_TAIL = /\s+(to taste|as needed|for (?:garnish|garnishing|serving|frying|deep-frying|pan-frying|greasing|brushing|dusting|dredging|rolling|ramekins|the pan|topping|top|drizzling|sprinkling|glazing|coating|basting|cooking|finishing|dipping|decoration|decorating)\b.*|to (?:pan fry|deep fry|fry|garnish|serve)\b.*)$/i;

/** The first comma that is not inside parentheses: "juice (optional, as starter)" has none. */
function firstTopLevelComma(text: string): number {
  let depth = 0;
  for (const [index, char] of [...text].entries()) {
    if (char === "(") depth += 1;
    else if (char === ")") depth = Math.max(0, depth - 1);
    else if (char === "," && depth === 0) return index;
  }
  return -1;
}

/** "toasted, chopped walnuts" is one ingredient, not "toasted" with a note; leading adjectives join their list. */
function joinAdjectiveList(text: string): string {
  let joined = text;
  for (let i = 0; i < 4; i += 1) {
    const comma = firstTopLevelComma(joined);
    if (comma === -1) break;
    const head = joined.slice(0, comma).trim();
    const tail = joined.slice(comma + 1).trim();
    if (tail === "" || !head.split(/\s+/).every((word) => ADJECTIVE_HEAD.test(word))) break;
    joined = `${head} ${tail}`;
  }
  return joined;
}

export function parseIngredientString(ingStr: string) {
  let amount = 1;
  let unit = "piece";
  const front: string[] = [];

  let rest = normalizeNumerals(ingStr.trim()).replace(/^(approximately|about|around)\s+/i, "");

  const label = rest.match(/^garnish:\s*/i);
  if (label) {
    front.push("garnish");
    rest = rest.slice(label[0].length);
  }
  const modifier = rest.match(/^(scant|heaping|heaped|generous|level|rounded)\s+/i);
  if (modifier?.[1]) {
    front.push(modifier[1].toLowerCase());
    rest = rest.slice(modifier[0].length);
  }

  let hyphenSized = false;
  let firstUnitText = "";
  const quantity = rest.match(QUANTITY);
  const textNumMatch = rest.match(/^(one|two|three|four|five|six|seven|eight|nine|ten)\s*(.*)$/i);
  if (quantity?.[1]) {
    amount = numberValue(quantity[1]);
    rest = rest.slice(quantity[0].length).trimStart();
    const high = quantity[2];
    if (high !== undefined) {
      const countSize = rest.match(new RegExp(String.raw`^(${SIZE_UNITS})(?![a-z])\.?\s*`, "i"));
      if (/^\d+\/\d+$/.test(high) && /^\d+$/.test(quantity[1]) && numberValue(high) < amount) {
        // "1-1/2" is a mixed number.
        amount += numberValue(high);
      } else if (
        countSize?.[1] &&
        (numberValue(high) < amount ||
          (!/s$/i.test(countSize[1]) && /^(?:packages?|cans?|jars?|bags?|bottles?|boxe?s?|skewers?)(?![a-z])/i.test(rest.slice(countSize[0].length))))
      ) {
        // "2-8 ounce packages" and "12-8 inch skewers" are a count and a size, not a range.
        front.push(`${high}-${countSize[1].toLowerCase()}`);
        rest = rest.slice(countSize[0].length);
      } else {
        // "1-1 1/2" and "8-10" are ranges.
        front.push(`${quantity[1]}-${high}`);
      }
    }
    const hyphenSize = rest.match(HYPHEN_SIZE);
    if (hyphenSize?.[1]) {
      // "14-ounce can": the number is a size, the count is one.
      front.push(`${quantity[1]}-${hyphenSize[1].toLowerCase()}`);
      hyphenSized = true;
      amount = 1;
      rest = rest.slice(hyphenSize[0].length);
    }
  } else if (textNumMatch?.[1]) {
    const wordMap: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      six: 6, seven: 7, eight: 8, nine: 9, ten: 10
    };
    amount = wordMap[textNumMatch[1].toLowerCase()] || 1;
    rest = textNumMatch[2] ?? "";
  }

  // A size ahead of the container: "1 28-ounce can", "Six 8-inch skewers", "1 (14 oz.) can".
  const leadingSize = rest.match(LEADING_SIZE);
  if (leadingSize?.[1]) {
    front.push(leadingSize[1].toLowerCase());
    rest = rest.slice(leadingSize[0].length).replace(/^,\s*/, "");
  } else {
    const parenSize = rest.match(/^\(([^)]*)\)\s*,?\s*/);
    if (parenSize?.[1] && quantity?.[1]) {
      front.push(parenSize[1]);
      rest = rest.slice(parenSize[0].length);
    }
  }

  // N garlic cloves is N cloves of garlic (the importer read "g" out of "garlic"; see #937).
  const garlic = rest.match(/^garlic\s+(cloves?)(?![a-z])\s*/i);
  let matchedUnit = "";
  if (garlic?.[1]) {
    unit = garlic[1].toLowerCase();
    matchedUnit = unit;
    rest = `garlic${rest.slice(garlic[0].length)}`;
  }

  // Unit patterns
  const units = [
    "cups?", "teaspoons?", "tsps?", "tablespoons?", "tbsps?", "ounces?", "ozs?", "pounds?", "lbs?", "grams?", "g",
    "cloves?", "cans?", "pinches?", "sprigs?", "stalks?", "pieces?", "slices?", "fillets?", "heads?", "bunches?",
    "pints?", "quarts?", "gallons?", "bottles?", "jars?", "packages?", "bags?", "handfuls?", "cans?"
  ];

  // A unit must be a whole word: without the lookahead "4 Granny Smith apples"
  // read as 4 g of "ranny smith apples", and "Canola oil" as a can of "ola oil".
  const unitRegex = new RegExp(`^(${units.join("|")})(?![a-z])\\.?\\s*(.*)$`, "i");
  const unitMatch = garlic ? null : rest.match(unitRegex);

  if (unitMatch?.[1]) {
    unit = unitMatch[1].toLowerCase();
    firstUnitText = unitMatch[1];
    matchedUnit = unit;
    rest = unitMatch[2] ?? "";
  }

  // What may follow the unit: "of", a parenthetical size, a second quantity ("plus 1 teaspoon").
  rest = rest.replace(/^of\s+/i, "");
  const afterUnit = rest.match(/^\(([^)]*)\)\s*,?\s*/);
  if (afterUnit?.[1] && matchedUnit !== "") {
    front.push(afterUnit[1]);
    rest = rest.slice(afterUnit[0].length).replace(/^of\s+/i, "");
  }
  const second = rest.match(
    new RegExp(
      String.raw`^((?:plus|\+)\s*(?:(${NUMBER}|${Object.keys(NUMBER_WORDS).join("|")})\s*)?(${units.join("|")})|and\s+(${NUMBER}|${Object.keys(NUMBER_WORDS).join("|")})\s*(${units.join("|")}))(?![a-z])\.?\s*`,
      "i",
    ),
  );
  if (second?.[1]) {
    const text = second[1].replace(/\s+/g, " ");
    const count = second[2] ?? second[4];
    const secondUnit = (second[3] ?? second[5] ?? "").toLowerCase();
    const value = count === undefined ? 1 : (NUMBER_WORDS[count.toLowerCase()] ?? numberValue(count));
    const first = TEASPOONS[unit];
    const next = TEASPOONS[secondUnit];
    if (first !== undefined && next !== undefined && quantity?.[1] && quantity[2] === undefined && !hyphenSized) {
      // "1 gallon + 2 quarts" is one and a half gallons; the sentence stays in the notes.
      amount += (value * next) / first;
      front.push(`${quantity[1]} ${firstUnitText} ${text}`);
    } else {
      front.push(text);
    }
    rest = rest.slice(second[0].length);
  }

  rest = joinAdjectiveList(rest);

  // Split on first comma for notes
  let name: string;
  let tail = "";
  const commaIdx = firstTopLevelComma(rest);
  if (commaIdx !== -1) {
    tail = rest.substring(commaIdx + 1).trim();
    name = rest.substring(0, commaIdx).trim();
  } else {
    name = rest.trim();
  }

  // Parentheses in the name go to the notes, all of them.
  const inName = [...name.matchAll(/\(([^)]+)\)/g)].map((m) => m[1] ?? "");
  name = name.replace(/\([^)]+\)/g, "").replace(/\s+/g, " ").trim();

  // "salt to taste", "canola oil for frying": the purpose is a note, not part of the ingredient.
  const purpose = name.match(PURPOSE_TAIL);
  if (purpose?.[1]) {
    inName.push(purpose[1]);
    name = name.slice(0, purpose.index).trim();
  }

  const leadingMore = name.match(/^or more\s+/i);
  if (leadingMore) {
    inName.push("or more");
    name = name.slice(leadingMore[0].length).trim();
  }

  // "sea salt or to taste" leaves a dangling "or"; "tamari or more" and "herbs + more" keep the "more".
  const connector = name.match(/\s+(?:(?:or|and|\+)\s+)?more$|\s+(?:or|and)$/i);
  if (connector) {
    if (/more$/i.test(connector[0])) inName.push(connector[0].trim());
    name = name.slice(0, connector.index).trim();
  }

  const notes = [...front, ...inName, ...(tail ? [tail] : [])].join("; ");

  // Final sanitization of ingredient name
  name = name.toLowerCase().replace(/\s+/g, " ").trim();

  // Try to clean common adjectives for better matching
  const cleanName = name
    .replace(/^(organic|fresh|large|medium|small|dry|dried|powdered|raw|extra-virgin|sifted)\s+/gi, "")
    .trim();

  return { amount, unit, name: cleanName, rawName: name, notes };
}

// Parse prep/cook time strings
export function parseTimeMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)\s*(minute|hour)/i);
  if (!match || !match[1] || !match[2]) return 0;
  const val = parseInt(match[1], 10);
  if (match[2].toLowerCase().startsWith("hour")) {
    return val * 60;
  }
  return val;
}

export function buildHscaDish(r: RawRecipe) {
  const recipeName = r.name || r.title || "Unnamed Recipe";

  // The bucket places the dish (and names its static id); `meals` is what it
  // claims, only what the source categories support. See hscaMealFiling.
  const filing = fileHscaRecipe({ name: recipeName, title: r.title, categories: r.categories });
  const mealType = filing.bucket;
  const ownMeals = filing.meals.length === 1 && filing.meals[0] === mealType ? {} : { mealType: filing.meals };

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
          .sort((a, b) => b[1] - a[1]);
        if (sortedElems.length > 0 && sortedElems[0]) {
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

  // Servings: only what the yield says (hscaYield.ts). It used to be the first integer of any
  // yield, so "3 cups" was 3 servings and "9-inch tart" 9. Otherwise the archive-wide placeholder 4.
  const servings = servingsFromYield(r.yield_amount) ?? PLACEHOLDER_SERVINGS;

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
    // standardizeRecipe fills a missing mealType from the bucket, so a dish
    // that claims anything else must carry its own.
    ...ownMeals,
    classifications: {
      mealType: filing.meals,
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

  return {
    dish,
    mealType,
    seasons,
    matchedIngredients: matchedCount,
    totalIngredients: r.ingredients.length,
  };
}

export type HscaBuiltDish = ReturnType<typeof buildHscaDish>;
