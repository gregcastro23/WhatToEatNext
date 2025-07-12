'use client';

import React, { useState } from 'react';
import { fetchNutritionalData, nutritionalToElemental, zodiacNutritionalNeeds } from '@/data/nutritional';
import { NutritionalProfile, Element, ZodiacSign } from '@/types/alchemy';

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex justify-center my-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No data to display</h3>
      <p className="mt-1 text-sm text-gray-500">
        Enter a food name in the search box above to see nutritional information and elemental properties.
      </p>
      <p className="mt-3 text-xs text-gray-500">
        Try searching for foods like "apple", "chicken breast", or "quinoa".
      </p>
    </div>
  );
}

// Add this component to display zodiac sign recommendations
function ZodiacRecommendations({ dominantElement }: { dominantElement: Element }) {
  const compatibleSigns = Object.entries(zodiacNutritionalNeeds)
    .filter(([_sign, data]) => {
      // Find signs that need this element the most
      const elementNeeds = data.elementalNeeds;
      const dominantElementNeeded = Object.entries(elementNeeds)
        .sort(([_a, valueA], [_b, valueB]) => valueB - valueA)[0][0];
      return dominantElementNeeded === dominantElement;
    })
    .map(([sign]) => sign as ZodiacSign);

  if (compatibleSigns?.length === 0) return null;

  return (
    <div className="mt-6 p-4 border border-purple-200 bg-purple-50 rounded">
      <h3 className="text-lg font-semibold mb-2 text-purple-800">Astrological Affinity</h3>
      <p className="text-sm text-purple-700 mb-3">
        This food's dominant {dominantElement as any} element makes it especially beneficial for:
      </p>
      <div className="flex flex-wrap gap-2">
        {compatibleSigns.map(sign => (
          <span 
            key={sign} 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
          >
            {sign.charAt(0).toUpperCase() + sign.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function NutritionalDataFetcher() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nutritionalData, setNutritionalData] = useState<NutritionalProfile | null>(null);
  const [elementalData, setElementalData] = useState<{
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a food name to search');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchNutritionalData(searchTerm);
      
      if (!data) {
        setError(`No nutritional data found for "${searchTerm}". Try a different food name.`);
        setNutritionalData(null);
        setElementalData(null);
        return;
      }
      
      setNutritionalData(data as any);
      const elemental = nutritionalToElemental(data);
      setElementalData(elemental);
    } catch (err) {
      // console.error('Error in nutritional search:', err);
      setError('Error fetching nutritional data. Please try again or try a different food name.');
      setNutritionalData(null);
      setElementalData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nutritional Data Fetcher</h1>
      
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter food name (e.g., apple, chicken)"
          className="flex-1 p-2 border border-gray-300 rounded"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {isLoading && <LoadingSpinner />}
      
      {!isLoading && !nutritionalData && !error && <EmptyState />}
      
      {!isLoading && nutritionalData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded bg-white shadow">
            <h2 className="text-xl font-semibold mb-2">Nutritional Profile</h2>
            {(nutritionalData as any)?.name && (
              <p className="text-lg font-medium mb-2">{(nutritionalData as any)?.name}</p>
            )}
            <p><strong>Calories:</strong> {nutritionalData.calories.toFixed(1)}</p>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">Macronutrients</h3>
            <ul className="pl-5 list-disc">
              <li>Protein: {((nutritionalData as any)?.macros?.protein || 0).toFixed(1)}g</li>
              <li>Carbohydrates: {((nutritionalData as any)?.macros?.carbs || 0).toFixed(1)}g</li>
              <li>Fat: {((nutritionalData as any)?.macros?.fat || 0).toFixed(1)}g</li>
              <li>Fiber: {((nutritionalData as any)?.macros?.fiber || 0).toFixed(1)}g</li>
            </ul>
            
            {nutritionalData.vitamins && Object.keys(nutritionalData.vitamins).length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-4 mb-2">Vitamins</h3>
                
                {/* Calculate if we have any non-zero values */}
                {Object.values(nutritionalData.vitamins).some(v => v > 0) ? (
                  <>
                    <ul className="pl-5 list-disc">
                      {Object.entries(nutritionalData.vitamins).map(([vitamin, value]) => {
                        const percentage = value * 100;
                        // Choose appropriate styling based on percentage
                        let textClass = "text-gray-500"; // Default for 0%
                        if (percentage > 50) textClass = "text-green-600 font-medium";
                        else if (percentage > 20) textClass = "text-blue-600";
                        else if (percentage > 0) textClass = "text-gray-700";
                        
                        return (
                          <li key={vitamin} className={textClass}>
                            Vitamin {vitamin}: {percentage.toFixed(1)}% DV
                            {percentage > 20 && " ★"}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      DV = Daily Value based on 2,000 calorie diet. ★ indicates good source.
                    </p>
                  </>
                ) : (
                  <div className="bg-amber-50 p-3 rounded text-amber-800 text-sm">
                    <p>
                      <span className="font-medium">Note:</span> Detailed vitamin data is not available for this food in the USDA database.
                    </p>
                    <p className="mt-1 text-xs">
                      Try searching for a similar food or a less processed version of this food.
                    </p>
                  </div>
                )}
              </>
            )}
            
            {nutritionalData.minerals && Object.keys(nutritionalData.minerals).length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-4 mb-2">Minerals</h3>
                
                {/* Calculate if we have any non-zero values */}
                {Object.values(nutritionalData.minerals).some(v => v > 0) ? (
                  <>
                    <ul className="pl-5 list-disc">
                      {Object.entries(nutritionalData.minerals).map(([mineral, value]) => {
                        const percentage = value * 100;
                        // Choose appropriate styling based on percentage
                        let textClass = "text-gray-500"; // Default for 0%
                        if (percentage > 50) textClass = "text-green-600 font-medium";
                        else if (percentage > 20) textClass = "text-blue-600";
                        else if (percentage > 0) textClass = "text-gray-700";
                        
                        return (
                          <li key={mineral} className={textClass}>
                            {mineral.charAt(0).toUpperCase() + mineral.slice(1)}: {percentage.toFixed(1)}% DV
                            {percentage > 20 && " ★"}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      DV = Daily Value based on 2,000 calorie diet. ★ indicates good source.
                    </p>
                  </>
                ) : (
                  <div className="bg-amber-50 p-3 rounded text-amber-800 text-sm">
                    <p>
                      <span className="font-medium">Note:</span> Detailed mineral data is not available for this food in the USDA database.
                    </p>
                    <p className="mt-1 text-xs">
                      Try searching for a similar food or a less processed version of this food.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          
          {elementalData && (
            <div className="p-4 border rounded bg-white shadow">
              <h2 className="text-xl font-semibold mb-4">Elemental Properties</h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-16 font-medium">Fire:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-red-500 rounded-full h-4" 
                      style={{ width: `${elementalData.Fire * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2">{(elementalData.Fire * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center">
                  <span className="w-16 font-medium">Water:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-500 rounded-full h-4" 
                      style={{ width: `${elementalData.Water * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2">{(elementalData.Water * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center">
                  <span className="w-16 font-medium">Earth:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-500 rounded-full h-4" 
                      style={{ width: `${elementalData.Earth * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2">{(elementalData.Earth * 100).toFixed(1)}%</span>
                </div>
                
                <div className="flex items-center">
                  <span className="w-16 font-medium">Air:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-yellow-400 rounded-full h-4" 
                      style={{ width: `${elementalData.Air * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2">{(elementalData.Air * 100).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Dominant Element</h3>
                <p className="text-xl">
                  {Object.entries(elementalData)
                    .sort(([,a], [,b]) => b - a)[0][0]}
                </p>
              </div>
              
              <ZodiacRecommendations 
                dominantElement={Object.entries(elementalData)
                  .sort(([,a], [,b]) => b - a)[0][0] as Element} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 