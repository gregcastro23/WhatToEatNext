'use client';

import React, { useState, useEffect } from 'react';
import { useAstrologicalState } from '../../hooks/useAstrologicalState';
import { getChakraBasedRecommendations, GroupedIngredientRecommendations, getIngredientRecommendations } from '../../utils/ingredientRecommender';
import { Flame, Droplets, Mountain, Wind, Tag, Clock } from 'lucide-react';
import { safeArray, safeGet, safeRound, safeString, safeNumber, safeElementalProperties } from '../../utils/typeSafeOperations';
import { CelestialPosition, ElementalProperties } from '@/types/celestial';

export default function IngredientDisplay() {
  const [activeTab, setActiveTab] = useState('all');
  const [groupedIngredients, setGroupedIngredients] = useState<GroupedIngredientRecommendations>({});
  const [loading, setLoading] = useState(true);
  const astroData = useAstrologicalState();
  
  useEffect(() => {
    if (astroData.isReady && !astroData.loading) {
      setLoading(true);
      
      // Create the planetary alignment object safely with proper type checking
      const planetaryAlignment: Record<string, { sign: string; degree: number }> = {};
      
      // Safely extract planetary positions
      Object.entries(astroData.currentPlanetaryAlignment).forEach(([planet, data]) => {
        // Skip non-object entries or special properties like "description"
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          return;
        }
        
        // TypeScript narrowing - check for CelestialPosition properties
        if ('sign' in data && typeof data.sign === 'string') {
          planetaryAlignment[planet] = {
            sign: data.sign,
            degree: typeof data.degree === 'number' ? data.degree : 0
          };
        }
      });
      
      // Create the data structure expected by getIngredientRecommendations
      const ingredientRecommenderProps = {
        // Use the elemental properties from the domElements
        Fire: astroData.domElements.Fire || 0.25,
        Water: astroData.domElements.Water || 0.25,
        Earth: astroData.domElements.Earth || 0.25,
        Air: astroData.domElements.Air || 0.25,
        // Current timestamp
        timestamp: new Date(),
        // Set a default stability 
        currentStability: 0.5,
        // Use the safely constructed planetary alignment
        planetaryAlignment
      };
      
      // Get recommendations
      const recommendations = getIngredientRecommendations(
        ingredientRecommenderProps,
        { count: 20 }
      );
      
      setGroupedIngredients(recommendations);
      setLoading(false);
    }
  }, [astroData.isReady, astroData.loading, astroData.currentPlanetaryAlignment, astroData.domElements]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const renderElementIcon = (element: string) => {
    switch (element.toLowerCase()) {
      case 'fire':
        return <Flame className="w-4 h-4 text-red-500" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'earth':
        return <Mountain className="w-4 h-4 text-green-500" />;
      case 'air':
        return <Wind className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const renderElementBar = (elementalProps: ElementalProperties | Record<string, number> | undefined) => {
    const props = safeElementalProperties(elementalProps);
    
    return (
      <div className="mt-2 flex flex-col gap-1">
        {Object.entries(props)
          .sort(([_, a], [__, b]) => safeNumber(b) - safeNumber(a))
          .map(([element, value]) => (
            <div key={element} className="flex items-center text-xs">
              <span className="w-14 flex items-center">
                {renderElementIcon(element)}
                <span className="ml-1">{element}</span>
              </span>
              <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    element.toLowerCase() === 'fire'
                      ? 'bg-red-400'
                      : element.toLowerCase() === 'water'
                      ? 'bg-blue-400'
                      : element.toLowerCase() === 'earth'
                      ? 'bg-green-400'
                      : 'bg-purple-400'
                  }`}
                  style={{ width: `${safeRound(value * 100)}%` }}
                ></div>
              </div>
              <span className="ml-1 w-7 text-right text-gray-600">{safeRound(value * 100)}%</span>
            </div>
          ))}
      </div>
    );
  };

  const renderIngredientCard = (item: any) => {
    // Get the dominant element based on elemental properties using safe accessor
    const elementalProps = safeElementalProperties(safeGet(item, 'elementalProperties', {}));
    
    // Get dominant element
    const dominantElement = Object.entries(elementalProps)
      .sort(([_, a], [__, b]) => safeNumber(b) - safeNumber(a))[0][0];
    
    // Find sensory properties if available
    const seasonality = safeGet(item, 'seasonality', 
      ['Spring', 'Summer', 'Fall', 'Winter'][Math.floor(Math.random() * 4)]);
    
    // Get qualities as an array of strings
    const qualities = safeArray(safeGet(item, 'qualities', []));
    
    // Ensure matchScore is a valid number
    const matchScore = safeNumber(safeGet(item, 'matchScore', safeGet(item, 'score', 0)));
    
    return (
      <div
        key={safeString(safeGet(item, 'name', 'ingredient'))}
        className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white"
      >
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{safeString(safeGet(item, 'name', 'Ingredient'))}</h3>
          <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
            {matchScore.toFixed(0)}% Match
          </div>
        </div>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {qualities.slice(0, 3).map((quality, index) => (
            <span key={`${index}-${safeString(quality)}`} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {safeString(quality)}
            </span>
          ))}
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {safeString(seasonality)}
          </span>
        </div>
        
        {renderElementBar(elementalProps)}
        
        <div className="mt-3 text-sm text-gray-600">
          <p>{safeString(safeGet(item, 'reason', ''))}</p>
        </div>
      </div>
    );
  };

  const renderCategoryGroup = (category: string, items: any) => {
    return (
      <div key={category} className="mb-8">
        <h2 className="text-xl font-semibold mb-4 capitalize">{category}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeArray(items).map((item, index) => (
            <React.Fragment key={`${index}-${safeString(safeGet(item, 'name', 'ingredient'))}`}>
              {renderIngredientCard(item)}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Astrologically Aligned Food Recommendations</h1>
      
      <div className="mb-6 flex overflow-x-auto gap-2">
        <button
          className={`px-4 py-2 rounded-full ${
            activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => handleTabChange('all')}
        >
          All
        </button>
        {Object.keys(groupedIngredients).map((category, index) => (
          <button
            key={`${index}-${category}`}
            className={`px-4 py-2 rounded-full ${
              activeTab === category ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => handleTabChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {loading || astroData.loading ? (
        <div className="text-center py-8">Loading recommendations...</div>
      ) : (
        <div>
          {activeTab === 'all' ? (
            Object.entries(groupedIngredients)
              .filter(([_, items]) => safeArray(items).length > 0)
              .map(([category, items], index) => (
                <React.Fragment key={`category-${index}-${category}`}>
                  {renderCategoryGroup(category, items)}
                </React.Fragment>
              ))
          ) : (
            <div>
              {renderCategoryGroup(activeTab, safeGet(groupedIngredients, activeTab, []))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 