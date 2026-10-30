import {
  emptyFeatures,
  FEATURE_KEYS,
  type CourseKey,
  type FeatureKey,
  type FeatureVector,
} from "./catalogContract";
import { normalizeText } from "./dishLexicon";
import {
  COLD_NAME,
  HEAT_METHODS,
  INGREDIENT_TERMS,
  METHOD_EFFECTS,
  METHOD_PATTERNS,
  NAME_TERMS,
  type MethodId,
  type Term,
} from "./featureLexicon";

/** The recipe fields feature extraction reads. `Recipe` satisfies it. */
export interface RecipeSource {
  id: string;
  name: string;
  description?: string;
  cuisine?: string;
  ingredients: ReadonlyArray<{ name: string }>;
  instructions: readonly string[];
  cookingMethod?: readonly string[];
  spiceLevel?: string | number;
  mealType?: string | readonly string[];
  season?: string | readonly string[];
  totalTime?: string;
  numberOfServings?: number;
  elementalProperties?: { Fire: number; Water: number; Earth: number; Air: number };
}

/**
 * Cuisines whose authored `cookingMethod` lists are placeholders. Measured
 * 2026-10-03 over the static catalog: of 501 HSCA recipes, 368 carry exactly
 * ["steaming","simmering","raw"], 131 the same plus "baking", and 2
 * ["steaming","simmering"]. Their methods are read from instructions only.
 */
const PLACEHOLDER_METHOD_CUISINES: ReadonlySet<string> = new Set(["hsca"]);

/** Authored spice labels, mapped onto the 0–1 heat scale. */
const SPICE_LEVELS: Readonly<Record<string, number>> = {
  none: 0,
  low: 0.2,
  mild: 0.25,
  "mild-medium": 0.4,
  medium: 0.55,
  "medium-high": 0.7,
  "medium-hot": 0.7,
  high: 0.8,
  hot: 0.8,
  "very high": 1,
  "very hot": 1,
  fiery: 1,
};

const CHILI = /\b(chil(i|e|li)e?s?|cayenne|jalapenos?|habaneros?|serranos?|gochugaru|gochujang|sriracha|harissa|sambal|chipotles?|red pepper flakes|bird'?s eye|hot sauce|pepper flakes|wasabi|horseradish|scotch bonnet|piri piri|peri peri)\b/;

export interface DishText {
  name: string;
  ingredients: readonly string[];
  instructions: string;
  methods: ReadonlySet<MethodId>;
  courses: readonly CourseKey[];
  minutes: number | null;
  steps: number;
}

function asList(value: string | readonly string[] | undefined): string[] {
  if (value === undefined) return [];
  return typeof value === "string" ? [value] : [...value];
}

export function coursesOf(recipe: RecipeSource): CourseKey[] {
  const courses: CourseKey[] = [];
  for (const raw of asList(recipe.mealType).map(normalizeText)) {
    for (const course of ["breakfast", "lunch", "dinner", "dessert"] satisfies CourseKey[]) {
      if (raw.includes(course) && !courses.includes(course)) courses.push(course);
    }
  }
  return courses;
}

export function minutesOf(recipe: RecipeSource): number | null {
  const minutes = Number(recipe.totalTime);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : null;
}

export function readDishText(recipe: RecipeSource): DishText {
  const instructions = normalizeText(recipe.instructions.join(" "));
  const name = normalizeText(recipe.name);
  const authored = PLACEHOLDER_METHOD_CUISINES.has(normalizeText(recipe.cuisine ?? ""))
    ? ""
    : normalizeText((recipe.cookingMethod ?? []).join(" "));
  const methods = new Set<MethodId>();
  for (const { id, pattern } of METHOD_PATTERNS) {
    if (pattern.test(authored) || pattern.test(instructions) || pattern.test(name)) methods.add(id);
  }
  return {
    name,
    ingredients: recipe.ingredients.map((item) => normalizeText(item.name)),
    instructions,
    methods,
    courses: coursesOf(recipe),
    minutes: minutesOf(recipe),
    steps: recipe.instructions.length,
  };
}

/** 1 − e^(−x/k): 0 at 0, ≈0.63 at k, approaching 1. */
export function saturate(raw: number, k: number): number {
  return raw <= 0 ? 0 : 1 - Math.exp(-raw / k);
}

function termScore(terms: readonly Term[] | undefined, texts: readonly string[]): number {
  let total = 0;
  for (const term of terms ?? []) {
    if (texts.some((text) => term.pattern.test(text))) total += term.weight;
  }
  return total;
}

function rawScores(text: DishText): FeatureVector {
  const raw = emptyFeatures();
  for (const key of FEATURE_KEYS) {
    raw[key] =
      termScore(INGREDIENT_TERMS[key], text.ingredients) +
      termScore(NAME_TERMS[key], [text.name]);
  }
  for (const method of text.methods) {
    for (const [key, points] of Object.entries(METHOD_EFFECTS[method])) {
      if (isFeatureKey(key)) raw[key] += points;
    }
  }
  return raw;
}

function isFeatureKey(value: string): value is FeatureKey {
  return FEATURE_KEYS.some((key) => key === value);
}

export function warmthOf(text: DishText): number {
  const heated = [...text.methods].some((method) => HEAT_METHODS.has(method));
  if (COLD_NAME.test(text.name)) return heated ? 0.25 : 0;
  if (text.courses.includes("dessert") && (text.methods.has("chill") || text.methods.has("freeze"))) return 0.15;
  if (!heated) return text.methods.has("raw") || text.methods.has("chill") ? 0 : 0.35;
  return text.methods.has("chill") ? 0.6 : 1;
}

export function spiceOf(recipe: RecipeSource, text: DishText): number {
  const authored = SPICE_LEVELS[normalizeText(String(recipe.spiceLevel ?? "none")).trim()] ?? 0;
  const chiliLines = text.ingredients.filter((name) => CHILI.test(name)).length;
  return Math.max(authored, Math.min(0.8, chiliLines * 0.35));
}

const CRAFT_METHODS: readonly MethodId[] = ["knead", "ferment", "deep-fry", "slow-cook", "marinate"];

/**
 * Time (log scale, 3 h ≈ full), step count (12 ≈ full) and craft techniques.
 * An unstated time counts as the catalog median, 30 minutes.
 */
export function effortOf(text: DishText): number {
  const minutes = text.minutes ?? 30;
  const time = Math.min(1, Math.log1p(minutes / 10) / Math.log1p(18));
  const steps = Math.min(1, text.steps / 12);
  const craft = CRAFT_METHODS.filter((method) => text.methods.has(method)).length;
  return Math.min(1, 0.55 * time + 0.3 * steps + 0.1 * craft);
}

/** Saturation constants: the raw score at which a feature reads ≈0.63. */
const SATURATION: Readonly<Record<FeatureKey, number>> = {
  warmth: 1, spice: 1, richness: 1.2, crunch: 1, tender: 1, brothy: 0.8,
  fresh: 1.2, umami: 1.2, sweet: 1, hearty: 1.4, effort: 1, adventure: 1,
  smoky: 0.9, aromatic: 1.2, handheld: 0.8, green: 1.6,
};

/** All features except `adventure`, which needs the whole catalog (dishCatalog.ts). */
export function computeFeatures(recipe: RecipeSource, text: DishText): FeatureVector {
  const raw = rawScores(text);
  const features = emptyFeatures();
  for (const key of FEATURE_KEYS) features[key] = saturate(raw[key], SATURATION[key]);
  features.warmth = warmthOf(text);
  features.spice = spiceOf(recipe, text);
  features.effort = effortOf(text);
  if (text.courses.length === 1 && text.courses[0] === "dessert") {
    features.sweet = Math.max(features.sweet, 0.8);
  }
  return features;
}
