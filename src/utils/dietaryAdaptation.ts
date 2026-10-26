import type { ElementalProperties, Recipe, RecipeIngredient } from "@/types/recipe";
import { computeRecipeNutritionFromIngredients } from "@/utils/ingredientNutritionAggregation";
import {
  calculateRecipeElementalFromIngredients,
  type RecipeAlchemicalSummary,
} from "@/utils/recipeAlchemicalQuantities";
import {
  hasNutritionData,
  normalizeRecipeNutrition,
  type NormalizedRecipeNutrition,
} from "@/utils/recipeNutrition";

export type DietaryMode = "vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "keto" | "low-carb";

export interface IngredientSwap {
  index: number;
  from: RecipeIngredient;
  to: RecipeIngredient;
  reason: string;
}

export interface InstructionEdit {
  index: number;
  from: string;
  to: string;
  swappedTerms: Array<{ from: string; to: string }>;
}

export interface NutritionalDelta {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
}

export interface ElementalDelta {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

export interface AdaptationResult {
  mode: DietaryMode;
  compatible: boolean;
  swaps: IngredientSwap[];
  nutritionalDelta: NutritionalDelta;
  elementalDelta: ElementalDelta;
  adaptedIngredients: RecipeIngredient[];
  adaptedInstructions: string[];
  instructionEdits: InstructionEdit[];
  recomputedElemental: ElementalProperties | null;
  recomputedNutrition: NormalizedRecipeNutrition | null;
  recomputedAlchemical: RecipeAlchemicalSummary | null;
  /** Complete elemental coverage and usable per-serving nutrition; not cooking-method validation. */
  readingsComplete: boolean;
}

export interface SavedVersionRecomputedReadings {
  elementalProperties: ElementalProperties | null;
  nutritionPerServing: NormalizedRecipeNutrition | null;
  alchemicalSummary: RecipeAlchemicalSummary | null;
  isComplete: boolean;
}

export interface AdaptedRecipeDisplayState {
  hasSwaps: boolean;
  activeIngredients: Recipe["ingredients"];
  activeInstructions: string[];
  activeTitle: string;
  activeCartId: string;
  activeElementalProperties: Recipe["elementalProperties"];
  activeNutrition: {
    calories: number | undefined;
    protein: number | undefined;
    carbs: number | undefined;
    fat: number | undefined;
    fiber: number | undefined;
    sodium: number | undefined;
    sugar: number | undefined;
    vitamins: string[] | undefined;
    minerals: string[] | undefined;
  } | null;
  elementalRecomputed: boolean;
  nutritionRecomputed: boolean;
  instructionsRecomputed: boolean;
}

function getRecipeNutrition(recipe: Recipe): AdaptedRecipeDisplayState["activeNutrition"] {
  const norm = normalizeRecipeNutrition({ nutrition: recipe.nutrition });
  if (!norm) return null;
  return {
    calories: norm.calories,
    protein: norm.protein,
    carbs: norm.carbs,
    fat: norm.fat,
    fiber: norm.fiber,
    sodium: norm.sodium ?? undefined,
    sugar: norm.sugar ?? undefined,
    vitamins: norm.vitamins ?? undefined,
    minerals: norm.minerals ?? undefined,
  };
}

export function resolveAdaptedRecipeState(
  recipe: Recipe,
  adaptation: AdaptationResult | null,
): AdaptedRecipeDisplayState {
  const baseNutrition = getRecipeNutrition(recipe);
  if (adaptation && adaptation.swaps.length > 0) {
    const elementalRecomputed = adaptation.recomputedElemental !== null;
    const nutritionRecomputed = adaptation.recomputedNutrition !== null;
    const instructionsRecomputed = adaptation.instructionEdits.length > 0;
    const activeNutrition: AdaptedRecipeDisplayState["activeNutrition"] = adaptation.recomputedNutrition
      ? {
          calories: Math.round(adaptation.recomputedNutrition.calories),
          protein: Math.round(adaptation.recomputedNutrition.protein * 10) / 10,
          carbs: Math.round(adaptation.recomputedNutrition.carbs * 10) / 10,
          fat: Math.round(adaptation.recomputedNutrition.fat * 10) / 10,
          fiber: Math.round(adaptation.recomputedNutrition.fiber * 10) / 10,
          sodium:
            adaptation.recomputedNutrition.sodium !== undefined
              ? Math.round(adaptation.recomputedNutrition.sodium)
              : undefined,
          sugar:
            adaptation.recomputedNutrition.sugar !== undefined
              ? Math.round(adaptation.recomputedNutrition.sugar * 10) / 10
              : undefined,
          vitamins: adaptation.recomputedNutrition.vitamins,
          minerals: adaptation.recomputedNutrition.minerals,
        }
      : baseNutrition;

    return {
      hasSwaps: true,
      activeIngredients: adaptation.adaptedIngredients,
      activeInstructions: adaptation.adaptedInstructions,
      activeTitle: `${recipe.name} (${adaptation.mode})`,
      activeCartId: `${String(recipe.id)}:${adaptation.mode}`,
      activeElementalProperties:
        adaptation.recomputedElemental ?? recipe.elementalProperties,
      activeNutrition,
      elementalRecomputed,
      nutritionRecomputed,
      instructionsRecomputed,
    };
  }
  return {
    hasSwaps: false,
    activeIngredients: recipe.ingredients,
    activeInstructions: recipe.instructions,
    activeTitle: recipe.name,
    activeCartId: String(recipe.id),
    activeElementalProperties: recipe.elementalProperties,
    activeNutrition: baseNutrition,
    elementalRecomputed: false,
    nutritionRecomputed: false,
    instructionsRecomputed: false,
  };
}

interface SwapRule {
  match: (ing: RecipeIngredient) => boolean;
  replace: (ing: RecipeIngredient) => { name: string; unit?: string; category?: string; amountScale?: number };
  reason: string;
  nutritionDelta?: NutritionalDelta;
  elementalDelta?: Partial<ElementalDelta>;
}

const MODE_LABELS: Record<DietaryMode, string> = {
  "vegan": "vegan",
  "vegetarian": "vegetarian",
  "gluten-free": "gluten-free",
  "dairy-free": "dairy-free",
  "keto": "keto",
  "low-carb": "low-carb",
};

export function getModeLabel(mode: DietaryMode): string {
  return MODE_LABELS[mode];
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const PROTECTED_PLANT_COMPOUNDS =
  /\b(?:mock|vegan|vegetarian|plant[- ]based|imitation)\b|\bchicken\s+of\s+the\s+woods\b|\bcrab\s+apples?\b|\b(?:peanut|almond|cashew|sunflower|cocoa|shea|apple|pumpkin|maple)\s+butter\b|\bbutternut\b|\beggplant\b|\baubergine\b|\bcream\s+of\s+tartar\b/i;

/** Match ingredient by lowercase name with word boundaries (avoids matching "ham" in "graham" or "egg" in "eggplant"). */
function nameHas(ing: RecipeIngredient, ...needles: string[]): boolean {
  const n = ing.name.toLowerCase();
  return needles.some((s) => {
    const clean = s.toLowerCase().trim();
    if (!clean) return false;
    if (clean === "anchov") {
      return /\banchov(?:y|ies)\b/i.test(n);
    }
    const pattern = new RegExp(`\\b${escapeRegex(clean)}(?:s|es)?\\b`, "i");
    return pattern.test(n);
  });
}

function isProtectedPlantIngredient(ing: RecipeIngredient): boolean {
  return PROTECTED_PLANT_COMPOUNDS.test(ing.name);
}

function categoryIs(ing: RecipeIngredient, ...cats: string[]): boolean {
  const c = (ing.category ?? "").toLowerCase();
  return cats.some((x) => c === x.toLowerCase());
}

// ── Shared swap rules ────────────────────────────────────────────────

const MEAT_NAMES = [
  "chicken", "beef", "pork", "lamb", "veal", "turkey", "duck",
  "bacon", "ham", "sausage", "prosciutto", "pancetta", "salami",
  "steak", "ground meat", "ground beef", "ground pork", "ground turkey", "ground chicken",
  "ribs", "brisket", "chorizo",
];
const FISH_NAMES = ["fish", "salmon", "tuna", "cod", "shrimp", "prawn", "crab", "lobster", "anchov", "scallop", "squid", "octopus", "mussel", "clam", "oyster"];
const EGG_NAMES = ["egg", "eggs"];
const HONEY_NAMES = ["honey"];

function meatSwap(ing: RecipeIngredient): { name: string; reason: string } {
  const n = ing.name.toLowerCase();
  if (n.includes("ground")) return { name: "crumbled tempeh", reason: "plant-based ground meat swap" };
  if (n.includes("chicken")) return { name: "firm tofu", reason: "mild plant protein swap" };
  if (n.includes("pork") || n.includes("bacon") || n.includes("ham")) return { name: "smoked tempeh", reason: "smoky plant protein swap" };
  if (n.includes("beef") || n.includes("steak") || n.includes("brisket")) return { name: "seitan", reason: "hearty plant protein swap" };
  if (n.includes("sausage")) return { name: "plant-based sausage", reason: "plant-based sausage swap" };
  return { name: "jackfruit", reason: "plant-based protein swap" };
}

function fishSwap(ing: RecipeIngredient): { name: string; reason: string } {
  const n = ing.name.toLowerCase();
  if (n.includes("shrimp") || n.includes("prawn")) return { name: "hearts of palm", reason: "plant-based shellfish swap" };
  if (n.includes("anchov")) return { name: "capers", reason: "briny vegan substitute" };
  return { name: "marinated tofu", reason: "plant-based seafood swap" };
}

// ── Rule builders per mode ────────────────────────────────────────────

function veganRules(): SwapRule[] {
  return [
    {
      match: (ing) => !isProtectedPlantIngredient(ing) && (nameHas(ing, ...MEAT_NAMES) || categoryIs(ing, "protein") && nameHas(ing, ...MEAT_NAMES)),
      replace: (ing) => {
        const s = meatSwap(ing);
        return { name: s.name, unit: ing.unit };
      },
      reason: "Replace animal protein",
      nutritionDelta: { calories: -80, fat: -8, protein: -5 },
      elementalDelta: { Fire: -0.05, Earth: 0.05 },
    },
    {
      match: (ing) => !isProtectedPlantIngredient(ing) && nameHas(ing, ...FISH_NAMES),
      replace: (ing) => {
        const s = fishSwap(ing);
        return { name: s.name, unit: ing.unit };
      },
      reason: "Replace seafood",
      nutritionDelta: { calories: -40, protein: -10 },
      elementalDelta: { Water: -0.03, Earth: 0.03 },
    },
    {
      match: (ing) => !isProtectedPlantIngredient(ing) && nameHas(ing, "butter") && !nameHas(ing, "peanut", "almond", "cashew", "cocoa", "shea", "apple"),
      replace: (ing) => ({ name: "vegan butter", unit: ing.unit }),
      reason: "Replace dairy butter",
      elementalDelta: { Water: -0.02, Earth: 0.02 },
    },
    {
      match: (ing) => !isProtectedPlantIngredient(ing) && nameHas(ing, "milk") && !nameHas(ing, "almond", "oat", "soy", "coconut", "cashew", "rice milk"),
      replace: (ing) => ({ name: "oat milk", unit: ing.unit }),
      reason: "Replace dairy milk",
      nutritionDelta: { calories: -20, fat: -4, protein: -2 },
      elementalDelta: { Water: -0.02, Earth: 0.02 },
    },
    {
      match: (ing) => !isProtectedPlantIngredient(ing) && nameHas(ing, "cream") && !nameHas(ing, "coconut cream", "cashew cream"),
      replace: (ing) => ({ name: "coconut cream", unit: ing.unit }),
      reason: "Replace dairy cream",
      nutritionDelta: { calories: 20, fat: 4 },
    },
    {
      match: (ing) => !isProtectedPlantIngredient(ing) && nameHas(ing, "yogurt", "yoghurt") && !nameHas(ing, "coconut", "soy", "almond"),
      replace: (ing) => ({ name: "coconut yogurt", unit: ing.unit }),
      reason: "Replace dairy yogurt",
    },
    {
      match: (ing) => !isProtectedPlantIngredient(ing) && nameHas(ing, "cheese", "parmesan", "mozzarella", "ricotta", "feta", "cheddar", "gruyere"),
      replace: (ing) => {
        if (nameHas(ing, "parmesan")) return { name: "nutritional yeast", unit: ing.unit };
        if (nameHas(ing, "ricotta")) return { name: "cashew ricotta", unit: ing.unit };
        return { name: "vegan cheese", unit: ing.unit };
      },
      reason: "Replace cheese",
      nutritionDelta: { calories: -50, fat: -6, protein: -4 },
    },
    {
      match: (ing) => !isProtectedPlantIngredient(ing) && nameHas(ing, ...EGG_NAMES),
      replace: (ing) => ({ name: "flax egg (1 tbsp ground flax + 3 tbsp water per egg)", unit: ing.unit }),
      reason: "Replace eggs",
      nutritionDelta: { calories: -40, protein: -6, fat: -3 },
    },
    {
      match: (ing) => nameHas(ing, ...HONEY_NAMES),
      replace: (ing) => ({ name: "maple syrup", unit: ing.unit }),
      reason: "Replace honey",
    },
    {
      match: (ing) => nameHas(ing, "ghee"),
      replace: (ing) => ({ name: "coconut oil", unit: ing.unit }),
      reason: "Replace ghee",
    },
  ];
}

function vegetarianRules(): SwapRule[] {
  return [
    {
      match: (ing) => !isProtectedPlantIngredient(ing) && nameHas(ing, ...MEAT_NAMES),
      replace: (ing) => {
        const s = meatSwap(ing);
        return { name: s.name, unit: ing.unit };
      },
      reason: "Replace animal protein",
      nutritionDelta: { calories: -80, fat: -8, protein: -5 },
      elementalDelta: { Fire: -0.05, Earth: 0.05 },
    },
    {
      match: (ing) => !isProtectedPlantIngredient(ing) && nameHas(ing, ...FISH_NAMES),
      replace: (ing) => {
        const s = fishSwap(ing);
        return { name: s.name, unit: ing.unit };
      },
      reason: "Replace seafood",
      elementalDelta: { Water: -0.03, Earth: 0.03 },
    },
  ];
}

function glutenFreeRules(): SwapRule[] {
  return [
    {
      match: (ing) => nameHas(ing, "flour") && !nameHas(ing, "almond flour", "coconut flour", "rice flour", "chickpea flour", "gluten-free"),
      replace: (ing) => ({ name: "gluten-free flour blend", unit: ing.unit }),
      reason: "Gluten-free flour",
    },
    {
      match: (ing) => nameHas(ing, "pasta", "noodle") && !nameHas(ing, "gluten-free", "rice noodle", "shirataki"),
      replace: (ing) => ({ name: "gluten-free pasta", unit: ing.unit }),
      reason: "Gluten-free pasta",
    },
    {
      match: (ing) => nameHas(ing, "soy sauce") && !nameHas(ing, "tamari"),
      replace: (ing) => ({ name: "tamari", unit: ing.unit }),
      reason: "Gluten-free soy sauce",
    },
    {
      match: (ing) => nameHas(ing, "bread") && !nameHas(ing, "gluten-free"),
      replace: (ing) => ({ name: "gluten-free bread", unit: ing.unit }),
      reason: "Gluten-free bread",
    },
    {
      match: (ing) => nameHas(ing, "couscous", "bulgur", "farro", "semolina", "barley", "rye"),
      replace: (ing) => ({ name: "quinoa", unit: ing.unit }),
      reason: "Gluten-free grain",
    },
    {
      match: (ing) => nameHas(ing, "seitan"),
      replace: (ing) => ({ name: "firm tofu", unit: ing.unit }),
      reason: "Seitan contains gluten",
    },
  ];
}

function dairyFreeRules(): SwapRule[] {
  return [
    {
      match: (ing) => nameHas(ing, "butter") && !nameHas(ing, "peanut", "almond", "cashew"),
      replace: (ing) => ({ name: "olive oil", unit: ing.unit, amountScale: 0.75 }),
      reason: "Replace butter with olive oil",
      nutritionDelta: { fat: -2 },
    },
    {
      match: (ing) => nameHas(ing, "milk") && !nameHas(ing, "almond", "oat", "soy", "coconut", "cashew"),
      replace: (ing) => ({ name: "almond milk", unit: ing.unit }),
      reason: "Replace dairy milk",
    },
    {
      match: (ing) => nameHas(ing, "cream") && !nameHas(ing, "coconut", "cashew"),
      replace: (ing) => ({ name: "coconut cream", unit: ing.unit }),
      reason: "Replace dairy cream",
    },
    {
      match: (ing) => nameHas(ing, "yogurt", "yoghurt") && !nameHas(ing, "coconut", "soy", "almond"),
      replace: (ing) => ({ name: "coconut yogurt", unit: ing.unit }),
      reason: "Replace dairy yogurt",
    },
    {
      match: (ing) => nameHas(ing, "cheese", "parmesan", "mozzarella", "ricotta", "feta", "cheddar"),
      replace: (ing) => ({ name: "dairy-free cheese", unit: ing.unit }),
      reason: "Replace cheese",
    },
    {
      match: (ing) => nameHas(ing, "ghee"),
      replace: (ing) => ({ name: "coconut oil", unit: ing.unit }),
      reason: "Replace ghee",
    },
  ];
}

function ketoRules(): SwapRule[] {
  return [
    {
      match: (ing) => nameHas(ing, "flour") && !nameHas(ing, "almond flour", "coconut flour"),
      replace: (ing) => ({ name: "almond flour", unit: ing.unit, amountScale: 0.75 }),
      reason: "Low-carb flour",
      nutritionDelta: { carbs: -40, calories: -30 },
    },
    {
      match: (ing) => nameHas(ing, "sugar") && !nameHas(ing, "erythritol", "stevia", "monk fruit"),
      replace: (ing) => ({ name: "erythritol", unit: ing.unit }),
      reason: "Low-carb sweetener",
      nutritionDelta: { carbs: -48, calories: -190 },
    },
    {
      match: (ing) => nameHas(ing, "pasta", "noodle") && !nameHas(ing, "shirataki", "zucchini"),
      replace: (ing) => ({ name: "zucchini noodles", unit: ing.unit }),
      reason: "Low-carb noodle",
      nutritionDelta: { carbs: -40, calories: -150 },
    },
    {
      match: (ing) => nameHas(ing, "rice") && !nameHas(ing, "cauliflower"),
      replace: (ing) => ({ name: "cauliflower rice", unit: ing.unit }),
      reason: "Low-carb rice",
      nutritionDelta: { carbs: -35, calories: -130 },
    },
    {
      match: (ing) => nameHas(ing, "potato") && !nameHas(ing, "sweet potato"),
      replace: (ing) => ({ name: "turnip", unit: ing.unit }),
      reason: "Low-carb tuber",
      nutritionDelta: { carbs: -20, calories: -60 },
    },
    {
      match: (ing) => nameHas(ing, "bread") && !nameHas(ing, "keto"),
      replace: (ing) => ({ name: "keto bread (almond flour based)", unit: ing.unit }),
      reason: "Low-carb bread",
      nutritionDelta: { carbs: -24, calories: -80 },
    },
    {
      match: (ing) => nameHas(ing, "honey", "maple syrup", "agave"),
      replace: (ing) => ({ name: "monk fruit sweetener", unit: ing.unit }),
      reason: "Low-carb sweetener",
      nutritionDelta: { carbs: -16, calories: -60 },
    },
  ];
}

function lowCarbRules(): SwapRule[] {
  return [
    {
      match: (ing) => nameHas(ing, "pasta", "noodle") && !nameHas(ing, "shirataki", "zucchini"),
      replace: (ing) => ({ name: "zucchini noodles", unit: ing.unit }),
      reason: "Lower-carb noodle",
      nutritionDelta: { carbs: -40, calories: -150 },
    },
    {
      match: (ing) => nameHas(ing, "rice") && !nameHas(ing, "cauliflower"),
      replace: (ing) => ({ name: "cauliflower rice", unit: ing.unit }),
      reason: "Lower-carb rice",
      nutritionDelta: { carbs: -35, calories: -130 },
    },
    {
      match: (ing) => nameHas(ing, "potato") && !nameHas(ing, "sweet"),
      replace: (ing) => ({ name: "cauliflower", unit: ing.unit }),
      reason: "Lower-carb veg",
      nutritionDelta: { carbs: -20, calories: -60 },
    },
    {
      match: (ing) => nameHas(ing, "flour") && !nameHas(ing, "almond flour", "coconut flour"),
      replace: (ing) => ({ name: "almond flour", unit: ing.unit, amountScale: 0.75 }),
      reason: "Lower-carb flour",
      nutritionDelta: { carbs: -30, calories: -25 },
    },
    {
      match: (ing) => nameHas(ing, "sugar") && !nameHas(ing, "erythritol", "stevia", "monk"),
      replace: (ing) => ({ name: "stevia", unit: ing.unit }),
      reason: "Lower-carb sweetener",
      nutritionDelta: { carbs: -24, calories: -95 },
    },
  ];
}

function rulesFor(mode: DietaryMode): SwapRule[] {
  switch (mode) {
    case "vegan": return veganRules();
    case "vegetarian": return vegetarianRules();
    case "gluten-free": return glutenFreeRules();
    case "dairy-free": return dairyFreeRules();
    case "keto": return ketoRules();
    case "low-carb": return lowCarbRules();
  }
}

/** Detect whether a recipe is already compatible with a given mode. */
export function isAlreadyCompatible(recipe: Recipe, mode: DietaryMode): boolean {
  switch (mode) {
    case "vegan":       return recipe.isVegan === true;
    case "vegetarian":  return recipe.isVegetarian === true || recipe.isVegan === true;
    case "gluten-free": return recipe.isGlutenFree === true;
    case "dairy-free":  return recipe.isDairyFree === true || recipe.isVegan === true;
    case "keto":        return recipe.isKeto === true;
    case "low-carb":    return recipe.isLowCarb === true || recipe.isKeto === true;
  }
}

/** Heuristic fallback: scan ingredients to see if any swap would trigger. */
export function needsAdaptation(recipe: Recipe, mode: DietaryMode): boolean {
  if (isAlreadyCompatible(recipe, mode)) return false;
  const rules = rulesFor(mode);
  return recipe.ingredients.some((ing) => rules.some((r) => r.match(ing)));
}

const LEADING_CULINARY_MODIFIERS =
  /^(?:(?:boneless|skinless|skin-on|unsalted|salted|fresh|raw|cooked|diced|chopped|sliced|minced|grated|shredded|cubed|crumbled|large|medium|small|whole|extra[- ]virgin|heavy|whipping|light|low[- ]sodium|all[- ]purpose|granulated|white|plain|greek)\s+)+/i;

const CORE_SWAP_NOUNS = [
  "chicken breasts",
  "chicken breast",
  "chicken thighs",
  "chicken thigh",
  "ground chicken",
  "ground beef",
  "ground pork",
  "ground turkey",
  "ground meat",
  "soy sauce",
  "chicken",
  "beef",
  "pork",
  "lamb",
  "veal",
  "turkey",
  "duck",
  "bacon",
  "ham",
  "sausage",
  "prosciutto",
  "pancetta",
  "salami",
  "steak",
  "brisket",
  "ribs",
  "chorizo",
  "salmon",
  "tuna",
  "cod",
  "shrimp",
  "prawns",
  "prawn",
  "crab",
  "lobster",
  "anchovies",
  "anchovy",
  "scallops",
  "scallop",
  "squid",
  "octopus",
  "mussels",
  "mussel",
  "clams",
  "clam",
  "oysters",
  "oyster",
  "fish",
  "butter",
  "milk",
  "cream",
  "yogurt",
  "yoghurt",
  "parmesan",
  "mozzarella",
  "ricotta",
  "feta",
  "cheddar",
  "gruyere",
  "cheese",
  "eggs",
  "egg",
  "honey",
  "ghee",
  "flour",
  "pasta",
  "noodles",
  "noodle",
  "bread",
  "couscous",
  "bulgur",
  "farro",
  "semolina",
  "barley",
  "rye",
  "seitan",
  "rice",
  "potatoes",
  "potato",
  "sugar",
];

const PROTECTED_PREFIX_BEFORE_MATCH =
  /(?:vegan|vegetarian|mock|plant[- ]based|imitation|peanut|almond|cashew|sunflower|cocoa|shea|coconut|oat|soy|rice|cauliflower|zucchini|shirataki|gluten[- ]free|dairy[- ]free|sweet|keto|monk\s+fruit)\s+$/i;

const PROTECTED_SUFFIX_AFTER_MATCH =
  /^\s+(?:of\s+the\s+woods|of\s+tartar|apples?|squash|vinegar|wine|paper|noodles?|flour|milk|butter)\b/i;

function cleanInlineTargetName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function buildSourcePhrases(fromName: string): string[] {
  const base = fromName
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .split(",")[0]
    ?.replace(/\s+/g, " ")
    .trim() ?? "";
  const candidates = new Set<string>();
  if (base.length >= 3) {
    candidates.add(base);
    const stripped = base.replace(LEADING_CULINARY_MODIFIERS, "").trim();
    if (stripped.length >= 3) {
      candidates.add(stripped);
    }
  }
  const lower = base.toLowerCase();
  const identity = lower.replace(LEADING_CULINARY_MODIFIERS, "");
  for (const noun of CORE_SWAP_NOUNS) {
    const pattern = new RegExp(`\\b${escapeRegex(noun)}(?:s|es)?\\b`, "i");
    // Only meat cuts may use a shorter protein reference ("chicken breast"
    // → "chicken"). Other compounds must retain their identity: rice noodles
    // are not rice, and chicken broth is not chicken.
    const isMeatCut = /\b(?:breasts?|thighs?|ribs|ground|boneless|skinless)\b/i.test(lower);
    if (pattern.test(lower) && ([noun, `${noun}s`, `${noun}es`].includes(identity) || (isMeatCut && [...MEAT_NAMES, ...FISH_NAMES].includes(noun)))) {
      candidates.add(noun);
    }
  }
  return Array.from(candidates).sort((a, b) => b.length - a.length);
}

function applyCapitalization(matched: string, replacement: string): string {
  if (!matched || !replacement) return replacement;
  const first = matched.charAt(0);
  if (first >= "A" && first <= "Z" && matched.slice(1) === matched.slice(1).toLowerCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/**
 * Recompute step-by-step instructions by replacing swapped ingredient
 * references inline while guarding against compound plant terms.
 */
export function recomputeAdaptedInstructions(
  instructions: readonly string[],
  swaps: readonly IngredientSwap[],
  unchangedIngredients: readonly RecipeIngredient[] = [],
): {
  adaptedInstructions: string[];
  instructionEdits: InstructionEdit[];
} {
  if (swaps.length === 0 || instructions.length === 0) {
    return {
      adaptedInstructions: [...instructions],
      instructionEdits: [],
    };
  }

  const targets = new Map<string, string | null>();
  for (const swap of swaps) {
    const target = cleanInlineTargetName(swap.to.name);
    if (!target) continue;
    for (const phrase of buildSourcePhrases(swap.from.name)) {
      for (const form of [phrase, `${phrase}s`, `${phrase}es`]) {
        const key = form.toLowerCase();
        // Ambiguous shorthand is left for the cook to review.
        targets.set(key, targets.has(key) && targets.get(key) !== target ? null : target);
      }
    }
  }
  for (const ingredient of unchangedIngredients) {
    for (const phrase of buildSourcePhrases(ingredient.name)) {
      for (const form of [phrase, `${phrase}s`, `${phrase}es`]) {
        targets.set(form.toLowerCase(), null);
      }
    }
  }
  const phrases = [...targets.keys()].sort((a, b) => b.length - a.length);
  if (phrases.length === 0) return { adaptedInstructions: [...instructions], instructionEdits: [] };
  const pattern = new RegExp(`\\b(?:${phrases.map(escapeRegex).join("|")})\\b`, "gi");

  const adaptedInstructions: string[] = [];
  const instructionEdits: InstructionEdit[] = [];

  instructions.forEach((step, index) => {
    const swappedTerms: Array<{ from: string; to: string }> = [];
    // Match the original text once. Replacement labels cannot become inputs
    // to subsequent swaps (e.g. eggs → flax egg → flax flax egg).
    const current = step.replace(pattern, (match, offset: number) => {
      const target = targets.get(match.toLowerCase());
      if (!target) return match;
      const before = step.slice(0, offset);
      const after = step.slice(offset + match.length);
      if (PROTECTED_PREFIX_BEFORE_MATCH.test(before) || PROTECTED_SUFFIX_AFTER_MATCH.test(after)) return match;
      const replaced = applyCapitalization(match, target);
      if (replaced.toLowerCase() !== match.toLowerCase()) swappedTerms.push({ from: match, to: replaced });
      return replaced;
    });

    adaptedInstructions.push(current);
    if (current !== step && swappedTerms.length > 0) {
      instructionEdits.push({
        index,
        from: step,
        to: current,
        swappedTerms,
      });
    }
  });

  return { adaptedInstructions, instructionEdits };
}

/**
 * Recompute elements and per-serving nutrition from an adapted ingredient
 * list. Elemental coverage must include every line; nutrition uses the shared
 * mass-completeness gate and requires an authored serving count. ESMS remains
 * unavailable: the legacy aggregator includes synthesized/default quantities.
 */
export function recomputeSavedVersionReadings(recipe: {
  ingredients: Array<Pick<RecipeIngredient, "name" | "amount" | "unit">>;
  numberOfServings?: number;
  servingSize?: number;
  servings?: number;
}): SavedVersionRecomputedReadings {
  const names = recipe.ingredients.map((i) => i.name).filter(Boolean);
  if (names.length === 0) {
    return {
      elementalProperties: null,
      nutritionPerServing: null,
      alchemicalSummary: null,
      isComplete: false,
    };
  }

  const elementalSummary = calculateRecipeElementalFromIngredients(names);
  const elementalProperties =
    elementalSummary && names.length === recipe.ingredients.length && elementalSummary.matchedCount === names.length
      ? elementalSummary.elementalProperties
      : null;

  const servings =
    recipe.numberOfServings ?? recipe.servingSize ?? recipe.servings;
  // The shared aggregator assumes one unit for missing/zero amounts and clamps
  // serving counts below one. Do not present those fallbacks as recomputation.
  const knownAmounts = recipe.ingredients.every((ingredient) =>
    ingredient.name.trim().length > 0 && ingredient.unit.trim().length > 0 &&
    Number.isFinite(ingredient.amount) && ingredient.amount > 0,
  );
  const computedNutrition = knownAmounts && servings !== undefined && Number.isFinite(servings) && servings >= 1
    ? computeRecipeNutritionFromIngredients({
        ingredients: recipe.ingredients,
        numberOfServings: servings,
      })
    : null;
  const nutritionPerServing =
    computedNutrition && hasNutritionData(computedNutrition)
      ? computedNutrition
      : null;

  return {
    elementalProperties,
    nutritionPerServing,
    alchemicalSummary: null,
    isComplete: Boolean(elementalProperties && nutritionPerServing),
  };
}

/** Pure adaptation: returns swaps + deltas + derived ingredient list + recomputed instructions & readings. Never mutates. */
export function adaptRecipe(recipe: Recipe, mode: DietaryMode): AdaptationResult {
  const compatible = isAlreadyCompatible(recipe, mode);
  const rules = rulesFor(mode);

  const swaps: IngredientSwap[] = [];
  const adaptedIngredients: RecipeIngredient[] = [];
  const nutritionalDelta: NutritionalDelta = {};
  const elementalDelta: ElementalDelta = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

  recipe.ingredients.forEach((ing, index) => {
    const rule = rules.find((r) => r.match(ing));
    if (!rule || compatible) {
      adaptedIngredients.push(ing);
      return;
    }
    const spec = rule.replace(ing);
    const category = spec.category ?? ing.category;
    const newIng: RecipeIngredient = {
      name: spec.name,
      unit: spec.unit ?? ing.unit,
      amount: spec.amountScale ? ing.amount * spec.amountScale : ing.amount,
      ...(category !== undefined ? { category } : {}),
      ...(ing.optional !== undefined ? { optional: ing.optional } : {}),
    };
    adaptedIngredients.push(newIng);
    swaps.push({ index, from: ing, to: newIng, reason: rule.reason });

    const nd = rule.nutritionDelta ?? {};
    (Object.keys(nd) as Array<keyof NutritionalDelta>).forEach((k) => {
      const v = nd[k];
      if (v != null) nutritionalDelta[k] = (nutritionalDelta[k] ?? 0) + v;
    });
    const ed = rule.elementalDelta ?? {};
    (Object.keys(ed) as Array<keyof ElementalDelta>).forEach((k) => {
      const v = ed[k];
      if (v != null) elementalDelta[k] = elementalDelta[k] + v;
    });
  });

  const { adaptedInstructions, instructionEdits } = recomputeAdaptedInstructions(
    recipe.instructions ?? [],
    swaps,
    recipe.ingredients.filter((_, index) => !swaps.some((swap) => swap.index === index)),
  );

  let recomputedElemental: ElementalProperties | null = null;
  let recomputedNutrition: NormalizedRecipeNutrition | null = null;
  let recomputedAlchemical: RecipeAlchemicalSummary | null = null;

  if (swaps.length > 0) {
    const recomputed = recomputeSavedVersionReadings({
      ingredients: adaptedIngredients,
      ...(recipe.numberOfServings !== undefined ? { numberOfServings: recipe.numberOfServings } : {}),
      ...(recipe.servingSize !== undefined ? { servingSize: recipe.servingSize } : {}),
    });
    recomputedElemental = recomputed.elementalProperties;
    recomputedNutrition = recomputed.nutritionPerServing;
    recomputedAlchemical = recomputed.alchemicalSummary;

    if (recomputedElemental && recipe.elementalProperties) {
      const activeElemental = recomputedElemental;
      (["Fire", "Water", "Earth", "Air"] as const).forEach((el) => {
        const origVal = recipe.elementalProperties[el];
        if (typeof origVal === "number") {
          elementalDelta[el] = activeElemental[el] - origVal;
        }
      });
    }

    const baseNutrition =
      normalizeRecipeNutrition({ nutrition: recipe.nutrition }) ??
      recomputeSavedVersionReadings(recipe).nutritionPerServing;
    if (recomputedNutrition && baseNutrition) {
      nutritionalDelta.calories = Math.round(recomputedNutrition.calories - baseNutrition.calories);
      nutritionalDelta.protein = Math.round((recomputedNutrition.protein - baseNutrition.protein) * 10) / 10;
      nutritionalDelta.carbs = Math.round((recomputedNutrition.carbs - baseNutrition.carbs) * 10) / 10;
      nutritionalDelta.fat = Math.round((recomputedNutrition.fat - baseNutrition.fat) * 10) / 10;
      nutritionalDelta.fiber = Math.round((recomputedNutrition.fiber - baseNutrition.fiber) * 10) / 10;
      if (recomputedNutrition.sodium !== undefined && baseNutrition.sodium !== undefined) {
        nutritionalDelta.sodium = Math.round(recomputedNutrition.sodium - baseNutrition.sodium);
      }
    }
  }

  const readingsComplete =
    swaps.length > 0 &&
    recomputedElemental !== null &&
    recomputedNutrition !== null;

  return {
    mode,
    compatible,
    swaps,
    nutritionalDelta,
    elementalDelta,
    adaptedIngredients,
    adaptedInstructions,
    instructionEdits,
    recomputedElemental,
    recomputedNutrition,
    recomputedAlchemical,
    readingsComplete,
  };
}
