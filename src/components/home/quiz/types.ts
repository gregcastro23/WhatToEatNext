import type { ElementVector, PalateElement } from "@/utils/guestPalate";

export type QuizMode = "quick" | "deep";
export type QuizDepthMode = QuizMode;
export type QuizQuestionLimit = 8 | 12 | 16 | 20;
export type QuizAnswers = Readonly<Record<string, readonly string[]>>;
export type ESMSKey = "Spirit" | "Essence" | "Matter" | "Substance";
export type ESMSVector = Record<ESMSKey, number>;

export interface QuizContext {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  season: "spring" | "summer" | "autumn" | "winter";
  tableSize: number;
  tableGlyphs: string;
  elementalBias: ElementVector | null;
  isAuthenticated: boolean;
  planetaryHour?: string;
  lunarPhase?: string;
  zodiacSign?: string;
  isDaytime?: boolean;
  weather?: { temperatureC: number; condition: string };
  planetaryPositions?: Readonly<Record<string, string>>;
  /** Authoritative planetary quantities, never inferred from quiz answers. */
  planetaryESMS?: ESMSVector;
}

export type QuizBranchCondition = (
  answers: QuizAnswers,
  context: QuizContext,
) => boolean;

export interface QuizOptionWeight {
  elements: Partial<ElementVector>;
  /** Culinary preference axes only; these are not planetary measurements. */
  esms?: Partial<ESMSVector>;
}

export interface QuizOption {
  id: string;
  label: string;
  sub: string;
  weights: QuizOptionWeight;
  dietaryTags?: readonly string[];
  cookingMethodTag?: string;
  textureTag?: string;
  condition?: QuizBranchCondition;
  /** "None" clears other selections in a multiple-selection question. */
  exclusive?: boolean;
}

export interface QuizQuestion {
  id: string;
  tier: 1 | 2 | 3 | 4 | 5;
  category: "core" | "celestial" | "thermodynamic" | "boundary" | "alchemical";
  prompt: string | ((context: QuizContext, answers: QuizAnswers) => string);
  subprompt?: string;
  options: readonly QuizOption[];
  selection: "single" | "multiple";
  condition?: QuizBranchCondition;
  isQuickQuestion?: boolean;
}

export interface QuizPreferences {
  dietaryStyle: "unrestricted" | "vegetarian" | "vegan" | "pescatarian";
  excludedAllergens: readonly string[];
  cookingMethod: string | null;
  texture: string | null;
  maxMinutes: number | null;
  equipment: string | null;
  proteinFocus: string | null;
  servings: number;
  spiceLevel: "mild" | "medium" | "hot";
  selectedOptions: readonly {
    questionId: string;
    question: string;
    optionId: string;
    label: string;
  }[];
}

export interface QuizReading {
  totals: ElementVector;
  pct: ElementVector;
  dominant: PalateElement;
  secondary: PalateElement;
  /** Preference totals; explicitly separate from context.planetaryESMS. */
  esmsTotals: ESMSVector;
  meal: {
    name: string;
    emoji: string;
    cuisine: string;
    cuisineSlug: string;
    method: string;
    blurb: string;
    prepMinutes: number;
    dietaryMatch: readonly string[];
    suggestedIngredients: readonly string[];
  };
  preferences: QuizPreferences;
  tunedDescription: string;
}

export interface QuizState {
  mode: QuizMode;
  questionLimit: QuizQuestionLimit;
  status: "idle" | "questions" | "result";
  isOpen: boolean;
  currentQuestionId: string;
  answers: QuizAnswers;
  history: readonly string[];
  direction: 1 | -1;
  hydrated: boolean;
}

export type QuizAction =
  | { type: "HYDRATE"; state: QuizState | null }
  | { type: "START" }
  | { type: "CLOSE" }
  | { type: "SELECT"; optionId: string }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "RESTART" }
  | { type: "SET_MODE"; mode: QuizMode }
  | { type: "SET_LIMIT"; questionLimit: QuizQuestionLimit };
