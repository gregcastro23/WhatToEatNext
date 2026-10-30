import { z } from "zod";

/**
 * The quiz dish catalog: one compact record per meal-worthy recipe in the
 * static catalog, carrying COMPUTED features (see dishFeatures.ts). Shared by
 * the `/api/quiz/catalog` route (server) and the quiz engine (client).
 *
 * Every feature is a value in [0, 1] computed from the recipe's own
 * ingredient names, method list and instruction text. None is authored by
 * hand per dish, so each one can be reproduced from the recipe and the
 * lexicons in dishLexicon.ts.
 */

export type FeatureKey =
  | "warmth"
  | "spice"
  | "richness"
  | "crunch"
  | "tender"
  | "brothy"
  | "fresh"
  | "umami"
  | "sweet"
  | "hearty"
  | "effort"
  | "adventure"
  | "smoky"
  | "aromatic"
  | "handheld"
  | "green";

/** Wire order of the feature array. Never reorder: clients decode by index. */
export const FEATURE_KEYS: readonly FeatureKey[] = [
  "warmth",
  "spice",
  "richness",
  "crunch",
  "tender",
  "brothy",
  "fresh",
  "umami",
  "sweet",
  "hearty",
  "effort",
  "adventure",
  "smoky",
  "aromatic",
  "handheld",
  "green",
];

export type FeatureVector = Record<FeatureKey, number>;

export type DietKey = "vegetarian" | "vegan" | "pescatarian";
export type AllergenKey =
  | "gluten"
  | "dairy"
  | "eggs"
  | "soy"
  | "peanuts"
  | "tree-nuts"
  | "sesame"
  | "fish"
  | "shellfish";
export type CourseKey = "breakfast" | "lunch" | "dinner" | "dessert";
export type CuisineFamily =
  | "east-asian"
  | "southeast-asian"
  | "south-asian"
  | "middle-eastern"
  | "mediterranean"
  | "eastern-european"
  | "latin-american"
  | "american"
  | "african"
  | "holistic"
  | "fusion";

export interface QuizDish {
  id: string;
  name: string;
  cuisine: string;
  family: CuisineFamily;
  emoji: string;
  blurb: string;
  courses: readonly CourseKey[];
  seasons: readonly string[];
  minutes: number | null;
  servings: number | null;
  diets: readonly DietKey[];
  allergens: readonly AllergenKey[];
  /** Ingredient-group ids (dishLexicon INGREDIENT_GROUPS) named by the recipe. */
  groups: readonly string[];
  features: FeatureVector;
  /** The recipe's own elementalProperties, normalized to sum 1. */
  elements: ElementShares;
}

export interface ElementShares {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

const dishWireSchema = z.object({
  id: z.string().min(1),
  n: z.string().min(1),
  c: z.string(),
  fam: z.enum([
    "east-asian",
    "southeast-asian",
    "south-asian",
    "middle-eastern",
    "mediterranean",
    "eastern-european",
    "latin-american",
    "american",
    "african",
    "holistic",
    "fusion",
  ]),
  e: z.string(),
  b: z.string(),
  co: z.array(z.enum(["breakfast", "lunch", "dinner", "dessert"])),
  se: z.array(z.string()),
  m: z.number().finite().nonnegative().nullable(),
  sv: z.number().finite().positive().nullable(),
  d: z.array(z.enum(["vegetarian", "vegan", "pescatarian"])),
  a: z.array(
    z.enum([
      "gluten",
      "dairy",
      "eggs",
      "soy",
      "peanuts",
      "tree-nuts",
      "sesame",
      "fish",
      "shellfish",
    ]),
  ),
  g: z.array(z.string()),
  f: z.array(z.number().finite().min(0).max(1)).length(FEATURE_KEYS.length),
  el: z.array(z.number().finite().min(0).max(1)).length(4),
});

export const quizCatalogSchema = z.object({
  success: z.literal(true),
  version: z.literal(1),
  generatedFrom: z.string(),
  dishes: z.array(dishWireSchema),
});

export type DishWire = z.infer<typeof dishWireSchema>;
export type QuizCatalogResponse = z.infer<typeof quizCatalogSchema>;

const round2 = (value: number): number => Math.round(value * 100) / 100;

export function encodeDish(dish: QuizDish): DishWire {
  return {
    id: dish.id,
    n: dish.name,
    c: dish.cuisine,
    fam: dish.family,
    e: dish.emoji,
    b: dish.blurb,
    co: [...dish.courses],
    se: [...dish.seasons],
    m: dish.minutes,
    sv: dish.servings,
    d: [...dish.diets],
    a: [...dish.allergens],
    g: [...dish.groups],
    f: FEATURE_KEYS.map((key) => round2(dish.features[key])),
    el: [dish.elements.Fire, dish.elements.Water, dish.elements.Earth, dish.elements.Air].map(round2),
  };
}

export function decodeDish(wire: DishWire): QuizDish {
  const features: FeatureVector = emptyFeatures();
  FEATURE_KEYS.forEach((key, index) => {
    features[key] = wire.f[index] ?? 0;
  });
  return {
    id: wire.id,
    name: wire.n,
    cuisine: wire.c,
    family: wire.fam,
    emoji: wire.e,
    blurb: wire.b,
    courses: wire.co,
    seasons: wire.se,
    minutes: wire.m,
    servings: wire.sv,
    diets: wire.d,
    allergens: wire.a,
    groups: wire.g,
    features,
    elements: {
      Fire: wire.el[0] ?? 0.25,
      Water: wire.el[1] ?? 0.25,
      Earth: wire.el[2] ?? 0.25,
      Air: wire.el[3] ?? 0.25,
    },
  };
}

export function emptyFeatures(): FeatureVector {
  return {
    warmth: 0,
    spice: 0,
    richness: 0,
    crunch: 0,
    tender: 0,
    brothy: 0,
    fresh: 0,
    umami: 0,
    sweet: 0,
    hearty: 0,
    effort: 0,
    adventure: 0,
    smoky: 0,
    aromatic: 0,
    handheld: 0,
    green: 0,
  };
}
