'use client';

import React, { useState, useMemo, useEffect } from 'react';

import { ElementalItem } from '@/calculations/alchemicalTransformation';
import { PlanetaryDignityDetails } from '@/constants/planetaryFoodAssociations';
import type { Ingredient, Modality } from "@/data/ingredients/types";
import { useServices } from '@/hooks/useServices';
import { ZodiacSign, LunarPhaseWithSpaces, Element, CuisineType } from '@/types/alchemy';
import { PlanetaryPosition } from "@/types/celestial";
import type { Recipe } from '@/types/recipe';
import { determineModalityFromElements } from '@/utils/cuisineUtils';
interface CuisineSelectorProps {
  onRecipesChange: (recipes: Recipe[]) => void;
  selectedCuisine: string | null;
  onCuisineChange: (cuisine: string) => void;
  planetaryPositions?: { [key: string]: number };
  isDaytime?: boolean;
  currentZodiac?: ZodiacSign | null;
  currentLunarPhase?: LunarPhaseWithSpaces | null;
}

/**
 * CuisineSelector Component - Migrated Version
 * 
 * This component allows users to select from available cuisines with filtering options.
 * It has been migrated from using context-based data access to service-based architecture.
 */
function CuisineSelectorMigrated({ 
  onRecipesChange, 
  selectedCuisine, 
  onCuisineChange,
  planetaryPositions: propPlanetaryPositions,
  isDaytime: propIsDaytime,
  currentZodiac: propCurrentZodiac,
  currentLunarPhase: propCurrentLunarPhase
}: CuisineSelectorProps) {
  // Replace context access with services
  const { 
    isLoading: servicesLoading, 
    error: servicesError, 
    astrologyService,
    recipeService,
    recommendationService
  } = useServices();

  // Component state
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [zodiacFilter, setZodiacFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [resolvedPlanetaryPositions, setResolvedPlanetaryPositions] = useState<Record<string, any>>({});
  const [resolvedIsDaytime, setResolvedIsDaytime] = useState<boolean>(true);
  const [resolvedCurrentZodiac, setResolvedCurrentZodiac] = useState<ZodiacSign | null>(null);
  const [resolvedLunarPhase, setResolvedLunarPhase] = useState<LunarPhaseWithSpaces | null>(null);
  const [cuisineList, setCuisineList] = useState<ElementalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Define all zodiac signs for the filter dropdown
  const currentZodiacSigns = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  // Load astrological data if needed
  useEffect(() => {
    if (servicesLoading || !astrologyService) {
      return;
    }

    const loadAstrologyData = async () => {
      try {
        // Apply safe type casting for astrology service access
        const serviceData = astrologyService as unknown as Record<string, unknown>;
        
        setResolvedPlanetaryPositions(propPlanetaryPositions || await astrologyService.getCurrentPlanetaryPositions());
        setResolvedIsDaytime(propIsDaytime !== undefined ? propIsDaytime : await astrologyService.isDaytime());
        setResolvedCurrentZodiac(propCurrentZodiac || await astrologyService.getCurrentZodiacSign());
        
        // Use safe method access for lunar phase
        const lunarPhase = propCurrentLunarPhase || 
          (serviceData.getCurrentLunarPhase ? await (serviceData.getCurrentLunarPhase as () => Promise<string>)() : 'full moon');
        setResolvedLunarPhase(lunarPhase as LunarPhaseWithSpaces);
      } catch (err) {
        console.error('Error loading astrological data:', err);
        setError(err instanceof Error ? err : new Error('Error loading astrological data'));
      }
    };

    void loadAstrologyData();
  }, [
    servicesLoading, 
    astrologyService, 
    propPlanetaryPositions, 
    propIsDaytime, 
    propCurrentZodiac, 
    propCurrentLunarPhase
  ]);

  // Load cuisines from recommendation service
  useEffect(() => {
    if (servicesLoading || !recommendationService || Object.keys(resolvedPlanetaryPositions || {}).length === 0) {
      return;
    }

    const loadCuisines = async () => {
      try {
        setLoading(true);
        
        // Get recommended cuisines based on planetary positions
        const result = await recommendationService.getRecommendedCuisines({
          planetaryPositions: Object.entries(resolvedPlanetaryPositions).reduce((acc, [planet, degree]) => {
            // Apply safe type casting for astrology service access
            const serviceData = astrologyService as unknown as Record<string, unknown>;
            const getZodiacSignForDegree = serviceData.getZodiacSignForDegree as ((degree: number) => string) | undefined;
            const zodiacSign = getZodiacSignForDegree ? 
              getZodiacSignForDegree(Number(degree)) : 'aries';
            
            acc[planet] = { 
              sign: zodiacSign,
              degree: Number(degree)
            };
            return acc;
          }, {} as Record<string, { sign: string; degree: number }>),
          limit: 20 // Get a good selection of cuisines
        });
        
        // Transform to ElementalItem format for compatibility with existing component
        const cuisines: ElementalItem[] = (result.items || []).map((cuisine, _index) => {
          // Extract elemental properties from context if available
          const elementalProps = result.context?.elementalState?.[cuisine] || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
          };
          
          // Get score from result
          const score = result.scores[cuisine] || 0.5;
          
          // Create ElementalItem
          return {
            id: cuisine.toLowerCase().replace(/\s+/g, ''),
            name: cuisine,
            elementalProperties: elementalProps,
            // Add compatibility score as gregsEnergy for sorting
            gregsEnergy: score,
            // Extract zodiac influences if available
            zodiacInfluences: result.context?.zodiacInfluences?.[cuisine] || [],
            // Add any planetary dignities if available
            planetaryDignities: result.context?.planetaryDignities?.[cuisine] || {}
          };
        });
        
        setCuisineList(cuisines);
      } catch (err) {
        console.error('Error loading cuisines:', err);
        setError(err instanceof Error ? err : new Error('Error loading cuisines'));
      } finally {
        setLoading(false);
      }
    };

    void loadCuisines();
  }, [servicesLoading, recommendationService, resolvedPlanetaryPositions, astrologyService]);

  // Sort cuisines when sort preference changes
  const sortedCuisines = useMemo(() => {
    const sorted = [...cuisineList];
    
    if (sortBy === 'alchemical' && Object.keys(resolvedPlanetaryPositions || {}).length > 0) {
      // Sort by gregsEnergy or compatibility score
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
  }, [cuisineList, sortBy, resolvedPlanetaryPositions]);
  
  // Function to determine cuisine modality
  const getCuisineModality = (cuisine: CuisineType): Modality => {
    // Apply safe type casting for cuisine access
    const cuisineData = cuisine as unknown as Record<string, unknown>;
    
    // If cuisine already has modality defined, use it
    if (cuisineData.modality) return cuisineData.modality as Modality;
    
    // Otherwise determine from elemental state
    const elementalState = cuisineData.elementalState as ElementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    return determineModalityFromElements(elementalState);
  };
  
  // Filter cuisines by modality and zodiac influence
  const filteredCuisines = useMemo(() => {
    return (sortedCuisines || []).filter(cuisine => {
      // Apply modality filter
      if (modalityFilter !== 'all' && getCuisineModality(cuisine as unknown as CuisineType) !== modalityFilter) {
        return false;
      }
      
      // Apply zodiac filter
      if (zodiacFilter !== 'all') {
        // Check if cuisine has zodiac influences and includes the selected zodiac
        // Apply safe type casting for zodiac influences access
        const zodiacInfluencesData = cuisine.zodiacInfluences as Record<string, unknown>;
        const zodiacInfluences: string[] = Array.isArray(zodiacInfluencesData) ? zodiacInfluencesData as string[] : [];
        
        if (zodiacFilter !== 'all' && !zodiacInfluences.includes(zodiacFilter)) {
          // Also check for planetary dignities if cuisines were transformed
          if ('planetaryDignities' in cuisine) {
            const hasPlanetaryMatch = Object.values(cuisine.planetaryDignities || {}).some((dignity) => {
              const signs = (dignity as PlanetaryDignityDetails).favorableZodiacSigns;
              if (!signs) return false;
              return Array.isArray(signs) ? signs.includes(zodiacFilter) : signs === zodiacFilter;
            });
            
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

  // Handle cuisine selection
  const handleCuisineSelect = async (cuisine: string) => {
    // Show loading state while fetching recipes
    onRecipesChange([]);
    
    try {
      if (recipeService) {
        // Get recipes for the selected cuisine
        const recipes = await recipeService.getRecipesForCuisine(cuisine);
        onRecipesChange(recipes);
      }
    } catch (err) {
      console.error('Error fetching recipes for cuisine:', err);
      // Still update the selected cuisine even if recipe fetch fails
      onRecipesChange([]);
    }
    
    // Update selected cuisine
    onCuisineChange(cuisine);
  };

  // Get the zodiac signs for filtering
  const zodiacSigns: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];

  // Handle loading state
  if (servicesLoading || loading) {
    return (
      <div className="cuisine-selector p-4">
        <h2 className="text-xl font-bold mb-4">Select a Cuisine</h2>
        <div className="p-4 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-blue-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-blue-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-blue-600">Loading cuisines...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (servicesError || error) {
    return (
      <div className="cuisine-selector p-4">
        <h2 className="text-xl font-bold mb-4">Select a Cuisine</h2>
        <div className="p-4 text-center text-red-600 border border-red-200 rounded bg-red-50">
          <p>Error loading cuisine data: {(servicesError || error)?.message}</p>
          <p className="text-sm mt-2">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if ((filteredCuisines || []).length === 0) {
    return (
      <div className="cuisine-selector p-4">
        <h2 className="text-xl font-bold mb-4">Select a Cuisine</h2>
        <div className="filters mb-6 flex flex-wrap gap-4">
          {/* Filter UI elements */}
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
              {(currentZodiacSigns || []).map(sign => (
                <option key={sign} value={sign}>
                  {sign.charAt(0).toUpperCase() + sign.slice(1)}
                  {sign === resolvedCurrentZodiac ? ' (Current)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="empty-state p-6 text-center bg-gray-50 rounded-lg">
          <p>No cuisines match your current filters. Try adjusting your criteria.</p>
        </div>
      </div>
    );
  }

  // Main component UI
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
            {(currentZodiacSigns || []).map(sign => (
              <option key={sign} value={sign}>
                {sign.charAt(0).toUpperCase() + sign.slice(1)}
                {sign === resolvedCurrentZodiac ? ' (Current)' : ''}
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
      
      {resolvedCurrentZodiac && (
        <div className="current-influences p-3 bg-blue-50 rounded-lg mb-4">
          <p>Current influences: <span className="font-semibold">{resolvedCurrentZodiac.charAt(0).toUpperCase() + resolvedCurrentZodiac.slice(1)}</span> 
            {resolvedLunarPhase &amp;&amp; (
              <span> - {resolvedLunarPhase.split(/(?=[A-Z])/).join(" ")}</span>
            )}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(filteredCuisines || []).map((cuisine) => {
          // Determine if current zodiac is favorable for this cuisine
          const isZodiacFavorable = resolvedCurrentZodiac &amp;&amp; 
            ((Array.isArray(cuisine.zodiacInfluences) ? cuisine.zodiacInfluences.includes(resolvedCurrentZodiac) : cuisine.zodiacInfluences === resolvedCurrentZodiac) ||
             Object.values(cuisine.planetaryDignities || {}).some((dignity) => {
               const signs = (dignity as PlanetaryDignityDetails).favorableZodiacSigns;
               if (!signs) return false;
               return Array.isArray(signs) ? signs.includes(resolvedCurrentZodiac) : signs === resolvedCurrentZodiac;
             }
             ));
          
          return (
            <button
              key={cuisine.id}
              onClick={() => handleCuisineSelect(cuisine.name)}
              className={`
                p-4 rounded-lg shadow-md transition-all
                ${selectedCuisine === cuisine.name
                  ? 'bg-primary text-white&apos;
                  : isZodiacFavorable
                    ? 'bg-blue-50 hover:bg-blue-100'
                    : 'bg-white hover:bg-gray-50'
                }
              `}
            >
              <span className="text-lg font-medium">{cuisine.name}</span>
              
              <div className="cuisine-modality flex justify-between items-center mt-2">
                <span className={`modality-badge ${getCuisineModality(cuisine as unknown as CuisineType).toLowerCase()}`}>
                  {getCuisineModality(cuisine as unknown as CuisineType)}
                </span>
                
                {/* Display alchemical compatibility if available */}
                {'gregsEnergy&apos; in cuisine &amp;&amp; (
                  <span className="alchemical-score text-sm">
                    Compatibility: {Math.round((cuisine.gregsEnergy as number) * 100)}%
                  </span>
                )}
              </div>
              
              {/* Display zodiac influences if available */}
              {Boolean(cuisine.zodiacInfluences) && (() => {
                // Apply safe type casting for zodiac influences access
                const zodiacInfluencesData = cuisine.zodiacInfluences as Record<string, unknown>;
                const zodiacInfluences: string[] = Array.isArray(zodiacInfluencesData) ? zodiacInfluencesData as string[] : [];
                
                return zodiacInfluences.length > 0 && (
                  <div className="zodiac-influences text-xs mt-2">
                    <span>Zodiac influences: </span>
                    {zodiacInfluences.map((sign: string, i: number) => (
                      <span key={sign} className={`${resolvedCurrentZodiac === sign ? 'font-bold' : ''}`}>
                        {sign.charAt(0).toUpperCase() + sign.slice(1)}
                        {i < zodiacInfluences.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CuisineSelectorMigrated; 