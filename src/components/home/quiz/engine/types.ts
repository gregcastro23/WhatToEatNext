import type {
  AllergenKey,
  CourseKey,
  CuisineFamily,
  DietKey,
  FeatureKey,
  QuizDish,
} from "@/lib/quiz/catalogContract";

export type { AllergenKey, CourseKey, CuisineFamily, DietKey, FeatureKey, QuizDish };

/** Preference direction per feature, roughly −2 (avoid) … +2 (seek). */
export type Leans = Partial<Record<FeatureKey, number>>;

/**
 * What choosing an option says about the meal. Everything here is plain data
 * so asked questions (including generated ones) can be saved and restored.
 */
export interface ChoiceEffect {
  leans?: Leans;
  /** Ingredient groups (dishLexicon) to favor (+) or disfavor (−). */
  groups?: Readonly<Record<string, number>>;
  families?: Readonly<Partial<Record<CuisineFamily, number>>>;
  courses?: Readonly<Partial<Record<CourseKey, number>>>;
  /** A dish's features to move toward: used by dish duels. */
  like?: Readonly<Partial<Record<FeatureKey, number>>>;
  /** Hard rules: dishes naming any of these groups are removed. */
  excludeGroups?: readonly string[];
  /** Hard-ish rule: dishes over twice this are removed, over it penalized. */
  maxMinutes?: number;
  servings?: number;
}

export interface QuizChoice {
  id: string;
  label: string;
  sub?: string;
  emoji?: string;
  effect: ChoiceEffect;
  /** Answers without moving anything ("doesn't land for me"). */
  neutral?: boolean;
  /** Clears the other selections of a multi question ("none"). */
  exclusive?: boolean;
  /** Hidden for these diets (e.g. "Meat" for vegetarians). */
  hiddenFor?: readonly DietKey[];
  /** Rapid-fire: the item this reaction belongs to. */
  item?: string;
}

export type QuestionFormat = "choice" | "multi" | "versus" | "slider" | "rapid" | "duel" | "sky";

export type QuestionFacet =
  | "appetite"
  | "mood"
  | "scene"
  | "texture"
  | "temperature"
  | "flavor"
  | "spice"
  | "richness"
  | "effort"
  | "time"
  | "satiety"
  | "dislikes"
  | "protein"
  | "base"
  | "cuisine"
  | "course"
  | "company"
  | "adventure"
  | "ingredients"
  | "duel"
  | "sky";

export const QUESTION_FACETS: readonly QuestionFacet[] = [
  "appetite", "mood", "scene", "texture", "temperature", "flavor", "spice", "richness", "effort",
  "time", "satiety", "dislikes", "protein", "base", "cuisine", "course", "company", "adventure",
  "ingredients", "duel", "sky",
];

export interface QuizQuestion {
  id: string;
  format: QuestionFormat;
  facet: QuestionFacet;
  eyebrow: string;
  prompt: string;
  sub?: string;
  choices: readonly QuizChoice[];
  /** Sky questions: the glyph shown beside the prompt. */
  glyph?: string;
}

/** A bank entry: a question plus when it may be offered. */
export interface BankQuestion extends QuizQuestion {
  opener?: boolean;
  when?: (moment: QuizMoment) => boolean;
}

export interface QuizRules {
  diet: DietKey | null;
  allergens: readonly AllergenKey[];
}

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type Season = "spring" | "summer" | "autumn" | "winter";

export interface ElementBias {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

/** Everything about "right now" the engine may read. */
export interface QuizMoment {
  timeOfDay: TimeOfDay;
  season: Season;
  tableSize: number;
  elementalBias: ElementBias | null;
  planetaryHour: string | null;
  sky: SkySnapshot | null;
}

export type AspectKind = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export interface SkySnapshot {
  computedAt: string;
  moon: { sign: string; degree: number; hoursLeftInSign: number };
  sun: { sign: string };
  phase: { name: string; illumination: number };
  retrogrades: readonly string[];
  aspect: { a: string; b: string; kind: AspectKind; orb: number } | null;
}

export type QuizAnswers = Readonly<Record<string, readonly string[]>>;

export interface ScoredDish {
  dish: QuizDish;
  probability: number;
}
