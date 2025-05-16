// src / (components || 1)/FoodRecommender / (components || 1) / (FoodBalanceTracker.tsx || 1)

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Clock,
  Coffee,
  Utensils,
  Flame,
  Droplet,
  Wind,
  Mountain,
  X,
  BarChart3,
  Heart,
  Calendar,
} from 'lucide-react';
import @/data  from 'ingredients ';
import {
  FoodEntry as BaseFoodEntry,
  nutritionTargets,
  calculateNutritionalBalance,
  analyzePropertyBalance,
  findComplementaryDishes,
  FoodProperty,
} from '@/data / (foodTypes || 1)';
import @/types  from 'alchemy ';
import @/data  from 'cuisines ';
import {
  culturalRules,
  getCulturalRecommendations,
} from '@/data / (culturalrules || 1)';

// Modified FoodEntry interface to fix type compatibility issues
interface FoodEntry extends BaseFoodEntry {
  cuisineId?: string;
  dishId?: string;
  timeEaten?: Date;
}

interface FoodBalanceTrackerProps {
  showCuisineSelection?: boolean;
  showElementalFeatures?: boolean;
}

interface NutritionSummary {
  total: number;
  target: number;
  unit: string;
  percentage: number;
}

interface Ingredient {
  id: string;
  name: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    [key: string]: number | undefined;
  };
  elementalProperties: ElementalProperties;
  category?: string;
  season?: string[];
  properties?: string[];
}

// Define interface for dish items from cuisine data
interface Dish {
  id?: string;
  name: string;
  mealType: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    [key: string]: number;
  };
  timeToMake?: string;
  properties?: string[];
  elementalProperties?: ElementalProperties;
}

// Define the keys of nutritionTargets as a type
type NutrientKey = keyof typeof nutritionTargets;

interface ElementalRecommendation {
  element: keyof typeof ElementIcons;
  percentage: number;
  ingredients: string[];
}

const ElementIcons = {
  Fire: Flame,
  Water: Droplet,
  Air: Wind,
  Earth: Mountain,
};

// Default elemental properties object that satisfies the ElementalProperties type
const defaultElementalProperties: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

const FoodBalanceTracker: React.FC<FoodBalanceTrackerProps> = ({
  showCuisineSelection = false,
  showElementalFeatures = true,
}) => {
  // Common state
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<(Ingredient | Dish)[]>([]);
  const [mealType, setMealType] = useState<
    'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'
  >('breakfast');

  // Elemental feature states
  const [showRecommendations, setShowRecommendations] =
    useState<boolean>(false);
  const [missingElements, setMissingElements] = useState<
    ElementalRecommendation[]
  >([]);

  // Cuisine selection states
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [selectedView, setSelectedView] = useState<'today' | 'week'>('today');

  // Calculate current nutritional totals
  const nutritionalBalance = calculateNutritionalBalance(entries);
  const propertyBalance = analyzePropertyBalance(entries);

  // Update meal type based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setMealType('breakfast');
    else if (hour < 16) setMealType('lunch');
    else if (hour < 20) setMealType('dinner');
    else setMealType('snack');
  }, []);

  // Update search results when search term changes
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    // Handle different search types based on mode
    if (showCuisineSelection && selectedCuisine) {
      // Search for dishes in selected cuisine
      if (cuisines[selectedCuisine]?.dishes) {
        // Type-safe access to dishes
        const cuisineDishes = cuisines[selectedCuisine].dishes;
        const results: Dish[] = [];

        // Safely iterate over dishes
        Object.entries(cuisineDishes).forEach(([timeOfDay, dishMap]) => {
          if (dishMap && typeof dishMap === 'object') {
            Object.values(dishMap).forEach((dishArray) => {
              if (Array.isArray(dishArray)) {
                dishArray.forEach((dish) => {
                  if (
                    dish &&
                    typeof dish === 'object' &&
                    'name' in dish &&
                    typeof dish.name === 'string' &&
                    dish.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) &&
                    (mealType === 'all' ||
                      ('mealType' in dish &&
                        Array.isArray(dish.mealType) &&
                        dish.mealType.includes(mealType)))
                  ) {
                    results.push(dish as Dish);
                  }
                });
              }
            });
          }
        });

        setSearchResults(results.slice(0, 8));
      }
    } else {
      // Search for ingredients
      const results = ingredients
        .filter((ingredient) =>
          ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 8) // Limit to 8 results for better performance
        .map((ingredient) => {
          // Convert IngredientMapping to Ingredient if needed
          if (!('id' in ingredient)) {
            return {
              id: `ingredient-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              name: ingredient.name,
              nutrition: {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
              },
              elementalProperties: ingredient.elementalProperties,
              category: ingredient.category || 'general',
              properties: ingredient.qualities || [],
            } as Ingredient;
          }
          return ingredient as Ingredient;
        });

      setSearchResults(results);
    }
  }, [searchTerm, showCuisineSelection, selectedCuisine, mealType]);

  // Run search when dependencies change
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  // Handle ingredient / (dish || 1) selection
  const handleIngredientSelect = (item: Ingredient | Dish) => {
    if (showCuisineSelection && selectedCuisine && 'mealType' in item) {
      // Add dish from cuisine
      const dish = item as Dish;
      // Convert string[] properties to FoodProperty[] safely
      let propertyEntries = dish.properties
        ? (dish.properties.filter((prop) =>
            // Only include valid FoodProperty values
            [
              'hot',
              'cold',
              'wet',
              'dry',
              'light',
              'heavy',
              'spicy',
              'mild',
              'fresh',
              'preserved',
              'sweet',
              'sour',
              'bitter',
              'umami',
              'balanced',
              'creamy',
              'neutral',
              'aromatic',
              'crispy',
              'grilled',
              'layered',
              'comforting',
              'savory',
              'numbing',
              'refreshing',
              'hearty',
              'tangy',
              'rich',
              'complex',
              'mild-spicy',
              'earthy',
            ].includes(prop)
          ) as FoodProperty[])
        : [];

      // Ensure elementalProperties is never an empty object
      const elementalProps =
        dish.elementalProperties || defaultElementalProperties;

      setEntries([
        ...entries,
        {
          id: typeof dish.id === 'string' ? dish.id : `dish-${Date.now()}`,
          name: dish.name,
          timeAdded: new Date(),
          mealType: mealType === 'all' ? 'breakfast' : mealType,
          cuisineId: selectedCuisine,
          dishId: dish.name,
          nutrition: dish.nutrition,
          elementalProperties: elementalProps,
          category:
            'category' in dish && typeof dish.category === 'string'
              ? dish.category
              : 'dish',
          properties: propertyEntries,
          portion: 1,
        },
      ]);
    } else {
      // Add ingredient
      let ingredient = item as Ingredient;
      // Convert string[] properties to FoodProperty[] safely
      const propertyEntries = ingredient.properties
        ? (ingredient.properties.filter((prop) =>
            // Only include valid FoodProperty values
            [
              'hot',
              'cold',
              'wet',
              'dry',
              'light',
              'heavy',
              'spicy',
              'mild',
              'fresh',
              'preserved',
              'sweet',
              'sour',
              'bitter',
              'umami',
              'balanced',
              'creamy',
              'neutral',
              'aromatic',
              'crispy',
              'grilled',
              'layered',
              'comforting',
              'savory',
              'numbing',
              'refreshing',
              'hearty',
              'tangy',
              'rich',
              'complex',
              'mild-spicy',
              'earthy',
            ].includes(prop)
          ) as FoodProperty[])
        : [];

      setEntries([
        ...entries,
        {
          id: ingredient.id,
          name: ingredient.name,
          timeAdded: new Date(),
          mealType: mealType === 'all' ? 'breakfast' : mealType,
          nutrition: ingredient.nutrition,
          elementalProperties: ingredient.elementalProperties,
          category: ingredient.category || 'general',
          properties: propertyEntries,
          portion: 1,
        },
      ]);
    }

    setSearchTerm('');
    setSearchResults([]);
  };

  // Update cultural recommendations when entries change
  useEffect(() => {
    if (showCuisineSelection && entries.length > 0 && entries[0].cuisineId) {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry.cuisineId) {
        const { recommended } = getCulturalRecommendations(
          lastEntry.cuisineId,
          entries.map((e) => e.dishId).filter(Boolean) as string[]
        );
        setRecommendations(recommended);
      }
    }
  }, [entries, showCuisineSelection]);

  // Get icon for meal type
  const getMealTypeIcon = (type: string) => {
    if (showCuisineSelection) {
      switch (type) {
        case 'breakfast':
          return '🌅';
        case 'lunch':
          return '☀️';
        case 'dinner':
          return '🌙';
        default:
          return '🍽️';
      }
    } else {
      switch (type) {
        case 'breakfast':
          return <Coffee size={16} />;
        case 'lunch':
          return <Utensils size={16} />;
        case 'dinner':
          return <Utensils size={16} />;
        case 'snack':
          return <Coffee size={16} />;
        default:
          return <Utensils size={16} />;
      }
    }
  };

  // Calculate elemental recommendations based on current balance
  useEffect(() => {
    if (showElementalFeatures && entries.length > 0) {
      // Find which elements are underrepresented
      const elementalNeeds: ElementalRecommendation[] = [];
      Object.entries(propertyBalance).forEach(([element, value]) => {
        let numericValue =
          typeof value === 'object' && value && 'count' in value
            ? value.count
            : (value as unknown as number);

        // If element is below 20%, recommend ingredients rich in this element
        if (numericValue < 0.2) {
          // Find top 3 ingredients rich in this element
          const recommendedIngredients = ingredients
            .filter((ing) => {
              const elementValue =
                ing.elementalProperties[element as keyof ElementalProperties];
              return elementValue && elementValue > 0.4; // Only ingredients strong in this element
            })
            .sort((a, b) => {
              const aValue =
                a.elementalProperties[element as keyof ElementalProperties] ||
                0;
              const bValue =
                b.elementalProperties[element as keyof ElementalProperties] ||
                0;
              return bValue - aValue;
            })
            .slice(0, 3)
            .map((ing) => ing.name);

          if (recommendedIngredients.length > 0) {
            elementalNeeds.push({
              element: element as keyof typeof ElementIcons,
              percentage: numericValue * 100,
              ingredients: recommendedIngredients,
            });
          }
        }
      });

      setMissingElements(elementalNeeds);
    }
  }, [entries, propertyBalance, showElementalFeatures]);

  const calculateNutritionSummary = (nutrient: string): NutritionSummary => {
    const total = nutritionalBalance[nutrient] || 0;

    // Type-safe way to access nutritionTargets
    let target = 0;
    if (Object.prototype.hasOwnProperty.call(nutritionTargets, nutrient)) {
      target = nutritionTargets[nutrient as NutrientKey].max;
    }

    const unit = nutrient === 'calories' ? 'kcal' : 'g';
    const percentage = target > 0 ? (total / (target || 1)) * 100 : 0;

    return { total, target, unit, percentage };
  };

  return (
    <div className="card w-full max-w-4xl shadow-sm">
      <div className="card-header flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">Daily Food Balance Tracker</h2>

        {showCuisineSelection && (
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('today')}
              className={`btn btn-sm ${
                selectedView === 'today' ? 'btn-primary' : 'btn-outline'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedView('week')}
              className={`btn btn-sm ${
                selectedView === 'week' ? 'btn-primary' : 'btn-outline'
              }`}
            >
              Week
            </button>
          </div>
        )}
      </div>

      <div className="card-content space-y-6 p-4">
        {/* Meal Type Selection */}
        <div className="flex gap-2">
          {(showCuisineSelection
            ? ['all', 'breakfast', 'lunch', 'dinner']
            : ['breakfast', 'lunch', 'dinner', 'snack']
          ).map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type as any)}
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${
                mealType === type
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {typeof getMealTypeIcon(type) === 'string' ? (
                <span>{getMealTypeIcon(type)}</span>
              ) : (
                getMealTypeIcon(type)
              )}
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>

        {/* Cuisine Selection */}
        {showCuisineSelection && (
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(cuisines).map((cuisineId) => (
              <button
                key={cuisineId}
                onClick={() => setSelectedCuisine(cuisineId)}
                className={`btn ${
                  selectedCuisine === cuisineId ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {cuisines[cuisineId].name}
              </button>
            ))}
          </div>
        )}

        {/* Food Search */}
        <div className="relative">
          <div className="flex items-center">
            <Search className="absolute left-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                showCuisineSelection && selectedCuisine
                  ? 'Search dishes...'
                  : 'Search ingredients...'
              }
              className="w-full p-2 pl-10 border rounded-md"
            />
          </div>

          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map((item) => (
                <div
                  key={('id' in item && item.id) || `item-${item.name}`}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => handleIngredientSelect(item)}
                >
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500 mt-1 flex justify-between">
                    <span>{`${item.nutrition?.calories || 0} cal | ${
                      item.nutrition?.protein || 0
                    }g protein`}</span>
                    <span className="text-primary">+ Add</span>
                  </div>

                  {/* Show elemental properties if available */}
                  {item.elementalProperties && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(item.elementalProperties).map(
                        ([element, value]) => {
                          if (value > 0.2) {
                            let Icon =
                              ElementIcons[
                                element as keyof typeof ElementIcons
                              ] || Flame;
                            return (
                              <span
                                key={element}
                                className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-100"
                              >
                                <Icon size={12} className="mr-1" />
                                {element}: {Math.round(value * 100)}%
                              </span>
                            );
                          }
                          return null;
                        }
                      )}
                    </div>
                  )}

                  {/* Show dish properties if available */}
                  {item.properties && item.properties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.properties.map((prop) => (
                        <span
                          key={prop}
                          className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-100"
                        >
                          {prop}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Entries */}
        <div>
          <h3 className="text-lg font-medium mb-2">Today's Entries</h3>
          <div className="space-y-2">
            {entries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No entries yet. Search and add ingredients above.</p>
              </div>
            ) : (
              entries.map((entry, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-md flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {entry.name || entry.dishId}
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                        {entry.mealType || 'unspecified'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(
                          entry.timeAdded || entry.timeEaten
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Show elemental properties if available */}
                    {entry.elementalProperties &&
                      Object.keys(entry.elementalProperties).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(entry.elementalProperties).map(
                            ([element, value]) => {
                              let numericValue = value as number;
                              if (numericValue > 0.2) {
                                let Icon =
                                  ElementIcons[
                                    element as keyof typeof ElementIcons
                                  ] || Flame;
                                return (
                                  <span
                                    key={element}
                                    className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-100"
                                  >
                                    <Icon size={12} className="mr-1" />
                                    {Math.round(numericValue * 100)}%
                                  </span>
                                );
                              }
                              return null;
                            }
                          )}
                        </div>
                      )}

                    {/* Show dish properties if available */}
                    {entry.properties && entry.properties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.properties.map((prop) => (
                          <span
                            key={prop}
                            className="inline-flex items-center px-2 py-1 text-xs rounded bg-gray-100"
                          >
                            {prop}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setEntries(entries.filter((_, i) => i !== index))
                    }
                    className="p-1 rounded-full hover:bg-gray-200"
                    aria-label="Remove entry"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Simple Nutrition Summary */}
        {entries.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-3">Nutritional Balance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(nutritionTargets).map((nutrient) => {
                const summary = calculateNutritionSummary(nutrient);
                let statusColor =
                  summary.percentage < 50
                    ? 'bg-blue-100 text-blue-800'
                    : summary.percentage <= 90
                    ? 'bg-green-100 text-green-800'
                    : summary.percentage <= 110
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800';

                return (
                  <div key={nutrient} className="p-3 border rounded-md">
                    <div className="capitalize font-medium">{nutrient}</div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-lg font-bold">
                        {summary.total.toFixed(0)}
                        <span className="text-sm ml-1 font-normal">
                          {summary.unit}
                        </span>
                      </div>
                      <div
                        className={`text-xs px-2 py-1 rounded-full ${statusColor}`}
                      >
                        {summary.percentage.toFixed(0)}%
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          summary.percentage < 50
                            ? 'bg-blue-500'
                            : summary.percentage <= 90
                            ? 'bg-green-500'
                            : summary.percentage <= 110
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(summary.percentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Target: {summary.target} {summary.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cultural Recommendations */}
        {showCuisineSelection && recommendations.length > 0 && (
          <div className="pt-4">
            <h3 className="text-lg font-medium mb-3">
              Recommended Next Dishes
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {recommendations.map((dish) => (
                <div
                  key={dish}
                  className="p-2 border rounded flex items-center gap-2"
                >
                  <Utensils className="text-primary" size={16} />
                  <span>{dish}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Elemental Balance Section - Show only if elemental features are enabled */}
        {showElementalFeatures && entries.length > 0 && (
          <div className="pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">Elemental Balance</h3>
              <button
                onClick={() => setShowRecommendations(!showRecommendations)}
                className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                {showRecommendations
                  ? 'Hide Recommendations'
                  : 'Get Recommendations'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(propertyBalance).map(([element, value]) => {
                // Fix the type error by properly accessing the count property
                let numericValue =
                  typeof value === 'object' && value && 'count' in value
                    ? value.count
                    : (value as unknown as number);

                let ElementIcon =
                  ElementIcons[element as keyof typeof ElementIcons] || Flame;
                const elementLevel =
                  numericValue < 0.2
                    ? 'Low'
                    : numericValue < 0.4
                    ? 'Moderate'
                    : numericValue < 0.7
                    ? 'Balanced'
                    : 'High';

                const statusColor =
                  numericValue < 0.2
                    ? 'bg-red-100 text-red-800'
                    : numericValue < 0.4
                    ? 'bg-yellow-100 text-yellow-800'
                    : numericValue < 0.7
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800';

                return (
                  <div
                    key={element}
                    className="p-3 border rounded-md flex items-center gap-3"
                  >
                    <ElementIcon size={24} className="text-primary" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{element}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${statusColor}`}
                        >
                          {elementLevel}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{ width: `${numericValue * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold">
                      {(numericValue * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Elemental Recommendations */}
            {showRecommendations && missingElements.length > 0 && (
              <div className="mt-4 p-4 border rounded-md bg-gray-50">
                <h4 className="font-medium mb-3">
                  Recommended Ingredients to Balance Elements
                </h4>
                <div className="space-y-3">
                  {missingElements.map((rec) => {
                    const ElementIcon = ElementIcons[rec.element] || Flame;
                    return (
                      <div
                        key={rec.element}
                        className="p-3 border rounded-md bg-white"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <ElementIcon size={18} className="text-primary" />
                          <span className="font-medium">{rec.element}</span>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            {rec.percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rec.ingredients.map((ing) => (
                            <button
                              key={ing}
                              onClick={() => {
                                const ingredient = ingredients.find(
                                  (i) => i.name === ing
                                );
                                if (ingredient) {
                                  // Convert IngredientMapping to Ingredient if needed
                                  if (!('id' in ingredient)) {
                                    const convertedIngredient: Ingredient = {
                                      id: `ingredient-${Date.now()}-${Math.random()
                                        .toString(36)
                                        .substr(2, 9)}`,
                                      name: ingredient.name,
                                      nutrition: {
                                        calories: 0,
                                        protein: 0,
                                        carbs: 0,
                                        fat: 0,
                                      },
                                      elementalProperties:
                                        ingredient.elementalProperties,
                                      category:
                                        ingredient.category || 'general',
                                      properties: ingredient.qualities || [],
                                    };
                                    handleIngredientSelect(convertedIngredient);
                                  } else {
                                    handleIngredientSelect(
                                      ingredient as Ingredient
                                    );
                                  }
                                }
                              }}
                              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center gap-1"
                            >
                              <Plus size={14} />
                              {ing}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Elemental Combinations & Effects - Show only if elemental features are enabled */}
        {showElementalFeatures && entries.length > 0 && (
          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium mb-3">
              Elemental Combinations & Effects
            </h3>
            <div className="p-4 border rounded-md bg-gray-50">
              <ul className="space-y-2">
                {Object.entries(propertyBalance)
                  .filter(([_, value]) => {
                    let numericValue =
                      typeof value === 'object' && value && 'count' in value
                        ? value.count
                        : (value as unknown as number);
                    return numericValue > 0.3; // Only show significant elements
                  })
                  .map(([element, value], index, arr) => {
                    if (index < arr.length - 1) {
                      const nextElement = arr[index + 1][0];
                      return (
                        <li
                          key={`${element}-${nextElement}`}
                          className="p-3 border rounded-md bg-white"
                        >
                          <div className="font-medium flex items-center">
                            <span className="flex items-center gap-1">
                              {ElementIcons[
                                element as keyof typeof ElementIcons
                              ] &&
                                React.createElement(
                                  ElementIcons[
                                    element as keyof typeof ElementIcons
                                  ],
                                  { size: 16, className: 'text-primary' }
                                )}
                              {element}
                            </span>
                            <span className="mx-2">+</span>
                            <span className="flex items-center gap-1">
                              {ElementIcons[
                                nextElement as keyof typeof ElementIcons
                              ] &&
                                React.createElement(
                                  ElementIcons[
                                    nextElement as keyof typeof ElementIcons
                                  ],
                                  { size: 16, className: 'text-primary' }
                                )}
                              {nextElement}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {getElementalCombinationEffect(
                              element,
                              nextElement
                            )}
                          </p>
                        </li>
                      );
                    }
                    return null;
                  })
                  .filter(Boolean)}
              </ul>

              {/* If no significant combinations */}
              {Object.entries(propertyBalance).filter(([_, value]) => {
                const numericValue =
                  typeof value === 'object' && value && 'count' in value
                    ? value.count
                    : (value as unknown as number);
                return numericValue > 0.3;
              }).length <= 1 && (
                <p className="text-center text-gray-500 py-3">
                  Add more diverse ingredients to see elemental combination
                  effects.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Function to get elemental combination effects
function getElementalCombinationEffect(
  element1: string,
  element2: string
): string {
  const combinations: Record<string, Record<string, string>> = {
    Fire: {
      Water:
        'Creates balance between energy and emotion. Good for digestive health.',
      Air: 'Enhances creativity and mental clarity. Supports respiratory system.',
      Earth:
        'Provides grounding energy while maintaining vitality. Supports metabolism.',
    },
    Water: {
      Fire: 'Balances emotional energy with vitality. Supports circulatory system.',
      Air: 'Enhances intuition and mental flexibility. Good for the nervous system.',
      Earth:
        'Creates deep emotional stability. Supports kidney and bladder health.',
    },
    Air: {
      Fire: 'Amplifies intellect and passion. Good for brain function.',
      Water: 'Balances thought with feeling. Supports lung and heart health.',
      Earth: 'Grounds mental energy with practicality. Good for anxiety.',
    },
    Earth: {
      Fire: 'Provides sustainable energy and endurance. Good for stamina.',
      Water: 'Creates emotional resilience. Supports immune system.',
      Air: 'Balances practical thinking with inspiration. Good for focus.',
    },
  };

  return (
    combinations[element1]?.[element2] ||
    combinations[element2]?.[element1] ||
    'These elements create a balanced effect on body and mind.'
  );
}

export default FoodBalanceTracker;
