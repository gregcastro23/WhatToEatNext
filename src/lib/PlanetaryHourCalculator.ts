import { Planet } from '@/types/alchemy';

export class PlanetaryHourCalculator {
    // Traditional planetary hour rulerships
    private static dayRulers: Planet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    private static hourRulers: Planet[] = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'];
    
    /**
     * Calculate the planetary hour for a given date
     * @param date The date to calculate the planetary hour for
     * @returns The planet ruling the hour
     */
    calculatePlanetaryHour(date: Date): Planet {
        const hour = date.getHours();
        const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Calculate planetary hour index (0-23)
        const isDaytimeHour = hour >= 6 && hour < 18;
        const dayHourIndex = isDaytimeHour ? (hour - 6) : ((hour < 6 ? hour + 18 : hour - 18));
        
        // The first hour of the day is ruled by the day ruler
        const firstHourRuler = PlanetaryHourCalculator.dayRulers[day];
        const firstHourIndex = PlanetaryHourCalculator.hourRulers.indexOf(firstHourRuler);
        
        // Calculate the current hour's ruler
        const hourRulerIndex = (firstHourIndex + dayHourIndex) % 7;
        
        return PlanetaryHourCalculator.hourRulers[hourRulerIndex];
    }
    
    /**
     * Determine if the current time is during daylight hours
     * @param date The date to check
     * @returns True if it's daytime (6am-6pm), false otherwise
     */
    isDaytime(date: Date): boolean {
        const hour = date.getHours();
        return hour >= 6 && hour < 18;
    }
    
    /**
     * Get all planetary hours for a specific day
     * @param date The date to calculate hours for
     * @returns Map of hour (0-23) to ruling planet
     */
    getDailyPlanetaryHours(date: Date): Map<number, Planet> {
        const day = date.getDay();
        const result = new Map<number, Planet>();
        
        // The first hour of the day is ruled by the day ruler
        const firstHourRuler = PlanetaryHourCalculator.dayRulers[day];
        const firstHourIndex = PlanetaryHourCalculator.hourRulers.indexOf(firstHourRuler);
        
        // Calculate all 24 hours
        for (let hour = 0; hour < 24; hour++) {
            const hourRulerIndex = (firstHourIndex + hour) % 7;
            result.set(hour, PlanetaryHourCalculator.hourRulers[hourRulerIndex]);
        }
        
        return result;
    }
} 