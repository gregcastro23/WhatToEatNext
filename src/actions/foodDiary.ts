"use server";

import { foodDiaryService } from "@/services/FoodDiaryService";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
import type {
  CreateFoodDiaryEntryInput,
  UpdateFoodDiaryEntryInput,
  DailyFoodDiarySummary,
  FoodDiaryEntry,
  FoodDiaryStats,
  FoodInsight,
  FoodRating,
  FoodSearchResult,
  MoodTag,
  QuickFoodCategory,
  QuickFoodPreset,
  UserFoodFavorite,
  WeeklyFoodDiarySummary,
} from "@/types/foodDiary";
import type { MealSlot, MealType } from "@/types/menuPlanner";
import type { Recipe } from "@/types/recipe";
import {
  buildDiaryEntryFromPlan,
  type LogFromPlanInput,
} from "@/utils/foodDiary/logMealFromPlan";

/** The id `useFoodDiary` passes for signed-out visitors. */
const GUEST_USER_ID = "guest";

/**
 * Server Actions are public endpoints; `userId` is untrusted input.
 * Guest mode ("guest") stays open for signed-out visitors; any other `userId`
 * must match the caller's authenticated session.
 */
async function requireOwnUserId(userId: string): Promise<string> {
  if (userId === GUEST_USER_ID) return GUEST_USER_ID;
  const { auth } = await import("@/lib/auth/auth");
  const session = await auth();
  const sessionUserId = typeof session?.user?.id === "string" ? session.user.id : "";
  if (!sessionUserId || sessionUserId !== userId) {
    throw new Error("Not authorized for this food diary");
  }
  return userId;
}

export async function getServerDayEntries(
  userId: string,
  date: Date | string,
): Promise<FoodDiaryEntry[]> {
  await requireOwnUserId(userId);
  return typeof date === "string"
    ? foodDiaryService.getDayEntries(userId, new Date(date))
    : foodDiaryService.getDayEntries(userId, date);
}

export async function getServerDailySummary(
  userId: string,
  date: Date | string,
): Promise<DailyFoodDiarySummary> {
  await requireOwnUserId(userId);
  return typeof date === "string"
    ? foodDiaryService.getDailySummary(userId, new Date(date))
    : foodDiaryService.getDailySummary(userId, date);
}

export async function getServerWeeklySummary(
  userId: string,
  date: Date | string,
): Promise<WeeklyFoodDiarySummary> {
  await requireOwnUserId(userId);
  return typeof date === "string"
    ? foodDiaryService.getWeeklySummary(userId, new Date(date))
    : foodDiaryService.getWeeklySummary(userId, date);
}

export async function getServerStats(userId: string): Promise<FoodDiaryStats> {
  await requireOwnUserId(userId);
  return foodDiaryService.getStats(userId);
}

export async function getServerFavorites(
  userId: string,
): Promise<UserFoodFavorite[]> {
  await requireOwnUserId(userId);
  return foodDiaryService.getFavorites(userId);
}

export async function createServerEntry(
  userId: string,
  input: CreateFoodDiaryEntryInput,
): Promise<FoodDiaryEntry> {
  await requireOwnUserId(userId);
  // Convert date if it became a string during Next.js serialization
  const parsedInput = { ...input };
  if (typeof parsedInput.date === "string") {
    parsedInput.date = new Date(parsedInput.date);
  }
  return foodDiaryService.createEntry(userId, parsedInput);
}

export async function updateServerEntry(
  userId: string,
  input: UpdateFoodDiaryEntryInput,
): Promise<FoodDiaryEntry | null> {
  await requireOwnUserId(userId);
  return foodDiaryService.updateEntry(userId, input);
}

export async function deleteServerEntry(
  userId: string,
  entryId: string,
): Promise<boolean> {
  await requireOwnUserId(userId);
  return foodDiaryService.deleteEntry(userId, entryId);
}

export async function rateServerEntry(
  userId: string,
  entryId: string,
  rating: FoodRating,
  moodTags?: MoodTag[],
): Promise<FoodDiaryEntry | null> {
  await requireOwnUserId(userId);
  return foodDiaryService.rateEntry(userId, entryId, rating, moodTags);
}

// Quick-food presets are a shared catalogue, not user data — no owner to check.
export async function getServerQuickFoodPreset(
  presetId: string,
): Promise<QuickFoodPreset | null> {
  return Promise.resolve(foodDiaryService.getQuickFoodPreset(presetId) ?? null);
}

export async function getServerQuickFoodPresets(
  category?: QuickFoodCategory,
): Promise<QuickFoodPreset[]> {
  return Promise.resolve(foodDiaryService.getQuickFoodPresets(category));
}

export async function searchServerFoods(
  userId: string,
  query: string,
): Promise<FoodSearchResult[]> {
  await requireOwnUserId(userId);
  return foodDiaryService.searchFoods(userId, query);
}

export async function addServerToFavorites(
  userId: string,
  entryId: string,
): Promise<UserFoodFavorite | null> {
  await requireOwnUserId(userId);
  return foodDiaryService.addToFavorites(userId, entryId);
}

export async function removeServerFavorite(
  userId: string,
  favoriteIdOrName: string,
): Promise<boolean> {
  await requireOwnUserId(userId);
  return foodDiaryService.removeFavorite(userId, favoriteIdOrName);
}

export async function generateServerInsights(
  userId: string,
): Promise<FoodInsight[]> {
  await requireOwnUserId(userId);
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
): Promise<FoodDiaryEntry> {
  await requireOwnUserId(userId);
  let payload: LogFromPlanInput;
  if (input.mealSlot) {
    payload = {
      mealSlot: input.mealSlot,
      ...(input.date ? { date: input.date } : {}),
      ...(input.time ? { time: input.time } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
    };
  } else if (input.recipe && input.mealType) {
    payload = {
      recipe: input.recipe,
      mealType: input.mealType,
      ...(input.servings !== undefined ? { servings: input.servings } : {}),
      ...(input.date ? { date: input.date } : {}),
      ...(input.time ? { time: input.time } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
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

export interface CookAndLogPlannedMealInput {
  mealSlot?: MealSlot;
  recipe?: Recipe;
  mealType?: MealType;
  servings?: number;
  date?: Date;
  time?: string;
  notes?: string;
}

export interface CookAndLogPlannedMealResult {
  entry: FoodDiaryEntry;
  reward: {
    tokenType: string;
    amount: number;
    hint: string;
  } | null;
}

/**
 * Mark a planned meal as cooked, log it to the user's Food Diary, and credit
 * both the Food Diary quests and the server-only `cooked_recipe` ESMS practice
 * reward (`+4 🝙 Matter`, daily-deduped per recipe).
 */
export async function cookAndLogPlannedMeal(
  inputOrUserId: CookAndLogPlannedMealInput | string,
  maybeInput?: CookAndLogPlannedMealInput,
): Promise<CookAndLogPlannedMealResult> {
  let userId: string;
  let input: CookAndLogPlannedMealInput;
  if (typeof inputOrUserId === "string") {
    userId = inputOrUserId;
    input = maybeInput ?? {};
  } else {
    input = inputOrUserId;
    try {
      const { auth } = await import("@/lib/auth/auth");
      const session = await auth();
      userId =
        typeof session?.user?.id === "string" && session.user.id
          ? session.user.id
          : GUEST_USER_ID;
    } catch {
      userId = GUEST_USER_ID;
    }
  }

  const entry = await logServerMealFromPlan(userId, input);
  const recipeId =
    entry.sourceId ??
    input.mealSlot?.recipe?.id ??
    input.recipe?.id ??
    null;

  let reward: CookAndLogPlannedMealResult["reward"] = null;
  if (userId !== GUEST_USER_ID && recipeId) {
    try {
      await reportQuestEventBestEffort(userId, "cook_recipe");
      const { practiceRewardService } = await import(
        "@/services/practiceRewardService"
      );
      const result = await practiceRewardService.recognize(
        userId,
        "cooked_recipe",
        String(recipeId),
      );
      if (result.rewarded && result.tokenType && result.amount && result.hint) {
        reward = {
          tokenType: result.tokenType,
          amount: result.amount,
          hint: result.hint,
        };
      }
    } catch {
      // Reward failures must not fail diary logging.
    }
  }

  return { entry, reward };
}

