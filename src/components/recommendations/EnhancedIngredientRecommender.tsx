"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { IngredientService } from "@/services/IngredientService";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
import type { ElementalProperties } from "@/types/alchemy";

interface EnhancedIngredientRecommenderProps {
  initialCategory?: string | null;
  initialSelectedIngredient?: string | null;
  isFullPageVersion?: boolean;
  onCategoryChange?: (category: string) => void;
  onIngredientSelect?: (ingredient: string) => void;
}

// Category definitions mapped to ingredient categories
const CATEGORIES = [
  { id: "spice", name: "Spices & Herbs", icon: "🌿", altIds: ["culinary_herb"] },
  { id: "vegetable", name: "Vegetables", icon: "🥬", altIds: [] },
  { id: "protein", name: "Proteins", icon: "🥩", altIds: [] },
  { id: "grain", name: "Grains & Legumes", icon: "🌾", altIds: [] },
  { id: "dairy", name: "Dairy", icon: "🧀", altIds: [] },
  { id: "fruit", name: "Fruits", icon: "🍎", altIds: [] },
  { id: "oil", name: "Oils & Fats", icon: "🫒", altIds: [] },
  { id: "seasoning", name: "Seasonings", icon: "🍯", altIds: [] },
];

// Helper: Calculate elemental compatibility score
function calculateCompatibilityScore(
  ingredientElementals: ElementalProperties,
  currentElementals: ElementalProperties
): number {
  const elements = ["Fire", "Water", "Earth", "Air"] as const;
  let totalDiff = 0;

  elements.forEach((element) => {
    const diff = Math.abs(
      (ingredientElementals[element] || 0) - (currentElementals[element] || 0)
    );
    totalDiff += diff;
  });

  // Convert to 0-1 score (lower difference = higher score)
  return 1 - totalDiff / (2 * elements.length);
}

// Helper: Get dominant element
function getDominantElement(elementals: ElementalProperties): string {
  const entries = Object.entries(elementals) as [keyof ElementalProperties, number][];
  const sorted = entries.sort((a, b) => (b[1] as number) - (a[1] as number));
  return (sorted[0]?.[0] as string) || "Unknown";
}

export const EnhancedIngredientRecommender: React.FC<
  EnhancedIngredientRecommenderProps
> = ({
  initialCategory,
  initialSelectedIngredient,
  isFullPageVersion = false,
  onCategoryChange,
  onIngredientSelect,
}) => {
  // State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || null
  );
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    initialSelectedIngredient || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [ingredients, setIngredients] = useState<UnifiedIngredient[]>([]);
  const [loading, setLoading] = useState(true);

  // Hooks
  const alchemicalContext = useAlchemical();
  const ingredientService = useMemo(() => IngredientService.getInstance(), []);

  // Load ingredients
  useEffect(() => {
    setLoading(true);
    try {
      const allIngredients = ingredientService.getAllIngredientsFlat();
      setIngredients(allIngredients);
    } catch (error) {
      console.error("Error loading ingredients:", error);
    } finally {
      setLoading(false);
    }
  }, [ingredientService]);

  // Get current elemental properties from alchemical context
  const currentElementals: ElementalProperties = useMemo(() => {
    if (alchemicalContext?.state?.elementalState) {
      return alchemicalContext.state.elementalState as ElementalProperties;
    }
    // Default balanced elementals
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }, [alchemicalContext]);

  // Filter and score ingredients
  const scoredIngredients = useMemo(() => {
    let filtered = ingredients;

    // Filter by category
    if (selectedCategory) {
      const category = CATEGORIES.find((c) => c.id === selectedCategory);
      const allowedCategories = category
        ? [category.id, ...category.altIds]
        : [selectedCategory];

      filtered = filtered.filter((ing) =>
        allowedCategories.includes(ing.category)
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ing) =>
          ing.name.toLowerCase().includes(query) ||
          ing.qualities?.some((q) => q.toLowerCase().includes(query)) ||
          ing.origin?.some((o) => o.toLowerCase().includes(query))
      );
    }

    // Calculate scores and sort
    return filtered
      .map((ing) => ({
        ...ing,
        compatibilityScore: ing.elementalProperties
          ? calculateCompatibilityScore(ing.elementalProperties, currentElementals)
          : 0.5,
        dominantElement: ing.elementalProperties
          ? getDominantElement(ing.elementalProperties)
          : "Unknown",
      }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }, [ingredients, selectedCategory, searchQuery, currentElementals]);

  // Handlers
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedIngredient(null);
    onCategoryChange?.(categoryId);
  };

  const handleIngredientSelect = (ingredientName: string) => {
    setSelectedIngredient(
      selectedIngredient === ingredientName ? null : ingredientName
    );
    onIngredientSelect?.(ingredientName);
  };

  // Render category grid
  const renderCategoryGrid = () => (
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold text-gray-800">
        Browse by Category
      </h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`rounded-lg border-2 p-4 transition-all ${
              selectedCategory === category.id
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-indigo-300"
            }`}
          >
            <div className="mb-2 text-3xl">{category.icon}</div>
            <div className="text-sm font-medium text-gray-800">
              {category.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Render search bar
  const renderSearchBar = () => (
    <div className="mb-6">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search ingredients..."
        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );

  // Render elemental properties
  const renderElementalProperties = (elementals: ElementalProperties) => {
    const elements = [
      { name: "Fire", icon: "🔥", color: "red" },
      { name: "Water", icon: "💧", color: "blue" },
      { name: "Earth", icon: "🌍", color: "green" },
      { name: "Air", icon: "💨", color: "sky" },
    ] as const;

    return (
      <div className="space-y-2">
        {elements.map(({ name, icon, color }) => {
          const value = elementals[name] || 0;
          const percentage = Math.round(value * 100);

          return (
            <div key={name} className="flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <span className="w-16 text-sm font-medium text-gray-700">
                {name}
              </span>
              <div className="flex-1">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full bg-${color}-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <span className="w-12 text-right text-sm text-gray-600">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render ingredient card
  const renderIngredientCard = (
    ingredient: (typeof scoredIngredients)[0]
  ) => {
    const isSelected = selectedIngredient === ingredient.name;

    return (
      <div
        key={ingredient.name}
        onClick={() => handleIngredientSelect(ingredient.name)}
        className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
          isSelected
            ? "border-indigo-500 bg-indigo-50 shadow-lg"
            : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md"
        }`}
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 capitalize">
              {ingredient.name}
            </h4>
            <div className="mt-1 flex flex-wrap gap-1">
              <span className="text-xs text-gray-500 capitalize">
                {ingredient.category}
              </span>
              {ingredient.subCategory && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {ingredient.subCategory}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
              {Math.round(ingredient.compatibilityScore * 100)}%
            </div>
            <div className="text-xs text-gray-500">
              {ingredient.dominantElement}
            </div>
          </div>
        </div>

        {/* Qualities badges */}
        {ingredient.qualities && ingredient.qualities.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {ingredient.qualities.slice(0, 4).map((quality, idx) => (
              <span
                key={idx}
                className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-700"
              >
                {quality}
              </span>
            ))}
            {ingredient.qualities.length > 4 && (
              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                +{ingredient.qualities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Seasonality */}
        {ingredient.seasonality && ingredient.seasonality.length > 0 && (
          <div className="mb-3 text-sm">
            <span className="font-medium text-gray-700">Season: </span>
            <span className="text-gray-600 capitalize">
              {ingredient.seasonality.join(", ")}
            </span>
          </div>
        )}

        {/* Expanded details */}
        {isSelected && (
          <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
            {/* Origin */}
            {ingredient.origin && ingredient.origin.length > 0 && (
              <div>
                <div className="mb-1 text-sm font-semibold text-gray-800">
                  Origin
                </div>
                <div className="text-sm text-gray-600">
                  {ingredient.origin.join(", ")}
                </div>
              </div>
            )}

            {/* Sensory Profile */}
            {ingredient.sensoryProfile && (
              <div>
                <div className="mb-2 text-sm font-semibold text-gray-800">
                  Sensory Profile
                </div>
                <div className="space-y-2 text-sm">
                  {/* Taste */}
                  {ingredient.sensoryProfile.taste && (
                    <div>
                      <span className="font-medium text-gray-700">Taste: </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(ingredient.sensoryProfile.taste)
                          .filter(([, value]) => (value as number) > 0)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .map(([taste, value]) => (
                            <span
                              key={taste}
                              className="rounded-md bg-purple-100 px-2 py-1 text-xs text-purple-700"
                            >
                              {taste} ({Math.round((value as number) * 10)}/10)
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Aroma */}
                  {ingredient.sensoryProfile.aroma && (
                    <div>
                      <span className="font-medium text-gray-700">Aroma: </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(ingredient.sensoryProfile.aroma)
                          .filter(([, value]) => (value as number) > 0)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .map(([aroma, value]) => (
                            <span
                              key={aroma}
                              className="rounded-md bg-pink-100 px-2 py-1 text-xs text-pink-700"
                            >
                              {aroma} ({Math.round((value as number) * 10)}/10)
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Texture */}
                  {ingredient.sensoryProfile.texture && (
                    <div>
                      <span className="font-medium text-gray-700">Texture: </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(ingredient.sensoryProfile.texture)
                          .filter(([, value]) => (value as number) > 0)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .map(([texture, value]) => (
                            <span
                              key={texture}
                              className="rounded-md bg-orange-100 px-2 py-1 text-xs text-orange-700"
                            >
                              {texture} ({Math.round((value as number) * 10)}/10)
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Astrological Profile */}
            {ingredient.astrologicalProfile && (
              <div>
                <div className="mb-2 text-sm font-semibold text-gray-800">
                  Astrological Profile
                </div>
                <div className="space-y-1 text-sm">
                  {ingredient.astrologicalProfile.rulingPlanets && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Ruling Planets:{" "}
                      </span>
                      <span className="text-gray-600">
                        {ingredient.astrologicalProfile.rulingPlanets.join(", ")}
                      </span>
                    </div>
                  )}
                  {ingredient.astrologicalProfile.favorableZodiac && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Favorable Signs:{" "}
                      </span>
                      <span className="text-gray-600 capitalize">
                        {ingredient.astrologicalProfile.favorableZodiac.join(", ")}
                      </span>
                    </div>
                  )}
                  {ingredient.astrologicalProfile.seasonalAffinity && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Seasonal Affinity:{" "}
                      </span>
                      <span className="text-gray-600 capitalize">
                        {ingredient.astrologicalProfile.seasonalAffinity.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommended Cooking Methods */}
            {ingredient.recommendedCookingMethods &&
              ingredient.recommendedCookingMethods.length > 0 && (
                <div>
                  <div className="mb-1 text-sm font-semibold text-gray-800">
                    Recommended Cooking Methods
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ingredient.recommendedCookingMethods.map((method, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Pairing Recommendations */}
            {ingredient.pairingRecommendations && (
              <div>
                <div className="mb-2 text-sm font-semibold text-gray-800">
                  Pairings
                </div>
                <div className="space-y-1 text-sm">
                  {ingredient.pairingRecommendations.complementary && (
                    <div>
                      <span className="font-medium text-green-700">
                        Complementary:{" "}
                      </span>
                      <span className="text-gray-600">
                        {ingredient.pairingRecommendations.complementary.join(
                          ", "
                        )}
                      </span>
                    </div>
                  )}
                  {ingredient.pairingRecommendations.contrasting && (
                    <div>
                      <span className="font-medium text-orange-700">
                        Contrasting:{" "}
                      </span>
                      <span className="text-gray-600">
                        {ingredient.pairingRecommendations.contrasting.join(", ")}
                      </span>
                    </div>
                  )}
                  {ingredient.pairingRecommendations.toAvoid && (
                    <div>
                      <span className="font-medium text-red-700">Avoid: </span>
                      <span className="text-gray-600">
                        {ingredient.pairingRecommendations.toAvoid.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Elemental Properties */}
            {ingredient.elementalProperties && (
              <div>
                <div className="mb-2 text-sm font-semibold text-gray-800">
                  Elemental Balance
                </div>
                {renderElementalProperties(ingredient.elementalProperties)}
              </div>
            )}

            {/* Alchemical Properties */}
            {ingredient.alchemicalProperties && (
              <div>
                <div className="mb-2 text-sm font-semibold text-gray-800">
                  Alchemical Properties
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(ingredient.alchemicalProperties).map(
                    ([prop, value]) => (
                      <div key={prop} className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          {prop}:
                        </span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Thermodynamic Properties */}
            {ingredient.thermodynamicProperties && (
              <div>
                <div className="mb-2 text-sm font-semibold text-gray-800">
                  Thermodynamic Properties
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(ingredient.thermodynamicProperties).map(
                    ([prop, value]) => (
                      <div key={prop} className="flex justify-between">
                        <span className="font-medium text-gray-700 capitalize">
                          {prop}:
                        </span>
                        <span className="text-gray-600">
                          {typeof value === "number"
                            ? value.toFixed(3)
                            : value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-4 border-indigo-600" />
          <p className="text-gray-600">Loading ingredients...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="p-6">
      {/* Current moment summary */}
      {alchemicalContext && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4">
          <div className="mb-3 text-center text-sm font-semibold text-gray-800">
            Current Elemental Alignment
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Object.entries(currentElementals).map(([element, value]) => (
              <div key={element} className="text-center">
                <div className="text-xs text-gray-600">{element}</div>
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(value * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {renderCategoryGrid()}
      {renderSearchBar()}

      {/* Selected category indicator */}
      {selectedCategory && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">Showing:</span>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
            {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
          </span>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSearchQuery("");
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {scoredIngredients.length} ingredient
        {scoredIngredients.length !== 1 ? "s" : ""} (sorted by compatibility)
      </div>

      {/* Ingredients grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scoredIngredients.map(renderIngredientCard)}
      </div>

      {scoredIngredients.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          {searchQuery || selectedCategory
            ? "No ingredients match your filters."
            : "No ingredients available at this time."}
        </div>
      )}
    </div>
  );
};

export default EnhancedIngredientRecommender;
