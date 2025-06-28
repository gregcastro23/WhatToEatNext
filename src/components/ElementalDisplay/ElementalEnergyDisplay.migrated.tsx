'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useServices } from '@/hooks/useServices';
import { ElementType, ElementalEnergy } from '@/types/elements';
import { getCachedCalculation } from '@/utils/calculationCache';
import { isEqual } from 'lodash';

import { PlanetaryPosition } from "@/types/celestial";
interface ElementalEnergyDisplayProps {
  showDebug?: boolean;
}

const ElementalEnergyDisplayMigrated: React.FC<ElementalEnergyDisplayProps> = ({ showDebug = false }) => {
  const [renderCount, setRenderCount] = useState(0);
  const [energies, setEnergies] = useState<ElementalEnergy[]>([]);
  const [lastPositions, setLastPositions] = useState({});
  
  // Use the useServices hook instead of the AlchemicalContext
  const {
    isLoading,
    error,
    astrologyService
  } = useServices();

  // Track renders for debugging - only increments once on mount
  useEffect(() => {
    // Only increment on component mount, not on every render
    if (showDebug) {
      console.log(`ElementalEnergyDisplay initial render`);
    }
    // Empty dependency array ensures this runs only once on mount
  }, []);

  // Only update render count when needed for debugging
  useEffect(() => {
    if (showDebug) {
      setRenderCount(prev => prev + 1);
      console.log(`ElementalEnergyDisplay rendered ${renderCount} times`);
    }
  }, [showDebug]); // Only update when showDebug changes

  // Load planetary positions and calculate energies
  useEffect(() => {
    if (isLoading || error || !astrologyService) {
      return;
    }

    const loadPlanetaryData = async () => {
      try {
        // Get current planetary positions from the astrologyService
        const positions = await astrologyService.getCurrentPlanetaryPositions();
        
        // Check if daytime
        const isDaytime = await astrologyService.isDaytime();
        
        // Skip calculation if positions haven't changed
        if (isEqual(lastPositions, positions)) {
          if (showDebug) console.log('Skipping calculation - positions unchanged');
          return;
        }
        
        // Calculate elemental energies
        const result = getCachedCalculation(
          'elementalEnergies',
          { positions, isDaytime },
          () => calculateElementalEnergies(positions, isDaytime)
        );
        
        if (!result || !Array.isArray(result)) {
          console.error('Invalid calculation result:', result);
          return;
        }
        
        // Only update state if energies have changed
        if (!isEqual(energies, result)) {
          if (showDebug) console.log('Updating energy values:', result);
          setEnergies(result);
        }
        
        setLastPositions(positions);
      } catch (err) {
        console.error('Error loading planetary data:', err);
      }
    };

    loadPlanetaryData();
  }, [isLoading, error, astrologyService, showDebug]);

  // Memoize the sorted energies array
  const sortedEnergies = useMemo(() => {
    return [...energies].sort((a, b) => b.strength - a.strength);
  }, [energies]);

  // Show loading state if services aren't ready
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading services...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  // Show loading state if no energies available
  if (!(sortedEnergies || []).length) {
    return (
      <div className="p-4 text-center">
        <p>Loading elemental energies...</p>
      </div>
    );
  }

  return (
    <div className="elemental-display">
      {showDebug && (
        <div className="debug-info text-xs text-gray-500 mb-2">
          Render count: {renderCount} | Elements: {(sortedEnergies || []).length}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(sortedEnergies || []).map((element) => (
          <div 
            key={element.type} 
            className="element-card p-3 rounded-lg shadow-md"
            style={{
              backgroundColor: getElementColor(element.type, 0.2),
              borderColor: getElementColor(element.type, 1),
              borderWidth: '2px'
            }}
          >
            <h3 className="font-bold">{capitalizeFirstLetter(element.type)}</h3>
            <div className="strength-bar h-4 rounded bg-gray-200 mt-2">
              <div 
                className="h-full rounded"
                style={{ 
                  width: `${Math.max(5, Math.min(100, element.strength * 100))}%`,
                  backgroundColor: getElementColor(element.type, 0.8) 
                }}
              ></div>
            </div>
            <p className="text-sm mt-1">{Math.round(element.strength * 100)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to calculate elemental energies
function calculateElementalEnergies(
  planetaryPositions: { [key: string]: any },
  isDaytime = true
): ElementalEnergy[] {
  if (!planetaryPositions || Object.keys(planetaryPositions || {}).length === 0) {
    return getDefaultElementalEnergies();
  }

  // Initialize energy values for each element
  const energyValues = { 
    Fire: 0, 
    Water: 0, 
    Earth: 0, 
    Air: 0 
  } as Record<ElementType, number>;

  // Define planetary influences (weights)
  const planetWeights: { [key: string]: number } = { Sun: 0.25,
    moon: 0.2,
    Mercury: 0.1,
    Venus: 0.1,
    Mars: 0.1,
    Jupiter: 0.1,
    Saturn: 0.1,
    Uranus: 0.05,
    Neptune: 0.05,
    Pluto: 0.05 };

  // Define which sign corresponds to which element
  const signElementMap: { [key: string]: ElementType } = { aries: 'Fire',
    leo: 'Fire',
    sagittarius: 'Fire',
    taurus: 'Earth',
    virgo: 'Earth',
    capricorn: 'Earth',
    gemini: 'Air',
    libra: 'Air',
    aquarius: 'Air',
    cancer: 'Water',
    scorpio: 'Water',
    pisces: 'Water' };

  // Calculate element values based on planetary positions
  let totalWeight = 0;

  for (const [planet, position] of Object.entries(planetaryPositions)) {
    const weight = planetWeights[planet?.toLowerCase()] || 0.05;

    // Skip if position doesn't have a sign
    if (!position?.sign) continue;

    // Convert the sign to lowercase to ensure matching
    const sign = position.sign?.toLowerCase();
    const element = signElementMap[sign];

    if (element) {
      energyValues[element] += weight;
      totalWeight += weight;
    }
  }

  // Apply day/night modifiers
  if (isDaytime) {
    energyValues.Fire *= 1.2;
    energyValues.Air *= 1.1;
  } else {
    energyValues.Water *= 1.2;
    energyValues.Earth *= 1.1;
  }

  // Normalize values to ensure they sum to 1
  const sum = Object.values(energyValues)?.reduce(
    (acc, value) => acc + value,
    0
  );

  for (const element of Object.keys(energyValues) as ElementType[]) {
    energyValues[element] = sum > 0 ? energyValues[element] / sum : 0;
  }

  // Create ElementalEnergy objects
  const energies: ElementalEnergy[] = Object.entries(energyValues)
    .filter(([_, strength]) => strength > 0)
    .map(([type, strength]) => ({ type: type as ElementType,
      strength,
      influence: getPlanetaryInfluencers(
        planetaryPositions,
        type as ElementType
      ) }));

  return energies;
}

/**
 * Gets the planetary influencers for a specific element
 */
function getPlanetaryInfluencers(
  planetaryPositions: { [key: string]: any },
  elementType: ElementType
): string[] { // Define which planets influence which elements
  const elementInfluencers = { 
    Fire: ['Sun', 'Mars', 'Jupiter'],
    Water: ['Moon', 'Venus', 'Neptune'],
    Earth: ['Venus', 'Saturn', 'Pluto'],
    Air: ['Mercury', 'Uranus', 'Jupiter']
  } as Record<ElementType, string[]>;

  // Get the potential influencers for this element
  const potentialInfluencers = elementInfluencers[elementType] || [];

  // Return only the planets that are actually present in the positions data
  return (potentialInfluencers || []).filter((planet) =>
      planetaryPositions[planet] &&
      typeof planetaryPositions[planet] === 'object'
  );
}

/**
 * Returns default elemental energies when no data is available
 */
function getDefaultElementalEnergies(): ElementalEnergy[] {
  return [
    { type: 'Fire', strength: 0.25, influence: [] },
    { type: 'Water', strength: 0.25, influence: [] },
    { type: 'Earth', strength: 0.25, influence: [] },
    { type: 'Air', strength: 0.25, influence: [] },
  ];
}

// Helper functions
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0)?.toUpperCase() + string?.slice(1);
}

function getElementColor(elementType: ElementType, opacity: number = 1): string {
  const colors = { 
    Fire: `rgba(255, 59, 48, ${opacity})`,
    Water: `rgba(0, 122, 255, ${opacity})`,
    Air: `rgba(255, 204, 0, ${opacity})`,
    Earth: `rgba(52, 199, 89, ${opacity})`
  } as Record<ElementType, string>;
  
  return colors[elementType] || `rgba(155, 155, 155, ${opacity})`;
}

// Wrap with memo to prevent unnecessary re-renders from parent components
export default React.memo(ElementalEnergyDisplayMigrated, (prevProps, nextProps) => {
  // Only re-render if showDebug changes
  return prevProps.showDebug === nextProps.showDebug;
}); 