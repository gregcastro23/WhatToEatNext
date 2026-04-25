"use server";

import { reportQuestEventBestEffort } from "@/services/questEventReporter";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type {
  CreateFoodDiaryEntryInput,
  UpdateFoodDiaryEntryInput,
  FoodRating,
  MoodTag,
  QuickFoodCategory,
} from "@/types/foodDiary";
import type { MealSlot, MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import {
  buildDiaryEntryFromPlan,
  type LogFromPlanInput,
} from "@/utils/foodDiary/logMealFromPlan";

export async function getServerDayEntries(userId: string, date: Date) {
  return typeof date === "string" ? foodDiaryService.getDayEntries(userId, new Date(date)) : foodDiaryService.getDayEntries(userId, date);
}

export async function getServerDailySummary(userId: string, date: Date) {
  return typeof date === "string" ? foodDiaryService.getDailySummary(userId, new Date(date)) : foodDiaryService.getDailySummary(userId, date);
}

export async function getServerWeeklySummary(userId: string, date: Date) {
  return typeof date === "string" ? foodDiaryService.getWeeklySummary(userId, new Date(date)) : foodDiaryService.getWeeklySummary(userId, date);
}

export async function getServerStats(userId: string) {
  return foodDiaryService.getStats(userId);
}

export async function getServerFavorites(userId: string) {
  return foodDiaryService.getFavorites(userId);
}

export async function createServerEntry(userId: string, input: CreateFoodDiaryEntryInput) {
  // Convert date if it became a string during Next.js serialization
  const parsedInput = { ...input };
  if (typeof parsedInput.date === "string") {
    parsedInput.date = new Date(parsedInput.date);
  }
  return foodDiaryService.createEntry(userId, parsedInput);
}

export async function updateServerEntry(userId: string, input: UpdateFoodDiaryEntryInput) {
  return foodDiaryService.updateEntry(userId, input);
}

export async function deleteServerEntry(userId: string, entryId: string) {
  return foodDiaryService.deleteEntry(userId, entryId);
}

export async function rateServerEntry(userId: string, entryId: string, rating: FoodRating, moodTags?: MoodTag[]) {
  return foodDiaryService.rateEntry(userId, entryId, rating, moodTags);
}

export async function getServerQuickFoodPreset(presetId: string) {
  return foodDiaryService.getQuickFoodPreset(presetId);
}

export async function getServerQuickFoodPresets(category?: QuickFoodCategory) {
  return foodDiaryService.getQuickFoodPresets(category);
}

export async function searchServerFoods(userId: string, query: string) {
  return foodDiaryService.searchFoods(userId, query);
}

export async function addServerToFavorites(userId: string, entryId: string) {
  return foodDiaryService.addToFavorites(userId, entryId);
}

export async function removeServerFavorite(
  userId: string,
  favoriteIdOrName: string,
) {
  return foodDiaryService.removeFavorite(userId, favoriteIdOrName);
}

export async function generateServerInsights(userId: string) {
  return foodDiaryService.generateInsights(userId);
}

/**
 * Log a planned meal into the food diary. Accepts either a full MealSlot
 * or a loose { recipe, mealType, servings } shape. Emits quest events so
 * "I ate this" logging still credits streak/meal-type progress.
 */
export async function logServerMealFromPlan(
  userId: string,
  input: {
    mealSlot?: MealSlot;
    recipe?: Recipe;
    mealType?: MealType;
    servings?: number;
    date?: Date;
    time?: string;
    notes?: string;
  },
) {
  let payload: LogFromPlanInput;
  if (input.mealSlot) {
    payload = {
      mealSlot: input.mealSlot,
      date: input.date,
      time: input.time,
      notes: input.notes,
    };
  } else if (input.recipe && input.mealType) {
    payload = {
      recipe: input.recipe,
      mealType: input.mealType,
      servings: input.servings,
      date: input.date,
      time: input.time,
      notes: input.notes,
    };
  } else {
    throw new Error("logServerMealFromPlan requires a mealSlot or recipe+mealType");
  }

  const diaryInput = buildDiaryEntryFromPlan(payload);
  const entry = await foodDiaryService.createEntry(userId, diaryInput);

  // Fire the same quest events as a normal /api/food-diary POST so we stay
  // consistent with streak + meal-type progression.
  await reportQuestEventBestEffort(userId, "log_meal");
  await reportQuestEventBestEffort(userId, `log_${entry.mealType}`);
  await reportQuestEventBestEffort(userId, "log_from_plan");

  try {
    const stats = await foodDiaryService.getStats(userId);
    const streak = stats.trackingStreak;
    if (streak === 3) {
      await reportQuestEventBestEffort(userId, "log_streak_3_days");
    } else if (streak === 7) {
      await reportQuestEventBestEffort(userId, "log_streak_7_days");
    } else if (streak === 30) {
      await reportQuestEventBestEffort(userId, "log_streak_30_days");
    }
  } catch {
    // Stats failures must not break logging.
  }

  return entry;
}
