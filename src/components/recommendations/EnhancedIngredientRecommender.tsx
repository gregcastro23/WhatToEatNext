"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { IngredientService } from "@/services/IngredientService";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";
import type { ElementalProperties } from "@/types/alchemy";
import { normalizeForDisplay } from "@/utils/elemental/normalization";
import {
  calculateThermodynamicMetrics,
  elementalToAlchemicalApproximation,
} from "@/utils/monicaKalchmCalculations";
import { calculateKineticProperties } from "@/utils/kineticCalculations";

// Pagination constant - items shown before expansion
const ITEMS_PER_PAGE = 21;

interface EnhancedIngredientRecommenderProps {
  initialCategory?: string | null;
  initialSelectedIngredient?: string | null;
  isFullPageVersion?: boolean;
  onCategoryChange?: (category: string) => void;
  onIngredientSelect?: (ingredient: string) => void;
}

// Category definitions mapped to ingredient categories
// Note: IDs must match the actual 'category' values in ingredient data (plural forms)
const CATEGORIES = [
  {
    id: "spices",
    name: "Spices",
    icon: "🌶️",
    altIds: [],
  },
  {
    id: "herbs",
    name: "Herbs",
    icon: "🌿",
    altIds: [],
  },
  { id: "vegetables", name: "Vegetables", icon: "🥬", altIds: [] },
  { id: "proteins", name: "Proteins", icon: "🥩", altIds: [] },
  { id: "grains", name: "Grains", icon: "🌾", altIds: [] },
  { id: "dairy", name: "Dairy", icon: "🧀", altIds: [] },
  { id: "fruits", name: "Fruits", icon: "🍎", altIds: [] },
  { id: "oils", name: "Oils", icon: "🫒", altIds: [] },
  { id: "vinegars", name: "Vinegars", icon: "🍶", altIds: [] },
  { id: "seasonings", name: "Seasonings", icon: "🍯", altIds: [] },
];

/**
 * Enhanced compatibility scoring using exponential decay function
 * Creates better differentiation between scores than linear approaches
 *
 * Perfect match (diff=0) → 1.0
 * Small diff (0.1) → ~0.82
 * Medium diff (0.5) → ~0.37
 * Large diff (1.0) → ~0.14
 */
function exponentialCompatibility(value1: number, value2: number, sensitivity = 2.0): number {
  const diff = Math.abs(value1 - value2);
  return Math.exp(-sensitivity * diff);
}

/**
 * Calculate enhanced compatibility score using thermodynamic properties
 * This creates much more varied and meaningful match percentages
 */
function calculateCompatibilityScore(
  ingredientElementals: ElementalProperties,
  currentElementals: ElementalProperties,
): number {
  // Calculate elemental compatibility using exponential decay for better spread
  const fireCompat = exponentialCompatibility(
    ingredientElementals.Fire || 0,
    currentElementals.Fire || 0,
    2.5
  );
  const waterCompat = exponentialCompatibility(
    ingredientElementals.Water || 0,
    currentElementals.Water || 0,
    2.5
  );
  const earthCompat = exponentialCompatibility(
    ingredientElementals.Earth || 0,
    currentElementals.Earth || 0,
    2.5
  );
  const airCompat = exponentialCompatibility(
    ingredientElementals.Air || 0,
    currentElementals.Air || 0,
    2.5
  );

  const elementalScore = (fireCompat + waterCompat + earthCompat + airCompat) / 4;

  // Calculate thermodynamic metrics for both ingredient and current state
  const ingredientAlchemical = elementalToAlchemicalApproximation(ingredientElementals);
  const currentAlchemical = elementalToAlchemicalApproximation(currentElementals);

  const ingredientThermo = calculateThermodynamicMetrics(ingredientAlchemical, ingredientElementals);
  const currentThermo = calculateThermodynamicMetrics(currentAlchemical, currentElementals);

  // Thermodynamic compatibility (heat, entropy, reactivity)
  const heatCompat = exponentialCompatibility(ingredientThermo.heat, currentThermo.heat, 3.0);
  const entropyCompat = exponentialCompatibility(ingredientThermo.entropy, currentThermo.entropy, 2.5);
  const reactivityCompat = exponentialCompatibility(ingredientThermo.reactivity, currentThermo.reactivity, 2.0);

  // Kalchm ratio compatibility (logarithmic scale for better handling of large differences)
  const kalchmMin = Math.min(ingredientThermo.kalchm, currentThermo.kalchm);
  const kalchmMax = Math.max(ingredientThermo.kalchm, currentThermo.kalchm);
  const kalchmRatio = kalchmMax > 0 ? kalchmMin / kalchmMax : 0.5;

  // Monica compatibility
  const monicaCompat = exponentialCompatibility(ingredientThermo.monica, currentThermo.monica, 1.5);

  // Calculate kinetic properties for deeper differentiation
  const ingredientKinetics = calculateKineticProperties(
    ingredientAlchemical,
    ingredientElementals,
    ingredientThermo
  );
  const currentKinetics = calculateKineticProperties(
    currentAlchemical,
    currentElementals,
    currentThermo
  );

  // Kinetic compatibility (power matching)
  const powerCompat = exponentialCompatibility(ingredientKinetics.power, currentKinetics.power, 2.0);
  const forceCompat = exponentialCompatibility(
    ingredientKinetics.forceMagnitude,
    currentKinetics.forceMagnitude,
    1.0
  );

  // Weighted composite score
  const thermoScore = (
    heatCompat * 0.25 +
    entropyCompat * 0.20 +
    reactivityCompat * 0.20 +
    kalchmRatio * 0.15 +
    monicaCompat * 0.20
  );

  const kineticScore = (powerCompat * 0.6 + forceCompat * 0.4);

  // Final score: Blend elemental, thermodynamic, and kinetic
  // Using geometric mean for better differentiation (penalizes imbalanced scores)
  const geometricMean = Math.pow(
    elementalScore * thermoScore * kineticScore,
    1 / 3
  );

  // Blend geometric mean with weighted average for final score
  const weightedScore = elementalScore * 0.35 + thermoScore * 0.40 + kineticScore * 0.25;
  const finalScore = geometricMean * 0.5 + weightedScore * 0.5;

  // Apply power function to expand the range (creates more variation)
  return Math.pow(finalScore, 0.85);
}

// Helper: Get dominant element
function getDominantElement(elementals: ElementalProperties): string {
  const entries = Object.entries(elementals) as [
    keyof ElementalProperties,
    number,
  ][];
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
    initialCategory || null,
  );
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(
    initialSelectedIngredient || null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [ingredients, setIngredients] = useState<UnifiedIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  // Track which categories are expanded to show all items
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
        allowedCategories.includes(ing.category),
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ing) =>
          ing.name.toLowerCase().includes(query) ||
          ing.qualities?.some((q) => q.toLowerCase().includes(query)) ||
          ing.origin?.some((o) => o.toLowerCase().includes(query)),
      );
    }

    // Calculate scores and sort
    return filtered
      .map((ing) => ({
        ...ing,
        compatibilityScore: ing.elementalProperties
          ? calculateCompatibilityScore(
              ing.elementalProperties,
              currentElementals,
            )
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
    // Reset expanded state for this category when selecting
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.delete(categoryId);
      return next;
    });
    onCategoryChange?.(categoryId);
  };

  const handleIngredientSelect = (ingredientName: string) => {
    setSelectedIngredient(
      selectedIngredient === ingredientName ? null : ingredientName,
    );
    onIngredientSelect?.(ingredientName);
  };

  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Determine if current category is expanded
  const currentCategoryExpanded = selectedCategory
    ? expandedCategories.has(selectedCategory)
    : false;

  // Get paginated ingredients for display
  const displayedIngredients = useMemo(() => {
    if (!selectedCategory || currentCategoryExpanded || searchQuery) {
      // Show all when no category, expanded, or searching
      return scoredIngredients;
    }
    // Limit to ITEMS_PER_PAGE when collapsed
    return scoredIngredients.slice(0, ITEMS_PER_PAGE);
  }, [scoredIngredients, selectedCategory, currentCategoryExpanded, searchQuery]);

  // Count of remaining items not shown
  const remainingCount = selectedCategory && !currentCategoryExpanded && !searchQuery
    ? Math.max(0, scoredIngredients.length - ITEMS_PER_PAGE)
    : 0;

  // Render category grid
  const renderCategoryGrid = () => (
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold text-gray-800">
        Browse by Category
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`rounded-lg border-2 p-4 transition-all ${
              selectedCategory === category.id
                ? "border-indigo-500 bg-indigo-50 shadow-md"
                : "border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm"
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
      { name: "Fire", icon: "🔥", colorClass: "bg-red-500" },
      { name: "Water", icon: "💧", colorClass: "bg-blue-500" },
      { name: "Earth", icon: "🌍", colorClass: "bg-green-500" },
      { name: "Air", icon: "💨", colorClass: "bg-sky-500" },
    ] as const;

    // Normalize raw elemental values for display
    const normalized = normalizeForDisplay(elementals);

    return (
      <div className="space-y-2">
        {elements.map(({ name, icon, colorClass }) => {
          const value = normalized[name] || 0;
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
                    className={`h-2 rounded-full ${colorClass}`}
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
  const renderIngredientCard = (ingredient: (typeof scoredIngredients)[0]) => {
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
              {ingredient.subcategory && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500 capitalize">
                    {ingredient.subcategory}
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
            {(ingredient as any).sensoryProfile && (
              <div>
                <div className="mb-2 text-sm font-semibold text-gray-800">
                  Sensory Profile
                </div>
                <div className="space-y-2 text-sm">
                  {/* Taste */}
                  {(ingredient as any).sensoryProfile.taste && (
                    <div>
                      <span className="font-medium text-gray-700">Taste: </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(
                          (ingredient as any).sensoryProfile.taste,
                        )
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
                  {(ingredient as any).sensoryProfile.aroma && (
                    <div>
                      <span className="font-medium text-gray-700">Aroma: </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(
                          (ingredient as any).sensoryProfile.aroma,
                        )
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
                  {(ingredient as any).sensoryProfile.texture && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Texture:{" "}
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(
                          (ingredient as any).sensoryProfile.texture,
                        )
                          .filter(([, value]) => (value as number) > 0)
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .map(([texture, value]) => (
                            <span
                              key={texture}
                              className="rounded-md bg-orange-100 px-2 py-1 text-xs text-orange-700"
                            >
                              {texture} ({Math.round((value as number) * 10)}
                              /10)
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
                        {ingredient.astrologicalProfile.rulingPlanets.join(
                          ", ",
                        )}
                      </span>
                    </div>
                  )}
                  {ingredient.astrologicalProfile.favorableZodiac && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Favorable Signs:{" "}
                      </span>
                      <span className="text-gray-600 capitalize">
                        {ingredient.astrologicalProfile.favorableZodiac.join(
                          ", ",
                        )}
                      </span>
                    </div>
                  )}
                  {(ingredient.astrologicalProfile as any).seasonalAffinity && (
                    <div>
                      <span className="font-medium text-gray-700">
                        Seasonal Affinity:{" "}
                      </span>
                      <span className="text-gray-600 capitalize">
                        {(
                          ingredient.astrologicalProfile as any
                        ).seasonalAffinity.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommended Cooking Methods */}
            {(ingredient as any).recommendedCookingMethods &&
              (ingredient as any).recommendedCookingMethods.length > 0 && (
                <div>
                  <div className="mb-1 text-sm font-semibold text-gray-800">
                    Recommended Cooking Methods
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(ingredient as any).recommendedCookingMethods.map(
                      (method: any, idx: number) => (
                        <span
                          key={idx}
                          className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700"
                        >
                          {method}
                        </span>
                      ),
                    )}
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
                  {(ingredient.pairingRecommendations as any)
                    ?.complementary && (
                    <div>
                      <span className="font-medium text-green-700">
                        Complementary:{" "}
                      </span>
                      <span className="text-gray-600">
                        {(
                          ingredient.pairingRecommendations as any
                        ).complementary.join(", ")}
                      </span>
                    </div>
                  )}
                  {(ingredient.pairingRecommendations as any)?.contrasting && (
                    <div>
                      <span className="font-medium text-orange-700">
                        Contrasting:{" "}
                      </span>
                      <span className="text-gray-600">
                        {(
                          ingredient.pairingRecommendations as any
                        ).contrasting.join(", ")}
                      </span>
                    </div>
                  )}
                  {(ingredient.pairingRecommendations as any)?.toAvoid && (
                    <div>
                      <span className="font-medium text-red-700">Avoid: </span>
                      <span className="text-gray-600">
                        {(
                          ingredient.pairingRecommendations as any
                        ).toAvoid.join(", ")}
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
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Thermodynamic Properties */}
            {(ingredient as any).thermodynamicProperties && (
              <div>
                <div className="mb-2 text-sm font-semibold text-gray-800">
                  Thermodynamic Properties
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(
                    (ingredient as any).thermodynamicProperties,
                  ).map(([prop, value]: [string, any]) => (
                    <div key={prop} className="flex justify-between">
                      <span className="font-medium text-gray-700 capitalize">
                        {prop}:
                      </span>
                      <span className="text-gray-600">
                        {typeof value === "number" ? value.toFixed(3) : value}
                      </span>
                    </div>
                  ))}
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
        Showing {displayedIngredients.length}
        {remainingCount > 0 ? ` of ${scoredIngredients.length}` : ""} ingredient
        {scoredIngredients.length !== 1 ? "s" : ""} (sorted by compatibility)
      </div>

      {/* Ingredients grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedIngredients.map(renderIngredientCard)}
      </div>

      {/* Expand/Collapse button */}
      {selectedCategory && scoredIngredients.length > ITEMS_PER_PAGE && !searchQuery && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => handleToggleExpand(selectedCategory)}
            className="group flex items-center gap-2 rounded-lg border-2 border-indigo-200 bg-white px-6 py-3 text-indigo-700 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-md"
          >
            {currentCategoryExpanded ? (
              <>
                <svg
                  className="h-5 w-5 transition-transform group-hover:-translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                <span className="font-medium">Show Less</span>
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span className="font-medium">
                  Show {remainingCount} More Ingredient{remainingCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {displayedIngredients.length === 0 && (
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
