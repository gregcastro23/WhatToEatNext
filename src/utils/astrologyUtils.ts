import type { LunarPhase, ZodiacSign, AstrologicalState } from '@/types/alchemy';

export const astrologyUtils = {
  calculateLunarPhase(date: Date = new Date()): LunarPhase {
    // Lunar phase calculation
    const LUNAR_MONTH = 29.530588853; // days
    const KNOWN_NEW_MOON = new Date('2000-01-06').getTime(); // Known new moon date
    
    const daysSinceNewMoon = (date.getTime() - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
    const phase = (daysSinceNewMoon % LUNAR_MONTH) / LUNAR_MONTH;

    if (phase < 0.0625) return 'new_moon';
    if (phase < 0.1875) return 'waxing_crescent';
    if (phase < 0.3125) return 'first_quarter';
    if (phase < 0.4375) return 'waxing_gibbous';
    if (phase < 0.5625) return 'full_moon';
    if (phase < 0.6875) return 'waning_gibbous';
    if (phase < 0.8125) return 'last_quarter';
    return 'waning_crescent';
  },

  calculateSunSign(date: Date = new Date()): ZodiacSign {
    const day = date.getDate();
    const month = date.getMonth() + 1;

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
    return 'pisces';
  },

  getCurrentAstrologicalState(): AstrologicalState {
    const now = new Date();
    return {
      lunarPhase: this.calculateLunarPhase(now),
      sunSign: this.calculateSunSign(now),
      // Note: Moon sign calculation would require an ephemeris or API
      // For now, we'll use the sun sign as a placeholder
      moonSign: this.calculateSunSign(now)
    };
  },

  getElementalInfluence(astroState: AstrologicalState) {
    // Calculate combined elemental influence of current astrological state
    // This could be used to modify recipes or suggestions
    return {
      lunarPhaseStrength: 0.4,
      sunSignStrength: 0.4,
      moonSignStrength: 0.2
    };
  }
};

export default astrologyUtils;