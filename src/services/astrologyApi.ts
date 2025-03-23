import { elementalUtils } from '@/utils/elementalUtils';
import { AstrologicalService } from '@/services/AstrologicalService';
import { calculatePlanetaryPositions, calculateSunSign, calculateLunarPhase } from '@/utils/astrologyUtils';

type CelestialPosition = {
    sunSign: string;
    moonPhase: string;
    planetaryPositions: {
        sun: { sign: string; degree: number; minutes: number };
        moon: { sign: string; degree: number; minutes: number };
        mercury: { sign: string; degree: number; minutes: number };
        venus: { sign: string; degree: number; minutes: number };
        mars: { sign: string; degree: number; minutes: number };
        jupiter: { sign: string; degree: number; minutes: number };
        saturn: { sign: string; degree: number; minutes: number };
        uranus: { sign: string; degree: number; minutes: number };
        neptune: { sign: string; degree: number; minutes: number };
        pluto: { sign: string; degree: number; minutes: number };
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
        const lunarPhase = calculateLunarPhase(date);
        
        // Map positions to planetary alignment structure
        const planetaryPositions: Record<string, any> = {};
        Object.entries(positions).forEach(([planet, degree]) => {
            const sign = getSignFromDegree(degree);
            planetaryPositions[planet.toLowerCase()] = {
                sign: sign.toLowerCase(),
                degree: degree % 30,
                element: getZodiacElement(sign)
            };
        });
        
        return {
            sunSign: sunSign,
            moonPhase: lunarPhase,
            planetaryPositions: planetaryPositions,
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
        const astroState = await AstrologicalService.getStateForDate(currentDate);
        
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
        const fallbackState = AstrologicalService.getStateForDate(date);
        
        return {
            sunSign: fallbackState.currentZodiac,
            moonPhase: fallbackState.moonPhase,
            planetaryPositions: fallbackState.currentPlanetaryAlignment,
            time: {
                hours: date.getHours(),
                minutes: date.getMinutes()
            },
            timestamp: timestamp
        };
    } catch (error) {
        console.error('Error getting fallback positions:', error);
        
        // Ultimate fallback - use static calculations
        const j2000 = new Date('2000-01-01T12:00:00Z').getTime();
        const daysSince = (timestamp - j2000) / (1000 * 3600 * 24);
        
        return {
            sunSign: calculateSunSign(date),
            moonPhase: 'full', // Default fallback
            planetaryPositions: {
                sun: AstrologicalService.getStaticPlanetPosition('sun'),
                moon: AstrologicalService.getStaticPlanetPosition('moon'),
                mercury: AstrologicalService.getStaticPlanetPosition('mercury'),
                venus: AstrologicalService.getStaticPlanetPosition('venus'),
                mars: AstrologicalService.getStaticPlanetPosition('mars'),
                jupiter: AstrologicalService.getStaticPlanetPosition('jupiter'),
                saturn: AstrologicalService.getStaticPlanetPosition('saturn'),
                uranus: AstrologicalService.getStaticPlanetPosition('uranus'),
                neptune: AstrologicalService.getStaticPlanetPosition('neptune'),
                pluto: AstrologicalService.getStaticPlanetPosition('pluto')
            },
            time: {
                hours: date.getHours(),
                minutes: date.getMinutes()
            },
            timestamp: timestamp
        };
    }
};

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

export const getElementalInfluence = (): typeof elementalUtils.DEFAULT_ELEMENTAL_PROPERTIES => {
    // Use the zodiac to element mapping from AstrologicalService if available
    try {
        const astroState = AstrologicalService.getCurrentState();
        if (astroState) {
            const sunElement = AstrologicalService.mapZodiacToElement(astroState.currentZodiac);
            const moonElement = AstrologicalService.mapZodiacToElement(astroState.currentPlanetaryAlignment.moon.sign);
            
            // Create a weighted influence based on sun and moon positions
            return {
                Fire: sunElement === 'Fire' ? 0.6 : (moonElement === 'Fire' ? 0.3 : 0.1),
                Water: sunElement === 'Water' ? 0.6 : (moonElement === 'Water' ? 0.3 : 0.1),
                Earth: sunElement === 'Earth' ? 0.6 : (moonElement === 'Earth' ? 0.3 : 0.1),
                Air: sunElement === 'Air' ? 0.6 : (moonElement === 'Air' ? 0.3 : 0.1)
            };
        }
    } catch (error) {
        console.error('Error getting elemental influence:', error);
    }
    
    // Fallback to default
    return elementalUtils.DEFAULT_ELEMENTAL_PROPERTIES;
};

// Helper function to get sign from degree
function getSignFromDegree(degree: number): string {
    const signs = [
        'Aries', 'Taurus', 'Gemini', 'Cancer', 
        'Leo', 'Virgo', 'Libra', 'Scorpio',
        'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
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
