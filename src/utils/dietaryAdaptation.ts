import type { Recipe, RecipeIngredient } from "@/types/recipe";

export type DietaryMode = "vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "keto" | "low-carb";

export interface IngredientSwap {
  index: number;
  from: RecipeIngredient;
  to: RecipeIngredient;
  reason: string;
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

/** Match ingredient by lowercase name substring (word-boundary friendly). */
function nameHas(ing: RecipeIngredient, ...needles: string[]): boolean {
  const n = ing.name.toLowerCase();
  return needles.some((s) => n.includes(s.toLowerCase()));
}

function categoryIs(ing: RecipeIngredient, ...cats: string[]): boolean {
  const c = (ing.category || "").toLowerCase();
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
      match: (ing) => nameHas(ing, ...MEAT_NAMES) || categoryIs(ing, "protein") && nameHas(ing, ...MEAT_NAMES),
      replace: (ing) => {
        const s = meatSwap(ing);
        return { name: s.name, unit: ing.unit };
      },
      reason: "Replace animal protein",
      nutritionDelta: { calories: -80, fat: -8, protein: -5 },
      elementalDelta: { Fire: -0.05, Earth: 0.05 },
    },
    {
      match: (ing) => nameHas(ing, ...FISH_NAMES),
      replace: (ing) => {
        const s = fishSwap(ing);
        return { name: s.name, unit: ing.unit };
      },
      reason: "Replace seafood",
      nutritionDelta: { calories: -40, protein: -10 },
      elementalDelta: { Water: -0.03, Earth: 0.03 },
    },
    {
      match: (ing) => nameHas(ing, "butter") && !nameHas(ing, "peanut", "almond", "cashew"),
      replace: (ing) => ({ name: "vegan butter", unit: ing.unit }),
      reason: "Replace dairy butter",
      elementalDelta: { Water: -0.02, Earth: 0.02 },
    },
    {
      match: (ing) => nameHas(ing, "milk") && !nameHas(ing, "almond", "oat", "soy", "coconut", "cashew", "rice milk"),
      replace: (ing) => ({ name: "oat milk", unit: ing.unit }),
      reason: "Replace dairy milk",
      nutritionDelta: { calories: -20, fat: -4, protein: -2 },
      elementalDelta: { Water: -0.02, Earth: 0.02 },
    },
    {
      match: (ing) => nameHas(ing, "cream") && !nameHas(ing, "coconut cream", "cashew cream"),
      replace: (ing) => ({ name: "coconut cream", unit: ing.unit }),
      reason: "Replace dairy cream",
      nutritionDelta: { calories: 20, fat: 4 },
    },
    {
      match: (ing) => nameHas(ing, "yogurt", "yoghurt") && !nameHas(ing, "coconut", "soy", "almond"),
      replace: (ing) => ({ name: "coconut yogurt", unit: ing.unit }),
      reason: "Replace dairy yogurt",
    },
    {
      match: (ing) => nameHas(ing, "cheese", "parmesan", "mozzarella", "ricotta", "feta", "cheddar", "gruyere"),
      replace: (ing) => {
        if (nameHas(ing, "parmesan")) return { name: "nutritional yeast", unit: ing.unit };
        if (nameHas(ing, "ricotta")) return { name: "cashew ricotta", unit: ing.unit };
        return { name: "vegan cheese", unit: ing.unit };
      },
      reason: "Replace cheese",
      nutritionDelta: { calories: -50, fat: -6, protein: -4 },
    },
    {
      match: (ing) => nameHas(ing, ...EGG_NAMES),
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
      match: (ing) => nameHas(ing, ...MEAT_NAMES),
      replace: (ing) => {
        const s = meatSwap(ing);
        return { name: s.name, unit: ing.unit };
      },
      reason: "Replace animal protein",
      nutritionDelta: { calories: -80, fat: -8, protein: -5 },
      elementalDelta: { Fire: -0.05, Earth: 0.05 },
    },
    {
      match: (ing) => nameHas(ing, ...FISH_NAMES),
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

/** Pure adaptation: returns swaps + deltas + derived ingredient list. Never mutates. */
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
    const newIng: RecipeIngredient = {
      ...ing,
      name: spec.name,
      unit: spec.unit ?? ing.unit,
      category: spec.category ?? ing.category,
      amount: spec.amountScale ? ing.amount * spec.amountScale : ing.amount,
      notes: ing.notes,
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

  return {
    mode,
    compatible,
    swaps,
    nutritionalDelta,
    elementalDelta,
    adaptedIngredients,
  };
}
