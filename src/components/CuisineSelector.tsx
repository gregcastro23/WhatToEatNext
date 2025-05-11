import React, { useState, useMemo, useEffect } from 'react';
import @/utils  from 'recipeFilters ';
import @/types  from 'recipe ';
import @/data  from 'ingredients ';
import @/types  from 'alchemy ';
import @/utils  from 'cuisineUtils ';
import @/utils  from 'alchemicalTransformationUtils ';
import @/calculations  from 'alchemicalTransformation ';
import @/data  from 'cuisines ';
import @/constants  from 'planetaryFoodAssociations ';

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
  let cuisineList = useMemo(() => {
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
  let sortedCuisines = useMemo(() => {
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
  let getCuisineModality = (cuisine: unknown): Modality => {
    // If cuisine already has modality defined, use it
    if (cuisine.modality) return cuisine.modality;
    
    // Otherwise determine from elemental state
    return determineModalityFromElements(cuisine.elementalState || cuisine.elementalProperties || {
      Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
    });
  };
  
  // Filter cuisines by modality and zodiac influence
  let filteredCuisines = useMemo(() => {
    return sortedCuisines.filter(cuisine => {
      // Apply modality filter
      if (modalityFilter !== 'all' && getCuisineModality(cuisine) !== modalityFilter) {
        return false;
      }
      
      // Apply zodiac filter
      if (zodiacFilter !== 'all') {
        // Check if cuisine has zodiac influences and includes the selected zodiac
        let zodiacInfluences = cuisine.zodiacInfluences || [];
        if (zodiacFilter !== 'all' && !zodiacInfluences.includes(zodiacFilter)) {
          // Also check for planetary dignities if cuisines were transformed
          if ('planetaryDignities' in cuisine) {
            let hasPlanetaryMatch = Object.values(cuisine.planetaryDignities || {}).some(
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

  let handleCuisineSelect = (cuisine: string) => {
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
          let isZodiacFavorable = currentZodiac && 
            (cuisine.zodiacInfluences?.includes(currentZodiac) ||
             Object.values(cuisine.planetaryDignities || {}).some(
               (dignity) => (dignity as PlanetaryDignityDetails).favorableZodiacSigns?.includes(currentZodiac)
             ));
          
          return (
            <button
              key={cuisine.id}
              onClick={() => handleCuisineSelect(cuisine.name)}
              className={`
                p-4 rounded-lg shadow-md transition-all
                ${selectedCuisine === cuisine.name
                  ? 'bg-primary text-white'
                  : isZodiacFavorable
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'bg-white hover:bg-gray-50'
                }
              `}
            >
              <span className="text-lg font-medium">{cuisine.name}</span>
              
              <div className="cuisine-modality flex justify-between items-center mt-2">
                <span className={`modality-badge ${getCuisineModality(cuisine).toLowerCase()}`}>
                  {getCuisineModality(cuisine)}
                </span>
                
                {/* Display alchemical compatibility if available */}
                {'gregsEnergy' in cuisine && (
                  <span className="alchemical-score text-sm">
                    Compatibility: {Math.round((cuisine.gregsEnergy as number) * 100)}%
                  </span>
                )}
              </div>
              
              {/* Display zodiac influences if available */}
              {cuisine.zodiacInfluences && cuisine.zodiacInfluences.length > 0 && (
                <div className="zodiac-influences text-xs mt-2">
                  <span>Zodiac influences: </span>
                  {cuisine.zodiacInfluences.map((sign: string, i: number) => (
                    <span key={sign} className={`${currentZodiac === sign ? 'font-bold' : ''}`}>
                      {sign.charAt(0).toUpperCase() + sign.slice(1)}
                      {i < cuisine.zodiacInfluences.length - 1 ? ', ' : ''}
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