import type { ElementalProperties, CookingMethod } from '@/types/alchemy';

import { calculatePlanetaryPositions, calculateSunSign, calculateLunarPhase } from '../utils/astrologyUtils';
import { elementalUtils , getCurrentElementalState } from '../utils/elementalUtils';

import { AstrologicalService , getLatestAstrologicalState } from './AstrologicalService';

type CelestialPosition = {
    sunSign: string;
    moonPhase: string;
    planetaryPositions: {
        sun: { sign: string; degree: number; minutes: number; isRetrograde?: boolean };
        moon: { sign: string; degree: number; minutes: number; isRetrograde?: boolean };
        mercury: { sign: string; degree: number; minutes: number; isRetrograde?: boolean };
        venus: { sign: string; degree: number; minutes: number; isRetrograde?: boolean };
        mars: { sign: string; degree: number; minutes: number; isRetrograde?: boolean };
        jupiter: { sign: string; degree: number; minutes: number; isRetrograde?: boolean };
        saturn: { sign: string; degree: number; minutes: number; isRetrograde?: boolean };
        uranus: { sign: string; degree: number; minutes: number; isRetrograde?: boolean };
        neptune: { sign: string; degree: number; minutes: number; isRetrograde?: boolean };
        pluto: { sign: string; degree: number; minutes: number; isRetrograde?: boolean };
    };
    time: {
        hours: number;
        minutes: number;
    };
    timestamp: number;
};

let cachedPositions: CelestialPosition | null = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

export const getCurrentCelestialPositions = async (): Promise<CelestialPosition> => {
    try {
        return await getCachedCelestialPositions();
    } catch (error) {
        console.error('Error fetching celestial positions:', error);
        return getFallbackPositions();
    }
};

// Add a new function to get positions for a specific date
export const getCelestialPositionsForDate = async (date: Date): Promise<CelestialPosition> => {
    try {
        // Use our local calculation functions
        const positions = await calculatePlanetaryPositions(date);
        const sunSign = calculateSunSign(date);
        const lunarPhase = await calculateLunarPhase(date);
        
        // Map positions to planetary alignment structure
        const planetaryPositions: Record<string, unknown> = {};
        Object.entries(positions).forEach(([planet, position]) => {
            // Handle numeric positions
            const degreeValue = typeof position === 'number' 
                ? position 
                : ((position as unknown) as Record<string, unknown>)?.degree as number || 0;
                
            const sign = getSignFromDegree(degreeValue);
            planetaryPositions[planet.toLowerCase()] = {
                sign: sign.toLowerCase(),
                degree: degreeValue % 30,
                element: getZodiacElement(sign)
            };
        });
        
        return {
            sunSign: sunSign,
            moonPhase: lunarPhase.toString(),
            planetaryPositions: planetaryPositions as CelestialPosition['planetaryPositions'],
            time: {
                hours: date.getHours(),
                minutes: date.getMinutes()
            },
            timestamp: date.getTime()
        };
    } catch (error) {
        console.error('Error calculating positions for date:', error);
        return getFallbackPositions(date);
    }
};

const getCachedCelestialPositions = async (): Promise<CelestialPosition> => {
    const now = Date.now();

    // Return cached data if valid
    if (cachedPositions && now - cachedPositions.timestamp < CACHE_DURATION) {
        return cachedPositions;
    }

    try {
        // Use AstrologicalService to get accurate positions for current date
        const currentDate = new Date();
        // Apply safe type casting for service method access
        const astroService = AstrologicalService as unknown as any;
        const astroState = await (astroService?.getStateForDate ? 
            astroService.getStateForDate(currentDate) : 
            astroService.getCurrentState?.(currentDate));
        
        // Map the data to our format
        cachedPositions = {
            sunSign: astroState.currentZodiac,
            moonPhase: astroState.moonPhase,
            planetaryPositions: astroState.currentPlanetaryAlignment,
            time: {
                hours: currentDate.getHours(),
                minutes: currentDate.getMinutes()
            },
            timestamp: now
        };

        return cachedPositions;
    } catch (error) {
        console.error('Error calling AstrologicalService:', error);
        return getFallbackPositions();
    }
};

const getFallbackPositions = (date: Date = new Date()): CelestialPosition => {
    const timestamp = date.getTime();
    
    // Get fallback data from AstrologicalService for the specified date
    try {
        // Apply safe type casting for service method access
        const astroService = AstrologicalService as unknown as any;
        const fallbackStatePromise = astroService?.getStateForDate ? 
            astroService.getStateForDate(date) : 
            astroService.getCurrentState?.(date);
        
        // Since we can't await here (not an async function), we'll use a static fallback
        return {
            sunSign: getSunSignFromDate(date),
            moonPhase: 'full', // Default fallback
            planetaryPositions: getStaticPlanetaryPositions(),
            time: {
                hours: date.getHours(),
                minutes: date.getMinutes()
            },
            timestamp: timestamp
        };
    } catch (error) {
        console.error('Error getting fallback positions:', error);
        
        // Ultimate fallback - use static calculations
        return {
            sunSign: calculateSunSign(date),
            moonPhase: 'full', // Default fallback
            planetaryPositions: getStaticPlanetaryPositions(),
            time: {
                hours: date.getHours(),
                minutes: date.getMinutes()
            },
            timestamp: timestamp
        };
    }
};

// Helper function to get static planetary positions
function getStaticPlanetaryPositions(): CelestialPosition['planetaryPositions'] {
    return {
        sun: { sign: 'aries', degree: 14, minutes: 37 },
        moon: { sign: 'cancer', degree: 2, minutes: 40 },
        mercury: { sign: 'pisces', degree: 27, minutes: 19, isRetrograde: true },
        venus: { sign: 'pisces', degree: 26, minutes: 13, isRetrograde: true },
        mars: { sign: 'cancer', degree: 24, minutes: 39 },
        jupiter: { sign: 'gemini', degree: 16, minutes: 28 },
        saturn: { sign: 'pisces', degree: 24, minutes: 51 },
        uranus: { sign: 'taurus', degree: 24, minutes: 54 },
        neptune: { sign: 'aries', degree: 0, minutes: 10 },
        pluto: { sign: 'aquarius', degree: 3, minutes: 36 }
    };
}

// Helper function to calculate sun sign from date
function getSunSignFromDate(date: Date): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
    return 'capricorn';
}

export const getElementalInfluence = async (): Promise<ElementalProperties> => {
    // Use the zodiac to element mapping if available
    try {
        // Apply safe type casting for service method access
        const astroService = AstrologicalService as unknown as any;
        const astroState = await (astroService?.getCurrentState ? 
            astroService.getCurrentState() : 
            astroService.getStateForDate?.(new Date()));
        if (astroState) {
            // First check if elementalState is already calculated in the astrological state
            if (astroState.elementalState) {
                return astroState.elementalState;
            }
            
            // If we have planetary alignment data, use full calculation
            if (astroState.currentPlanetaryAlignment && 
                Object.keys(astroState.currentPlanetaryAlignment).length > 0) {
                return calculateElementalBalanceFromPositions(astroState.currentPlanetaryAlignment);
            }
            
            // Fall back to basic calculation with zodiac sign and moon
            const sunElement = getElementFromZodiac(astroState.currentZodiac);
            const moonElement = getElementFromZodiac(
                astroState.currentPlanetaryAlignment?.moon?.sign || 'cancer'
            );
            
            // Get elements from other planets for a more balanced calculation
            const mercuryElement = getElementFromZodiac(
                astroState.currentPlanetaryAlignment?.mercury?.sign || 'gemini'
            );
            const venusElement = getElementFromZodiac(
                astroState.currentPlanetaryAlignment?.venus?.sign || 'taurus'
            );
            const marsElement = getElementFromZodiac(
                astroState.currentPlanetaryAlignment?.mars?.sign || 'aries'
            );
            
            // Create a weighted influence based on planetary positions
            // Sun and Moon have more influence (0.3 each), other planets contribute the rest (0.1 each)
            const elementalState = {
                Fire: 0,
                Water: 0,
                Earth: 0,
                Air: 0
            };
            
            // Add Sun influence (30%)
            elementalState[sunElement] += 0.3;
            
            // Add Moon influence (30%)
            elementalState[moonElement] += 0.3;
            
            // Add Mercury influence (15%)
            elementalState[mercuryElement] += 0.15;
            
            // Add Venus influence (15%)
            elementalState[venusElement] += 0.15;
            
            // Add Mars influence (10%)
            elementalState[marsElement] += 0.1;
            
            return elementalState;
        }
    } catch (error) {
        console.error('Error getting elemental influence:', error);
    }
    
    // Fallback to default
    return getCurrentElementalState();
};

// Helper function to get element from zodiac sign
function getElementFromZodiac(sign: string): string {
    const fireSign = ['aries', 'leo', 'sagittarius'];
    const earthSigns = ['taurus', 'virgo', 'capricorn'];
    const airSigns = ['gemini', 'libra', 'aquarius'];
    const waterSigns = ['cancer', 'scorpio', 'pisces'];
    
    const normalizedSign = sign.toLowerCase();
    
    if (fireSign.includes(normalizedSign)) return 'Fire';
    if (earthSigns.includes(normalizedSign)) return 'Earth';
    if (airSigns.includes(normalizedSign)) return 'Air';
    if (waterSigns.includes(normalizedSign)) return 'Water';
    
    return 'Fire'; // Default fallback
}

// Helper function to get sign from degree
function getSignFromDegree(degree: number): string {
    const signs = [
        'aries', 'taurus', 'gemini', 'cancer', 
        'leo', 'virgo', 'Libra', 'Scorpio',
        'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];
    const signIndex = Math.floor(degree / 30) % 12;
    return signs[signIndex];
}

// Helper function to get zodiac element
function getZodiacElement(sign: string): string {
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    const elementIndex = Math.floor(elements.indexOf(sign) / 2);
    return elements[elementIndex];
}

// New function to calculate elemental balance based on all available planetary positions
export function calculateElementalBalanceFromPositions(positions: Record<string, unknown>): ElementalProperties {
    // Start with empty values
    const elementalBalance = {
        Fire: 0,
        Water: 0,
        Earth: 0,
        Air: 0
    };
    
    // Define planetary weights - some planets have more influence than others
    const planetaryWeights = {
        sun: 0.25,     // Sun and Moon are most important
        moon: 0.25,
        mercury: 0.10,  // Inner planets
        venus: 0.10,
        mars: 0.10,
        jupiter: 0.07,  // Outer planets
        saturn: 0.07,
        uranus: 0.02,   // Distant planets have less immediate influence
        neptune: 0.02,
        pluto: 0.02
    };
    
    // Calculate total influence
    let totalInfluence = 0;
    
    // Calculate elemental influence from each planet's position
    Object.entries(positions).forEach(([planet, data]) => {
        // Apply safe type casting for data property access
        const planetData = data as Record<string, unknown>;
        if (!planetData?.sign) return;
        
        const planetKey = planet.toLowerCase();
        const weight = planetaryWeights[planetKey as keyof typeof planetaryWeights] || 0.05;
        const element = getElementFromZodiac((planetData as any)?.sign as string);
        
        elementalBalance[element as keyof typeof elementalBalance] += weight;
        totalInfluence += weight;
    });
    
    // Normalize values if we have influence
    if (totalInfluence > 0) {
        Object.keys(elementalBalance).forEach(element => {
            elementalBalance[element as keyof typeof elementalBalance] /= totalInfluence;
        });
    } else {
        // If no influence, use balanced distribution
        return getCurrentElementalState();
    }
    
    return elementalBalance;
}
