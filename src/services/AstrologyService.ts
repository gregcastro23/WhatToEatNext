import { PlanetaryAlignment , AstrologicalState , CelestialPosition } from "@/types/celestial";
import { getCurrentPlanetaryPositions, getPlanetaryPositionsForDateTime } from '@/services/astrologizeApi';
import { 




  PlanetaryAlignment, 
  CelestialPosition, 
  ZodiacSign, 
  Planet, 
  LunarPhase,
  AstrologicalState
} from '../types';

// Define and export the DEFAULT_PLANETARY_ALIGNMENT constant
export const DEFAULT_PLANETARY_ALIGNMENT: PlanetaryAlignment = {
  sun: { sign: 'aries', degree: 0 },
  moon: { sign: 'taurus', degree: 0 },
  mercury: { sign: 'gemini', degree: 0 },
  venus: { sign: 'libra', degree: 0 },
  mars: { sign: 'aries', degree: 0 },
  jupiter: { sign: 'sagittarius', degree: 0 },
  saturn: { sign: 'capricorn', degree: 0 },
  uranus: { sign: 'aquarius', degree: 0 },
  neptune: { sign: 'pisces', degree: 0 },
  pluto: { sign: 'scorpio', degree: 0 }
};

/**
 * AstrologyService
 * 
 * Core service for astrological calculations and planetary positions.
 * This service consolidates all astrology-related functionality into a single, 
 * standardized interface following a consistent singleton pattern.
 */
export class AstrologyService {
  private static instance: AstrologyService;
  
  private currentState: AstrologicalState = {
    currentZodiac: 'aries',
    moonPhase: 'new moon',
    currentPlanetaryAlignment: DEFAULT_PLANETARY_ALIGNMENT,
    loading: false,
    isReady: false
  };

  private constructor() {}

  /**
   * Get the singleton instance of AstrologyService
   */
  public static getInstance(): AstrologyService {
    if (!AstrologyService.instance) {
      AstrologyService.instance = new AstrologyService();
    }
    return AstrologyService.instance;
  }

  /**
   * Get current planetary positions
   */
  async getCurrentPlanetaryPositions(forceRefresh = false): Promise<Record<Planet, CelestialPosition>> {
    try {
      // Use astrologize API for real planetary positions
      const positions = await getCurrentPlanetaryPositions();
      
      // Convert to CelestialPosition format
      const celestialPositions: Record<Planet, CelestialPosition> = {};
      
      Object.entries(positions).forEach(([planet, position]) => {
        celestialPositions[planet as Planet] = {
          sign: position.sign,
          degree: position.degree
        };
      });
      
      // Update cached state
      this.currentState.currentPlanetaryAlignment = celestialPositions;
      this.currentState.isReady = true;
      
      return celestialPositions;
    } catch (error) {
      console.warn('Astrologize API failed, using cached data:', error);
      if (forceRefresh || !this.currentState.isReady) {
        await this.refreshAstrologicalState();
      }
      return this.currentState.currentPlanetaryAlignment;
    }
  }

  /**
   * Get the current astrological state including all relevant data
   */
  async getAstrologicalState(forceRefresh = false): Promise<AstrologicalState> {
    if (forceRefresh || !this.currentState.isReady) {
      await this.refreshAstrologicalState();
    }
    return { ...this.currentState };
  }

  /**
   * Get the current lunar phase
   */
  async getLunarPhase(forceRefresh = false): Promise<LunarPhase> {
    if (forceRefresh || !this.currentState.isReady) {
      await this.refreshAstrologicalState();
    }
    return this.currentState.moonPhase;
  }

  /**
   * Get the current zodiac sign (Sun sign)
   */
  async getCurrentZodiacSign(forceRefresh = false): Promise<ZodiacSign> {
    if (forceRefresh || !this.currentState.isReady) {
      await this.refreshAstrologicalState();
    }
    return this.currentState.currentZodiac;
  }

  /**
   * Check if it's currently daytime
   */
  async isDaytime(forceRefresh = false): Promise<boolean> {
    if (forceRefresh || !this.currentState.isReady) {
      await this.refreshAstrologicalState();
    }
    return this.currentState.isDaytime || false;
  }

  /**
   * Get the current planetary hour ruler
   */
  async getPlanetaryHour(forceRefresh = false): Promise<Planet | undefined> {
    if (forceRefresh || !this.currentState.isReady) {
      await this.refreshAstrologicalState();
    }
    return this.currentState.planetaryHour;
  }

  /**
   * Refresh the current astrological state
   */
  private async refreshAstrologicalState(): Promise<void> {
    this.currentState.loading = true;
    
    try {
      const currentDate = new Date();
      
      // Try to get real planetary positions from astrologize API
      let planetaryAlignment: PlanetaryAlignment;
      try {
        const positions = await getCurrentPlanetaryPositions();
        
        // Convert to our format
        planetaryAlignment = {};
        Object.entries(positions).forEach(([planet, position]) => {
          planetaryAlignment[planet as Planet] = {
            sign: position.sign,
            degree: position.degree
          };
        });
        
        console.log('🌟 Using real astrologize API data for astrological state');
      } catch (apiError) {
        console.warn('Astrologize API failed, using fallback calculations:', apiError);
        planetaryAlignment = this.calculatePlanetaryPositions(currentDate);
      }
      
      const state: AstrologicalState = {
        currentZodiac: this.calculateZodiacSign(currentDate),
        moonPhase: this.calculateLunarPhase(currentDate),
        currentPlanetaryAlignment: planetaryAlignment,
        isDaytime: this.calculateIsDaytime(currentDate),
        planetaryHour: this.calculatePlanetaryHour(currentDate),
        loading: false,
        isReady: true,
        sunSign: 'aries'
      };
      
      this.currentState = state;
    } catch (error) {
      console.error("Failed to refresh astrological state", error);
    } finally {
      this.currentState.loading = false;
      this.currentState.isReady = true;
    }
  }

  // Mock calculation methods - these would contain real implementations in practice
  private calculateZodiacSign(date: Date): ZodiacSign {
    const month = date.getMonth();
    const day = date.getDate();
    
    // Very simplified calculation
    if ((month === 2 && day >= 21) || (month === 3 && day <= 19)) return 'aries';
    if ((month === 3 && day >= 20) || (month === 4 && day <= 20)) return 'taurus';
    if ((month === 4 && day >= 21) || (month === 5 && day <= 20)) return 'gemini';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 22)) return 'cancer';
    if ((month === 6 && day >= 23) || (month === 7 && day <= 22)) return 'leo';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'virgo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'libra';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 21)) return 'scorpio';
    if ((month === 10 && day >= 22) || (month === 11 && day <= 21)) return 'sagittarius';
    if ((month === 11 && day >= 22) || (month === 0 && day <= 19)) return 'capricorn';
    if ((month === 0 && day >= 20) || (month === 1 && day <= 18)) return 'aquarius';
    return 'pisces';
  }

  private calculateLunarPhase(date: Date): LunarPhase {
    // Very simplified calculation - in real implementation this would be more accurate
    const dayOfMonth = date.getDate();
    
    if (dayOfMonth <= 3) return 'new moon';
    if (dayOfMonth <= 7) return 'waxing crescent';
    if (dayOfMonth <= 10) return 'first quarter';
    if (dayOfMonth <= 14) return 'waxing gibbous';
    if (dayOfMonth <= 17) return 'full moon';
    if (dayOfMonth <= 21) return 'waning gibbous';
    if (dayOfMonth <= 24) return 'last quarter';
    return 'waning crescent';
  }

  private calculatePlanetaryPositions(date: Date): PlanetaryAlignment {
    // This would contain complex astronomical calculations in a real implementation
    // For now, return default positions
    return DEFAULT_PLANETARY_ALIGNMENT;
  }

  private calculateIsDaytime(date: Date): boolean {
    const hours = date.getHours();
    return hours >= 6 && hours < 18;
  }

  private calculatePlanetaryHour(date: Date): Planet {
    // Simplified calculation
    const dayOfWeek = date.getDay();
    const hour = date.getHours() % 12;
    
    // Planetary day rulers
    const dayRulers: Planet[] = [
      'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'
    ];
    
    // Planet order for hours
    const hourRulers: Planet[] = [
      'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'
    ];
    
    // Simplified calculation
    const planetOfDay = dayRulers[dayOfWeek];
    const hourIndex = (hourRulers.indexOf(planetOfDay) + hour) % 7;
    
    return hourRulers[hourIndex];
  }
}

// Export a singleton instance for use across the application
export const astrologyService = AstrologyService.getInstance();

// Export default for compatibility with existing code
export default astrologyService; 