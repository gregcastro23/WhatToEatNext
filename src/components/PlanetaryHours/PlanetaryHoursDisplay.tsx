'use client';

import React, { useState, useEffect } from 'react';
import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator';
import { ChakraAlchemyService } from '@/lib/ChakraAlchemyService';
import { Planet as AlchemyPlanet } from '@/types/alchemy';
import { Clock, Sun, Moon, Star } from 'lucide-react';

// Define a type for capitalized planet names as used in PlanetaryHourCalculator
type CapitalizedPlanet = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';

interface PlanetaryHoursDisplayProps {
  compact?: boolean;
}

const PlanetaryHoursDisplay: React.FC<PlanetaryHoursDisplayProps> = ({ compact = false }) => {
  const [currentHour, setCurrentHour] = useState<CapitalizedPlanet | null>(null);
  const [allHours, setAllHours] = useState<Map<number, CapitalizedPlanet>>(new Map());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [planetaryCalculator] = useState(() => new PlanetaryHourCalculator());
  const [chakraService] = useState(() => new ChakraAlchemyService());
  const [associatedChakras, setAssociatedChakras] = useState<string[]>([]);

  useEffect(() => {
    // Initial calculation
    updatePlanetaryHours();
    
    // Update every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
      updatePlanetaryHours();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const updatePlanetaryHours = () => {
    const now = new Date();
    
    try {
      // Create a wrapper around the calculator to handle the type conversion safely
      const hourInfo = planetaryCalculator.getCurrentPlanetaryHour();
      if (hourInfo && typeof hourInfo.planet === 'string') {
        const planet = hourInfo.planet as unknown as CapitalizedPlanet;
        setCurrentHour(planet);
        
        // Get associated chakras for this planet
        const planetLowerCase = planet.toLowerCase() as AlchemyPlanet;
        const chakras = chakraService.getChakrasByPlanet(planetLowerCase);
        setAssociatedChakras(chakras.map(c => {
          const chakraInfo = chakraService.getChakraInfo(c);
          return chakraInfo.name;
        }));
      }
      
      // Get all hours and manually convert them to a new Map with the correct type
      const calculatedHours = planetaryCalculator.getDailyPlanetaryHours(now);
      const typedHours = new Map<number, CapitalizedPlanet>();
      
      calculatedHours.forEach((planet, hour) => {
        if (typeof planet === 'string') {
          typedHours.set(hour, planet as unknown as CapitalizedPlanet);
        }
      });
      
      setAllHours(typedHours);
    } catch (error) {
      console.error('Error calculating planetary hours:', error);
    }
  };
  
  const getPlanetIcon = (planet: CapitalizedPlanet) => {
    switch (planet) {
      case 'Sun': return <Sun className="h-4 w-4 text-yellow-400" />;
      case 'Moon': return <Moon className="h-4 w-4 text-blue-300" />;
      case 'Mercury': return <Star className="h-4 w-4 text-purple-400" />;
      case 'Venus': return <Star className="h-4 w-4 text-pink-400" />;
      case 'Mars': return <Star className="h-4 w-4 text-red-500" />;
      case 'Jupiter': return <Star className="h-4 w-4 text-blue-500" />;
      case 'Saturn': return <Star className="h-4 w-4 text-gray-500" />;
      default: return <Star className="h-4 w-4" />;
    }
  };
  
  const getPlanetColor = (planet: CapitalizedPlanet): string => {
    const colors: Record<CapitalizedPlanet, string> = {
      'Sun': 'text-yellow-400',
      'Moon': 'text-blue-300',
      'Mercury': 'text-purple-400',
      'Venus': 'text-pink-400',
      'Mars': 'text-red-500',
      'Jupiter': 'text-blue-500',
      'Saturn': 'text-gray-500'
    };
    return colors[planet] || 'text-white';
  };
  
  if (compact) {
    return (
      <div className="flex items-center space-x-2 bg-opacity-30 bg-purple-900 rounded-md px-3 py-1.5">
        <Clock className="h-4 w-4 text-gray-300" />
        <div className="flex items-center">
          <span className="text-sm text-gray-300">Planetary Hour:</span>
          <span className={`ml-1.5 text-sm font-medium ${currentHour ? getPlanetColor(currentHour) : ''}`}>
            {getPlanetIcon(currentHour || 'Sun')}
            <span className="ml-1">{currentHour}</span>
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-opacity-20 bg-purple-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-white">Planetary Hours</h3>
      
      <div className="mb-4 p-3 bg-opacity-30 bg-purple-900 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-300 mr-2" />
            <span className="text-gray-300">Current Planetary Hour:</span>
          </div>
          <div className={`flex items-center font-medium ${currentHour ? getPlanetColor(currentHour) : ''}`}>
            {getPlanetIcon(currentHour || 'Sun')}
            <span className="ml-1">{currentHour}</span>
          </div>
        </div>
        
        {/* Add chakra associations */}
        {associatedChakras.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">Influences Chakras:</span>
              <div className="flex flex-wrap gap-1">
                {associatedChakras.map((chakra, index) => (
                  <span key={index} className="text-xs px-2 py-0.5 bg-opacity-30 bg-purple-700 rounded-full text-purple-200">
                    {chakra}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
          const planet = allHours.get(hour);
          const isCurrentHour = new Date().getHours() === hour;
          
          return (
            <div 
              key={hour} 
              className={`flex items-center justify-between p-2 rounded-md ${
                isCurrentHour ? 'bg-opacity-50 bg-purple-700' : 'bg-opacity-20 bg-gray-800'
              }`}
            >
              <span className="text-sm text-gray-300">
                {hour.toString().padStart(2, '0')}:00 - {((hour + 1) % 24).toString().padStart(2, '0')}:00
              </span>
              {planet && (
                <div className={`flex items-center ${getPlanetColor(planet)}`}>
                  {getPlanetIcon(planet)}
                  <span className="ml-1 text-sm">{planet}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanetaryHoursDisplay; 