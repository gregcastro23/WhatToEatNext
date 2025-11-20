"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAlchemical } from "@/contexts/AlchemicalContext/hooks";
import { useEnhancedRecommendations } from "@/hooks/useEnhancedRecommendations";
import {
  unifiedIngredients,
  getUnifiedIngredientsByCategory
} from "@/data/unified/ingredients";
import type { UnifiedIngredient } from "@/data/unified/unifiedTypes";

interface IngredientRecommenderProps {
  initialCategory?: string | null;
  initialSelectedIngredient?: string | null;
  isFullPageVersion?: boolean;
  onCategoryChange?: (category: string) => void;
  onIngredientSelect?: (ingredient: string) => void;
}

// Category definitions
const CATEGORIES = [
  { id: "spices", name: "Spices & Herbs", icon: "🌿" },
  { id: "vegetables", name: "Vegetables", icon: "🥬" },
  { id: "proteins", name: "Proteins", icon: "🥩" },
  { id: "grains", name: "Grains & Legumes", icon: "🌾" },
  { id: "dairy", name: "Dairy", icon: "🧀" },
  { id: "fruits", name: "Fruits", icon: "🍎" },
  { id: "oils", name: "Oils & Fats", icon: "🫒" },
  { id: "sweeteners", name: "Sweeteners", icon: "🍯" },
];

export const IngredientRecommender: React.FC<IngredientRecommenderProps> = ({
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

  // Hooks
  const { recommendations, loading, error, getRecommendations } =
    useEnhancedRecommendations();

  // Get alchemical context (hook must be called unconditionally)
  const alchemicalContext = useAlchemical();

  // Fetch recommendations
  useEffect(() => {
    void getRecommendations({
      datetime: new Date().toISOString(),
      useBackendInfluence: true,
    });
  }, [selectedCategory, getRecommendations]);

  // Get all ingredients from the unified system
  const allIngredients = useMemo(() => {
    return Object.values(unifiedIngredients) as UnifiedIngredient[];
  }, []);

  // Filter ingredients
  const filteredIngredients = useMemo(
    () =>
      allIngredients.filter((item) => {
        const matchesSearch =
          !searchQuery ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
          !selectedCategory || item.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
      }),
    [allIngredients, searchQuery, selectedCategory],
  );

  // Handlers
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedIngredient(null);
    onCategoryChange?.(categoryId);
  };

  const handleIngredientSelect = (ingredientId: string) => {
    setSelectedIngredient(ingredientId);
    onIngredientSelect?.(ingredientId);
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

  // Render ingredient card
  const renderIngredientCard = (
    ingredient: UnifiedIngredient,
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
        <div className="mb-2 flex items-start justify-between">
          <h4 className="text-lg font-semibold text-gray-900 capitalize">
            {ingredient.name.replace(/_/g, ' ')}
          </h4>
          {ingredient.kalchm && (
            <div className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
              K: {ingredient.kalchm.toFixed(2)}
            </div>
          )}
        </div>

        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs text-gray-500 capitalize">{ingredient.category}</span>
          {ingredient.subcategory && (
            <>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 capitalize">{ingredient.subcategory}</span>
            </>
          )}
        </div>

        {/* Elemental Properties - Always visible */}
        <div className="mb-2">
          <div className="text-xs font-medium text-gray-600 mb-1">Elements</div>
          <div className="flex flex-wrap gap-1">
            {ingredient.elementalProperties && (
              <>
                {ingredient.elementalProperties.Fire > 0 && (
                  <span className="rounded-md bg-red-100 px-2 py-1 text-xs text-red-700">
                    🔥 {(ingredient.elementalProperties.Fire * 100).toFixed(0)}%
                  </span>
                )}
                {ingredient.elementalProperties.Water > 0 && (
                  <span className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700">
                    💧 {(ingredient.elementalProperties.Water * 100).toFixed(0)}%
                  </span>
                )}
                {ingredient.elementalProperties.Earth > 0 && (
                  <span className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-700">
                    🌍 {(ingredient.elementalProperties.Earth * 100).toFixed(0)}%
                  </span>
                )}
                {ingredient.elementalProperties.Air > 0 && (
                  <span className="rounded-md bg-cyan-100 px-2 py-1 text-xs text-cyan-700">
                    💨 {(ingredient.elementalProperties.Air * 100).toFixed(0)}%
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Qualities - Always visible if available */}
        {ingredient.qualities && ingredient.qualities.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {ingredient.qualities.slice(0, isSelected ? undefined : 3).map((quality, idx) => (
              <span
                key={idx}
                className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {quality}
              </span>
            ))}
            {!isSelected && ingredient.qualities.length > 3 && (
              <span className="text-xs text-gray-400">+{ingredient.qualities.length - 3} more</span>
            )}
          </div>
        )}

        {/* Expanded details when selected */}
        {isSelected && (
          <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
            {/* Alchemical Properties */}
            {ingredient.alchemicalProperties && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Alchemical Properties (ESMS)</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded bg-purple-50 px-2 py-1">
                    <span className="text-xs text-gray-600">Spirit:</span>
                    <span className="ml-1 text-xs font-medium text-purple-700">
                      {ingredient.alchemicalProperties.Spirit?.toFixed(2) ?? 'N/A'}
                    </span>
                  </div>
                  <div className="rounded bg-blue-50 px-2 py-1">
                    <span className="text-xs text-gray-600">Essence:</span>
                    <span className="ml-1 text-xs font-medium text-blue-700">
                      {ingredient.alchemicalProperties.Essence?.toFixed(2) ?? 'N/A'}
                    </span>
                  </div>
                  <div className="rounded bg-green-50 px-2 py-1">
                    <span className="text-xs text-gray-600">Matter:</span>
                    <span className="ml-1 text-xs font-medium text-green-700">
                      {ingredient.alchemicalProperties.Matter?.toFixed(2) ?? 'N/A'}
                    </span>
                  </div>
                  <div className="rounded bg-yellow-50 px-2 py-1">
                    <span className="text-xs text-gray-600">Substance:</span>
                    <span className="ml-1 text-xs font-medium text-yellow-700">
                      {ingredient.alchemicalProperties.Substance?.toFixed(2) ?? 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Thermodynamic Metrics */}
            {ingredient.energyProfile && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Thermodynamic Metrics</div>
                <div className="grid grid-cols-2 gap-2">
                  {ingredient.energyProfile.heat !== undefined && (
                    <div className="rounded bg-orange-50 px-2 py-1">
                      <span className="text-xs text-gray-600">Heat:</span>
                      <span className="ml-1 text-xs font-medium text-orange-700">
                        {ingredient.energyProfile.heat.toFixed(3)}
                      </span>
                    </div>
                  )}
                  {ingredient.energyProfile.entropy !== undefined && (
                    <div className="rounded bg-indigo-50 px-2 py-1">
                      <span className="text-xs text-gray-600">Entropy:</span>
                      <span className="ml-1 text-xs font-medium text-indigo-700">
                        {ingredient.energyProfile.entropy.toFixed(3)}
                      </span>
                    </div>
                  )}
                  {ingredient.energyProfile.reactivity !== undefined && (
                    <div className="rounded bg-pink-50 px-2 py-1">
                      <span className="text-xs text-gray-600">Reactivity:</span>
                      <span className="ml-1 text-xs font-medium text-pink-700">
                        {ingredient.energyProfile.reactivity.toFixed(3)}
                      </span>
                    </div>
                  )}
                  {ingredient.energyProfile.gregsEnergy !== undefined && (
                    <div className="rounded bg-teal-50 px-2 py-1">
                      <span className="text-xs text-gray-600">GregsEnergy:</span>
                      <span className="ml-1 text-xs font-medium text-teal-700">
                        {ingredient.energyProfile.gregsEnergy.toFixed(3)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Monica constant */}
            {ingredient.monica !== undefined && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Monica Constant</div>
                <div className="rounded bg-violet-50 px-2 py-1">
                  <span className="text-xs font-medium text-violet-700">
                    {ingredient.monica.toFixed(4)}
                  </span>
                </div>
              </div>
            )}

            {/* Astrological Profile */}
            {ingredient.astrologicalProfile && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Astrological Profile</div>
                <div className="space-y-1">
                  {ingredient.astrologicalProfile.rulingPlanets &&
                   ingredient.astrologicalProfile.rulingPlanets.length > 0 && (
                    <div className="text-xs">
                      <span className="text-gray-600">Ruling Planets:</span>
                      <span className="ml-1 text-gray-800">
                        {ingredient.astrologicalProfile.rulingPlanets.join(', ')}
                      </span>
                    </div>
                  )}
                  {ingredient.astrologicalProfile.favorableZodiac &&
                   ingredient.astrologicalProfile.favorableZodiac.length > 0 && (
                    <div className="text-xs">
                      <span className="text-gray-600">Favorable Zodiac:</span>
                      <span className="ml-1 text-gray-800">
                        {ingredient.astrologicalProfile.favorableZodiac.join(', ')}
                      </span>
                    </div>
                  )}
                  {ingredient.planetaryRuler && (
                    <div className="text-xs">
                      <span className="text-gray-600">Planetary Ruler:</span>
                      <span className="ml-1 text-gray-800">
                        {ingredient.planetaryRuler}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Origin */}
            {ingredient.origin && ingredient.origin.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Origin</div>
                <div className="flex flex-wrap gap-1">
                  {ingredient.origin.map((origin, idx) => (
                    <span key={idx} className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-700">
                      {origin}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Flavor Profile */}
            {ingredient.flavorProfile && Object.keys(ingredient.flavorProfile).length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Flavor Profile</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(ingredient.flavorProfile)
                    .filter(([_, value]) => value > 0)
                    .map(([flavor, value], idx) => (
                      <span key={idx} className="rounded-md bg-rose-100 px-2 py-1 text-xs text-rose-700">
                        {flavor}: {(Number(value) * 100).toFixed(0)}%
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Description if available */}
            {ingredient.description && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Description</div>
                <p className="text-sm text-gray-700">{ingredient.description}</p>
              </div>
            )}

            {/* Health Benefits */}
            {ingredient.healthBenefits && ingredient.healthBenefits.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Health Benefits</div>
                <ul className="list-disc list-inside space-y-1">
                  {ingredient.healthBenefits.map((benefit, idx) => (
                    <li key={idx} className="text-xs text-gray-700">{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Seasonality */}
            {ingredient.seasonality && ingredient.seasonality.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Seasonality</div>
                <div className="flex flex-wrap gap-1">
                  {ingredient.seasonality.map((season, idx) => (
                    <span key={idx} className="rounded-md bg-lime-100 px-2 py-1 text-xs text-lime-700 capitalize">
                      {season}
                    </span>
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

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-red-800">
          Error Loading Ingredients
        </h3>
        <p className="text-red-600">
          {error || "An unexpected error occurred"}
        </p>
        <button
          onClick={() => {
            void getRecommendations({
              datetime: new Date().toISOString(),
              useBackendInfluence: true,
            });
          }}
          className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="p-6">
      {/* Current moment summary */}
      {alchemicalContext && (
        <div className="mb-6 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Season</div>
              <div className="text-lg font-semibold text-gray-900 capitalize">
                {alchemicalContext.state?.currentSeason || "Unknown"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Time of Day</div>
              <div className="text-lg font-semibold text-gray-900 capitalize">
                {alchemicalContext.state?.timeOfDay || "Unknown"}
              </div>
            </div>
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

      {/* Ingredients grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredIngredients.map(renderIngredientCard)}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          {searchQuery || selectedCategory
            ? "No ingredients match your filters."
            : "No ingredients available at this time."}
        </div>
      )}
    </div>
  );
};

export default IngredientRecommender;
