import type { ZodiacSign } from '@/types/alchemy';

export const getCurrentZodiacSign = (): string => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Basic zodiac calculation
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  return 'Capricorn';
};

/**
 * Convert any string to a valid ZodiacSign if possible
 * @param zodiac String representing a zodiac sign
 * @returns A valid ZodiacSign or 'aries' as default
 */
export function toZodiacSign(zodiac: string | null | undefined): ZodiacSign {
  if (!zodiac) return 'aries';
  
  const normalized = zodiac.toLowerCase();
  
  const validSigns: ZodiacSign[] = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];
  
  return validSigns.includes(normalized as ZodiacSign) 
    ? (normalized as ZodiacSign) 
    : 'aries';
}

export function getSignFromLongitude(longitude: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  const signIndex = Math.floor((longitude % 360) / 30);
  return signs[signIndex];
}

export function getZodiacElementalInfluence(sign: ZodiacSign): ElementalProperties {
  const element = zodiacElements[sign];
  return {
    Fire: element === 'Fire' ? 1.2 : 0.8,
    Water: element === 'Water' ? 1.2 : 0.8,
    Earth: element === 'Earth' ? 1.2 : 0.8,
    Air: element === 'Air' ? 1.2 : 0.8
  };
} 