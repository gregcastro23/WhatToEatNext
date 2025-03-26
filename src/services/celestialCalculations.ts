import { logger } from '@/utils/logger';
import { cache } from '@/utils/cache';
import type { ElementalProperties } from '@/types/alchemy';

interface CelestialPosition {
  sign: string;
  degree: number;
}

interface CelestialData {
  sun: CelestialPosition;
  moon: CelestialPosition;
  elementalBalance: ElementalProperties;
  season: string;
  moonPhase: string;
}

class CelestialCalculator {
  private static instance: CelestialCalculator;
  private readonly CACHE_KEY = 'celestial_data';
  private readonly UPDATE_INTERVAL = 1000 * 60 * 5; // 5 minutes
  private lastCalculation: number = 0;

  private constructor() {
    this.initializeCalculations();
  }

  static getInstance(): CelestialCalculator {
    if (!CelestialCalculator.instance) {
      CelestialCalculator.instance = new CelestialCalculator();
    }
    return CelestialCalculator.instance;
  }

  private initializeCalculations(): void {
    setInterval(() => {
      this.calculateCurrentInfluences();
    }, this.UPDATE_INTERVAL);
  }

  calculateCurrentInfluences(): ElementalProperties {
    try {
      // Check cache first
      const cached = cache.get<CelestialData>(this.CACHE_KEY);
      if (cached && Date.now() - this.lastCalculation < this.UPDATE_INTERVAL) {
        return cached.elementalBalance;
      }

      // Get current date
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();
      const hour = now.getHours();

      // Calculate base elemental balance
      const baseBalance = this.calculateBaseBalance(month);
      
      // Adjust for time of day
      const timeBalance = this.calculateTimeBalance(hour);
      
      // Adjust for moon phase
      const moonBalance = this.calculateMoonBalance(day);

      // Combine all influences
      const elementalBalance = this.combineBalances([
        baseBalance,
        timeBalance,
        moonBalance
      ]);

      // Calculate celestial positions
      const celestialData: CelestialData = {
        sun: this.calculateSunPosition(month, day),
        moon: this.calculateMoonPosition(day),
        elementalBalance,
        season: this.getSeason(month),
        moonPhase: this.getMoonPhase(day)
      };

      // Update cache
      cache.set(this.CACHE_KEY, celestialData);
      this.lastCalculation = Date.now();

      return elementalBalance;
    } catch (error) {
      logger.error('Error calculating celestial influences:', error);
      return this.getFallbackBalance();
    }
  }

  private calculateBaseBalance(month: number): ElementalProperties {
    // Seasonal base influences
    const seasons = [
      { Fire: 0.2, Earth: 0.3, Air: 0.2, Water: 0.3 }, // Winter
      { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 }, // Spring
      { Fire: 0.4, Earth: 0.2, Air: 0.2, Water: 0.2 }, // Summer
      { Fire: 0.2, Earth: 0.4, Air: 0.2, Water: 0.2 }  // Fall
    ];
    
    const seasonIndex = Math.floor(month / 3) % 4;
    return seasons[seasonIndex];
  }

  private calculateTimeBalance(hour: number): ElementalProperties {
    // Daily cycle influences
    if (hour >= 5 && hour < 12) {
      return { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 }; // Morning
    } else if (hour >= 12 && hour < 17) {
      return { Fire: 0.4, Earth: 0.2, Air: 0.2, Water: 0.2 }; // Afternoon
    } else if (hour >= 17 && hour < 22) {
      return { Fire: 0.2, Earth: 0.3, Air: 0.2, Water: 0.3 }; // Evening
    } else {
      return { Fire: 0.1, Earth: 0.2, Air: 0.3, Water: 0.4 }; // Night
    }
  }

  private calculateMoonBalance(day: number): ElementalProperties {
    // Moon phase influences (simplified)
    const phase = day % 30;
    if (phase < 7) {
      return { Fire: 0.2, Earth: 0.2, Air: 0.3, Water: 0.3 }; // New Moon
    } else if (phase < 15) {
      return { Fire: 0.3, Earth: 0.2, Air: 0.3, Water: 0.2 }; // Waxing
    } else if (phase < 22) {
      return { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 }; // Full Moon
    } else {
      return { Fire: 0.2, Earth: 0.3, Air: 0.2, Water: 0.3 }; // Waning
    }
  }

  private combineBalances(balances: ElementalProperties[]): ElementalProperties {
    const combined = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    const elements = ['Fire', 'Earth', 'Air', 'Water'] as const;
    
    elements.forEach(element => {
      combined[element] = balances.reduce((sum, balance) => 
        sum + (balance[element] || 0), 0) / balances.length;
    });

    return combined;
  }

  private calculateSunPosition(month: number, day: number): CelestialPosition {
    const signs = [
      'Capricorn', 'Aquarius', 'Pisces', 'Aries', 
      'Taurus', 'Gemini', 'Cancer', 'Leo', 
      'Virgo', 'Libra', 'Scorpio', 'Sagittarius'
    ];
    
    const signIndex = (month + Math.floor(day / 30)) % 12;
    const degree = (day % 30) * (30 / 31);

    return {
      sign: signs[signIndex],
      degree
    };
  }

  private calculateMoonPosition(day: number): CelestialPosition {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 
      'Leo', 'Virgo', 'Libra', 'Scorpio', 
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const signIndex = day % 12;
    const degree = (day % 30) * (30 / 31);

    return {
      sign: signs[signIndex],
      degree
    };
  }

  private getSeason(month: number): string {
    const seasons = ['winter', 'spring', 'summer', 'fall'];
    return seasons[Math.floor(month / 3) % 4];
  }

  private getMoonPhase(day: number): string {
    const phases = ['new', 'waxing', 'full', 'waning'];
    return phases[Math.floor((day % 28) / 7)];
  }

  private getFallbackBalance(): ElementalProperties {
    return {
      Fire: 0.25,
      Earth: 0.25,
      Air: 0.25,
      Water: 0.25
    };
  }

  // Public API for testing
  getCurrentData(): CelestialData | null {
    return cache.get(this.CACHE_KEY);
  }
}

export const celestialCalculator = CelestialCalculator.getInstance(); 