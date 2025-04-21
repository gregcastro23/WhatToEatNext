import React, { useState, useMemo, useEffect } from 'react';
import { getRecipesForCuisine } from '../utils/recipeFilters';
import type { Recipe } from '../types/recipe';
import type { Modality } from '../data/ingredients/types';
import { ZodiacSign, LunarPhase, LunarPhaseWithSpaces } from '../types/alchemy';
import { determineModalityFromElements } from '../utils/cuisineUtils';
import { transformCuisines } from '../utils/alchemicalTransformationUtils';
import { ElementalItem } from '../calculations/alchemicalTransformation';
import cuisines from '../data/cuisines';
import { PlanetaryDignityDetails } from '../constants/planetaryFoodAssociations';

interface CuisineSelectorProps {
  onRecipesChange: (recipes: Recipe[]) => void;
  selectedCuisine: string | null;
  onCuisineChange: (cuisine: string) => void;
  planetaryPositions?: Record<string, number>;
  isDaytime?: boolean;
  currentZodiac?: ZodiacSign | null;
  currentLunarPhase?: LunarPhaseWithSpaces | null;
}

function CuisineSelector({ 
  onRecipesChange, 
  selectedCuisine, 
  onCuisineChange,
  planetaryPositions = {},
  isDaytime = true,
  currentZodiac = null,
  currentLunarPhase = null
}: CuisineSelectorProps) {
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [zodiacFilter, setZodiacFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  
  // Get all cuisines
  const cuisineList = useMemo(() => {
    // Ensure each cuisine has the required properties for ElementalItem
    const baseCuisines: ElementalItem[] = [
      { 
        id: 'italian', 
        ...cuisines.italian,
        elementalProperties: cuisines.italian.elementalState || { 
          Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 
        },
      },
      { 
        id: 'french', 
        ...cuisines.french,
        elementalProperties: cuisines.french.elementalState || { 
          Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 
        },
      },
      { 
        id: 'thai', 
        ...cuisines.thai,
        elementalProperties: cuisines.thai.elementalState || { 
          Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 
        },
      },
      { 
        id: 'middleEastern', 
        ...cuisines.middleEastern,
        elementalProperties: cuisines.middleEastern.elementalState || { 
          Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 
        },
      }
    ];
    
    // Apply alchemical transformations if we have planetary positions
    if (Object.keys(planetaryPositions).length > 0) {
      return transformCuisines(
        baseCuisines,
        planetaryPositions,
        isDaytime,
        currentZodiac,
        currentLunarPhase
      );
    }
    
    return baseCuisines;
  }, [planetaryPositions, isDaytime, currentZodiac, currentLunarPhase]);
  
  // Sort cuisines when sort preference changes
  const sortedCuisines = useMemo(() => {
    const sorted = [...cuisineList];
    
    if (sortBy === 'alchemical' && Object.keys(planetaryPositions).length > 0) {
      // Sort by gregsEnergy or planetary boost if available
      sorted.sort((a, b) => {
        // If alchemical properties are available, sort by them
        if ('gregsEnergy' in a && 'gregsEnergy' in b) {
          return (b.gregsEnergy as number) - (a.gregsEnergy as number);
        }
        
        // Fallback to default sorting
        return 0;
      });
    }
    
    return sorted;
  }, [cuisineList, sortBy, planetaryPositions]);
  
  // Function to determine cuisine modality
  const getCuisineModality = (cuisine: unknown): Modality => {
    // Add type guard to safely check properties
    if (cuisine && typeof cuisine === 'object') {
      // Check if modality exists on the object
      if ('modality' in cuisine && cuisine.modality) {
        return cuisine.modality as Modality;
      }
      
      // Otherwise determine from elemental state
      const elementalData = ('elementalState' in cuisine) 
        ? cuisine.elementalState 
        : ('elementalProperties' in cuisine ? cuisine.elementalProperties : null);
      
      if (elementalData) {
        return determineModalityFromElements(elementalData as any);
      }
    }
    
    // Default return value if no data available
    return determineModalityFromElements({
      Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
    });
  };
  
  // Filter cuisines by modality and zodiac influence
  const filteredCuisines = useMemo(() => {
    return sortedCuisines.filter(cuisine => {
      // Apply modality filter
      if (modalityFilter !== 'all' && getCuisineModality(cuisine) !== modalityFilter) {
        return false;
      }
      
      // Apply zodiac filter
      if (zodiacFilter !== 'all') {
        // Check if cuisine has zodiac influences and includes the selected zodiac
        if (cuisine && typeof cuisine === 'object' && 'zodiacInfluences' in cuisine) {
          const zodiacInfluences = Array.isArray(cuisine.zodiacInfluences) 
            ? cuisine.zodiacInfluences 
            : [];
            
          if (!zodiacInfluences.includes(zodiacFilter)) {
            // Also check for planetary dignities if cuisines were transformed
            if (cuisine && typeof cuisine === 'object' && 'planetaryDignities' in cuisine) {
              const planetaryDignities = cuisine.planetaryDignities as Record<string, unknown> || {};
              const hasPlanetaryMatch = Object.values(planetaryDignities).some(
                (dignity) => {
                  if (dignity && typeof dignity === 'object' && 'favorableZodiacSigns' in dignity) {
                    const favorableSigns = Array.isArray(dignity.favorableZodiacSigns) 
                      ? dignity.favorableZodiacSigns 
                      : [];
                    return favorableSigns.includes(zodiacFilter);
                  }
                  return false;
                }
              );
              
              if (!hasPlanetaryMatch) {
                return false;
              }
            } else {
              return false;
            }
          }
        } else {
          return false;
        }
      }
      
      return true;
    });
  }, [sortedCuisines, modalityFilter, zodiacFilter]);

  const handleCuisineSelect = (cuisine: string) => {
    // Just notify the parent component about the cuisine change
    // and let it handle getting the recipes
    onRecipesChange([]);  // Pass empty array initially
    onCuisineChange(cuisine);  // Let parent component fetch recipes based on cuisine
  };

  // Get the zodiac signs for filtering
  const zodiacSigns: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];

  return (
    <div className="cuisine-selector">
      <h2 className="text-xl font-bold mb-4">Select a Cuisine</h2>
      
      <div className="filters mb-6 flex flex-wrap gap-4">
        <div className="filter-group">
          <label htmlFor="modality-filter" className="block text-sm font-medium text-gray-700 mb-1">Quality:</label>
          <select 
            id="modality-filter" 
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            <option value="all">All Qualities</option>
            <option value="Cardinal">Cardinal</option>
            <option value="Fixed">Fixed</option>
            <option value="Mutable">Mutable</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="zodiac-filter" className="block text-sm font-medium text-gray-700 mb-1">Zodiac Influence:</label>
          <select 
            id="zodiac-filter" 
            value={zodiacFilter}
            onChange={(e) => setZodiacFilter(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            <option value="all">All Signs</option>
            {zodiacSigns.map(sign => (
              <option key={sign} value={sign}>
                {sign.charAt(0).toUpperCase() + sign.slice(1)}
                {sign === currentZodiac ? ' (Current)' : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Sort By:</label>
          <select 
            id="sort-by" 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            <option value="default">Default</option>
            <option value="alchemical">Alchemical Compatibility</option>
          </select>
        </div>
      </div>
      
      {currentZodiac && (
        <div className="current-influences p-3 bg-blue-50 rounded-lg mb-4">
          <p>Current influences: <span className="font-semibold">{currentZodiac.charAt(0).toUpperCase() + currentZodiac.slice(1)}</span> 
            {currentLunarPhase && (
              <span> - {currentLunarPhase.split(/(?=[A-Z])/).join(" ")}</span>
            )}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredCuisines.map((cuisine) => {
          // Safely access cuisine properties with type guards
          const cuisineName = cuisine && typeof cuisine === 'object' && 'name' in cuisine 
            ? cuisine.name as string 
            : 'Unknown';
          
          const cuisineId = cuisine && typeof cuisine === 'object' && 'id' in cuisine
            ? cuisine.id as string
            : 'unknown';
          
          // Get zodiac influences safely
          const zodiacInfluences = cuisine && typeof cuisine === 'object' && 'zodiacInfluences' in cuisine
            ? Array.isArray(cuisine.zodiacInfluences) ? cuisine.zodiacInfluences : []
            : [];
            
          // Determine if current zodiac is favorable for this cuisine
          const isZodiacFavorable = currentZodiac && (
            // Check if the cuisine's zodiac influences include current zodiac
            zodiacInfluences.includes(currentZodiac) ||
            // Check planetary dignities
            (cuisine && typeof cuisine === 'object' && 'planetaryDignities' in cuisine && 
              Object.values(cuisine.planetaryDignities as Record<string, unknown> || {}).some(
                (dignity) => {
                  if (dignity && typeof dignity === 'object' && 'favorableZodiacSigns' in dignity) {
                    const favorableSigns = Array.isArray(dignity.favorableZodiacSigns) 
                      ? dignity.favorableZodiacSigns 
                      : [];
                    return currentZodiac ? favorableSigns.includes(currentZodiac) : false;
                  }
                  return false;
                }
              )
            )
          );
          
          // Get gregsEnergy value safely
          const hasGregsEnergy = cuisine && typeof cuisine === 'object' && 'gregsEnergy' in cuisine;
          const gregsEnergyValue = hasGregsEnergy ? (cuisine.gregsEnergy as number) : 0;
          
          return (
            <button
              key={cuisineId}
              onClick={() => handleCuisineSelect(cuisineName)}
              className={`
                p-4 rounded-lg shadow-md transition-all
                ${selectedCuisine === cuisineName
                  ? 'bg-primary text-white'
                  : isZodiacFavorable
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'bg-white hover:bg-gray-50'
                }
              `}
            >
              <span className="text-lg font-medium">{cuisineName}</span>
              
              <div className="cuisine-modality flex justify-between items-center mt-2">
                <span className={`modality-badge ${getCuisineModality(cuisine).toLowerCase()}`}>
                  {getCuisineModality(cuisine)}
                </span>
                
                {/* Display alchemical compatibility if available */}
                {hasGregsEnergy && (
                  <span className="alchemical-score text-sm">
                    Compatibility: {Math.round(gregsEnergyValue * 100)}%
                  </span>
                )}
              </div>
              
              {/* Display zodiac influences if available */}
              {zodiacInfluences.length > 0 && (
                <div className="zodiac-influences text-xs mt-2">
                  <span>Zodiac influences: </span>
                  {zodiacInfluences.map((sign: string, i: number) => (
                    <span key={sign} className={`${currentZodiac === sign ? 'font-bold' : ''}`}>
                      {sign.charAt(0).toUpperCase() + sign.slice(1)}
                      {i < zodiacInfluences.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {filteredCuisines.length === 0 && (
        <div className="empty-state p-6 text-center bg-gray-50 rounded-lg">
          <p>No cuisines match your current filters. Try adjusting your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default CuisineSelector; 