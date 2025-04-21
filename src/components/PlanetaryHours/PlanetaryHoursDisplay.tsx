'use client';

import React, { useState, useEffect } from 'react';
import { PlanetaryHourCalculator } from '../../lib/PlanetaryHourCalculator';
import { ChakraAlchemyService } from '../../lib/ChakraAlchemyService';
import { Clock, sun, Moon, Star, Calendar, Timer, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  planetElementMap, 
  planetPropertyMap 
} from '../../constants/alchemicalEnergyMapping';
import { 
  ENERGY_STATE_CHAKRA_MAPPING, 
  normalizeChakraKey, 
  getChakraDisplayName 
} from '../../constants/chakraSymbols';
import { PlanetName, Planet } from '../../types/alchemy';

// Type guard for checking if a string is a valid planet name
function isValidPlanetName(value: unknown): value is PlanetName {
  if (typeof value !== 'string') return false;
  return ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(value.toLowerCase());
}

// Helper function to normalize planet name to lowercase
function normalizePlanetName(planet: string): PlanetName | null {
  const normalized = planet.toLowerCase();
  return isValidPlanetName(normalized) ? normalized : null;
}

// Helper function to convert a planet name to a Planet object
function createPlanetObject(planetName: PlanetName): Planet {
  return {
    name: planetName,
    influence: 1.0 // Default influence value
  };
}

interface PlanetaryHoursDisplayProps {
  compact?: boolean;
}

const PlanetaryHoursDisplay: React.FC<PlanetaryHoursDisplayProps> = ({ compact = false }) => {
  const [currentHour, setCurrentHour] = useState<PlanetName | null>(null);
  const [currentDay, setCurrentDay] = useState<PlanetName | null>(null);
  const [currentMinute, setCurrentMinute] = useState<PlanetName | null>(null);
  const [allHours, setAllHours] = useState<Map<number, PlanetName>>(new Map());
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
        const planetName = normalizePlanetName(hourInfo.planet);
        if (planetName) {
          setCurrentHour(planetName);
          
          // Get associated chakras from the planet's alchemical property
          const property = planetPropertyMap(isDay)[planetName];
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
            const chakras = chakraService.getChakrasByPlanet(createPlanetObject(planetName));
            setAssociatedChakras(chakras.map(c => {
              const chakraInfo = chakraService.getChakraInfo(c);
              return chakraInfo.name;
            }));
          }
        }
      }
      
      // Get current planetary day
      const dayPlanet = planetaryCalculator.getCurrentPlanetaryDay();
      if (typeof dayPlanet === 'string') {
        const planetName = normalizePlanetName(dayPlanet);
        if (planetName) {
          setCurrentDay(planetName);
        }
      }
      
      // Get current planetary minute
      const minutePlanet = planetaryCalculator.getCurrentPlanetaryMinute();
      if (typeof minutePlanet === 'string') {
        const planetName = normalizePlanetName(minutePlanet);
        if (planetName) {
          setCurrentMinute(planetName);
        }
      }
      
      // Get all hours and safely convert them to a new Map with the correct type
      const calculatedHours = planetaryCalculator.getDailyPlanetaryHours(now);
      const typedHours = new Map<number, PlanetName>();
      
      calculatedHours.forEach((planet, hour) => {
        if (typeof planet === 'string') {
          const planetName = normalizePlanetName(planet);
          if (planetName) {
            typedHours.set(hour, planetName);
          }
        }
      });
      
      setAllHours(typedHours);
    } catch (error) {
      console.error('Error calculating planetary information:', error);
    }
  };
  
  const getPlanetIcon = (planet: PlanetName) => {
    switch (planet) {
      case 'sun': return <sun className="h-4 w-4 text-yellow-400" />;
      case 'moon': return <Moon className="h-4 w-4 text-blue-300" />;
      case 'mercury': return <Star className="h-4 w-4 text-purple-400" />;
      case 'venus': return <Star className="h-4 w-4 text-pink-400" />;
      case 'mars': return <Star className="h-4 w-4 text-red-500" />;
      case 'jupiter': return <Star className="h-4 w-4 text-blue-500" />;
      case 'saturn': return <Star className="h-4 w-4 text-gray-500" />;
      default: return <Star className="h-4 w-4" />;
    }
  };
  
  const getPlanetColor = (planet: PlanetName): string => {
    const colors: Record<PlanetName, string> = {
      'sun': 'text-yellow-400',
      'moon': 'text-blue-300',
      'mercury': 'text-purple-400',
      'venus': 'text-pink-400',
      'mars': 'text-red-500',
      'jupiter': 'text-blue-500',
      'saturn': 'text-gray-500',
      'uranus': 'text-teal-400',
      'neptune': 'text-indigo-400',
      'pluto': 'text-gray-600'
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
                {currentHour ? getPlanetIcon(currentHour) : <Star className="h-4 w-4" />}
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