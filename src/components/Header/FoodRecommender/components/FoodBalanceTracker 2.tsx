// src/components/FoodRecommender/components/FoodBalanceTracker.tsx

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowRight, 
  Clock, 
  Utensils, 
  Calendar,
  BarChart3,
  Heart,
  X
} from 'lucide-react';
// Comment out recharts imports to simplify component temporarily
// import { 
//   RadarChart, 
//   PolarGrid, 
//   PolarAngleAxis, 
//   Radar, 
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip
// } from 'recharts';
import { cuisines } from '@/data/cuisines';
import { culturalRules, getCulturalRecommendations } from '@/data/culturalrules';
import { 
  FoodEntry as BaseFoodEntry, 
  nutritionTargets,
  calculateNutritionalBalance,
  analyzePropertyBalance,
  findComplementaryDishes,
  FoodProperty
} from '@/data/foodTypes';

// Extend the FoodEntry interface with additional properties
interface FoodEntry extends BaseFoodEntry {
  cuisineId?: string;
  dishId?: string;
  timeEaten?: Date;
  properties: FoodProperty[];
  portion: number;
}

interface NutritionSummary {
  total: number;
  target: number;
  unit: string;
  percentage: number;
}

// Define the keys of nutritionTargets as a type
type NutrientKey = keyof typeof nutritionTargets;

const FoodBalanceTracker = () => {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [selectedView, setSelectedView] = useState<'today' | 'week'>('today');
  const [mealType, setMealType] = useState<'all' | 'breakfast' | 'lunch' | 'dinner'>('all');

  // Calculate current nutritional totals
  const nutritionalBalance = calculateNutritionalBalance(entries);
  const propertyBalance = analyzePropertyBalance(entries);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setMealType('breakfast');
    else if (hour < 16) setMealType('lunch');
    else setMealType('dinner');
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      if (lastEntry.cuisineId) {
        const { recommended } = getCulturalRecommendations(
          lastEntry.cuisineId,
          entries.map(e => e.dishId).filter((id): id is string => id !== undefined)
        );
        setRecommendations(recommended);
      }
    }
  }, [entries]);

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const calculateNutritionSummary = (nutrient: string): NutritionSummary => {
    const total = nutritionalBalance[nutrient] || 0;
    
    // Type-safe way to access nutritionTargets
    let target = 0;
    if (Object.prototype.hasOwnProperty.call(nutritionTargets, nutrient)) {
      target = nutritionTargets[nutrient as NutrientKey].max;
    }
    
    const unit = nutrient === 'calories' ? 'kcal' : 'g';
    const percentage = (total / target) * 100;

    return { total, target, unit, percentage };
  };

  // Removed getWeeklyData function as it's only used for charts

  const handleGetDishProperties = (dishName: string) => {
    // Use type assertion to avoid type errors
    if (!selectedCuisine || !cuisines[selectedCuisine as keyof typeof cuisines]) return [];
    
    // Use optional chaining with type assertion
    const cuisine = cuisines[selectedCuisine as keyof typeof cuisines] as any;
    return cuisine?.dishes?.[mealType]?.[dishName]?.properties || [];
  };

  return (
    <div className="card w-full max-w-4xl">
      <div className="card-header flex justify-between items-center">
        <h2 className="card-title">Daily Food Balance Tracker</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView('today')}
            className={`btn ${selectedView === 'today' ? 'btn-primary' : 'btn-outline'}`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedView('week')}
            className={`btn ${selectedView === 'week' ? 'btn-primary' : 'btn-outline'}`}
          >
            Week
          </button>
        </div>
      </div>

      <div className="card-content space-y-6">
        {/* Meal Type Selection */}
        <div className="flex gap-2">
          {['all', 'breakfast', 'lunch', 'dinner'].map(type => (
            <button
              key={type}
              onClick={() => setMealType(type as typeof mealType)}
              className={`btn ${mealType === type ? 'btn-primary' : 'btn-outline'}`}
            >
              <span>{getMealTypeIcon(type)}</span>
              <span className="ml-2 capitalize">{type}</span>
            </button>
          ))}
        </div>

        {/* Cuisine Selection */}
        <div className="grid grid-cols-3 gap-2">
          {Object.keys(cuisines).map(cuisineId => (
            <button
              key={cuisineId}
              onClick={() => setSelectedCuisine(cuisineId)}
              className={`btn ${selectedCuisine === cuisineId ? 'btn-primary' : 'btn-outline'}`}
            >
              {cuisines[cuisineId].name}
            </button>
          ))}
        </div>

        {/* Food Search */}
        {selectedCuisine && (
          <div className="relative">
            <div className="flex items-center">
              <Search className="absolute left-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search dishes..."
                className="input pl-10"
              />
            </div>
            
            {searchTerm && cuisines[selectedCuisine]?.dishes && (
              <div className="absolute w-full mt-1 card animate-slide-down max-h-64 overflow-y-auto">
                {Object.entries(cuisines[selectedCuisine].dishes)
                  .flatMap(([time, dishes]) =>
                    Object.values(dishes).flat()
                  )
                  .filter(dish => 
                    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (mealType === 'all' || dish.mealType.includes(mealType))
                  )
                  .map(dish => (
                    <div
                      key={dish.name}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setEntries([...entries, {
                          // Required properties from BaseFoodEntry
                          id: `dish-${Date.now()}`,
                          name: dish.name,
                          timeAdded: new Date(),
                          mealType: mealType === 'all' ? 'breakfast' : mealType,
                          elementalProperties: dish.elementalProperties || { Fire: 0, Water: 0, Air: 0, Earth: 0 },
                          category: 'dish',
                          // Extended properties
                          dishId: dish.name,
                          cuisineId: selectedCuisine,
                          timeEaten: new Date(),
                          portion: 1,
                          properties: handleGetDishProperties(dish.name),
                          nutrition: dish.nutrition
                        }]);
                        setSearchTerm('');
                      }}
                    >
                      <div className="font-medium">{dish.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {`${dish.nutrition?.calories || 0} cal | ${dish.nutrition?.protein || 0}g protein | ${dish.timeToMake || 'N/A'}`}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {handleGetDishProperties(dish.name).map((prop: string) => (
                          <span key={prop} className="badge badge-primary">
                            {prop}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Current Entries */}
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div key={index} className="card p-3 flex items-center justify-between animate-fade-in">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {entry.dishId}
                  <span className="text-sm text-gray-500">
                    {entry.timeEaten ? new Date(entry.timeEaten).toLocaleTimeString() : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {entry.properties?.map((prop: string) => (
                    <span key={prop} className="badge badge-primary">
                      {prop}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setEntries(entries.filter((_, i) => i !== index))}
                className="btn btn-outline p-2"
                aria-label="Remove entry"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Simple Nutrition Summary instead of Visualizations */}
        {entries.length > 0 && (
          <div className="space-y-6">
            {/* Nutrition Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.keys(nutritionTargets).map(nutrient => {
                const summary = calculateNutritionSummary(nutrient);
                return (
                  <div key={nutrient} className="card p-4">
                    <div className="capitalize font-medium">{nutrient}</div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xl font-bold">
                        {summary.total.toFixed(0)}<span className="text-sm ml-1">{summary.unit}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {summary.percentage.toFixed(0)}% of target
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="card p-4">
                <h3 className="font-medium mb-2">Recommended Next Dishes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recommendations.map((dish: string) => (
                    <div key={dish} className="p-2 border rounded flex items-center gap-2">
                      <Utensils className="text-primary" size={16} />
                      <span>{dish}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodBalanceTracker;