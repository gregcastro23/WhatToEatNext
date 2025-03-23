import { useState, useEffect, useMemo } from 'react';
import { 
  AstrologicalService, 
  AstrologicalState, 
  PlanetaryAlignment, 
  MoonPhase,
  CelestialPosition 
} from '@/services/AstrologicalService';
import { LunarPhase } from '@/constants/planetaryFoodAssociations';
import type { ZodiacSign, PlanetaryAspect } from '@/types/alchemy';
import { 
  calculatePlanetaryPositions, 
  calculateSunSign, 
  calculateLunarPhase, 
  calculateMoonSign, 
  longitudeToZodiacPosition, 
  getLunarPhaseName,
  calculateAspects
} from '@/utils/astrologyUtils';

// Helper function to create a celestial position with defaults
function createCelestialPosition(sign: ZodiacSign, longOffset = 0, options?: { planetName?: string }): CelestialPosition {
  // Calculate a reasonable longitude based on the zodiac sign
  const signIndex = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio',
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ].indexOf(sign);
  
  const baseLongitude = signIndex * 30 + longOffset;
  
  // Determine default speed based on planet traits
  // Moon moves fastest, inner planets medium, outer planets slow
  const getPlanetSpeed = (planetName?: string): number => {
    if (!planetName) return 0.5; // Default
    
    const planetSpeeds: Record<string, number> = {
      moon: 13.2,
      sun: 1.0,
      mercury: 1.4,
      venus: 1.2,
      mars: 0.5,
      jupiter: 0.1,
      saturn: 0.03,
      uranus: 0.01,
      neptune: 0.005,
      pluto: 0.002
    };
    
    return planetSpeeds[planetName.toLowerCase()] || 0.5;
  };
  
  return {
    sign,
    degree: Math.floor(longOffset),
    minutes: Math.floor((longOffset % 1) * 60),
    isRetrograde: false,
    exactLongitude: baseLongitude,
    speed: getPlanetSpeed(options?.planetName)
  };
}

export function useAstrologicalState() {
  // Create initial state with proper fallback
  const initialState: AstrologicalState = {
    currentZodiac: 'leo',
    moonPhase: 'full' as MoonPhase,
    currentPlanetaryAlignment: {
      sun: createCelestialPosition('leo', 15, { planetName: 'sun' }),
      moon: createCelestialPosition('cancer', 10, { planetName: 'moon' }),
      mercury: createCelestialPosition('virgo', 5, { planetName: 'mercury' }),
      venus: createCelestialPosition('libra', 8, { planetName: 'venus' }),
      mars: createCelestialPosition('aries', 12, { planetName: 'mars' }),
      jupiter: createCelestialPosition('sagittarius', 18, { planetName: 'jupiter' }),
      saturn: createCelestialPosition('capricorn', 20, { planetName: 'saturn' }),
      uranus: createCelestialPosition('aquarius', 5, { planetName: 'uranus' }),
      neptune: createCelestialPosition('pisces', 10, { planetName: 'neptune' }),
      pluto: createCelestialPosition('scorpio', 15, { planetName: 'pluto' })
    },
    activePlanets: ['sun', 'moon']
  };

  const [astroState, setAstroState] = useState<AstrologicalState>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDaytime, setIsDaytime] = useState(true);
  const [lunarPhase, setLunarPhase] = useState<LunarPhase | null>(null);

  // Add memoization for planetary alignment data
  const [currentPlanetaryAlignment, setCurrentPlanetaryAlignment] = useState<PlanetaryAlignment>(astroState.currentPlanetaryAlignment);
  
  // Memoize the alignment data to prevent unnecessary reference changes
  const stablePlanetaryAlignment = useMemo(() => currentPlanetaryAlignment, [
    JSON.stringify(currentPlanetaryAlignment) // Deep compare the alignment data
  ]);

  const [currentZodiac, setCurrentZodiac] = useState<ZodiacSign>('aries');
  const [activePlanets, setActivePlanets] = useState<string[]>(['sun', 'moon']);
  
  // Add aspects to state
  const [aspects, setAspects] = useState<PlanetaryAspect[]>([]);

  const [calculatedPositions, setCalculatedPositions] = useState<Record<string, CelestialPosition>>({});
  const [loading, setLoading] = useState(true);
  
  // Fetch calculated positions on load
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setLoading(true);
        const positions = await calculatePlanetaryPositions();
        
        // Format positions
        const formattedPositions: Record<string, CelestialPosition> = {};
        Object.entries(positions).forEach(([planet, position]) => {
          if (position && position.sign) {
            formattedPositions[planet.toLowerCase()] = {
              sign: position.sign as ZodiacSign,
              degree: position.degree,
              exactLongitude: position.exactLongitude,
              isRetrograde: position.isRetrograde || false
            };
          }
        });
        
        setCalculatedPositions(formattedPositions);
      } catch (error) {
        console.error('Error calculating planetary positions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPositions();
  }, []);

  // Load astrological data
  useEffect(() => {
    const loadAstrologicalData = async () => {
      try {
        setIsLoading(true);
        
        // Get current date
        const now = new Date();
        
        // Calculate current sun sign
        const sunSign = calculateSunSign(now);
        setCurrentZodiac(sunSign);
        
        // Calculate lunar phase
        const phase = calculateLunarPhase(now);
        setLunarPhase(getLunarPhaseName(phase) as LunarPhase);
        
        // Calculate if it's daytime
        const hours = now.getHours();
        setIsDaytime(hours >= 6 && hours < 18);
        
        // Calculate planetary positions using accurate astronomy
        const positions = await calculatePlanetaryPositions(now);
        
        // Convert to planetary alignment format
        const alignment: PlanetaryAlignment = {} as PlanetaryAlignment;
        
        Object.entries(positions).forEach(([planet, position]) => {
          alignment[planet.toLowerCase()] = {
            sign: position.sign,
            degree: position.degree,
            minutes: position.minute,
            isRetrograde: false,
            exactLongitude: position.exactLongitude,
            speed: planet.toLowerCase() === 'moon' ? 13.2 : 1.0
          };
        });
        
        setCurrentPlanetaryAlignment(alignment);
        
        // Determine active planets
        const newActivePlanets = new Set(['sun', 'moon']);
        const planetRulers = {
          aries: ['mars'],
          taurus: ['venus'],
          gemini: ['mercury'],
          cancer: ['moon'],
          leo: ['sun'],
          virgo: ['mercury'],
          libra: ['venus'],
          scorpio: ['pluto', 'mars'],
          sagittarius: ['jupiter'],
          capricorn: ['saturn'],
          aquarius: ['uranus', 'saturn'],
          pisces: ['neptune', 'jupiter']
        };
        
        if (planetRulers[sunSign]) {
          planetRulers[sunSign].forEach(planet => newActivePlanets.add(planet));
        }
        
        setActivePlanets(Array.from(newActivePlanets));
        
      } catch (err) {
        console.error('Error loading astrological data:', err);
        setError('Failed to load astrological data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAstrologicalData();
  }, []);

  // Update the useEffect to calculate aspects
  useEffect(() => {
    if (currentPlanetaryAlignment) {
      const { aspects: calculatedAspects } = calculateAspects(currentPlanetaryAlignment);
      setAspects(calculatedAspects);
    }
  }, [currentPlanetaryAlignment]);

  // Update the logging useEffect
  useEffect(() => {
    console.log('Current Planetary Alignment:', JSON.stringify(currentPlanetaryAlignment));
    console.log('Active Planets:', activePlanets);
    console.log('Aspects:', aspects);
  }, [currentPlanetaryAlignment, activePlanets, aspects]);

  return {
    currentPlanetaryAlignment: stablePlanetaryAlignment,
    currentZodiac,
    activePlanets,
    aspects,
    isDaytime,
    moonPhase: astroState.moonPhase,
    lunarPhase,
    isLoading,
    error,
    calculatedPositions,
    loading
  };
} 