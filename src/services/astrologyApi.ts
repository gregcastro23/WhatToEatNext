import { elementalUtils } from '@/utils/elementalUtils';

type CelestialPosition = {
    sunSign: string;
    moonPhase: string;
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

const getCachedCelestialPositions = async (): Promise<CelestialPosition> => {
    const now = Date.now();

    // Return cached data if valid
    if (cachedPositions && now - cachedPositions.timestamp < CACHE_DURATION) {
        return cachedPositions;
    }

    try {
        const response = await fetch('https://api.astrology.com/positions');
        const data = await response.json();
        
        cachedPositions = {
            sunSign: data.sunSign,
            moonPhase: data.moonPhase,
            time: {
                hours: new Date().getHours(),
                minutes: new Date().getMinutes()
            },
            timestamp: now
        };

        return cachedPositions;
    } catch (error) {
        return getFallbackPositions();
    }
};

const getFallbackPositions = (): CelestialPosition => {
    const now = Date.now();
    const currentDate = new Date();
    
    return {
        sunSign: 'Aries', // Default
        moonPhase: 'Full', // Default
        time: {
            hours: currentDate.getHours(),
            minutes: currentDate.getMinutes()
        },
        timestamp: now
    };
};

export const getElementalInfluence = (): typeof elementalUtils.DEFAULT_ELEMENTAL_PROPERTIES => {
    // Simplified version for testing
    return elementalUtils.DEFAULT_ELEMENTAL_PROPERTIES;
};
