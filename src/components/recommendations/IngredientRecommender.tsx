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
            ? "border-indigo-500 bg-indigo-50 shadow-lg md:col-span-2 lg:col-span-3"
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

            {/* Smoke Point (for oils) */}
            {(ingredient as any).smokePoint && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Smoke Point</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded bg-orange-50 px-2 py-1">
                    <span className="text-xs text-gray-600">Celsius:</span>
                    <span className="ml-1 text-xs font-medium text-orange-700">
                      {(ingredient as any).smokePoint.celsius}°C
                    </span>
                  </div>
                  <div className="rounded bg-orange-50 px-2 py-1">
                    <span className="text-xs text-gray-600">Fahrenheit:</span>
                    <span className="ml-1 text-xs font-medium text-orange-700">
                      {(ingredient as any).smokePoint.fahrenheit}°F
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Potency & Heat Level (for spices) */}
            {((ingredient as any).potency !== undefined || (ingredient as any).heatLevel !== undefined) && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Intensity</div>
                <div className="flex gap-2">
                  {(ingredient as any).potency !== undefined && (
                    <div className="rounded bg-red-50 px-2 py-1">
                      <span className="text-xs text-gray-600">Potency:</span>
                      <span className="ml-1 text-xs font-medium text-red-700">
                        {(ingredient as any).potency}/10
                      </span>
                    </div>
                  )}
                  {(ingredient as any).heatLevel !== undefined && (
                    <div className="rounded bg-red-50 px-2 py-1">
                      <span className="text-xs text-gray-600">Heat Level:</span>
                      <span className="ml-1 text-xs font-medium text-red-700">
                        {(ingredient as any).heatLevel}/10
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sensory Profile */}
            {(ingredient as any).sensoryProfile && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-2">Sensory Profile</div>

                {/* Taste */}
                {(ingredient as any).sensoryProfile.taste && Object.keys((ingredient as any).sensoryProfile.taste).length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-600 mb-1">Taste:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries((ingredient as any).sensoryProfile.taste)
                        .filter(([_, value]) => value > 0)
                        .map(([taste, value], idx) => (
                          <span key={idx} className="rounded-md bg-pink-100 px-2 py-1 text-xs text-pink-700">
                            {taste}: {(Number(value) * 100).toFixed(0)}%
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Aroma */}
                {(ingredient as any).sensoryProfile.aroma && Object.keys((ingredient as any).sensoryProfile.aroma).length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-gray-600 mb-1">Aroma:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries((ingredient as any).sensoryProfile.aroma)
                        .filter(([_, value]) => value > 0)
                        .map(([aroma, value], idx) => (
                          <span key={idx} className="rounded-md bg-purple-100 px-2 py-1 text-xs text-purple-700">
                            {aroma}: {(Number(value) * 100).toFixed(0)}%
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Texture */}
                {(ingredient as any).sensoryProfile.texture && Object.keys((ingredient as any).sensoryProfile.texture).length > 0 && (
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Texture:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries((ingredient as any).sensoryProfile.texture)
                        .filter(([_, value]) => value > 0)
                        .map(([texture, value], idx) => (
                          <span key={idx} className="rounded-md bg-teal-100 px-2 py-1 text-xs text-teal-700">
                            {texture}: {(Number(value) * 100).toFixed(0)}%
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Storage Information */}
            {(ingredient as any).storage && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Storage</div>
                <div className="space-y-1 rounded bg-slate-50 px-2 py-2">
                  {(ingredient as any).storage.duration && (
                    <div className="text-xs">
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-1 text-gray-800">{(ingredient as any).storage.duration}</span>
                    </div>
                  )}
                  {(ingredient as any).storage.container && (
                    <div className="text-xs">
                      <span className="text-gray-600">Container:</span>
                      <span className="ml-1 text-gray-800">{(ingredient as any).storage.container}</span>
                    </div>
                  )}
                  {(ingredient as any).storage.temperature && (
                    <div className="text-xs">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="ml-1 text-gray-800">
                        {typeof (ingredient as any).storage.temperature === 'string'
                          ? (ingredient as any).storage.temperature
                          : `${(ingredient as any).storage.temperature.celsius}°C / ${(ingredient as any).storage.temperature.fahrenheit}°F`
                        }
                      </span>
                    </div>
                  )}
                  {(ingredient as any).storage.notes && (
                    <div className="text-xs">
                      <span className="text-gray-600">Notes:</span>
                      <span className="ml-1 text-gray-800">{(ingredient as any).storage.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preparation Methods */}
            {(ingredient as any).preparation && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Preparation</div>
                <div className="space-y-2">
                  {(ingredient as any).preparation.fresh && (
                    <div className="rounded bg-green-50 px-2 py-2">
                      <div className="text-xs font-medium text-green-800 mb-1">Fresh:</div>
                      <div className="text-xs text-gray-700 space-y-1">
                        <div>Duration: {(ingredient as any).preparation.fresh.duration}</div>
                        <div>Storage: {(ingredient as any).preparation.fresh.storage}</div>
                        {(ingredient as any).preparation.fresh.tips && (
                          <div>
                            <div className="font-medium mt-1">Tips:</div>
                            <ul className="list-disc list-inside ml-2">
                              {(ingredient as any).preparation.fresh.tips.map((tip: string, idx: number) => (
                                <li key={idx}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {(ingredient as any).preparation.dried && (
                    <div className="rounded bg-amber-50 px-2 py-2">
                      <div className="text-xs font-medium text-amber-800 mb-1">Dried:</div>
                      <div className="text-xs text-gray-700 space-y-1">
                        <div>Duration: {(ingredient as any).preparation.dried.duration}</div>
                        <div>Storage: {(ingredient as any).preparation.dried.storage}</div>
                        {(ingredient as any).preparation.dried.tips && (
                          <div>
                            <div className="font-medium mt-1">Tips:</div>
                            <ul className="list-disc list-inside ml-2">
                              {(ingredient as any).preparation.dried.tips.map((tip: string, idx: number) => (
                                <li key={idx}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {(ingredient as any).preparation.methods && (ingredient as any).preparation.methods.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Methods:</div>
                      <div className="flex flex-wrap gap-1">
                        {(ingredient as any).preparation.methods.map((method: string, idx: number) => (
                          <span key={idx} className="rounded-md bg-blue-100 px-2 py-1 text-xs text-blue-700">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pairing Recommendations */}
            {(ingredient as any).pairingRecommendations && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Pairing Recommendations</div>
                <div className="space-y-2">
                  {(ingredient as any).pairingRecommendations.complementary &&
                   (ingredient as any).pairingRecommendations.complementary.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Complementary:</div>
                      <div className="flex flex-wrap gap-1">
                        {(ingredient as any).pairingRecommendations.complementary.map((item: string, idx: number) => (
                          <span key={idx} className="rounded-md bg-green-100 px-2 py-1 text-xs text-green-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(ingredient as any).pairingRecommendations.contrasting &&
                   (ingredient as any).pairingRecommendations.contrasting.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Contrasting:</div>
                      <div className="flex flex-wrap gap-1">
                        {(ingredient as any).pairingRecommendations.contrasting.map((item: string, idx: number) => (
                          <span key={idx} className="rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(ingredient as any).pairingRecommendations.toAvoid &&
                   (ingredient as any).pairingRecommendations.toAvoid.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">To Avoid:</div>
                      <div className="flex flex-wrap gap-1">
                        {(ingredient as any).pairingRecommendations.toAvoid.map((item: string, idx: number) => (
                          <span key={idx} className="rounded-md bg-red-100 px-2 py-1 text-xs text-red-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommended Cooking Methods */}
            {(ingredient as any).recommendedCookingMethods &&
             (ingredient as any).recommendedCookingMethods.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Recommended Cooking Methods</div>
                <div className="space-y-2">
                  {(ingredient as any).recommendedCookingMethods.map((method: any, idx: number) => (
                    <div key={idx} className="rounded bg-indigo-50 px-2 py-2">
                      <div className="text-xs font-medium text-indigo-800 mb-1">{method.name}</div>
                      <div className="text-xs text-gray-700">
                        <div>{method.description}</div>
                        {method.cookingTime && (
                          <div className="mt-1">
                            Time: {method.cookingTime.min}-{method.cookingTime.max} {method.cookingTime.unit}
                          </div>
                        )}
                        {method.temperatures && (
                          <div>
                            Temp: {method.temperatures.min}-{method.temperatures.max}°{method.temperatures.unit === 'celsius' ? 'C' : 'F'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Culinary Properties (from enhanced ingredients) */}
            {(ingredient as any).culinaryProperties && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Culinary Properties</div>
                <div className="space-y-2">
                  {(ingredient as any).culinaryProperties.cookingMethods &&
                   (ingredient as any).culinaryProperties.cookingMethods.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Cooking Methods:</div>
                      <div className="flex flex-wrap gap-1">
                        {(ingredient as any).culinaryProperties.cookingMethods.map((method: any, idx: number) => (
                          <span key={idx} className="rounded-md bg-sky-100 px-2 py-1 text-xs text-sky-700">
                            {typeof method === 'string' ? method : method.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(ingredient as any).culinaryProperties.pairings &&
                   (ingredient as any).culinaryProperties.pairings.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Pairings:</div>
                      <div className="flex flex-wrap gap-1">
                        {(ingredient as any).culinaryProperties.pairings.map((pairing: string, idx: number) => (
                          <span key={idx} className="rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                            {pairing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(ingredient as any).culinaryProperties.substitutions &&
                   (ingredient as any).culinaryProperties.substitutions.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Substitutions:</div>
                      <div className="flex flex-wrap gap-1">
                        {(ingredient as any).culinaryProperties.substitutions.map((sub: string, idx: number) => (
                          <span key={idx} className="rounded-md bg-violet-100 px-2 py-1 text-xs text-violet-700">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(ingredient as any).culinaryProperties.preparationMethods &&
                   (ingredient as any).culinaryProperties.preparationMethods.length > 0 && (
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Preparation Methods:</div>
                      <div className="flex flex-wrap gap-1">
                        {(ingredient as any).culinaryProperties.preparationMethods.map((method: string, idx: number) => (
                          <span key={idx} className="rounded-md bg-cyan-100 px-2 py-1 text-xs text-cyan-700">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Varieties */}
            {(ingredient as any).varieties && Object.keys((ingredient as any).varieties).length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Varieties</div>
                <div className="space-y-2">
                  {Object.entries((ingredient as any).varieties).map(([name, details]: [string, any], idx: number) => (
                    <div key={idx} className="rounded bg-amber-50 px-2 py-2">
                      <div className="text-xs font-medium text-amber-800 mb-1 capitalize">{name.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-gray-700 space-y-1">
                        {details.appearance && <div><span className="font-medium">Appearance:</span> {details.appearance}</div>}
                        {details.flavor && <div><span className="font-medium">Flavor:</span> {details.flavor}</div>}
                        {details.texture && <div><span className="font-medium">Texture:</span> {details.texture}</div>}
                        {details.uses && <div><span className="font-medium">Uses:</span> {details.uses}</div>}
                        {details.characteristics && <div><span className="font-medium">Characteristics:</span> {details.characteristics}</div>}
                        {details.season && <div><span className="font-medium">Season:</span> {details.season}</div>}
                        {details.notes && <div><span className="font-medium">Notes:</span> {details.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety Thresholds */}
            {(ingredient as any).safetyThresholds && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Safety Thresholds</div>
                <div className="rounded bg-red-50 px-2 py-2 space-y-1">
                  {(ingredient as any).safetyThresholds.minimum && (
                    <div className="text-xs">
                      <span className="text-gray-600">Minimum Safe Temp:</span>
                      <span className="ml-1 text-gray-800">
                        {(ingredient as any).safetyThresholds.minimum.celsius}°C / {(ingredient as any).safetyThresholds.minimum.fahrenheit}°F
                      </span>
                    </div>
                  )}
                  {(ingredient as any).safetyThresholds.maximum && (
                    <div className="text-xs">
                      <span className="text-gray-600">Maximum Safe Temp:</span>
                      <span className="ml-1 text-gray-800">
                        {(ingredient as any).safetyThresholds.maximum.celsius}°C / {(ingredient as any).safetyThresholds.maximum.fahrenheit}°F
                      </span>
                    </div>
                  )}
                  {(ingredient as any).safetyThresholds.notes && (
                    <div className="text-xs">
                      <span className="text-gray-600">Notes:</span>
                      <span className="ml-1 text-gray-800">{(ingredient as any).safetyThresholds.notes}</span>
                    </div>
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
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
