export type FlavorDirection = "sweeter" | "umami" | "acidic" | "spicier" | "savory";

export interface FlavorTweak {
  id: string;
  direction: FlavorDirection;
  ingredient: string;
  amount: string;
  reason: string;
}

export const FLAVOR_DIRECTIONS: Array<{ key: FlavorDirection; label: string; icon: string }> = [
  { key: "sweeter", label: "Sweeter", icon: "\u{1F36F}" },
  { key: "umami",   label: "Umami",   icon: "\u{1F344}" },
  { key: "acidic",  label: "Acidic",  icon: "\u{1F34B}" },
  { key: "spicier", label: "Spicier", icon: "\u{1F336}" },
  { key: "savory",  label: "Savory",  icon: "\u{1F9C2}" },
];

const CATALOG: Record<FlavorDirection, Array<Omit<FlavorTweak, "id" | "direction">>> = {
  sweeter: [
    { ingredient: "honey", amount: "1 tsp", reason: "Rounds out acidity, deepens caramel notes" },
    { ingredient: "maple syrup", amount: "1 tsp", reason: "Adds warm sweetness without overpowering" },
    { ingredient: "brown sugar", amount: "½ tsp", reason: "Brings molasses depth" },
    { ingredient: "date paste", amount: "1 tsp", reason: "Natural sweetness with fiber" },
    { ingredient: "roasted carrot purée", amount: "1 tbsp", reason: "Savory sweetness" },
  ],
  umami: [
    { ingredient: "fish sauce", amount: "a dash (¼ tsp)", reason: "Concentrated glutamates" },
    { ingredient: "soy sauce", amount: "½ tsp", reason: "Rich fermented depth" },
    { ingredient: "miso paste", amount: "½ tsp", reason: "Mellow umami backbone" },
    { ingredient: "parmesan rind (simmered)", amount: "1 piece", reason: "Slow-release glutamate" },
    { ingredient: "dried mushroom powder", amount: "¼ tsp", reason: "Plant-based umami" },
    { ingredient: "tomato paste", amount: "1 tsp", reason: "Concentrated fruity umami" },
  ],
  acidic: [
    { ingredient: "lemon juice", amount: "½ tsp", reason: "Brightens; add at the end" },
    { ingredient: "white wine vinegar", amount: "½ tsp", reason: "Clean acidity" },
    { ingredient: "rice vinegar", amount: "1 tsp", reason: "Mild, slightly sweet acidity" },
    { ingredient: "yogurt", amount: "1 tbsp", reason: "Creamy tartness" },
    { ingredient: "capers (chopped)", amount: "1 tsp", reason: "Briny, pickled brightness" },
  ],
  spicier: [
    { ingredient: "cayenne", amount: "¼ tsp", reason: "Clean heat" },
    { ingredient: "chili flakes", amount: "½ tsp", reason: "Bright, fruity heat" },
    { ingredient: "fresh chili (sliced)", amount: "½ chili", reason: "Fresh grassy heat" },
    { ingredient: "hot sauce", amount: "½ tsp", reason: "Vinegar-spiked lift" },
    { ingredient: "black pepper", amount: "¼ tsp", reason: "Warm, piney heat" },
    { ingredient: "gochujang", amount: "½ tsp", reason: "Fermented sweet heat" },
  ],
  savory: [
    { ingredient: "kosher salt", amount: "⅛ tsp", reason: "Amplifies existing flavors" },
    { ingredient: "caramelized onion", amount: "1 tbsp", reason: "Deep sweet-savory note" },
    { ingredient: "fresh herbs (parsley/thyme)", amount: "1 tbsp", reason: "Green savory lift" },
    { ingredient: "garlic (grated)", amount: "½ clove", reason: "Pungent foundation" },
    { ingredient: "anchovy paste", amount: "¼ tsp", reason: "Invisible savory depth" },
  ],
};

export function suggestTweak(direction: FlavorDirection, existing: FlavorTweak[]): FlavorTweak {
  const pool = CATALOG[direction];
  const usedIngredients = new Set(
    existing.filter((t) => t.direction === direction).map((t) => t.ingredient),
  );
  // Prefer tweaks not yet added; fall back to round-robin if all used.
  const preferred = pool.find((p) => !usedIngredients.has(p.ingredient)) ?? pool[existing.filter((t) => t.direction === direction).length % pool.length];
  return {
    id: `${direction}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    direction,
    ingredient: preferred.ingredient,
    amount: preferred.amount,
    reason: preferred.reason,
  };
}
