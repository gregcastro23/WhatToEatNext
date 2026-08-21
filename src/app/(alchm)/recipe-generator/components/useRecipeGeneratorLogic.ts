import { useState, useCallback } from "react";
import { useRecipeBuilder } from "@/contexts/RecipeBuilderContext";
import { useUser } from "@/contexts/UserContext";
import { useAstrologicalState } from "@/hooks/useAstrologicalState";
import type { MealType } from "@/types/menuPlanner";
import { createLogger } from "@/utils/logger";
import { useGenerateRecipeExecution } from "./useGenerateRecipeExecution";
import { useAstroAndUserContext } from "./useRecipeGeneratorState";
import { useSaveRecipeAction } from "./useSaveRecipeAction";
import type { RecipePayloadItem, TasteGraphSnapshot, RecipeGeneratorLogicReturn } from "./types";

const logger = createLogger("RecipeGenerator");

export function useTasteGraph(isAuthed: boolean): {
  tasteGraph: TasteGraphSnapshot | null;
  refreshTasteGraph: () => Promise<void>;
} {
  const [tasteGraph, setTasteGraph] = useState<TasteGraphSnapshot | null>(null);

  const refreshTasteGraph = useCallback(async (): Promise<void> => {
    if (!isAuthed) { setTasteGraph(null); return; }
    try {
      const res = await fetch("/api/user/taste-graph", {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = (await res.json()) as { tasteGraph?: TasteGraphSnapshot };
        setTasteGraph(data.tasteGraph ?? null);
      }
    } catch (error) {
      logger.debug("Taste Graph refresh skipped", error);
    }
  }, [isAuthed]);

  return { tasteGraph, refreshTasteGraph };
}

function usePlannerModalState(): {
  plannerRecipe: RecipePayloadItem | null;
  setPlannerRecipe: React.Dispatch<React.SetStateAction<RecipePayloadItem | null>>;
  toast: string | null;
  handleAddedToPlanner: (day: string, meal: string) => void;
} {
  const [plannerRecipe, setPlannerRecipe] = useState<RecipePayloadItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleAddedToPlanner = (day: string, meal: string): void => {
    setPlannerRecipe(null);
    setToast(`Added to ${day} ${meal}!`);
  };

  return { plannerRecipe, setPlannerRecipe, toast, handleAddedToPlanner };
}

function buildGeneratorActions(
  builder: ReturnType<typeof useRecipeBuilder>,
  generateRecipes: (types: MealType[]) => Promise<void>,
): {
  handleQuickGenerate: (mealType: MealType) => void;
  handleGenerateAll: () => void;
  handleBuilderGenerate: () => void;
} {
  return {
    handleQuickGenerate: (mealType: MealType): void => { generateRecipes([mealType]).catch(() => {}); },
    handleGenerateAll: (): void => { generateRecipes(["breakfast", "lunch", "dinner", "snack"]).catch(() => {}); },
    handleBuilderGenerate: (): void => {
      const types: MealType[] = builder.mealType ? [builder.mealType.toLowerCase() as MealType] : ["breakfast", "lunch", "dinner", "snack"];
      generateRecipes(types).catch(() => {});
    },
  };
}

export function useRecipeGeneratorLogic(): RecipeGeneratorLogicReturn {
  const astroState = useAstrologicalState();
  const { currentUser } = useUser();
  const builder = useRecipeBuilder();
  const [showBuilder, setShowBuilder] = useState(false);
  const planner = usePlannerModalState();

  const ctx = useAstroAndUserContext(astroState, currentUser);
  const { tasteGraph, refreshTasteGraph } = useTasteGraph(Boolean(currentUser?.userId));
  const save = useSaveRecipeAction(Boolean(currentUser?.userId), refreshTasteGraph, (msg) => {
    if (typeof msg === "string" || msg === null) planner.setPlannerRecipe(null);
  });

  const gen = useGenerateRecipeExecution(builder, tasteGraph, ctx.userContext, ctx.convertedAstroState, ctx.currentDay);
  const actions = buildGeneratorActions(builder, gen.generateRecipes);

  return {
    astroState,
    planetaryDayInfo: ctx.planetaryDayInfo,
    isPersonalized: ctx.isPersonalized,
    isGenerating: gen.isGenerating,
    hasGenerated: gen.hasGenerated,
    suggestions: gen.suggestions,
    showBuilder,
    setShowBuilder,
    plannerRecipe: planner.plannerRecipe,
    setPlannerRecipe: planner.setPlannerRecipe,
    toast: planner.toast,
    likedRecipeIds: save.likedRecipeIds,
    savingRecipeIds: save.savingRecipeIds,
    canBuilderGenerate: builder.totalItems > 0 || builder.mealType !== null,
    handleQuickGenerate: actions.handleQuickGenerate,
    handleGenerateAll: actions.handleGenerateAll,
    handleBuilderGenerate: actions.handleBuilderGenerate,
    handleSave: save.handleSave,
    handleAddedToPlanner: planner.handleAddedToPlanner,
  };
}
