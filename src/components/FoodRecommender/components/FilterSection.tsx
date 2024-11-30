// src/components/FoodRecommender/components/FilterSection.tsx

"use client"

import React from 'react';
import { Timer, Flame, Droplet, Wind, Mountain } from 'lucide-react';
import type { FilterOptions, NutritionPreferences, ElementalProperties } from '@/types/alchemy';
import { cuisines } from '@/data/cuisines';
import { useAlchemical } from '@/contexts/AlchemicalContext';

type FilterSectionProps = {
  selectedCuisines: string[];
  setSelectedCuisines: (cuisines: string[]) => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  nutritionPrefs: NutritionPreferences;
  setNutritionPrefs: React.Dispatch<React.SetStateAction<NutritionPreferences>>;
  resetAll: () => void;
};

const ElementIcons = {
  Fire: Flame,
  Water: Droplet,
  Air: Wind,
  Earth: Mountain
};

export default function FilterSection({
  selectedCuisines,
  setSelectedCuisines,
  filters,
  setFilters,
  nutritionPrefs,
  setNutritionPrefs,
  resetAll
}: FilterSectionProps) {
  const { state, updateElementalPreference } = useAlchemical();

  const handleCuisineSelect = (id: string) => {
    console.log('Selecting cuisine:', id);
    setSelectedCuisines(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleElementalChange = (element: keyof ElementalProperties, value: number) => {
    const newBalance = {
      ...state.elementalPreference,
      [element]: value / 100
    };
    updateElementalPreference(newBalance);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Customize Your Recommendations</h2>
        <button
          onClick={resetAll}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Reset All
        </button>
      </div>

      {/* Elemental Balance */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Elemental Balance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(state.elementalPreference).map(([element, value]) => {
            const Icon = ElementIcons[element as keyof typeof ElementIcons];
            return (
              <div key={element} className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value * 100}
                    onChange={(e) => handleElementalChange(element as keyof ElementalProperties, Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{element}</span>
                    <span>{Math.round(value * 100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Your existing sections */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Cuisine Types</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(cuisines).map(([id, cuisine]) => (
            <button
              key={id}
              onClick={() => handleCuisineSelect(id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCuisines.includes(id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {cuisine.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rest of your existing sections */}
      {/* Dietary Restrictions */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Dietary Preferences</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters.dietary).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  dietary: { ...prev.dietary, [key]: !value }
                }));
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                value ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Time Preferences */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Preparation Time</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters.time).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  time: { ...prev.time, [key]: !value }
                }));
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                value ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Timer className="w-4 h-4 inline-block mr-1" />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Existing Nutritional Preferences and Spice Level sections remain unchanged */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Nutritional Goals</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(nutritionPrefs).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setNutritionPrefs(prev => ({
                  ...prev,
                  [key]: !value
                }));
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                value ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {key.split(/(?=[A-Z])/).join(' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Spice Level</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters.spice).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setFilters(prev => ({
                  ...prev,
                  spice: { ...prev.spice, [key]: !value }
                }));
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                value ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}