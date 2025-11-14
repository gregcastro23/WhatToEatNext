"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { IngredientRecommender } from "@/components/recommendations/IngredientRecommender";
import { useEnhancedRecommendations } from "@/hooks/useEnhancedRecommendations";
import {
  useNavigationContext,
  useScrollPreservation,
} from "@/hooks/useStatePreservation";

export default function IngredientsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    null,
  );

  // Use enhanced state preservation hooks
  const { preserveContext, restoreContext } = useNavigationContext();
  const { restoreScrollPosition } = useScrollPreservation("ingredients-page");

  // Restore context from URL parameters or enhanced state preservation
  useEffect(() => {
    // Check URL parameters first
    const categoryParam = searchParams.get("category");
    const ingredientParam = searchParams.get("ingredient");

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    if (ingredientParam) {
      setSelectedIngredient(ingredientParam);
    }

    // If no URL params, try to restore from enhanced state preservation
    if (!categoryParam && !ingredientParam) {
      const restoredContext = restoreContext();
      if (restoredContext) {
        if (restoredContext.selectedIngredientCategory) {
          setSelectedCategory(restoredContext.selectedIngredientCategory);
        }
        if (restoredContext.selectedIngredient) {
          setSelectedIngredient(restoredContext.selectedIngredient);
        }
      }
    }

    // Restore scroll position after a short delay
    setTimeout(() => {
      restoreScrollPosition();
    }, 100);
  }, [searchParams, restoreContext, restoreScrollPosition]);

  // Handle navigation back to main page with enhanced context preservation
  const handleBackToMain = () => {
    // Preserve current context using enhanced system
    preserveContext({
      fromPage: "ingredients",
      selectedItems: selectedIngredient ? [selectedIngredient] : [],
      activeSection: "ingredients",
      scrollPosition: window.scrollY,
      timestamp: Date.now(),
    });

    // Navigate with smooth transition
    router.push("/#ingredients");
  };

  // Handle navigation to home
  const handleGoHome = () => {
    router.push("/");
  };

  // Enhanced ingredient recommendations context (rune/agent banner)
  const recommendationsContext = (useEnhancedRecommendations as any)({
    datetime: new Date(),
    useBackendInfluence: true,
  });

  const {
    ingredients: enhancedIngredients,
    loading: recLoading,
    error: recError,
    getIngredientRecommendations,
  } = recommendationsContext;

  useEffect(() => {
    void getIngredientRecommendations();
  }, [getIngredientRecommendations]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header with navigation */}
        <header className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToMain}
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-800"
              >
                <ArrowLeft size={20} />
                Back to Main
              </button>

              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
              >
                <Home size={20} />
                Home
              </button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-indigo-900 md:text-4xl">
              Ingredient Recommendations
            </h1>
            <p className="mb-4 text-indigo-600">
              Explore ingredients aligned with current celestial energies
            </p>
            {/* Context indicators */}
            {(selectedCategory || selectedIngredient) && (
              <div className="inline-flex items-center gap-4 rounded-lg bg-white px-4 py-2 shadow-sm">
                {selectedCategory && (
                  <span className="text-sm text-gray-600">
                    Category:{" "}
                    <span className="font-medium text-indigo-600">
                      {selectedCategory}
                    </span>
                  </span>
                )}
                {selectedIngredient && (
                  <span className="text-sm text-gray-600">
                    Selected:{" "}
                    <span className="font-medium text-indigo-600">
                      {selectedIngredient}
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto max-w-6xl">
          <div className="rounded-lg bg-white p-6 shadow-md">
            {!recLoading && !recError && enhancedIngredients?.context?.rune && (
              <div className="mb-4 flex items-center gap-3 rounded-md bg-indigo-50 p-3">
                <div className="text-2xl">
                  {enhancedIngredients.context.rune.symbol}
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {enhancedIngredients.context.rune.name}
                  </div>
                  <div className="text-xs text-indigo-700">
                    {enhancedIngredients.context.rune.guidance}
                  </div>
                </div>
              </div>
            )}
            <IngredientRecommender
              initialCategory={selectedCategory}
              initialSelectedIngredient={selectedIngredient}
              isFullPageVersion
            />
          </div>
        </main>
      </div>
    </div>
  );
}
