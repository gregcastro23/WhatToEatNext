'use client';

import { isEqual } from 'lodash';
import React, { useEffect, useState, useMemo, useCallback } from 'react';


import { calculateElementalEnergies } from '@/calculations/elementalcalculations';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { log } from '@/services/LoggingService';
import { ElementType, ElementalEnergy } from '@/types/elements';
import { getCachedCalculation } from '@/utils/calculationCache';


interface ElementalEnergyDisplayProps {
  showDebug?: boolean;
}

const ElementalEnergyDisplay: React.FC<ElementalEnergyDisplayProps> = ({ showDebug = false }) => {
  const [renderCount, setRenderCount] = useState(0);
  const [energies, setEnergies] = useState<ElementalEnergy[]>([]);
  const [lastPositions, setLastPositions] = useState({});
  const { planetaryPositions, isDaytime } = useAlchemical();

  // Track renders for debugging - only increments once on mount
  useEffect(() => {
    // Only increment on component mount, not on every render
    if (showDebug) {
      log.info(`ElementalEnergyDisplay initial render`);
    }
    // Empty dependency array ensures this runs only once on mount
  }, []);

  // Only update render count when needed for debugging
  useEffect(() => {
    if (showDebug) {
      setRenderCount(prev => prev + 1);
      log.info(`ElementalEnergyDisplay rendered ${renderCount} times`);
    }
  }, [planetaryPositions, isDaytime, showDebug]); // Only update when these dependencies change

  // Memoize the calculation to avoid recalculating unnecessarily
  const calculateEnergies = useCallback(() => {
    if (!planetaryPositions || Object.keys(planetaryPositions).length === 0) {
      log.info('No planetary positions available');
      return [];
    }

    try {
      // Use the cache utility to prevent redundant calculations
      const result = getCachedCalculation(
        'elementalEnergies',
        { positions: planetaryPositions, isDaytime },
        () => calculateElementalEnergies(planetaryPositions, isDaytime)
      );

      if (!result || !Array.isArray(result)) {
        console.error('Invalid calculation result:', result);
        return [];
      }

      return result;
    } catch (error) {
      console.error('Error calculating elemental energies:', error);
      return [];
    }
  }, [planetaryPositions, isDaytime]);

  // Update energies when dependencies change
  useEffect(() => {
    // Skip calculation if positions haven't changed
    if (isEqual(lastPositions, planetaryPositions)) {
      if (showDebug) log.info('Skipping calculation - positions unchanged');
      return;
    }

    const newEnergies = calculateEnergies();
    
    // Only update state if energies have changed
    if (!isEqual(energies, newEnergies)) {
      if (showDebug) log.info('Updating energy values:', newEnergies);
      setEnergies(newEnergies);
    }
    
    setLastPositions(planetaryPositions);
  }, [planetaryPositions, isDaytime, calculateEnergies, showDebug, energies, lastPositions]); // Added energies and lastPositions to deps

  // Memoize the sorted energies array
  const sortedEnergies = useMemo(() => {
    return [...energies].sort((a, b) => b.strength - a.strength);
  }, [energies]);

  if (!sortedEnergies.length) {
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
          Render count: {renderCount} | Elements: {sortedEnergies.length}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sortedEnergies.map((element) => (
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

// Helper functions
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getElementColor(elementType: ElementType, opacity: number = 1): string {
  const colors: Record<ElementType, string> = {
    Fire: `rgba(255, 59, 48, ${opacity})`,
    Water: `rgba(0, 122, 255, ${opacity})`,
    Air: `rgba(255, 204, 0, ${opacity})`,
    Earth: `rgba(52, 199, 89, ${opacity})`
  } as unknown as Record<ElementType, string>;
  
  return colors[elementType] || `rgba(155, 155, 155, ${opacity})`;
}

// Wrap with memo to prevent unnecessary re-renders from parent components
export default React.memo(ElementalEnergyDisplay, (prevProps, nextProps) => {
  // Only re-render if showDebug changes
  return prevProps.showDebug === nextProps.showDebug;
}); 