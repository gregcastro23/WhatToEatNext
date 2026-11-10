/**
 * Curated Multi-Persona Dietary Adaptation Definitions (Phase 45 Follow-Through).
 *
 * Backs the Persona Selector in `/recipes/[recipeId]`, `DietaryAdaptationPanel`,
 * and `GET /api/recipes/[recipeId]/adapt?persona=<mode>`.
 */
import type { DietaryMode } from "@/utils/dietaryAdaptationState";

export interface DietaryPersonaMetadata {
  key: DietaryMode;
  label: string;
  icon: string;
  personaTitle: string;
  description: string;
}

export const DIETARY_PERSONA_KEYS: readonly DietaryMode[] = [
  "vegan",
  "vegetarian",
  "gluten-free",
  "dairy-free",
  "keto",
  "low-carb",
  "low-fodmap",
  "pescatarian",
  "paleo",
];

export const DIETARY_PERSONAS: readonly DietaryPersonaMetadata[] = [
  {
    key: "vegan",
    label: "Vegan",
    icon: "\u{1F33F}",
    personaTitle: "Botanical Alchemist",
    description: "100% plant-based swaps for meats, seafood, dairy, eggs, and honey.",
  },
  {
    key: "vegetarian",
    label: "Vegetarian",
    icon: "\u{1F957}",
    personaTitle: "Leonardo's Table",
    description: "Replaces land meats and seafood while retaining eggs, dairy, and botanicals.",
  },
  {
    key: "gluten-free",
    label: "Gluten-Free",
    icon: "\u{1F33E}",
    personaTitle: "Wheat-Free Steward",
    description: "Swaps wheat flour, pasta, bread, soy sauce, and barley/rye grains.",
  },
  {
    key: "dairy-free",
    label: "Dairy-Free",
    icon: "\u{1F95B}",
    personaTitle: "Casein & Lactose Clear",
    description: "Replaces butter, milk, cream, yogurt, cheese, and ghee with plant lipids.",
  },
  {
    key: "keto",
    label: "Keto",
    icon: "\u{1F951}",
    personaTitle: "Ketogenic Burner",
    description: "Replaces starches, grains, tubers, and sugars with lipid-rich alternatives.",
  },
  {
    key: "low-carb",
    label: "Low-Carb",
    icon: "\u{1F366}",
    personaTitle: "Glycemic-Light",
    description: "Moderates high-glycemic grains, potatoes, and refined sugars.",
  },
  {
    key: "low-fodmap",
    label: "Low-FODMAP",
    icon: "\u{1F9C4}",
    personaTitle: "Digestive Harmony",
    description: "Replaces high-FODMAP alliums (garlic, onion), wheat, honey, and lactose.",
  },
  {
    key: "pescatarian",
    label: "Pescatarian",
    icon: "\u{1F41F}",
    personaTitle: "Maritime Steward",
    description: "Replaces poultry, beef, pork, and lamb with coastal seafood or tofu.",
  },
  {
    key: "paleo",
    label: "Paleo",
    icon: "\u{1F525}",
    personaTitle: "Ancestral Whole-Food",
    description: "Replaces grains, dairy, legumes, soy, and refined sugar with whole-food swaps.",
  },
];

const MODE_SET = new Set<string>(DIETARY_PERSONA_KEYS);

export function isDietaryMode(value: unknown): value is DietaryMode {
  return typeof value === "string" && MODE_SET.has(value);
}

/** Parse a URL query param (`?persona=` or `?diet=`) into a valid `DietaryMode` or null. */
export function parseDietaryPersonaParam(
  raw: string | string[] | undefined,
): DietaryMode | null {
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (!first) return null;
  const normalized = first.trim().toLowerCase();
  return isDietaryMode(normalized) ? normalized : null;
}

