import React, { useState, useEffect, useMemo } from 'react';

import {
  ingredientFilterService,
  INGREDIENT_GROUPS,
  type NutritionalFilter,
  type IngredientFilter,
  type RecipeRecommendation,
} from '@/services/IngredientFilterService';
import { ElementalProperties } from '@/types/alchemy';
import type { Ingredient, UnifiedIngredient } from '@/types/ingredient';

// Define IngredientMapping interface for nutritional recommendations
interface IngredientMapping {
  ingredient: string;
  nutritionalValue: number;
  elementalProperties?: ElementalProperties;
  seasonalAvailability?: string[];
  healthBenefits?: string[];
}


interface NutritionalRecommenderProps {
  initialFilter?: IngredientFilter;
  itemsPerCategory?: number;
  showAllCategories?: boolean;
}

const NutritionalRecommender: React.FC<NutritionalRecommenderProps> = ({
  initialFilter = {},
  itemsPerCategory = 3,
  showAllCategories = true,
}) => {
  const [filter, setFilter] = useState<IngredientFilter>(initialFilter);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [enhancedNutritionData, setEnhancedNutritionData] = useState<
    Record<string, unknown>
  >({});
  const [recipeRecommendations, setRecipeRecommendations] = useState<
    RecipeRecommendation[]
  >([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(false);
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(
    null
  );
  const [isSpoonacularLoading, setIsSpoonacularLoading] = useState<
    Record<string, boolean>
  >({});

  // Filter category options for rendering tabs
  const categoryOptions = useMemo(() => {
    return Object.values(INGREDIENT_GROUPS);
  }, []);

  // Apply filtering based on the current filter settings
  const recommendations = useMemo(() => {
    return ingredientFilterService.getBalancedRecommendations(
      itemsPerCategory,
      filter
    );
  }, [filter, itemsPerCategory]);

  // Handle filter changes from the form
  const handleFilterChange = (newFilterValues: Partial<IngredientFilter>) => {
    setFilter((prev) => ({
      ...prev,
      ...newFilterValues,
    }));
  };

  // Update nutritional filter settings
  const handleNutritionalFilterChange = (
    nutritionalFilter: Partial<NutritionalFilter>
  ) => {
    setFilter((prev) => ({
      ...prev,
      nutritional: {
        ...prev.nutritional,
        ...nutritionalFilter,
      },
    }));
  };

  // Handle tab switching
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);

    if (tabName === 'all') {
      // Remove category filter to show all categories
      const { categories, ...restFilter } = filter;
      setFilter(restFilter);
    } else {
      // Filter to show only the selected category
      setFilter((prev) => ({
        ...prev,
        categories: [tabName],
      }));
    }
  };

  // Toggle ingredient selection for recipe recommendations
  const toggleIngredientSelection = (ingredientName: string) => {
    setSelectedIngredients((prev) => {
      if (prev.includes(ingredientName)) {
        return prev.filter((name) => name !== ingredientName);
      } else {
        return [...prev, ingredientName];
      }
    });
  };

  // Fetch enhanced nutrition data from Spoonacular
  const fetchEnhancedNutritionData = async (ingredientName: string) => {
    if (
      enhancedNutritionData[ingredientName] ||
      isSpoonacularLoading[ingredientName]
    ) {
      return;
    }

    setIsSpoonacularLoading((prev) => ({ ...prev, [ingredientName]: true }));

    try {
      const data = await ingredientFilterService.getEnhancedNutritionData(
        ingredientName
      );
      if (data) {
        setEnhancedNutritionData((prev) => ({
          ...prev,
          [ingredientName]: data,
        }));
      }
    } catch (error) {
      // console.error(`Error fetching enhanced data for ${ingredientName}:`, error);
    } finally {
      setIsSpoonacularLoading((prev) => ({ ...prev, [ingredientName]: false }));
    }
  };

  // Fetch recipe recommendations when selected ingredients change
  useEffect(() => {
    const getRecipes = async () => {
      if (selectedIngredients.length === 0) {
        setRecipeRecommendations([]);
        return;
      }

      setIsLoadingRecipes(true);
      try {
        const recipes = await ingredientFilterService.getRecipeRecommendations(
          selectedIngredients,
          filter.dietary
        );
        setRecipeRecommendations(recipes);
      } catch (error) {
        // console.error("Error fetching recipe recommendations:", error);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    getRecipes();
  }, [selectedIngredients, filter.dietary]);

  // Determine which categories to display based on active tab and available data
  const categoriesToDisplay = useMemo(() => {
    if (activeTab === 'all') {
      return Object.keys(recommendations);
    }
    return Object.keys(recommendations).filter((cat) => cat === activeTab);
  }, [recommendations, activeTab]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">
        Nutritional Recommendations
      </h2>

      {/* Filter Controls */}
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <h3 className="font-medium mb-2">Filter Options</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* High protein toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="highProteinToggle"
              className="mr-2"
              checked={filter.nutritional?.highProtein || false}
              onChange={(e) =>
                handleNutritionalFilterChange({ highProtein: e.target.checked })
              }
            />
            <label htmlFor="highProteinToggle">High Protein</label>
          </div>

          {/* Low carb toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lowCarbToggle"
              className="mr-2"
              checked={filter.nutritional?.lowCarb || false}
              onChange={(e) =>
                handleNutritionalFilterChange({ lowCarb: e.target.checked })
              }
            />
            <label htmlFor="lowCarbToggle">Low Carb</label>
          </div>

          {/* Low fat toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lowFatToggle"
              className="mr-2"
              checked={filter.nutritional?.lowFat || false}
              onChange={(e) =>
                handleNutritionalFilterChange({ lowFat: e.target.checked })
              }
            />
            <label htmlFor="lowFatToggle">Low Fat</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Vitamin filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Vitamins</label>
            <select
              className="w-full p-2 border rounded"
              value=""
              onChange={(e) => {
                const selectedVitamin = e.target.value;
                if (selectedVitamin) {
                  const currentVitamins = filter.nutritional?.vitamins || [];
                  handleNutritionalFilterChange({
                    vitamins: [...currentVitamins, selectedVitamin],
                  });
                }
              }}
            >
              <option value="">Select vitamins to include</option>
              <option value="a">Vitamin A</option>
              <option value="c">Vitamin C</option>
              <option value="d">Vitamin D</option>
              <option value="e">Vitamin E</option>
              <option value="k">Vitamin K</option>
              <option value="b6">Vitamin B6</option>
              <option value="b12">Vitamin B12</option>
              <option value="folate">Folate</option>
            </select>

            {/* Display selected vitamins with remove option */}
            {filter.nutritional?.vitamins &&
              filter.nutritional.vitamins.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filter.nutritional.vitamins.map((vitamin) => (
                    <span
                      key={vitamin}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center"
                    >
                      Vitamin {vitamin.toUpperCase()}
                      <button
                        className="ml-1 text-blue-800"
                        onClick={() => {
                          const updatedVitamins =
                            filter.nutritional?.vitamins?.filter(
                              (v) => v !== vitamin
                            ) || [];
                          handleNutritionalFilterChange({
                            vitamins: updatedVitamins,
                          });
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
          </div>

          {/* Minerals filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Minerals</label>
            <select
              className="w-full p-2 border rounded"
              value=""
              onChange={(e) => {
                const selectedMineral = e.target.value;
                if (selectedMineral) {
                  const currentMinerals = filter.nutritional?.minerals || [];
                  handleNutritionalFilterChange({
                    minerals: [...currentMinerals, selectedMineral],
                  });
                }
              }}
            >
              <option value="">Select minerals to include</option>
              <option value="calcium">Calcium</option>
              <option value="iron">Iron</option>
              <option value="magnesium">Magnesium</option>
              <option value="potassium">Potassium</option>
              <option value="zinc">Zinc</option>
              <option value="selenium">Selenium</option>
            </select>

            {/* Display selected minerals with remove option */}
            {filter.nutritional?.minerals &&
              filter.nutritional.minerals.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filter.nutritional.minerals.map((mineral) => (
                    <span
                      key={mineral}
                      className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center"
                    >
                      {mineral.charAt(0).toUpperCase() + mineral.slice(1)}
                      <button
                        className="ml-1 text-green-800"
                        onClick={() => {
                          const updatedMinerals =
                            filter.nutritional?.minerals?.filter(
                              (m) => m !== mineral
                            ) || [];
                          handleNutritionalFilterChange({
                            minerals: updatedMinerals,
                          });
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Search query filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Search ingredients..."
            value={filter.searchQuery || ''}
            onChange={(e) =>
              handleFilterChange({ searchQuery: e.target.value })
            }
          />
        </div>
      </div>

      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">Selected Ingredients for Recipes</h3>
          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map((ingredient) => (
              <span
                key={ingredient}
                className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full flex items-center"
              >
                {ingredient}
                <button
                  className="ml-2 text-purple-800"
                  onClick={() => toggleIngredientSelection(ingredient)}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              className="text-sm text-purple-600 hover:text-purple-800"
              onClick={() => setSelectedIngredients([])}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Recipe Recommendations */}
      {selectedIngredients.length > 0 && (
        <div className="mb-8">
          <h3 className="font-medium mb-3">Recipe Recommendations</h3>

          {isLoadingRecipes ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">
                Finding recipes with your ingredients...
              </p>
            </div>
          ) : recipeRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipeRecommendations.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-600">
              No recipes found with the selected ingredients. Try selecting
              different ingredients.
            </div>
          )}
        </div>
      )}

      {/* Category Tabs */}
      <div className="mb-4 border-b">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              className={`inline-block p-2 rounded-t-lg ${
                activeTab === 'all'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'border-transparent hover:border-gray-300 hover:text-gray-600'
              }`}
              onClick={() => handleTabChange('all')}
            >
              All Categories
            </button>
          </li>

          {categoryOptions.map((category) => (
            <li className="mr-2" key={category}>
              <button
                className={`inline-block p-2 rounded-t-lg ${
                  activeTab === category
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'border-transparent hover:border-gray-300 hover:text-gray-600'
                }`}
                onClick={() => handleTabChange(category)}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Results Display */}
      <div>
        {categoriesToDisplay.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No recommendations found with the current filters.
          </div>
        ) : (
          categoriesToDisplay.map((category) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-medium mb-3">{category}</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(recommendations[category] as Ingredient[]).map(
                  (value: Ingredient, _index: number, _array: Ingredient[]): React.ReactElement => {
                    // Extract ingredient data with safe property access
                    // ✅ Pattern MM-1: Safe type assertion for ingredient data
                    const ingredientData = (value as unknown) as Record<string, unknown>;
                    const ingredientName = String(ingredientData.name || ingredientData.ingredient || '');
                    
                    return (
                      <IngredientCard
                        key={ingredientName}
                        ingredient={value}
                        isSelected={selectedIngredients.includes(ingredientName)}
                        onToggleSelection={toggleIngredientSelection}
                        enhancedData={enhancedNutritionData[ingredientName]}
                        isSpoonacularLoading={
                          isSpoonacularLoading[ingredientName] || false
                        }
                        onLoadSpoonacularData={() =>
                          fetchEnhancedNutritionData(ingredientName)
                        }
                        isExpanded={expandedIngredient === ingredientName}
                        onToggleExpand={(name) =>
                          setExpandedIngredient((prev) =>
                            prev === name ? null : name
                          )
                        }
                      />
                    );
                  }
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Recipe card subcomponent
const RecipeCard: React.FC<{ recipe: RecipeRecommendation }> = ({ recipe }) => {
  // Find key nutrients
  // ✅ Pattern GG-6: Safe property access for nutrition data
  const getKeyNutrient = (name: string) => {
    const nutrients = Array.isArray(recipe.nutrition.nutrients) ? recipe.nutrition.nutrients : [];
    return nutrients.find(
      (n: Record<string, unknown>) => String(n.name || '').toLowerCase() === name.toLowerCase()
    );
  };

  const calories = getKeyNutrient('Calories');
  const protein = getKeyNutrient('Protein');
  const carbs = getKeyNutrient('Carbohydrates');
  const fat = getKeyNutrient('Fat');

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h4 className="font-medium text-lg mb-2">{recipe.title}</h4>

        {/* Recipe details */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{recipe.readyInMinutes} min</span>
          </div>
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>Health: {recipe.healthScore}%</span>
          </div>
        </div>

        {/* Nutritional values */}
        <div className="grid grid-cols-4 gap-1 mb-3">
          {calories && (
            <div className="bg-gray-50 p-1 rounded text-center">
              <div className="text-xs text-gray-500">Calories</div>
              <div className="font-medium">{Math.round(Number((calories as Record<string, unknown>).amount || 0))}</div>
            </div>
          )}
          {protein && (
            <div className="bg-gray-50 p-1 rounded text-center">
              <div className="text-xs text-gray-500">Protein</div>
              <div className="font-medium">{Math.round(Number((protein as Record<string, unknown>).amount || 0))}g</div>
            </div>
          )}
          {carbs && (
            <div className="bg-gray-50 p-1 rounded text-center">
              <div className="text-xs text-gray-500">Carbs</div>
              <div className="font-medium">{Math.round(Number((carbs as Record<string, unknown>).amount || 0))}g</div>
            </div>
          )}
          {fat && (
            <div className="bg-gray-50 p-1 rounded text-center">
              <div className="text-xs text-gray-500">Fat</div>
              <div className="font-medium">{Math.round(Number((fat as Record<string, unknown>).amount || 0))}g</div>
            </div>
          )}
        </div>

        {/* Ingredients used */}
        <div className="mt-3 text-sm">
          <div className="font-medium mb-1">Ingredients:</div>
          <div className="flex flex-wrap gap-1">
            {/* ✅ Pattern GG-6: Safe property access for used ingredients */}
            {Array.isArray(recipe.usedIngredients) && recipe.usedIngredients.map((ingredient, idx) => (
              <span
                key={idx}
                className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Ingredient card subcomponent
interface IngredientCardProps {
  ingredient: Ingredient;
  isSelected: boolean;
  onToggleSelection: (name: string) => void;
  enhancedData?: unknown;
  isSpoonacularLoading: boolean;
  onLoadSpoonacularData: () => void;
  isExpanded: boolean;
  onToggleExpand: (name: string) => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  isSelected,
  onToggleSelection,
  enhancedData,
  isSpoonacularLoading,
  onLoadSpoonacularData,
  isExpanded,
  onToggleExpand,
}) => {
  // Extract ingredient data with safe property access
  // ✅ Pattern MM-1: Safe type assertion for ingredient data
  const ingredientData = (ingredient as unknown) as Record<string, unknown>;
  const nutritionalProfile = (ingredientData.nutritionalProfile as Record<string, unknown>) || {};
  const ingredientName = String(ingredientData.name || ingredientData.ingredient || '');
  const qualities = Array.isArray(ingredientData.qualities) ? ingredientData.qualities as string[] : undefined;

  return (
    <div
      className={`bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative
                  ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-lg">{ingredientName}</h4>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-purple-600"
            checked={isSelected}
            onChange={() => onToggleSelection(ingredientName)}
          />
          <span className="ml-1 text-xs text-gray-600">Select</span>
        </label>
      </div>

      {qualities && qualities.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {qualities.map((quality: string) => (
            <span
              key={quality}
              className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded"
            >
              {quality}
            </span>
          ))}
        </div>
      )}

      {/* Elemental properties visualization */}
      {ingredient.elementalProperties && (
        <div className="mb-3 grid grid-cols-4 gap-1">
          {Object.entries(ingredient.elementalProperties).map(
            ([element, value]) => (
              <div key={element} className="text-center">
                <div
                  className={`mx-auto w-6 h-6 rounded-full flex items-center justify-center text-white text-xs
                  ${
                    element === 'Fire'
                      ? 'bg-red-500'
                      : element === 'Water'
                      ? 'bg-blue-500'
                      : element === 'Earth'
                      ? 'bg-amber-700'
                      : 'bg-sky-300'
                  }`}
                >
                  {element.charAt(0)}
                </div>
                <div className="text-xs mt-1">{Math.round(value * 100)}%</div>
              </div>
            )
          )}
        </div>
      )}

      {/* Nutritional information display */}
      <div className="space-y-1 mt-3 border-t pt-2">
        <div className="flex justify-between">
          <h5 className="text-sm font-medium">Nutrition</h5>
          <button
            onClick={() => onToggleExpand(ingredientName)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-2 text-xs">
          {/* ✅ Pattern GG-6: Safe property access for nutritional profile */}
          {(nutritionalProfile ).calories !== undefined && (
            <div>Calories: {String((nutritionalProfile ).calories)}</div>
          )}

          {(nutritionalProfile ).protein_g !== undefined && (
            <div>Protein: {String((nutritionalProfile ).protein_g)}g</div>
          )}

          {(nutritionalProfile ).fiber_g !== undefined && (
            <div>Fiber: {String((nutritionalProfile ).fiber_g)}g</div>
          )}

          {(nutritionalProfile ).vitamin_density !== undefined && (
            <div>
              Vitamin Density: {Number((nutritionalProfile ).vitamin_density).toFixed(1)}
            </div>
          )}
        </div>

        {/* ✅ Pattern GG-6: Safe property access for vitamins and minerals */}
{Boolean((nutritionalProfile).vitamins || (nutritionalProfile).minerals) && (
          <div className="grid grid-cols-1 gap-1 mt-1">
            {Boolean((nutritionalProfile).vitamins &&
              Array.isArray((nutritionalProfile).vitamins) &&
              ((nutritionalProfile).vitamins as string[]).length > 0) && (
                <div className="text-xs">
                  Vitamins:{' '}
                  {((nutritionalProfile).vitamins as string[])
                    .map((v: string) => v.toUpperCase())
                    .join(', ')}
                </div>
              )}

{Boolean((nutritionalProfile).minerals &&
              Array.isArray((nutritionalProfile).minerals) &&
              ((nutritionalProfile).minerals as string[]).length > 0) && (
                <div className="text-xs">
                  Minerals: {((nutritionalProfile).minerals as string[]).join(', ')}
                </div>
              )}
          </div>
        )}
      </div>

      {/* Enhanced nutrition data from Spoonacular */}
      {isExpanded && (
        <div className="mt-3 border-t pt-2">
          <h5 className="text-sm font-medium mb-2">Detailed Nutrition</h5>

          {!enhancedData && !isSpoonacularLoading && (
            <button
              onClick={onLoadSpoonacularData}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Load Detailed Nutrition Data
            </button>
          )}

          {isSpoonacularLoading && (
            <div className="flex items-center text-xs text-gray-600">
              <div className="animate-spin rounded-full h-3 w-3 border border-gray-600 border-t-transparent mr-2"></div>
              Loading detailed nutrition data...
            </div>
          )}

          {Boolean(enhancedData) && (
            <div className="space-y-2">
              {/* Display enhanced nutrition data with safe property access */}
{(() => {
                const enhancedDataObj = enhancedData as Record<string, unknown>;
                const nutrition = enhancedDataObj.nutrition as Record<string, unknown>;
                const nutrients = nutrition.nutrients;
                
                // ✅ Pattern GG-6: Safe property access for nutrients array
                return nutrients && Array.isArray(nutrients) ? (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    {(nutrients as unknown[])
                      .slice(0, 8)
                      .map((nutrient: unknown) => {
                        const nutrientData = nutrient as Record<string, unknown>;
                        const name = String(nutrientData.name || '');
                        const amount = Number(nutrientData.amount || 0);
                        const unit = String(nutrientData.unit || '');
                        
                        return (
                          <div key={name} className="flex justify-between">
                            <span>{name}:</span>
                            <span className="font-medium">
                              {amount} {unit}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : null;
              })()}

              {(() => {
                const enhancedDataObj = enhancedData as Record<string, unknown>;
                const categoryPath = enhancedDataObj.categoryPath;
                
                // ✅ Pattern GG-6: Safe property access for category path
                if (categoryPath && Array.isArray(categoryPath)) {
                  return (
                    <div className="text-xs mt-2">
                      <span className="font-medium">Category:</span>{' '}
                      {(categoryPath as string[]).join(' > ')}
                    </div>
                  );
                }
                return null;
              })() as React.ReactNode}

              {/* Possible substitutes with safe access */}
              {(() => {
                const enhancedDataObj = enhancedData as Record<string, unknown>;
                const possibleSubstitutes = enhancedDataObj.possibleSubstitutes;
                
                // ✅ Pattern GG-6: Safe property access for possible substitutes
                return possibleSubstitutes && (
                  <div className="text-xs mt-1">
                    <span className="font-medium">Substitutes:</span>{' '}
                    {String(possibleSubstitutes)}
                  </div>
                );
              })() as React.ReactNode}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NutritionalRecommender;
