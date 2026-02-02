"use client";

/**
 * useFoodDiary Hook
 * Comprehensive hook for managing food diary entries, tracking nutrition,
 * and providing personalized insights.
 *
 * @file src/hooks/useFoodDiary.ts
 * @created 2026-02-02
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import { foodDiaryService } from "@/services/FoodDiaryService";
import type {
  FoodDiaryEntry,
  CreateFoodDiaryEntryInput,
  UpdateFoodDiaryEntryInput,
  DailyFoodDiarySummary,
  WeeklyFoodDiarySummary,
  FoodDiaryFilters,
  FoodDiaryStats,
  FoodInsight,
  FoodRating,
  MoodTag,
  FoodSearchResult,
  QuickFoodPreset,
  QuickFoodCategory,
  UserFoodFavorite,
} from "@/types/foodDiary";
import type { MealType } from "@/types/menuPlanner";

/**
 * Hook state interface
 */
interface UseFoodDiaryState {
  entries: FoodDiaryEntry[];
  dailySummary: DailyFoodDiarySummary | null;
  weeklySummary: WeeklyFoodDiarySummary | null;
  stats: FoodDiaryStats | null;
  insights: FoodInsight[];
  favorites: UserFoodFavorite[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook return interface
 */
interface UseFoodDiaryReturn extends UseFoodDiaryState {
  // Entry operations
  addEntry: (input: CreateFoodDiaryEntryInput) => Promise<FoodDiaryEntry | null>;
  updateEntry: (input: UpdateFoodDiaryEntryInput) => Promise<FoodDiaryEntry | null>;
  deleteEntry: (entryId: string) => Promise<boolean>;
  rateEntry: (entryId: string, rating: FoodRating, moodTags?: MoodTag[]) => Promise<boolean>;

  // Quick add operations
  addQuickFood: (
    presetId: string,
    mealType: MealType,
    quantity?: number,
    time?: string
  ) => Promise<FoodDiaryEntry | null>;
  getQuickFoodPresets: (category?: QuickFoodCategory) => QuickFoodPreset[];

  // Search and favorites
  searchFoods: (query: string) => Promise<FoodSearchResult[]>;
  addToFavorites: (entryId: string) => Promise<boolean>;
  removeFavorite: (favoriteId: string) => Promise<boolean>;

  // Navigation
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;

  // Filters
  filters: FoodDiaryFilters;
  setFilters: (filters: FoodDiaryFilters) => void;
  clearFilters: () => void;

  // Refresh
  refresh: () => Promise<void>;
  refreshInsights: () => Promise<void>;
}

/**
 * Custom hook for food diary management
 */
export function useFoodDiary(): UseFoodDiaryReturn {
  const { currentUser } = useUser();
  const userId = currentUser?.userId || "guest";

  // State
  const [state, setState] = useState<UseFoodDiaryState>({
    entries: [],
    dailySummary: null,
    weeklySummary: null,
    stats: null,
    insights: [],
    favorites: [],
    isLoading: true,
    error: null,
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FoodDiaryFilters>({});

  // Load data on mount and when date changes
  useEffect(() => {
    loadData();
  }, [userId, selectedDate]);

  // Load weekly summary when week changes
  useEffect(() => {
    loadWeeklySummary();
  }, [userId, selectedDate]);

  /**
   * Load data for the current view
   */
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [entries, dailySummary, stats, favorites] = await Promise.all([
        foodDiaryService.getDayEntries(userId, selectedDate),
        foodDiaryService.getDailySummary(userId, selectedDate),
        foodDiaryService.getStats(userId),
        foodDiaryService.getFavorites(userId),
      ]);

      setState(prev => ({
        ...prev,
        entries,
        dailySummary,
        stats,
        favorites,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load food diary",
      }));
    }
  }, [userId, selectedDate]);

  /**
   * Load weekly summary
   */
  const loadWeeklySummary = useCallback(async () => {
    try {
      // Get start of week (Sunday)
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weeklySummary = await foodDiaryService.getWeeklySummary(userId, weekStart);
      setState(prev => ({ ...prev, weeklySummary }));
    } catch (error) {
      console.error("Failed to load weekly summary:", error);
    }
  }, [userId, selectedDate]);

  /**
   * Add a new entry
   */
  const addEntry = useCallback(async (
    input: CreateFoodDiaryEntryInput
  ): Promise<FoodDiaryEntry | null> => {
    try {
      const entry = await foodDiaryService.createEntry(userId, input);
      await loadData();
      return entry;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to add entry",
      }));
      return null;
    }
  }, [userId, loadData]);

  /**
   * Update an entry
   */
  const updateEntry = useCallback(async (
    input: UpdateFoodDiaryEntryInput
  ): Promise<FoodDiaryEntry | null> => {
    try {
      const entry = await foodDiaryService.updateEntry(userId, input);
      await loadData();
      return entry;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to update entry",
      }));
      return null;
    }
  }, [userId, loadData]);

  /**
   * Delete an entry
   */
  const deleteEntry = useCallback(async (entryId: string): Promise<boolean> => {
    try {
      const success = await foodDiaryService.deleteEntry(userId, entryId);
      if (success) {
        await loadData();
      }
      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to delete entry",
      }));
      return false;
    }
  }, [userId, loadData]);

  /**
   * Rate an entry
   */
  const rateEntry = useCallback(async (
    entryId: string,
    rating: FoodRating,
    moodTags?: MoodTag[]
  ): Promise<boolean> => {
    try {
      const entry = await foodDiaryService.rateEntry(userId, entryId, rating, moodTags);
      if (entry) {
        await loadData();
        return true;
      }
      return false;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to rate entry",
      }));
      return false;
    }
  }, [userId, loadData]);

  /**
   * Add a quick food item
   */
  const addQuickFood = useCallback(async (
    presetId: string,
    mealType: MealType,
    quantity = 1,
    time?: string
  ): Promise<FoodDiaryEntry | null> => {
    const preset = foodDiaryService.getQuickFoodPreset(presetId);
    if (!preset) return null;

    const now = new Date();
    const input: CreateFoodDiaryEntryInput = {
      foodName: preset.name,
      foodSource: "quick",
      sourceId: presetId,
      date: selectedDate,
      mealType,
      time: time || `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
      serving: preset.defaultServing,
      quantity,
    };

    return addEntry(input);
  }, [selectedDate, addEntry]);

  /**
   * Get quick food presets
   */
  const getQuickFoodPresets = useCallback((category?: QuickFoodCategory): QuickFoodPreset[] => {
    return foodDiaryService.getQuickFoodPresets(category);
  }, []);

  /**
   * Search for foods
   */
  const searchFoods = useCallback(async (query: string): Promise<FoodSearchResult[]> => {
    return foodDiaryService.searchFoods(userId, query);
  }, [userId]);

  /**
   * Add entry to favorites
   */
  const addToFavorites = useCallback(async (entryId: string): Promise<boolean> => {
    try {
      const favorite = await foodDiaryService.addToFavorites(userId, entryId);
      if (favorite) {
        await loadData();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, [userId, loadData]);

  /**
   * Remove from favorites (placeholder - would need implementation in service)
   */
  const removeFavorite = useCallback(async (_favoriteId: string): Promise<boolean> => {
    // TODO: Implement in service
    return false;
  }, []);

  /**
   * Navigation helpers
   */
  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const goToPreviousDay = useCallback(() => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, []);

  const goToNextDay = useCallback(() => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  }, []);

  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await loadData();
    await loadWeeklySummary();
  }, [loadData, loadWeeklySummary]);

  /**
   * Refresh insights
   */
  const refreshInsights = useCallback(async () => {
    try {
      const insights = await foodDiaryService.generateInsights(userId);
      setState(prev => ({ ...prev, insights }));
    } catch (error) {
      console.error("Failed to load insights:", error);
    }
  }, [userId]);

  // Load insights on mount
  useEffect(() => {
    refreshInsights();
  }, [refreshInsights]);

  return {
    ...state,
    selectedDate,
    setSelectedDate,
    filters,
    setFilters,
    clearFilters,
    addEntry,
    updateEntry,
    deleteEntry,
    rateEntry,
    addQuickFood,
    getQuickFoodPresets,
    searchFoods,
    addToFavorites,
    removeFavorite,
    goToToday,
    goToPreviousDay,
    goToNextDay,
    refresh,
    refreshInsights,
  };
}

/**
 * Simplified hook for quick food entry
 */
export function useQuickFoodEntry() {
  const {
    addQuickFood,
    getQuickFoodPresets,
    searchFoods,
    selectedDate,
    isLoading,
  } = useFoodDiary();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<QuickFoodCategory | undefined>();

  const presets = useMemo(() => {
    return getQuickFoodPresets(selectedCategory);
  }, [getQuickFoodPresets, selectedCategory]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const results = await searchFoods(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchFoods]);

  return {
    presets,
    searchQuery,
    searchResults,
    selectedCategory,
    selectedDate,
    isLoading,
    setSelectedCategory,
    handleSearch,
    addQuickFood,
  };
}

/**
 * Hook for food diary statistics and insights
 */
export function useFoodDiaryInsights() {
  const { stats, insights, weeklySummary, refreshInsights, isLoading } = useFoodDiary();

  const topFoods = useMemo(() => {
    return weeklySummary?.patterns.topFoods || [];
  }, [weeklySummary]);

  const topRatedFoods = useMemo(() => {
    return weeklySummary?.patterns.topRatedFoods || [];
  }, [weeklySummary]);

  const goalCompliance = useMemo(() => {
    return weeklySummary?.goalCompliance || { overall: 0, byNutrient: {} };
  }, [weeklySummary]);

  const priorityInsights = useMemo(() => {
    return insights.filter(i => i.priority === "high");
  }, [insights]);

  return {
    stats,
    insights,
    priorityInsights,
    topFoods,
    topRatedFoods,
    goalCompliance,
    isLoading,
    refreshInsights,
  };
}

export default useFoodDiary;
