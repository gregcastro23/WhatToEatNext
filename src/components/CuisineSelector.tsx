import React, { useState, useMemo, useEffect } from 'react';
import { getRecipesForCuisine } from '@/utils/recipeFilters';
import type { Recipe } from '@/types/recipe';
import type { Modality } from '@/data/ingredients/types';
import { ZodiacSign, LunarPhase, LunarPhaseWithSpaces } from '@/types/alchemy';
import { determineModalityFromElements } from '@/utils/cuisineUtils';
import { transformCuisines } from '@/utils/alchemicalTransformationUtils';
import { ElementalItem } from '@/calculations/alchemicalTransformation';
import cuisines from '@/data/cuisines';
import { PlanetaryDignityDetails } from '@/constants/planetaryFoodAssociations';


// Phase 10: Calculation Type Interfaces
interface CalculationData {
  value: number;
  weight?: number;
  score?: number;
}

interface ScoredItem {
  score: number;
  [key: string]: unknown;
}

interface ElementalData {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: unknown;
}

interface CuisineData {
  id: string;
  name: string;
  zodiacInfluences?: string[];
  planetaryDignities?: Record<string, unknown>;
  elementalState?: ElementalData;
  elementalProperties?: ElementalData;
  modality?: string;
  gregsEnergy?: number;
  [key: string]: unknown;
}

interface NutrientData {
  nutrient?: { name?: string };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  data?: unknown;
  [key: string]: unknown;
}

interface MatchingResult {
  score: number;
  elements: ElementalData;
  recipe?: unknown;
  [key: string]: unknown;
}


interface CuisineSelectorProps {
  onRecipesChange: (recipes: Recipe[]) => void;
  selectedCuisine: string | null;
  onCuisineChange: (cuisine: string) => void;
  planetaryPositions?: Record<string, number>;
  isDaytime?: boolean;
  _isDaytime?: boolean;
  currentZodiac?: ZodiacSign | null;
  currentLunarPhase?: LunarPhaseWithSpaces | null;
}

function CuisineSelector({ 
  onRecipesChange, 
  selectedCuisine, 
  onCuisineChange,
  planetaryPositions = {},
  _isDaytime = true,
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
          return ((b as CuisineData).gregsEnergy as number) - ((a as CuisineData).gregsEnergy as number);
        }
        
        // Fallback to default sorting
        return 0;
      });
    }
    
    return sorted;
  }, [cuisineList, sortBy, planetaryPositions]);
  
  // Function to determine cuisine modality
  const getCuisineModality = (cuisine: CuisineData): _Modality => {
    // If cuisine already has modality defined, use it
    if ((cuisine as CuisineData).modality) return (cuisine as CuisineData).modality as Modality;
    
    // Otherwise determine from elemental state
    return determineModalityFromElements((cuisine as CuisineData).elementalState as any || (cuisine as CuisineData).elementalProperties as any || {
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
        const zodiacInfluences = (cuisine as CuisineData).zodiacInfluences || [];
        if (zodiacFilter !== 'all' && !zodiacInfluences.includes(zodiacFilter)) {
          // Also check for planetary dignities if cuisines were transformed
          if ('planetaryDignities' in cuisine) {
            const hasPlanetaryMatch = Object.values((cuisine as CuisineData).planetaryDignities || {}).some(
              (dignity) => (dignity as PlanetaryDignityDetails).favorableZodiacSigns?.includes(zodiacFilter)
            );
            
            if (!hasPlanetaryMatch) {
              return false;
            }
          } else {
            return false;
          }
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
          // Determine if current zodiac is favorable for this cuisine
          const isZodiacFavorable = currentZodiac && 
            ((cuisine as CuisineData).zodiacInfluences?.includes(currentZodiac) ||
             Object.values((cuisine as CuisineData).planetaryDignities || {}).some(
               (dignity) => (dignity as PlanetaryDignityDetails).favorableZodiacSigns?.includes(currentZodiac)
             ));
          
          return (
            <button
              key={(cuisine as CuisineData).id}
              onClick={() => handleCuisineSelect((cuisine as CuisineData).name)}
              className={`
                p-4 rounded-lg shadow-md transition-all
                ${selectedCuisine === (cuisine as CuisineData).name
                  ? 'bg-primary text-white'
                  : isZodiacFavorable
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'bg-white hover:bg-gray-50'
                }
              `}
            >
              <span className="text-lg font-medium">{(cuisine as CuisineData).name}</span>
              
              <div className="cuisine-modality flex justify-between items-center mt-2">
                <span className={`modality-badge ${getCuisineModality(cuisine).toLowerCase()}`}>
                  {getCuisineModality(cuisine)}
                </span>
                
                {/* Display alchemical compatibility if available */}
                {'gregsEnergy' in cuisine && (
                  <span className="alchemical-score text-sm">
                    Compatibility: {Math.round(((cuisine as CuisineData).gregsEnergy as number) * 100)}%
                  </span>
                )}
              </div>
              
              {/* Display zodiac influences if available */}
              {(cuisine as CuisineData).zodiacInfluences && (cuisine as CuisineData).zodiacInfluences.length > 0 && (
                <div className="zodiac-influences text-xs mt-2">
                  <span>Zodiac influences: </span>
                  {((cuisine as CuisineData).zodiacInfluences as string[]).map((sign: string, i: number) => (
                    <span key={sign} className={`${currentZodiac === sign ? 'font-bold' : ''}`}>
                      {sign.charAt(0).toUpperCase() + sign.slice(1)}
                      {i < (cuisine as CuisineData).zodiacInfluences.length - 1 ? ', ' : ''}
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