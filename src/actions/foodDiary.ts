"use server";

import { foodDiaryService } from "@/services/FoodDiaryService";
import type {
  CreateFoodDiaryEntryInput,
  UpdateFoodDiaryEntryInput,
  FoodRating,
  MoodTag,
  QuickFoodCategory,
} from "@/types/foodDiary";

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

export async function generateServerInsights(userId: string) {
  return foodDiaryService.generateInsights(userId);
}
