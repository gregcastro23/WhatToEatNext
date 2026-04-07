import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useFoodDiary, useQuickFoodEntry, useFoodDiaryInsights } from "@/hooks/useFoodDiary";
import * as foodDiaryActions from "@/actions/foodDiary";
import { useUser } from "@/contexts/UserContext";

// Mock the actions
jest.mock("@/actions/foodDiary", () => ({
  getServerDayEntries: jest.fn(),
  getServerDailySummary: jest.fn(),
  getServerWeeklySummary: jest.fn(),
  getServerStats: jest.fn(),
  getServerFavorites: jest.fn(),
  createServerEntry: jest.fn(),
  updateServerEntry: jest.fn(),
  deleteServerEntry: jest.fn(),
  rateServerEntry: jest.fn(),
  getServerQuickFoodPreset: jest.fn(),
  getServerQuickFoodPresets: jest.fn(),
  searchServerFoods: jest.fn(),
  addServerToFavorites: jest.fn(),
  generateServerInsights: jest.fn(),
}));

// Mock the context
jest.mock("@/contexts/UserContext", () => ({
  useUser: jest.fn(),
}));

describe("useFoodDiary hook", () => {
  const mockUserId = "test-user-id";
  const mockEntries = [{ id: "1", foodName: "Apple", calories: 95 }];
  const mockSummary = { date: new Date(), totalNutrition: { calories: 95 } };
  const mockStats = { totalEntries: 10, averageRating: 4.5 };
  const mockFavorites = [{ id: "fav1", foodName: "Banana" }];
  const mockInsights = [{ id: "ins1", title: "Good job!", priority: "high" }];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for "Guest"
    (useUser as jest.Mock).mockReturnValue({ currentUser: null });
    
    (foodDiaryActions.getServerDayEntries as jest.Mock).mockResolvedValue(mockEntries);
    (foodDiaryActions.getServerDailySummary as jest.Mock).mockResolvedValue(mockSummary);
    (foodDiaryActions.getServerStats as jest.Mock).mockResolvedValue(mockStats);
    (foodDiaryActions.getServerFavorites as jest.Mock).mockResolvedValue(mockFavorites);
    (foodDiaryActions.generateServerInsights as jest.Mock).mockResolvedValue(mockInsights);
    (foodDiaryActions.getServerWeeklySummary as jest.Mock).mockResolvedValue({ totalEntries: 70 });
    
    // Mock global fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ entries: mockEntries, summary: mockSummary }),
      } as Response)
    );
  });

  describe("Initial Loading", () => {
    it("loads guest data on mount using Server Actions", async () => {
      const { result } = renderHook(() => useFoodDiary());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(foodDiaryActions.getServerDayEntries).toHaveBeenCalledWith("guest", expect.any(Date));
      expect(result.current.entries).toEqual(mockEntries);
      expect(result.current.dailySummary).toEqual(mockSummary);
    });

    it("loads authenticated data on mount using fetch API", async () => {
      (useUser as jest.Mock).mockReturnValue({ currentUser: { userId: mockUserId } });

      const { result } = renderHook(() => useFoodDiary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/food-diary?userId=${mockUserId}`),
        expect.any(Object)
      );
      // Even in auth mode, stats and favorites are fetched via actions if response is ok
      expect(foodDiaryActions.getServerStats).toHaveBeenCalledWith(mockUserId);
      expect(result.current.entries).toEqual(mockEntries);
    });

    it("handles errors gracefully", async () => {
      const errorMessage = "Failed to load";
      (foodDiaryActions.getServerDayEntries as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useFoodDiary());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe("CRUD Operations", () => {
    it("adds an entry and refreshes data", async () => {
      const newEntryInput = { foodName: "Orange", foodSource: "custom" as const, quantity: 1 };
      const createdEntry = { id: "2", ...newEntryInput };
      (foodDiaryActions.createServerEntry as jest.Mock).mockResolvedValue(createdEntry);

      const { result } = renderHook(() => useFoodDiary());
      
      await waitFor(() => !result.current.isLoading);

      let returnedEntry;
      await act(async () => {
        returnedEntry = await result.current.addEntry(newEntryInput as any);
      });

      expect(foodDiaryActions.createServerEntry).toHaveBeenCalledWith("guest", newEntryInput);
      expect(returnedEntry).toEqual(createdEntry);
      // Verify refresh was called (getServerDayEntries called again)
      expect(foodDiaryActions.getServerDayEntries).toHaveBeenCalledTimes(2);
    });

    it("updates an entry", async () => {
      const updateInput = { id: "1", quantity: 2 };
      (foodDiaryActions.updateServerEntry as jest.Mock).mockResolvedValue({ ...mockEntries[0], quantity: 2 });

      const { result } = renderHook(() => useFoodDiary());
      await waitFor(() => !result.current.isLoading);

      await act(async () => {
        await result.current.updateEntry(updateInput);
      });

      expect(foodDiaryActions.updateServerEntry).toHaveBeenCalledWith("guest", updateInput);
    });

    it("deletes an entry", async () => {
      (foodDiaryActions.deleteServerEntry as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useFoodDiary());
      await waitFor(() => !result.current.isLoading);

      await act(async () => {
        const success = await result.current.deleteEntry("1");
        expect(success).toBe(true);
      });

      expect(foodDiaryActions.deleteServerEntry).toHaveBeenCalledWith("guest", "1");
    });
  });

  describe("Navigation", () => {
    it("goes to previous day", async () => {
      const { result } = renderHook(() => useFoodDiary());
      const initialDate = new Date(result.current.selectedDate);

      act(() => {
        result.current.goToPreviousDay();
      });

      const prevDate = new Date(initialDate);
      prevDate.setDate(prevDate.getDate() - 1);
      
      expect(result.current.selectedDate.toDateString()).toBe(prevDate.toDateString());
    });

    it("goes to next day", async () => {
      const { result } = renderHook(() => useFoodDiary());
      const initialDate = new Date(result.current.selectedDate);

      act(() => {
        result.current.goToNextDay();
      });

      const nextDate = new Date(initialDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      expect(result.current.selectedDate.toDateString()).toBe(nextDate.toDateString());
    });
  });

  describe("Quick Food & Search", () => {
    it("adds a quick food item", async () => {
      const mockPreset = { id: "p1", name: "Apple", defaultServing: { amount: 1, unit: "piece", grams: 150 } };
      (foodDiaryActions.getServerQuickFoodPreset as jest.Mock).mockResolvedValue(mockPreset);

      const { result } = renderHook(() => useFoodDiary());
      await waitFor(() => !result.current.isLoading);

      await act(async () => {
        await result.current.addQuickFood("p1", "snack");
      });

      expect(foodDiaryActions.createServerEntry).toHaveBeenCalledWith(
        "guest",
        expect.objectContaining({
          foodName: "Apple",
          mealType: "snack",
        })
      );
    });

    it("searches foods", async () => {
      const searchResults = [{ id: "s1", name: "Apple Green" }];
      (foodDiaryActions.searchServerFoods as jest.Mock).mockResolvedValue(searchResults);

      const { result } = renderHook(() => useFoodDiary());
      
      let results;
      await act(async () => {
        results = await result.current.searchFoods("Apple");
      });

      expect(foodDiaryActions.searchServerFoods).toHaveBeenCalledWith("guest", "Apple");
      expect(results).toEqual(searchResults);
    });
  });
});

  describe("Sub-hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ currentUser: null });
    (foodDiaryActions.getServerQuickFoodPresets as jest.Mock).mockResolvedValue([]);
    (foodDiaryActions.getServerDayEntries as jest.Mock).mockResolvedValue([]);
    (foodDiaryActions.getServerDailySummary as jest.Mock).mockResolvedValue({});
    (foodDiaryActions.getServerStats as jest.Mock).mockResolvedValue({});
    (foodDiaryActions.getServerFavorites as jest.Mock).mockResolvedValue([]);
    (foodDiaryActions.generateServerInsights as jest.Mock).mockResolvedValue([]);
    (foodDiaryActions.getServerWeeklySummary as jest.Mock).mockResolvedValue({
      totalEntries: 0,
      patterns: { topFoods: [], topRatedFoods: [], avoidedFoods: [], moodFoodCorrelations: [] },
      goalCompliance: { overall: 0, byNutrient: {}, bestDays: [], worstDays: [] },
      insights: [],
    });
  });

  it("useQuickFoodEntry fetches presets on mount", async () => {
    const presets = [{ id: "p1", name: "Apple" }];
    (foodDiaryActions.getServerQuickFoodPresets as jest.Mock).mockResolvedValue(presets);

    const { result } = renderHook(() => useQuickFoodEntry());

    await waitFor(() => {
      expect(result.current.presets).toEqual(presets);
    });
  });

  it("useFoodDiaryInsights provides computed insights", async () => {
    const mockInsights = [
      { id: "1", title: "High priority", priority: "high" },
      { id: "2", title: "Low priority", priority: "low" },
    ];
    (foodDiaryActions.generateServerInsights as jest.Mock).mockResolvedValue(mockInsights);

    const { result } = renderHook(() => useFoodDiaryInsights());

    // First wait for initial loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });

    // Then check insights (refreshInsights is also called on mount)
    await waitFor(() => {
      expect(result.current.insights).toHaveLength(2);
    }, { timeout: 3000 });

    expect(result.current.priorityInsights).toHaveLength(1);
    expect(result.current.priorityInsights[0].title).toBe("High priority");
  });
});
