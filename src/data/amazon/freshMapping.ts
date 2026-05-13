import type { Ingredient } from "@/types";

export const AMAZON_FRESH_CATEGORIES = [
  "Produce",
  "Dairy, Cheese & Eggs",
  "Meat & Seafood",
  "Pantry Staples",
  "Snack Foods",
  "Frozen Foods",
] as const;

export type AmazonFreshCategory = (typeof AMAZON_FRESH_CATEGORIES)[number];

export const CHAKRA_ALIGNMENTS = [
  "Root/Red",
  "Sacral/Orange",
  "Solar Plexus/Yellow",
  "Heart/Green",
  "Throat/Blue",
  "Third Eye/Indigo",
  "Crown/White",
] as const;

export type ChakraAlignment = (typeof CHAKRA_ALIGNMENTS)[number];

export interface AmazonFreshIngredientMapping {
  originalIngredient: string;
  optimizedSearchString: string;
  categoryNode: AmazonFreshCategory;
  primaryBrand: string;
  alternateBrands?: string[];
  chakraAlignment: ChakraAlignment;
  confidence: "verified_asin" | "optimized_nyc_fresh_query";
  fulfillmentSignal: string;
  rationale: string;
}

const SUBJECTIVE_WORDS = new Set([
  "amazing",
  "best",
  "cheap",
  "cheapest",
  "delicious",
  "favorite",
  "fresh",
  "great",
  "premium",
  "trending",
]);

const QUERY_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "by",
  "for",
  "of",
  "the",
  "to",
  "with",
]);

const COLOR_WORDS = new Set([
  "black",
  "blue",
  "brown",
  "dark",
  "golden",
  "green",
  "orange",
  "purple",
  "red",
  "white",
  "yellow",
]);

const CHAKRA_KEYWORDS: Array<{
  chakra: ChakraAlignment;
  words: string[];
}> = [
  {
    chakra: "Root/Red",
    words: [
      "beet",
      "beets",
      "carrot",
      "carrots",
      "parsnip",
      "potato",
      "potatoes",
      "radish",
      "radishes",
      "rutabaga",
      "strawberry",
      "strawberries",
      "pomegranate",
      "beef",
      "lamb",
      "red",
    ],
  },
  {
    chakra: "Sacral/Orange",
    words: [
      "orange",
      "mango",
      "mangoes",
      "sweet potato",
      "turmeric",
      "salmon",
      "flax",
      "broth",
      "stock",
      "squash",
      "pumpkin",
    ],
  },
  {
    chakra: "Solar Plexus/Yellow",
    words: [
      "banana",
      "bananas",
      "lemon",
      "lemons",
      "pineapple",
      "quinoa",
      "rice",
      "oat",
      "oats",
      "ginger",
      "corn",
      "yellow",
    ],
  },
  {
    chakra: "Heart/Green",
    words: [
      "kale",
      "spinach",
      "broccoli",
      "avocado",
      "avocados",
      "celery",
      "lime",
      "limes",
      "lettuce",
      "arugula",
      "basil",
      "cilantro",
      "parsley",
      "green",
      "matcha",
    ],
  },
  {
    chakra: "Throat/Blue",
    words: [
      "blueberry",
      "blueberries",
      "blackberry",
      "blackberries",
      "kelp",
      "seaweed",
      "coconut water",
      "tea",
      "hibiscus",
    ],
  },
  {
    chakra: "Third Eye/Indigo",
    words: [
      "purple cabbage",
      "eggplant",
      "dark chocolate",
      "walnut",
      "walnuts",
      "chia",
      "acai",
      "plum",
      "plums",
      "purple",
    ],
  },
  {
    chakra: "Crown/White",
    words: [
      "cauliflower",
      "garlic",
      "mushroom",
      "mushrooms",
      "oyster mushroom",
      "sesame",
      "parsnip",
      "white",
    ],
  },
];

const HIGH_VELOCITY_OVERRIDES: Record<
  string,
  {
    search: string;
    category: AmazonFreshCategory;
    brand: string;
    chakra: ChakraAlignment;
  }
> = {
  avocado: {
    search: "Amazon Grocery Medium Hass Avocado",
    category: "Produce",
    brand: "Amazon Grocery",
    chakra: "Heart/Green",
  },
  blueberries: {
    search: "Amazon Grocery Organic Blueberries 1 Pint",
    category: "Produce",
    brand: "Amazon Grocery",
    chakra: "Throat/Blue",
  },
  blueberry: {
    search: "Amazon Grocery Organic Blueberries 1 Pint",
    category: "Produce",
    brand: "Amazon Grocery",
    chakra: "Throat/Blue",
  },
  banana: {
    search: "Amazon Grocery Banana Bunch 4-5 Count",
    category: "Produce",
    brand: "Amazon Grocery",
    chakra: "Solar Plexus/Yellow",
  },
  bananas: {
    search: "Amazon Grocery Banana Bunch 4-5 Count",
    category: "Produce",
    brand: "Amazon Grocery",
    chakra: "Solar Plexus/Yellow",
  },
  egg: {
    search: "Amazon Grocery cage-free large white eggs",
    category: "Dairy, Cheese & Eggs",
    brand: "Amazon Grocery",
    chakra: "Crown/White",
  },
  eggs: {
    search: "Amazon Grocery cage-free large white eggs",
    category: "Dairy, Cheese & Eggs",
    brand: "Amazon Grocery",
    chakra: "Crown/White",
  },
  rice: {
    search: "Amazon Grocery jasmine long grain rice",
    category: "Pantry Staples",
    brand: "Amazon Grocery",
    chakra: "Solar Plexus/Yellow",
  },
  salmon: {
    search: "Whole Foods Market sustainable wild caught Atlantic salmon fillet portion",
    category: "Meat & Seafood",
    brand: "Whole Foods Market",
    chakra: "Sacral/Orange",
  },
};

const LOCAL_BRAND_RULES: Array<{
  brand: string;
  match: (value: string, ingredient?: Ingredient) => boolean;
  attribute?: string;
}> = [
  {
    brand: "Gotham Greens",
    match: (value, ingredient) =>
      hasAny(value, ["lettuce", "arugula", "salad", "basil", "cilantro", "parsley"]) ||
      (ingredient?.category === "culinary_herb" && hasAny(value, ["basil", "cilantro", "parsley"])),
    attribute: "organic",
  },
  {
    brand: "Ithaca Hummus",
    match: (value) => hasAny(value, ["hummus", "dip"]),
    attribute: "cold-crafted",
  },
  {
    brand: "Rick's Picks",
    match: (value) => hasAny(value, ["pickle", "pickles", "fermented vegetable"]),
  },
  {
    brand: "Sfoglini",
    match: (value) => hasAny(value, ["pasta", "rigatoni", "spaghetti", "macaroni"]),
  },
  {
    brand: "Catsmo Smoked Seafood",
    match: (value) => hasAny(value, ["smoked salmon", "lox"]),
  },
  {
    brand: "Elmhurst",
    match: (value) => hasAny(value, ["almond milk", "oat milk", "cashew milk", "plant milk", "nut milk"]),
  },
  {
    brand: "Berry Bissap",
    match: (value) => hasAny(value, ["hibiscus", "bissap"]),
  },
];

export function normalizeAmazonIngredientKey(ingredientName: string): string {
  return ingredientName
    .toLowerCase()
    .trim()
    .replace(/\s*\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getAmazonFreshMapping(
  ingredientOrName: Ingredient | string,
  asin?: string | null,
): AmazonFreshIngredientMapping {
  const ingredient =
    typeof ingredientOrName === "string" ? undefined : ingredientOrName;
  const originalIngredient =
    typeof ingredientOrName === "string"
      ? ingredientOrName
      : ingredientOrName.name;
  const normalized = normalizeAmazonIngredientKey(originalIngredient);
  const override = HIGH_VELOCITY_OVERRIDES[singularize(normalized)] ?? HIGH_VELOCITY_OVERRIDES[normalized];
  const categoryNode = override?.category ?? determineCategory(normalized, ingredient);
  const chakraAlignment = override?.chakra ?? determineChakra(normalized, ingredient);
  const { brand, attribute } = override
    ? { brand: override.brand, attribute: undefined }
    : selectBrandAndAttribute(normalized, categoryNode, chakraAlignment, ingredient);
  const optimizedSearchString =
    override?.search ?? buildOptimizedSearchString(brand, attribute, normalized, categoryNode, chakraAlignment);
  const alternateBrands = getAlternateBrands(brand, categoryNode);

  return {
    originalIngredient,
    optimizedSearchString,
    categoryNode,
    primaryBrand: brand,
    alternateBrands,
    chakraAlignment,
    confidence: asin ? "verified_asin" : "optimized_nyc_fresh_query",
    fulfillmentSignal: fulfillmentSignal(categoryNode, brand),
    rationale: `${brand} plus ${categoryNode} routing narrows Amazon Fresh/Whole Foods results for NYC 10001 while the ${chakraAlignment} mapping preserves the ingredient intent.`,
  };
}

export function getAmazonFreshAlternateSearchString(
  mapping: AmazonFreshIngredientMapping,
  alternateBrand: string,
): string {
  return buildOptimizedSearchString(
    alternateBrand,
    undefined,
    normalizeAmazonIngredientKey(mapping.originalIngredient),
    mapping.categoryNode,
    mapping.chakraAlignment,
  );
}

function buildOptimizedSearchString(
  brand: string,
  attribute: string | undefined,
  normalizedName: string,
  category: AmazonFreshCategory,
  chakra: ChakraAlignment,
): string {
  const core = sanitizeCoreIngredient(normalizedName);
  const attributes = new Set<string>();

  if (attribute) attributes.add(attribute);
  if (brand === "365 by Whole Foods Market" && shouldUseOrganic(core, category, chakra)) {
    attributes.add("organic");
  }
  if (category === "Meat & Seafood" && hasAny(core, ["salmon", "fish", "shrimp", "tuna", "cod"])) {
    attributes.add("sustainable");
    if (hasAny(core, ["salmon", "tuna", "cod", "fish"])) attributes.add("wild caught");
  }
  if (
    !core.includes("milk") &&
    hasAny(core, ["chia", "walnut", "walnuts", "almond", "almonds", "cashew", "sesame"])
  ) {
    attributes.add("raw");
  }
  if (category === "Pantry Staples" && hasAny(core, ["pepper", "cumin", "coriander", "cardamom"])) {
    attributes.add(core.includes("seed") ? "whole" : "ground");
  }

  return compactQuery([brand, ...attributes, core]);
}

function compactQuery(parts: Array<string | undefined>): string {
  const tokens: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    for (const token of part.split(/\s+/)) {
      const clean = token.trim();
      const lower = clean.toLowerCase();
      if (!clean || SUBJECTIVE_WORDS.has(lower)) continue;
      if (QUERY_STOP_WORDS.has(lower) && !parts[0]?.includes("Whole Foods Market")) continue;
      tokens.push(clean);
    }
  }

  return Array.from(new Set(tokens)).join(" ");
}

function sanitizeCoreIngredient(value: string): string {
  return value
    .split(/\s+/)
    .filter((token) => token.length > 0)
    .filter((token) => !SUBJECTIVE_WORDS.has(token))
    .join(" ");
}

function determineCategory(value: string, ingredient?: Ingredient): AmazonFreshCategory {
  if (hasAny(value, ["frozen"])) return "Frozen Foods";
  if (hasAny(value, ["dried fruit", "dried apple", "dried apricot", "raisin", "dates"])) {
    return "Snack Foods";
  }
  if (hasAny(value, ["milk", "yogurt", "cheese", "butter", "egg", "eggs", "cream"])) {
    return "Dairy, Cheese & Eggs";
  }
  if (
    ingredient?.category === "protein" ||
    hasAny(value, ["beef", "chicken", "pork", "lamb", "turkey", "salmon", "fish", "shrimp", "seafood", "tuna", "cod"])
  ) {
    return "Meat & Seafood";
  }
  if (
    ingredient?.category === "fruit" ||
    ingredient?.category === "vegetable" ||
    ingredient?.category === "culinary_herb" ||
    ingredient?.category === "fungi" ||
    hasAny(value, [
      "apple",
      "apples",
      "arugula",
      "asparagus",
      "basil",
      "beet",
      "beets",
      "bell pepper",
      "green pepper",
      "broccoli",
      "cabbage",
      "carrot",
      "carrots",
      "cauliflower",
      "celery",
      "cilantro",
      "cucumber",
      "eggplant",
      "garlic",
      "kale",
      "lemon",
      "lettuce",
      "lime",
      "mango",
      "mushroom",
      "mushrooms",
      "onion",
      "orange",
      "parsley",
      "potato",
      "radish",
      "spinach",
      "tomato",
      "red pepper",
      "yellow pepper",
      "zucchini",
    ])
  ) {
    return "Produce";
  }
  if (
    ingredient?.category === "nut_seed" ||
    hasAny(value, ["nuts", "almonds", "walnuts", "cashews", "seeds", "chia", "cracker", "bar", "dried fruit"])
  ) {
    return "Snack Foods";
  }
  return "Pantry Staples";
}

function determineChakra(value: string, ingredient?: Ingredient): ChakraAlignment {
  for (const { chakra, words } of CHAKRA_KEYWORDS) {
    if (hasAny(value, words)) return chakra;
  }

  const elemental = ingredient?.elementalProperties;
  if (elemental) {
    const top = Object.entries(elemental)
      .sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))[0]?.[0];
    if (top === "Fire") return "Solar Plexus/Yellow";
    if (top === "Water") return "Sacral/Orange";
    if (top === "Air") return "Throat/Blue";
  }

  if (ingredient?.category === "fruit") return "Sacral/Orange";
  if (ingredient?.category === "culinary_herb" || ingredient?.category === "vegetable") {
    return "Heart/Green";
  }
  return "Root/Red";
}

function selectBrandAndAttribute(
  value: string,
  category: AmazonFreshCategory,
  chakra: ChakraAlignment,
  ingredient?: Ingredient,
): { brand: string; attribute?: string } {
  const local = LOCAL_BRAND_RULES.find((rule) => rule.match(value, ingredient));
  if (local) return { brand: local.brand, attribute: local.attribute };

  if (category === "Pantry Staples" && hasAny(value, ["salt", "sugar", "flour", "honey", "syrup"])) {
    return { brand: "Amazon Saver" };
  }

  if (
    category === "Produce" ||
    category === "Snack Foods" ||
    chakra === "Third Eye/Indigo" ||
    chakra === "Crown/White" ||
    hasAny(value, [
      "black pepper",
      "cardamom",
      "cinnamon",
      "coriander",
      "cumin",
      "matcha",
      "miso",
      "nutmeg",
      "olive oil",
      "organic",
      "saffron",
      "turmeric",
      "vinegar",
    ])
  ) {
    return { brand: "365 by Whole Foods Market" };
  }

  return { brand: "Amazon Grocery" };
}

function getAlternateBrands(
  brand: string,
  category: AmazonFreshCategory,
): string[] | undefined {
  if (brand === "Amazon Saver") return ["Amazon Grocery", "365 by Whole Foods Market"];
  if (brand === "Amazon Grocery") return ["365 by Whole Foods Market"];
  if (brand === "365 by Whole Foods Market") return ["Amazon Grocery"];
  if (brand === "Whole Foods Market") return ["365 by Whole Foods Market", "Amazon Grocery"];
  if (category === "Snack Foods") return ["Aplenty", "365 by Whole Foods Market"];
  return ["365 by Whole Foods Market", "Amazon Grocery"];
}

function fulfillmentSignal(category: AmazonFreshCategory, brand: string): string {
  if (brand !== "Amazon Grocery" && brand !== "365 by Whole Foods Market" && brand !== "Amazon Saver") {
    return "NYC regional Fresh/Whole Foods distribution";
  }
  if (category === "Produce") return "Unified Fresh/Whole Foods produce inventory";
  if (category === "Meat & Seafood") return "Refrigerated Amazon Fresh cold-chain aisle";
  if (category === "Frozen Foods") return "Frozen Amazon Fresh logistics";
  if (category === "Dairy, Cheese & Eggs") return "Refrigerated Amazon Fresh dairy aisle";
  return "Shelf-stable Amazon grocery aisle";
}

function shouldUseOrganic(
  core: string,
  category: AmazonFreshCategory,
  chakra: ChakraAlignment,
): boolean {
  if (core.includes("organic")) return false;
  if (category === "Meat & Seafood" || category === "Frozen Foods") return false;
  if (chakra === "Root/Red" || chakra === "Heart/Green" || chakra === "Crown/White") return true;
  return hasColorWord(core);
}

function hasAny(value: string, words: string[]): boolean {
  return words.some((word) => value.includes(word));
}

function hasColorWord(value: string): boolean {
  return value.split(/\s+/).some((token) => COLOR_WORDS.has(token));
}

function singularize(value: string): string {
  if (value.endsWith("ies")) return `${value.slice(0, -3)}y`;
  if (value.endsWith("oes") || value.endsWith("ses") || value.endsWith("xes")) {
    return value.slice(0, -2);
  }
  if (value.endsWith("s") && !value.endsWith("ss")) return value.slice(0, -1);
  return value;
}
