import type { useAstrologicalState } from "@/hooks/useAstrologicalState";
import type { MealType } from "@/types/menuPlanner";
import type { RecommendedMeal } from "@/utils/menuPlanner/recommendationBridge";
import type { getPlanetaryDayCharacteristics } from "@/utils/planetaryDayRecommendations";

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export const ELEMENT_ICONS: Record<string, string> = {
  Fire: "🔥",
  Water: "💧",
  Earth: "🌍",
  Air: "💨",
};

export const ELEMENT_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  Fire: { bg: "bg-red-50", text: "text-red-700", bar: "bg-red-500" },
  Water: { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500" },
  Earth: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-600" },
  Air: { bg: "bg-sky-50", text: "text-sky-700", bar: "bg-sky-400" },
};

export const ESMS_COLORS: Record<string, { bg: string; text: string }> = {
  Spirit: { bg: "bg-violet-100", text: "text-violet-700" },
  Essence: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Matter: { bg: "bg-amber-100", text: "text-amber-700" },
  Substance: { bg: "bg-rose-100", text: "text-rose-700" },
};

export interface TasteGraphSnapshot {
  cuisines?: Array<{ name: string; score: number }>;
  cookingMethods?: Array<{ name: string; score: number }>;
  favoriteIngredients?: string[];
  dislikedIngredients?: string[];
  complexityPreference?: "simple" | "moderate" | "complex";
  totalInteractions?: number;
}

export interface CosmicMomentProps {
  planetaryInfo: ReturnType<typeof getPlanetaryDayCharacteristics>;
  lunarPhase: string;
  currentZodiac: string;
  activePlanets: string[];
  domElements: Record<string, number>;
  isPersonalized: boolean;
  planetaryHour: string | null;
}

export interface RecipePayloadItem {
  id?: string;
  name: string;
  cuisine?: string;
  cuisineType?: string;
  prepTime?: string;
  cookTime?: string;
  timeToMake?: string;
  numberOfServings?: number;
  description?: string;
  instructions?: string[];
  ingredients?: Array<{
    name: string;
    amount?: number | string;
    unit?: string;
    optional?: boolean;
    preparation?: string;
    substitutes?: string[];
  }>;
  equipmentNeeded?: string[];
  cookingMethod?: string[];
  cookingTechniques?: string[];
  elementalProperties?: Record<string, number>;
  alchemicalProperties?: Record<string, number | string>;
  seasonalAdaptation?: {
    currentSeason?: string;
    seasonalScore?: number;
    seasonalIngredientSubstitutions?: Array<{ original: string; seasonal: string; reason?: string }>;
  };
  cuisineIntegration?: {
    culturalNotes?: string[];
    traditionalVariations?: string[];
  };
  monicaOptimization?: {
    optimizationScore?: number;
    planetaryTimingRecommendations?: string[];
  };
  isVegan?: boolean;
  isVegetarian?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
}

export interface AddToMealPlannerProps {
  recipe: RecipePayloadItem;
  onClose: () => void;
  onAdded: (day: string, meal: string) => void;
}

export interface FullRecipeCardProps {
  recommendation: RecommendedMeal;
  index: number;
  total: number;
  isPersonalized: boolean;
  onAddToPlanner: (recipe: RecipePayloadItem) => void;
  onSave: (recipe: RecipePayloadItem) => void;
  isLiked: boolean;
  isSaving: boolean;
}

export interface RecipeCarouselProps {
  suggestions: RecommendedMeal[];
  isLoading: boolean;
  isPersonalized: boolean;
  onAddToPlanner: (recipe: RecipePayloadItem) => void;
  onSave: (recipe: RecipePayloadItem) => void;
  likedRecipeIds: Set<string>;
  savingRecipeIds: Set<string>;
}

export interface QuickGenerateBarProps {
  onGenerate: (mealType: MealType) => void;
  onGenerateAll: () => void;
  isGenerating: boolean;
}

export interface RecipeGeneratorLogicReturn {
  astroState: ReturnType<typeof useAstrologicalState>;
  planetaryDayInfo: ReturnType<typeof getPlanetaryDayCharacteristics>;
  isPersonalized: boolean;
  isGenerating: boolean;
  hasGenerated: boolean;
  suggestions: RecommendedMeal[];
  showBuilder: boolean;
  setShowBuilder: React.Dispatch<React.SetStateAction<boolean>>;
  plannerRecipe: RecipePayloadItem | null;
  setPlannerRecipe: React.Dispatch<React.SetStateAction<RecipePayloadItem | null>>;
  toast: string | null;
  likedRecipeIds: Set<string>;
  savingRecipeIds: Set<string>;
  canBuilderGenerate: boolean;
  handleQuickGenerate: (mealType: MealType) => void;
  handleGenerateAll: () => void;
  handleBuilderGenerate: () => void;
  handleSave: (recipe: RecipePayloadItem) => void;
  handleAddedToPlanner: (day: string, meal: string) => void;
}
