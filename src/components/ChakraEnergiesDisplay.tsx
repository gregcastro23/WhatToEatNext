'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ChakraAlchemyService } from '@/lib/ChakraAlchemyService';
import { ChakraEnergies, Planet, ZodiacSign } from '@/types/alchemy';
import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator';
import { CHAKRAS } from '@/types/chakra';
import { KeyCardChakraMapping } from '@/types/chakra';

interface ChakraEnergiesDisplayProps {
  sunSign?: ZodiacSign;
  moonSign?: ZodiacSign;
  dominantPlanets?: Planet[];
  compact?: boolean;
}

const ChakraEnergiesDisplay: React.FC<ChakraEnergiesDisplayProps> = ({
  sunSign = 'aries',
  moonSign = 'taurus',
  dominantPlanets = ['sun', 'moon', 'mercury'],
  compact = false
}) => {
  // Use useMemo to create the service instances
  const chakraService = useMemo(() => new ChakraAlchemyService(), []);
  const planetaryHourCalculator = useMemo(() => new PlanetaryHourCalculator(), []);
  
  const [chakraEnergies, setChakraEnergies] = useState<ChakraEnergies>({
    root: 0,
    sacral: 0,
    solarPlexus: 0,
    heart: 0,
    throat: 0,
    brow: 0,
    crown: 0
  });
  const [planetaryHour, setPlanetaryHour] = useState<Planet>('sun');
  const [recommendations, setRecommendations] = useState<{[key: string]: KeyCardChakraMapping[]}>({});
  const [activeChakra, setActiveChakra] = useState<string | null>(null);

  // Get the current planetary hour - only run once on component mount
  // This useEffect was causing the infinite loop, so we're fixing it by ensuring it only runs once
  useEffect(() => {
    let isMounted = true;
    try {
      const hourInfo = planetaryHourCalculator.getCurrentPlanetaryHour();
      if (hourInfo && typeof hourInfo.planet === 'string' && isMounted) {
        setPlanetaryHour(hourInfo.planet.toLowerCase() as Planet);
      }
    } catch (error) {
      console.error('Error getting planetary hour:', error);
    }
    return () => {
      isMounted = false;
    };
  }, [planetaryHourCalculator]); // Only depend on the memoized calculator

  // Memoize the chakra energies calculation
  const calculatedEnergies = useMemo(() => {
    return chakraService.calculateChakraEnergies(
      sunSign,
      moonSign,
      dominantPlanets,
      planetaryHour
    );
  }, [chakraService, sunSign, moonSign, dominantPlanets, planetaryHour]);
  
  // Memoize the recommendations calculation
  const calculatedRecommendations = useMemo(() => {
    const chakraRecommendations: {[key: string]: KeyCardChakraMapping[]} = {};
    
    Object.entries(calculatedEnergies).forEach(([key, value]) => {
      if (key !== 'solarPlexus') { // Convert to chakra position format
        const chakraKey = key as keyof ChakraEnergies;
        const chakraPosition = key === 'solarPlexus' ? 'solar plexus' : key;
        chakraRecommendations[chakraKey] = chakraService.getTarotRecommendationsForChakra(
          chakraPosition as any, 
          value
        );
      } else {
        chakraRecommendations.solarPlexus = chakraService.getTarotRecommendationsForChakra(
          'solar plexus', 
          calculatedEnergies.solarPlexus
        );
      }
    });
    
    return chakraRecommendations;
  }, [calculatedEnergies, chakraService]);
  
  // Update state from memoized values - using useEffect was causing unnecessary re-renders
  // Instead, we'll use a single useEffect with stable references
  useEffect(() => {
    setChakraEnergies(calculatedEnergies);
    setRecommendations(calculatedRecommendations);
  }, [calculatedEnergies, calculatedRecommendations]);

  // Memoize these functions to prevent recreation on each render
  const getChakraColor = useCallback((chakra: string): string => {
    const colorMap: Record<string, string> = {
      root: 'bg-red-500',
      sacral: 'bg-orange-400',
      solarPlexus: 'bg-yellow-300',
      heart: 'bg-green-400',
      throat: 'bg-blue-400',
      brow: 'bg-indigo-500',
      crown: 'bg-purple-400'
    };
    return colorMap[chakra] || 'bg-gray-400';
  }, []);

  const getChakraTextColor = useCallback((chakra: string): string => {
    const colorMap: Record<string, string> = {
      root: 'text-red-500',
      sacral: 'text-orange-400',
      solarPlexus: 'text-yellow-500',
      heart: 'text-green-500',
      throat: 'text-blue-500',
      brow: 'text-indigo-500',
      crown: 'text-purple-500'
    };
    return colorMap[chakra] || 'text-gray-500';
  }, []);

  const getChakraSymbol = useCallback((chakra: string): string => {
    const symbolMap: Record<string, string> = {
      root: '▼',      // Downward-pointing triangle
      sacral: '○',     // Circle
      solarPlexus: '△', // Upward-pointing triangle
      heart: '✦',      // Star
      throat: '◯',     // Circle
      brow: '◎',       // Circle with dot
      crown: '☼'       // Sun
    };
    return symbolMap[chakra] || '●';
  }, []);

  // Memoize the toggle active chakra handler
  const toggleActiveChakra = useCallback((chakra: string) => {
    setActiveChakra(current => current === chakra ? null : chakra);
  }, []);

  if (compact) {
    return (
      <div className="bg-opacity-30 bg-purple-900 rounded-md p-3">
        <h3 className="text-sm font-semibold mb-2 text-white">Chakra Energies</h3>
        <div className="flex items-center space-x-1">
          {Object.entries(chakraEnergies).map(([chakra, energy]) => (
            <div 
              key={chakra}
              className="flex flex-col items-center"
              title={`${chakra}: ${energy.toFixed(1)}`}
            >
              <div 
                className={`${getChakraColor(chakra)} w-3 h-3 rounded-full`}
                style={{ opacity: energy / 10 }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-opacity-20 bg-purple-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-white">Chakra Energies</h3>
      
      <div className="flex flex-col space-y-4">
        {Object.entries(chakraEnergies).map(([chakra, energy]) => {
          const chakraInfo = chakra === 'solarPlexus' 
            ? CHAKRAS['solar plexus']
            : CHAKRAS[chakra as keyof typeof CHAKRAS];
          
          return (
            <div 
              key={chakra} 
              className={`
                p-3 rounded-md transition-all duration-300 cursor-pointer 
                ${activeChakra === chakra ? 'bg-opacity-40 bg-gray-800' : 'bg-opacity-20 bg-gray-900'}
              `}
              onClick={() => toggleActiveChakra(chakra)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`${getChakraColor(chakra)} w-6 h-6 rounded-full flex items-center justify-center mr-3 text-white`}>
                    {getChakraSymbol(chakra)}
                  </div>
                  <div>
                    <div className={`font-medium ${getChakraTextColor(chakra)}`}>
                      {chakraInfo?.name || chakra}
                    </div>
                    <div className="text-xs text-gray-400">
                      {chakraInfo?.sanskritName} • {chakraInfo?.description}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden mr-3">
                    <div 
                      className={`h-full ${getChakraColor(chakra)}`}
                      style={{ width: `${energy * 10}%` }}
                    />
                  </div>
                  <span className="text-white font-medium">{energy.toFixed(1)}</span>
                </div>
              </div>
              
              {/* Tarot recommendations */}
              {activeChakra === chakra && recommendations[chakra] && recommendations[chakra].length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Tarot Recommendations</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {recommendations[chakra].map((card, index) => (
                      <div key={index} className="bg-opacity-20 bg-gray-800 p-2 rounded">
                        <div className="font-medium text-sm text-white">{card.cardName}</div>
                        <div className="text-xs text-gray-400">{card.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChakraEnergiesDisplay; 