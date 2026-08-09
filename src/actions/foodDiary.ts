"use server";

import { auth } from "@/lib/auth/auth";
import { foodDiaryService } from "@/services/FoodDiaryService";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
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

/** The id `useFoodDiary` passes for signed-out visitors. */
const GUEST_USER_ID = "guest";

/**
 * Server Actions are public endpoints. Their action ids ship inside the client
 * bundle (`useFoodDiary` imports these), so anyone who loads the site can invoke
 * them with arguments of their own choosing. A `userId` PARAMETER is therefore
 * untrusted input — it is a claim, never identity.
 *
 * Without this check these actions read and write an arbitrary account's diary:
 * `getEntries` turns the argument straight into `WHERE user_id = $1`, and the
 * write actions (create/update/delete/rate) accept it just as readily. That also
 * bypasses `/api/food-diary`, which authenticates properly via
 * `getUserIdFromRequest` — leaving the actions as the way around the front door.
 *
 * Guest mode is deliberate and stays open: `useFoodDiary` passes "guest" for
 * signed-out visitors, and only authenticated users are routed to the REST API
 * (see the branch at useFoodDiary.ts:142). Anything that is NOT the guest id has
 * to match the caller's own session.
 */
async function requireOwnUserId(userId: string): Promise<string> {
  if (userId === GUEST_USER_ID) return GUEST_USER_ID;

  const session = await auth();
  const sessionUserId =
    typeof session?.user?.id === "string" ? session.user.id : "";

  if (!sessionUserId || sessionUserId !== userId) {
    // Deliberately does not distinguish "signed out" from "wrong user" — that
    // difference tells a caller whether a given id exists.
    throw new Error("Not authorized for this food diary");
  }
  return userId;
}

export async function getServerDayEntries(userId: string, date: Date) {
  await requireOwnUserId(userId);
  return typeof date === "string" ? foodDiaryService.getDayEntries(userId, new Date(date)) : foodDiaryService.getDayEntries(userId, date);
}

export async function getServerDailySummary(userId: string, date: Date) {
  await requireOwnUserId(userId);
  return typeof date === "string" ? foodDiaryService.getDailySummary(userId, new Date(date)) : foodDiaryService.getDailySummary(userId, date);
}

export async function getServerWeeklySummary(userId: string, date: Date) {
  await requireOwnUserId(userId);
  return typeof date === "string" ? foodDiaryService.getWeeklySummary(userId, new Date(date)) : foodDiaryService.getWeeklySummary(userId, date);
}

export async function getServerStats(userId: string) {
  await requireOwnUserId(userId);
  return foodDiaryService.getStats(userId);
}

export async function getServerFavorites(userId: string) {
  await requireOwnUserId(userId);
  return foodDiaryService.getFavorites(userId);
}

export async function createServerEntry(userId: string, input: CreateFoodDiaryEntryInput) {
  await requireOwnUserId(userId);
  // Convert date if it became a string during Next.js serialization
  const parsedInput = { ...input };
  if (typeof parsedInput.date === "string") {
    parsedInput.date = new Date(parsedInput.date);
  }
  return foodDiaryService.createEntry(userId, parsedInput);
}

export async function updateServerEntry(userId: string, input: UpdateFoodDiaryEntryInput) {
  await requireOwnUserId(userId);
  return foodDiaryService.updateEntry(userId, input);
}

export async function deleteServerEntry(userId: string, entryId: string) {
  await requireOwnUserId(userId);
  return foodDiaryService.deleteEntry(userId, entryId);
}

export async function rateServerEntry(userId: string, entryId: string, rating: FoodRating, moodTags?: MoodTag[]) {
  await requireOwnUserId(userId);
  return foodDiaryService.rateEntry(userId, entryId, rating, moodTags);
}

// Quick-food presets are a shared catalogue, not user data — no owner to check.
export async function getServerQuickFoodPreset(presetId: string) {
  return foodDiaryService.getQuickFoodPreset(presetId);
}

export async function getServerQuickFoodPresets(category?: QuickFoodCategory) {
  return foodDiaryService.getQuickFoodPresets(category);
}

export async function searchServerFoods(userId: string, query: string) {
  await requireOwnUserId(userId);
  return foodDiaryService.searchFoods(userId, query);
}

export async function addServerToFavorites(userId: string, entryId: string) {
  await requireOwnUserId(userId);
  return foodDiaryService.addToFavorites(userId, entryId);
}

export async function removeServerFavorite(
  userId: string,
  favoriteIdOrName: string,
) {
  await requireOwnUserId(userId);
  return foodDiaryService.removeFavorite(userId, favoriteIdOrName);
}

export async function generateServerInsights(userId: string) {
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
) {
  await requireOwnUserId(userId);
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
