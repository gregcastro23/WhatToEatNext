'use client';

import { Clock, Sun, Moon, Star, Calendar, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { 
  planetElementMap, 
  planetPropertyMap 
} from '@/constants/alchemicalEnergyMapping';
import { 
  ENERGY_STATE_CHAKRA_MAPPING, 
  normalizeChakraKey, 
  getChakraDisplayName 
} from '@/constants/chakraSymbols';
import { ChakraAlchemyService } from '@/lib/ChakraAlchemyService';
import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator';
import { Planet as AlchemyPlanet } from '@/types/alchemy';

// Define a type for capitalized planet names as used in PlanetaryHourCalculator
type CapitalizedPlanet = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';

// Type guard for checking if a string is a valid CapitalizedPlanet
function isCapitalizedPlanet(value: unknown): value is CapitalizedPlanet {
  return typeof value === 'string' && 
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(value);
}

// Type guard for checking if a string is a valid planet name
function isValidPlanetName(value: string): boolean {
  return ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 
         'uranus', 'neptune', 'pluto'].includes(value.toLowerCase());
}

// Function to capitalize a planet name
function capitalizePlanet(planet: string): CapitalizedPlanet | null {
  const capitalizedPlanet = planet.charAt(0).toUpperCase() + planet.slice(1).toLowerCase();
  return isCapitalizedPlanet(capitalizedPlanet) ? capitalizedPlanet : null;
}

interface PlanetaryHoursDisplayProps {
  compact?: boolean;
}

const PlanetaryHoursDisplay: React.FC<PlanetaryHoursDisplayProps> = ({ compact = false }) => {
  const [currentHour, setCurrentHour] = useState<CapitalizedPlanet | null>(null);
  const [currentDay, setCurrentDay] = useState<CapitalizedPlanet | null>(null);
  const [currentMinute, setCurrentMinute] = useState<CapitalizedPlanet | null>(null);
  const [allHours, setAllHours] = useState<Map<number, CapitalizedPlanet>>(new Map());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [planetaryCalculator] = useState(() => new PlanetaryHourCalculator());
  const [chakraService] = useState(() => new ChakraAlchemyService());
  const [associatedChakras, setAssociatedChakras] = useState<string[]>([]);
  const [alchemicalProperty, setAlchemicalProperty] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Determine if it's daytime based on the current hour (between 6am and 6pm)
  const isDaytime = () => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18;
  };

  useEffect(() => {
    // Initial calculation
    updatePlanetaryInfo();
    
    // Update every minute
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
      updatePlanetaryInfo();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const updatePlanetaryInfo = () => {
    const now = new Date();
    const isDay = isDaytime();
    
    try {
      // Get current planetary hour
      const hourInfo = planetaryCalculator.getCurrentPlanetaryHour();
      if (hourInfo && typeof hourInfo.planet === 'string') {
        // Safely check if the planet is a valid CapitalizedPlanet
        if (isCapitalizedPlanet(hourInfo.planet)) {
          setCurrentHour(hourInfo.planet);
          
          // Safely convert to AlchemyPlanet (lowercase)
          const planetLowerCase = hourInfo.planet.toLowerCase();
          if (isValidPlanetName(planetLowerCase)) {
            // Get associated chakras from the planet's alchemical property
            const property = planetPropertyMap(isDay)[planetLowerCase ];
            setAlchemicalProperty(property);
            
            // Get associated chakras from the energy state mapping
            if (property && ENERGY_STATE_CHAKRA_MAPPING[property]) {
              const associatedChakraKeys = ENERGY_STATE_CHAKRA_MAPPING[property];
              
              // Get the display names for these chakras
              const chakraNames = associatedChakraKeys.map(key => 
                getChakraDisplayName(key)
              );
              
              setAssociatedChakras(chakraNames);
            } else {
              // Fallback to the service method if no mapping is found
              const planetObject: AlchemyPlanet = {
                name: planetLowerCase as any, // PlanetName from celestial types
                influence: 1.0,
                position: undefined
              };
              const chakras = chakraService.getChakrasByPlanet(planetObject);
              setAssociatedChakras(chakras.map(c => {
                const chakraInfo = chakraService.getChakraInfo(c);
                return chakraInfo.name;
              }));
            }
          }
        }
      }
      
      // Get current planetary day
      const dayPlanet = planetaryCalculator.getCurrentPlanetaryDay();
      setCurrentDay(capitalizePlanet(dayPlanet));
      
      // Get current planetary minute
      const minutePlanet = planetaryCalculator.getCurrentPlanetaryMinute();
      setCurrentMinute(capitalizePlanet(minutePlanet));
      
      // Get all hours and safely convert them to a new Map with the correct type
      const calculatedHours = planetaryCalculator.getDailyPlanetaryHours(now);
      const typedHours = new Map<number, CapitalizedPlanet>();
      
      calculatedHours.forEach((planet, hour) => {
        if (isCapitalizedPlanet(planet)) {
          typedHours.set(hour, planet);
        }
      });
      
      setAllHours(typedHours);
    } catch (error) {
      console.error('Error calculating planetary information:', error);
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
      <div className="bg-opacity-30 bg-purple-900 rounded-md">
        <div 
          className="flex items-center justify-between px-3 py-1.5 cursor-pointer" 
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-300" />
            <div className="flex items-center">
              <span className="text-sm text-gray-300">Planetary Hour:</span>
              <span className={`ml-1.5 text-sm font-medium ${currentHour ? getPlanetColor(currentHour) : ''}`}>
                {getPlanetIcon(currentHour || 'Sun')}
                <span className="ml-1">{currentHour || 'Unknown'}</span>
              </span>
            </div>
          </div>
          {showDetails ? 
            <ChevronUp className="h-4 w-4 text-gray-300" /> : 
            <ChevronDown className="h-4 w-4 text-gray-300" />
          }
        </div>
        
        {showDetails && (
          <div className="px-3 pb-2 space-y-2 border-t border-purple-700/30">
            {/* Day info */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-300 mr-2" />
                <span className="text-sm text-gray-300">Day:</span>
              </div>
              <div className={`flex items-center ${currentDay ? getPlanetColor(currentDay) : ''}`}>
                {currentDay && getPlanetIcon(currentDay)}
                <span className="ml-1 text-sm">{currentDay || 'Unknown'}</span>
              </div>
            </div>
            
            {/* Minute info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Timer className="h-4 w-4 text-gray-300 mr-2" />
                <span className="text-sm text-gray-300">Minute:</span>
              </div>
              <div className={`flex items-center ${currentMinute ? getPlanetColor(currentMinute) : ''}`}>
                {currentMinute && getPlanetIcon(currentMinute)}
                <span className="ml-1 text-sm">{currentMinute || 'Unknown'}</span>
              </div>
            </div>
            
            {/* Alchemical property */}
            {alchemicalProperty && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Energy:</span>
                <span className="text-xs px-2 py-0.5 bg-opacity-30 bg-blue-700 rounded-full text-blue-200">
                  {alchemicalProperty}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-opacity-20 bg-purple-900 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-white">Planetary Influences</h3>
      
      <div className="space-y-2">
        {/* Day Display */}
        <div className="p-3 bg-opacity-30 bg-purple-900 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-300 mr-2" />
              <span className="text-gray-300">Planetary Day:</span>
            </div>
            <div className={`flex items-center font-medium ${currentDay ? getPlanetColor(currentDay) : ''}`}>
              {currentDay && getPlanetIcon(currentDay)}
              <span className="ml-1">{currentDay || 'Unknown'}</span>
            </div>
          </div>
        </div>
        
        {/* Hour Display */}
        <div className="p-3 bg-opacity-30 bg-purple-900 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-gray-300 mr-2" />
              <span className="text-gray-300">Planetary Hour:</span>
            </div>
            <div className={`flex items-center font-medium ${currentHour ? getPlanetColor(currentHour) : ''}`}>
              {currentHour && getPlanetIcon(currentHour)}
              <span className="ml-1">{currentHour || 'Unknown'}</span>
            </div>
          </div>
        </div>
        
        {/* Minute Display */}
        <div className="p-3 bg-opacity-30 bg-purple-900 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Timer className="h-5 w-5 text-gray-300 mr-2" />
              <span className="text-gray-300">Planetary Minute:</span>
            </div>
            <div className={`flex items-center font-medium ${currentMinute ? getPlanetColor(currentMinute) : ''}`}>
              {currentMinute && getPlanetIcon(currentMinute)}
              <span className="ml-1">{currentMinute || 'Unknown'}</span>
            </div>
          </div>
        </div>
        
        {/* Alchemical property if available */}
        {alchemicalProperty && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2">Alchemical Energy:</span>
              <span className="text-xs px-2 py-0.5 bg-opacity-30 bg-blue-700 rounded-full text-blue-200">
                {alchemicalProperty}
              </span>
            </div>
          </div>
        )}
        
        {/* Chakra associations */}
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
      
      <div className="mt-4">
        <h4 className="text-md font-semibold mb-2 text-white">Daily Hours</h4>
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
    </div>
  );
};

export default PlanetaryHoursDisplay; 