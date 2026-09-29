import type { ElementVector, PalateElement } from "@/utils/guestPalate";

export type { ElementVector, PalateElement } from "@/utils/guestPalate";
export type QuizMode = "quick" | "deep";
export type QuestionLimit = 8 | 12 | 16 | 20;
export type ESMSKey = "Spirit" | "Essence" | "Matter" | "Substance";
export type ESMSVector = Record<ESMSKey, number>;
export type QuizAnswers = Record<string, readonly string[]>;
export type DietaryStyle =
  | "unrestricted"
  | "vegetarian"
  | "vegan"
  | "pescatarian";

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
  weather?: { temperatureC: number; condition: string };
  planetaryPositions?: Record<string, string>;
  /** Measured planetary quantities. Never inferred from elementalBias. */
  planetaryESMS?: ESMSVector;
}

export type QuizCondition = (
  context: QuizContext,
  answers: QuizAnswers,
) => boolean;
export interface QuizOption {
  id: string;
  label: string;
  sub: string;
  weights: { elements: Partial<ElementVector>; esms?: Partial<ESMSVector> };
  condition?: QuizCondition;
  exclusive?: boolean;
}
export interface QuizQuestion {
  id: string;
  prompt: string | ((context: QuizContext, answers: QuizAnswers) => string);
  subprompt?: string;
  category: "palate" | "context" | "preparation" | "dietary" | "esms";
  tier: 1 | 2 | 3 | 4 | 5;
  selection: "single" | "multiple";
  options: readonly QuizOption[];
  condition?: QuizCondition;
  isQuickQuestion?: boolean;
}
export interface QuizState {
  isOpen: boolean;
  mode: QuizMode;
  questionLimit: QuestionLimit;
  answers: QuizAnswers;
  status: "idle" | "questions" | "result";
  direction: 1 | -1;
  hydrated: boolean;
  currentQuestionId: string | null;
}
export interface QuizPreferences {
  dietaryStyle: DietaryStyle;
  excludedAllergens: readonly string[];
  cookingMethod: string | null;
  texture: string | null;
  maxMinutes: number | null;
  equipment: readonly string[];
  proteinFocus: string | null;
  servings: number;
  spiceLevel: string | null;
}
export interface QuizIngredient {
  name: string;
  amount: number;
  unit: string;
}
export interface QuizMeal {
  name: string;
  emoji: string;
  cuisine: string;
  cuisineSlug: string;
  method: string;
  blurb: string;
  prepMinutes: number;
  dietaryMatch: string;
  suggestedIngredients: readonly QuizIngredient[];
  instructions: readonly string[];
}
export interface QuizReading {
  totals: ElementVector;
  pct: ElementVector;
  dominant: PalateElement;
  secondary: PalateElement;
  /** Expressed culinary preferences; independent of measured sky quantities. */
  esmsTotals: ESMSVector;
  meal: QuizMeal;
  preferences: QuizPreferences;
  selectedOptions: ReadonlyArray<{
    questionId: string;
    question: string;
    optionId: string;
    label: string;
  }>;
  tunedDescription: string;
}

export interface QuizEngine {
  state: QuizState;
  context: QuizContext;
  questions: readonly QuizQuestion[];
  currentQuestion: QuizQuestion | undefined;
  currentOptions: readonly QuizOption[];
  currentIndex: number;
  reading: QuizReading | null;
  canAdvance: boolean;
  start: () => void;
  close: () => void;
  select: (optionId: string) => void;
  next: () => void;
  back: () => void;
  restart: () => void;
  setMode: (mode: QuizMode) => void;
  setQuestionLimit: (questionLimit: QuestionLimit) => void;
}
