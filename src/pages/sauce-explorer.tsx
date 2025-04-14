import React, { useState, useEffect } from 'react';
import SauceRecommender from '@/components/SauceRecommender';
import { ElementalProperties } from '@/types/alchemy';
import { 
  Utensils, 
  Droplet, 
  Flame, 
  Wind, 
  Mountain,
  Beef,
  Carrot,
  CookingPot,
  Globe,
  Filter,
  RotateCcw
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';

// Import all cuisines
import { default as italianCuisine } from '@/data/cuisines/italian';
import { default as frenchCuisine } from '@/data/cuisines/french';
import { default as japaneseCuisine } from '@/data/cuisines/japanese';
import { default as indianCuisine } from '@/data/cuisines/indian';
import { default as thaiCuisine } from '@/data/cuisines/thai';
import { default as mexicanCuisine } from '@/data/cuisines/mexican';

// Define interface for sauce data
interface Sauce {
  id: string;
  name: string;
  description?: string;
  base?: string;
  keyIngredients?: string[];
  culinaryUses?: string[];
  elementalProperties?: ElementalProperties;
  astrologicalInfluences?: string[];
}

// Define interface for sauce recommender structure
interface SauceRecommender {
  forProtein?: Record<string, string[]>;
  forVegetable?: Record<string, string[]>;
  forCookingMethod?: Record<string, string[]>;
}

// Define interface for cuisine objects
interface Cuisine {
  name: string;
  id?: string;
  description?: string;
  traditionalSauces?: Record<string, Sauce>;
  sauceRecommender?: SauceRecommender;
  elementalProperties?: ElementalProperties;
}

// Define type for all cuisines record
type CuisineRecord = Record<string, Cuisine>;

export default function SauceExplorer() {
  // State for selected filters
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedProtein, setSelectedProtein] = useState<string>('');
  const [selectedVegetable, setSelectedVegetable] = useState<string>('');
  const [selectedCookingMethod, setSelectedCookingMethod] = useState<string>('');
  
  // State for elemental profile sliders
  const [elementalProfile, setElementalProfile] = useState<ElementalProperties>({
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  });
  
  // State for all cuisines
  const [allCuisines, setAllCuisines] = useState<CuisineRecord>({});
  
  // Load all cuisines on component mount
  useEffect(() => {
    const cuisines = {
      italian: italianCuisine,
      french: frenchCuisine,
      japanese: japaneseCuisine,
      indian: indianCuisine,
      thai: thaiCuisine,
      mexican: mexicanCuisine,
    };
    
    setAllCuisines(cuisines as CuisineRecord);
  }, []);
  
  // Handle elemental profile change
  const handleElementChange = (element: keyof ElementalProperties, value: number) => {
    // Normalize all elements to ensure they sum to 1
    const newProfile = { ...elementalProfile, [element]: value };
    const sum = Object.values(newProfile).reduce((acc, val) => acc + val, 0);
    
    if (sum > 0) {
      const normalized: ElementalProperties = {} as ElementalProperties;
      Object.keys(newProfile).forEach(key => {
        normalized[key as keyof ElementalProperties] = 
          newProfile[key as keyof ElementalProperties] / sum;
      });
      
      setElementalProfile(normalized);
    }
  };
  
  // Get protein options
  const getProteinOptions = () => {
    if (!selectedCuisine || !allCuisines[selectedCuisine]) {
      return [];
    }
    
    const cuisine = allCuisines[selectedCuisine];
    
    if (cuisine.sauceRecommender?.forProtein) {
      return Object.keys(cuisine.sauceRecommender.forProtein);
    }
    
    return [];
  };
  
  // Get vegetable options
  const getVegetableOptions = () => {
    if (!selectedCuisine || !allCuisines[selectedCuisine]) {
      return [];
    }
    
    const cuisine = allCuisines[selectedCuisine];
    
    if (cuisine.sauceRecommender?.forVegetable) {
      return Object.keys(cuisine.sauceRecommender.forVegetable);
    }
    
    return [];
  };
  
  // Get cooking method options
  const getCookingMethodOptions = () => {
    if (!selectedCuisine || !allCuisines[selectedCuisine]) {
      return [];
    }
    
    const cuisine = allCuisines[selectedCuisine];
    
    if (cuisine.sauceRecommender?.forCookingMethod) {
      return Object.keys(cuisine.sauceRecommender.forCookingMethod);
    }
    
    return [];
  };
  
  // Reset filters
  const resetFilters = () => {
    setSelectedProtein('');
    setSelectedVegetable('');
    setSelectedCookingMethod('');
  };
  
  // Reset elemental profile
  const resetElementalProfile = () => {
    setElementalProfile({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    });
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Sauce Explorer</h1>
      <p className="text-gray-600 mb-8">
        Discover the perfect sauce for your cooking based on cuisine, ingredients, and elemental properties.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Section */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h2>
          
          {/* Cuisine Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              Cuisine
            </label>
            <select
              value={selectedCuisine}
              onChange={(e) => {
                setSelectedCuisine(e.target.value);
                resetFilters();
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Cuisines</option>
              {Object.entries(allCuisines).map(([id, cuisine]: [string, Cuisine]) => (
                <option key={id} value={id}>
                  {cuisine.name || id}
                </option>
              ))}
            </select>
          </div>
          
          {/* Protein Selection - only show if cuisine is selected */}
          {selectedCuisine && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Beef className="w-4 h-4 mr-1" />
                Protein
              </label>
              <select
                value={selectedProtein}
                onChange={(e) => setSelectedProtein(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Protein</option>
                {getProteinOptions().map((protein) => (
                  <option key={protein} value={protein}>
                    {protein.charAt(0).toUpperCase() + protein.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Vegetable Selection - only show if cuisine is selected */}
          {selectedCuisine && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Carrot className="w-4 h-4 mr-1" />
                Vegetable
              </label>
              <select
                value={selectedVegetable}
                onChange={(e) => setSelectedVegetable(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Vegetable</option>
                {getVegetableOptions().map((vegetable) => (
                  <option key={vegetable} value={vegetable}>
                    {vegetable.charAt(0).toUpperCase() + vegetable.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Cooking Method Selection - only show if cuisine is selected */}
          {selectedCuisine && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <CookingPot className="w-4 h-4 mr-1" />
                Cooking Method
              </label>
              <select
                value={selectedCookingMethod}
                onChange={(e) => setSelectedCookingMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Method</option>
                {getCookingMethodOptions().map((method) => (
                  <option key={method} value={method}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Elemental Profile Sliders */}
          <div className="mt-8 mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Elemental Profile</h3>
            
            {/* Fire Element */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-xs flex items-center text-red-600">
                  <Flame className="w-3 h-3 mr-1" />
                  Fire
                </label>
                <span className="text-xs text-gray-500">
                  {Math.round(elementalProfile.Fire * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={elementalProfile.Fire}
                onChange={(e) => handleElementChange('Fire', parseFloat(e.target.value))}
                className="w-full h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
            
            {/* Water Element */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-xs flex items-center text-blue-600">
                  <Droplet className="w-3 h-3 mr-1" />
                  Water
                </label>
                <span className="text-xs text-gray-500">
                  {Math.round(elementalProfile.Water * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={elementalProfile.Water}
                onChange={(e) => handleElementChange('Water', parseFloat(e.target.value))}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            
            {/* Earth Element */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-xs flex items-center text-amber-600">
                  <Mountain className="w-3 h-3 mr-1" />
                  Earth
                </label>
                <span className="text-xs text-gray-500">
                  {Math.round(elementalProfile.Earth * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={elementalProfile.Earth}
                onChange={(e) => handleElementChange('Earth', parseFloat(e.target.value))}
                className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            
            {/* Air Element */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label className="text-xs flex items-center text-purple-600">
                  <Wind className="w-3 h-3 mr-1" />
                  Air
                </label>
                <span className="text-xs text-gray-500">
                  {Math.round(elementalProfile.Air * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={elementalProfile.Air}
                onChange={(e) => handleElementChange('Air', parseFloat(e.target.value))}
                className="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
            
            {/* Reset buttons */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={resetFilters}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center"
              >
                Reset Filters
              </button>
              <button
                onClick={resetElementalProfile}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm flex items-center"
              >
                Balance Elements
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="lg:col-span-2">
          {/* Display title with selected filters */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Utensils className="w-5 h-5 mr-2" />
              {selectedCuisine 
                ? `${allCuisines[selectedCuisine]?.name || selectedCuisine} Sauces`
                : "All Cuisine Sauces"}
            </h2>
            
            {/* Active filters display */}
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedProtein && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
                  <Beef className="w-3 h-3 mr-1" />
                  Protein: {selectedProtein}
                </span>
              )}
              
              {selectedVegetable && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                  <Carrot className="w-3 h-3 mr-1" />
                  Vegetable: {selectedVegetable}
                </span>
              )}
              
              {selectedCookingMethod && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center">
                  <CookingPot className="w-3 h-3 mr-1" />
                  Method: {selectedCookingMethod}
                </span>
              )}
              
              {/* Display dominant element */}
              {Object.entries(elementalProfile)
                .sort(([, a], [, b]) => b - a)[0][0] !== 'Fire' &&
                Object.entries(elementalProfile)
                .sort(([, a], [, b]) => b - a)[0][1] > 0.3 && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center">
                  {Object.entries(elementalProfile)
                    .sort(([, a], [, b]) => b - a)[0][0] === 'Water' && (
                    <Droplet className="w-3 h-3 mr-1 text-blue-500" />
                  )}
                  {Object.entries(elementalProfile)
                    .sort(([, a], [, b]) => b - a)[0][0] === 'Earth' && (
                    <Mountain className="w-3 h-3 mr-1 text-amber-500" />
                  )}
                  {Object.entries(elementalProfile)
                    .sort(([, a], [, b]) => b - a)[0][0] === 'Air' && (
                    <Wind className="w-3 h-3 mr-1 text-purple-500" />
                  )}
                  {Object.entries(elementalProfile)
                    .sort(([, a], [, b]) => b - a)[0][0] === 'Fire' && (
                    <Flame className="w-3 h-3 mr-1 text-red-500" />
                  )}
                  Dominant: {Object.entries(elementalProfile)
                    .sort(([, a], [, b]) => b - a)[0][0]}
                </span>
              )}
            </div>
          </div>
          
          {/* Sauce Recommender Component */}
          <SauceRecommender
            currentElementalProfile={elementalProfile}
            cuisine={selectedCuisine}
            protein={selectedProtein}
            vegetable={selectedVegetable}
            cookingMethod={selectedCookingMethod}
            showByRegion={true}
            showByAstrological={true}
            maxResults={12}
            cuisines={allCuisines}
          />
        </div>
      </div>
    </div>
  );
} 