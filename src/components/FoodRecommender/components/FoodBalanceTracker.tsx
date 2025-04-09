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
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  Radar, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { cuisines } from '@/data/cuisines';
import { culturalRules, getCulturalRecommendations } from '@/data/culturalRules';
import { 
  FoodEntry, 
  nutritionTargets,
  calculateNutritionalBalance,
  analyzePropertyBalance,
  findComplementaryDishes
} from '@/data/foodTypes';
import { getDishProperties } from '@/data/enhancedDishes';

interface NutritionSummary {
  total: number;
  target: number;
  unit: string;
  percentage: number;
}

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
      const { recommended } = getCulturalRecommendations(
        lastEntry.cuisineId,
        entries.map(e => e.dishId)
      );
      setRecommendations(recommended);
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
    const target = nutritionTargets[nutrient].max;
    const unit = nutrient === 'calories' ? 'kcal' : 'g';
    const percentage = (total / target) * 100;

    return { total, target, unit, percentage };
  };

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => ({
      day,
      calories: Math.random() * 2000 + 500,
      protein: Math.random() * 100,
      carbs: Math.random() * 300,
      fats: Math.random() * 80
    }));
  };

  const getDishProperties = (dishName: string) => {
    return cuisines[selectedCuisine].dishes[mealType][dishName].properties;
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
            
            {searchTerm && (
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
                          dishId: dish.name,
                          cuisineId: selectedCuisine,
                          timeEaten: new Date(),
                          portion: 1,
                          properties: getDishProperties(dish.name),
                          nutrition: dish.nutrition
                        }]);
                        setSearchTerm('');
                      }}
                    >
                      <div className="font-medium">{dish.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {`${dish.nutrition.calories} cal | ${dish.nutrition.protein}g protein | ${dish.timeToMake}`}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {getDishProperties(dish.name).map(prop => (
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
                    {new Date(entry.timeEaten).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {entry.properties.map(prop => (
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

        {/* Visualizations */}
        {entries.length > 0 && (
          <div className="space-y-6">
            {/* Nutrition Summary */}
            <div className="grid grid-cols-4 gap-4">
              {Object.keys(nutritionTargets).map(nutrient => {
                const summary = calculateNutritionSummary(nutrient);
                return (
                  <div key={nutrient} className="card p-4">
                    <div className="text-sm font-medium capitalize">{nutrient}</div>
                    <div className="mt-2 text-2xl font-bold">
                      {summary.total.toFixed(0)}
                      <span className="text-sm font-normal text-gray-500 ml-1">
                        {summary.unit}
                      </span>
                    </div>
                    <div className="progress-bar mt-2">
                      <div
                        className={`progress-bar-fill ${
                          summary.percentage < 80 ? 'bg-orange-500' :
                          summary.percentage <= 100 ? 'bg-green-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(summary.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Target: {summary.target} {summary.unit}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              {/* Property Balance */}
              <div className="chart-container">
                <h3 className="text-sm font-bold mb-4">Property Balance</h3>
                <ResponsiveContainer>
                  <RadarChart data={propertyBalance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="property" />
                    <Radar
                      name="Properties"
                      dataKey="count"
                      fill="var(--primary)"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Trends */}
              <div className="chart-container">
                <h3 className="text-sm font-bold mb-4">Weekly Trends</h3>
                <ResponsiveContainer>
                  <LineChart data={getWeeklyData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="calories" 
                      stroke="var(--primary)" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-bold">Recommended Next Dishes</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-2 gap-4">
                {recommendations.map((dish, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all"
                  >
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span>{dish}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodBalanceTracker;