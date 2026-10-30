import {
  emptyFeatures,
  FEATURE_KEYS,
  type CuisineFamily,
  type FeatureVector,
  type QuizDish,
} from "@/lib/quiz/catalogContract";
import { INGREDIENT_GROUPS } from "@/lib/quiz/dishLexicon";
import { mulberry32 } from "../../engine/rng";
import type { QuizMoment, QuizRules } from "../../engine/types";

/** Shared fixtures for the quiz suites. Not a suite: jest ignores /__tests__/helpers/. */

type DishOverrides = Partial<Omit<QuizDish, "features">> & { features?: Partial<FeatureVector> };

export function dish(id: string, overrides: DishOverrides = {}): QuizDish {
  const { features, ...rest } = overrides;
  return {
    id,
    name: id,
    cuisine: "thai",
    family: "southeast-asian",
    emoji: "🍲",
    blurb: "",
    courses: ["dinner"],
    seasons: [],
    minutes: 30,
    servings: 2,
    diets: [],
    allergens: [],
    groups: [],
    elements: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    ...rest,
    features: { ...emptyFeatures(), ...features },
  };
}

export const MOMENT: QuizMoment = {
  timeOfDay: "evening",
  season: "autumn",
  tableSize: 1,
  elementalBias: null,
  planetaryHour: null,
  sky: null,
};

export const NO_RULES: QuizRules = { diet: null, allergens: [] };

const FAMILIES: readonly CuisineFamily[] = [
  "east-asian",
  "southeast-asian",
  "south-asian",
  "mediterranean",
  "latin-american",
  "american",
];

/** A seeded synthetic catalog: varied features, groups, families and times. */
export function syntheticCatalog(size: number, seed = 7): QuizDish[] {
  const random = mulberry32(seed);
  return Array.from({ length: size }, (_, index) => {
    const features = emptyFeatures();
    for (const key of FEATURE_KEYS) features[key] = Math.round(random() * 100) / 100;
    const groups = INGREDIENT_GROUPS.filter(() => random() < 0.18).map((group) => group.id);
    return dish(`dish-${index}`, {
      family: FAMILIES[index % FAMILIES.length] ?? "fusion",
      minutes: 10 + Math.floor(random() * 110),
      groups,
      features,
    });
  });
}
