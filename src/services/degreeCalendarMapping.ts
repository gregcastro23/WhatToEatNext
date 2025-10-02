/**
 * High-Precision Degree Calendar Mapping Service
 *
 * Provides fast lookups and intelligent caching for zodiac degree mappings
 * with astronomical precision and performance optimization.
 *
 * Based on Planetary Agents implementation with sub-millisecond performance.
 */

import { createLogger } from '@/utils/logger';
import {
    calculateSolarPosition,
    getCardinalPoints,
    getZodiacPositionForDate,
    type ZodiacPosition
} from './vsop87EphemerisService';

const logger = createLogger('DegreeCalendarMapping');

export interface DegreeInfo {
  absolute_longitude: number,
  sign: string,
  degree_in_sign: number,
  decan: number,
  decan_ruler: string,
  keywords: string[],
  sabian_symbol?: string,
  element: string,
  modality: string,
  planetary_hour_ruler?: string,
  lunar_phase_influence?: string;
}

export interface ZodiacCalendarEntry {
  date: string; // ISO date string
  zodiac_info: DegreeInfo,
  solar_speed: number; // degrees per day
  ingress_distance: number; // days until next sign ingress
  seasonal_context: string;
}

export interface AnnualCalendar {
  year: number,
  entries: ZodiacCalendarEntry[],
  cardinal_points: {
    spring_equinox: string,
    summer_solstice: string,
    autumn_equinox: string,
    winter_solstice: string;
  };
  sign_durations: Record<string, number>;
  metadata: {
    generated_at: string,
    accuracy: string,
    total_entries: number;
  };
}

/**
 * Sabian symbols for each degree (simplified version)
 */
const SABIAN_SYMBOLS: Record<number, string> = {
  0: "A woman rises out of water, a seal embraces her",
  1: "A woman just risen from the sea",
  2: "A comedian entertaining a group",
  3: "A cameo profile of a man in the outline of his country",
  4: "A triangle with wings",
  5: "A square, with one of its sides brightly illuminated",
  6: "A square brightly lighted on one side",
  7: "A woman of Samaria comes to draw water from Jacob's well",
  8: "A triangle with wings",
  9: "A crystal gazer",
  10: "A teacher gives new symbolic forms to old images",
  11: "The ruler of a nation",
  12: "A Chinese laundry",
  13: "A bomb explodes",
  14: "A serpent coiling near a man and a woman",
  15: "An Indian weaving a ceremonial blanket",
  16: "Square and compasses with triangle",
  17: "A retired sea captain",
  18: "A Hindu healer",
  19: "A majestic rock formation",
  20: "A young girl feeding birds in winter",
  21: "A pugilist entering the ring",
  22: "A royal coat of arms",
  23: "A woman clothed in white bears a white child",
  24: "Blown inward by the wind, the curtains of an open window take the shape of a cornucopia",
  25: "A double promise",
  26: "A man teaching new forms for old symbols",
  27: "The king of the fairies approaching his domain",
  28: "A large disappointed audience",
  29: "The music of the spheres"
};

/**
 * Keywords associated with each degree
 */
function getDegreeKeywords(sign: string, degree: number): string[] {
  const keywords: Record<string, Record<number, string[]>> = {
    aries: {
      0: ['new beginnings', 'emergence', 'pioneering'],
      1: ['awakening', 'fresh start', 'initiative'],
      2: ['expression', 'communication', 'entertainment'],
      3: ['leadership', 'authority', 'national identity'],
      4: ['inspiration', 'aspiration', 'higher purpose'],
      5: ['stability', 'foundation', 'structure'],
      6: ['service', 'healing', 'restoration'],
      7: ['spirituality', 'divine connection', 'faith'],
      8: ['wisdom', 'teaching', 'knowledge'],
      9: ['intuition', 'psychic ability', 'inner knowing'],
      10: ['transformation', 'renewal', 'rebirth'],
      11: ['authority', 'power', 'responsibility'],
      12: ['service', 'practicality', 'everyday life'],
      13: ['sudden change', 'breakthrough', 'crisis'],
      14: ['temptation', 'union', 'balance'],
      15: ['creativity', 'tradition', 'cultural heritage'],
      16: ['brotherhood', 'unity', 'shared purpose'],
      17: ['experience', 'wisdom', 'guidance'],
      18: ['healing', 'holistic', 'natural medicine'],
      19: ['strength', 'endurance', 'majesty'],
      20: ['innocence', 'nurturing', 'care'],
      21: ['courage', 'competition', 'strength'],
      22: ['heritage', 'tradition', 'legacy'],
      23: ['purity', 'innocence', 'new life'],
      24: ['abundance', 'prosperity', 'generosity'],
      25: ['commitment', 'promise', 'dedication'],
      26: ['innovation', 'creativity', 'teaching'],
      27: ['magic', 'enchantment', 'otherworldly'],
      28: ['disappointment', 'expectation', 'reality'],
      29: ['harmony', 'music', 'universal order']
    },
    // Add more signs as needed - for now using Aries as template
  };

  return keywords[sign]?.[degree] || ['universal', 'cosmic', 'energy'];
}

/**
 * Get element for zodiac sign
 */
function getSignElement(sign: string): string {
  const elements: Record<string, string> = {
    aries: 'Fire', taurus: 'Earth', gemini: 'Air', cancer: 'Water',
    leo: 'Fire', virgo: 'Earth', libra: 'Air', scorpio: 'Water',
    sagittarius: 'Fire', capricorn: 'Earth', aquarius: 'Air', pisces: 'Water'
};
  return elements[sign] || 'Unknown'
}

/**
 * Get modality for zodiac sign
 */
function getSignModality(sign: string): string {
  const modalities: Record<string, string> = {
    aries: 'Cardinal', taurus: 'Fixed', gemini: 'Mutable',
    cancer: 'Cardinal', leo: 'Fixed', virgo: 'Mutable',
    libra: 'Cardinal', scorpio: 'Fixed', sagittarius: 'Mutable',
    capricorn: 'Cardinal', aquarius: 'Fixed', pisces: 'Mutable'
};
  return modalities[sign] || 'Unknown'
}

/**
 * Calculate days until next sign ingress
 */
function calculateDaysUntilNextIngress(currentLongitude: number, currentDate: Date): number {
  const currentSignIndex = Math.floor(currentLongitude / 30);
  const nextSignStart = ((currentSignIndex + 1) % 12) * 30;

  // Find the next sign boundary
  let targetLongitude = nextSignStart;
  if (targetLongitude <= currentLongitude) {
    targetLongitude += 360; // Wrap around to next cycle
  }

  // Estimate days to reach target longitude at current solar speed
  const degreesToGo = targetLongitude - currentLongitude;
  const solarSpeed = getSolarSpeed(currentDate); // degrees per day

  return degreesToGo / solarSpeed;
}

/**
 * Get seasonal context for a date
 */
function getSeasonalContext(date: Date): string {
  const month = date.getMonth();
  const day = date.getDate();

  // Northern hemisphere seasons
  if ((month === 11 && day >= 21) || (month === 0) || (month === 1) || (month === 2 && day < 20)) {
    return 'winter';
  } else if ((month === 2 && day >= 20) || (month === 3) || (month === 4) || (month === 5 && day < 21)) {
    return 'spring';
  } else if ((month === 5 && day >= 21) || (month === 6) || (month === 7) || (month === 8 && day < 23)) {
    return 'summer';
  } else {
    return 'autumn';
  }
}

/**
 * Calculate solar speed for a given date (simplified)
 */
function getSolarSpeed(date: Date): number {
  // Approximate solar speed - varies from ~0.95°/day at aphelion to ~1.02°/day at perihelion
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const phase = (dayOfYear / 365.25) * 2 * Math.PI;

  // Kepler's laws: faster at perihelion (Jan 3-5), slower at aphelion (July 3-5)
  return 0.9856474 + 0.0167 * Math.cos(phase); // degrees per day
}

// Cache for annual calendars
const annualCalendarCache = new Map<string, AnnualCalendar>();
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Build complete annual calendar with detailed zodiac information
 */
export function buildAnnualCalendar(year: number): AnnualCalendar {
  const cacheKey = `calendar_${year}`;
  const cached = annualCalendarCache.get(cacheKey);

  if (cached && Date.now() - new Date(cached.metadata.generated_at).getTime() < CACHE_EXPIRATION) {
    logger.debug(`Using cached annual calendar for ${year}`);
    return cached;
  }

  logger.info(`Building annual zodiac calendar for ${year}`);

  const entries: ZodiacCalendarEntry[] = [],
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  let currentDate = new Date(startDate);
  while (currentDate < endDate) {
    const zodiacPosition = getZodiacPositionForDate(currentDate);
    const solarSpeed = getSolarSpeed(currentDate);
    const ingressDistance = calculateDaysUntilNextIngress(zodiacPosition.absolute_longitude, currentDate);
    const seasonalContext = getSeasonalContext(currentDate);

    const degreeInfo: DegreeInfo = {
      absolute_longitude: zodiacPosition.absolute_longitude,
      sign: zodiacPosition.sign,
      degree_in_sign: zodiacPosition.degree_in_sign,
      decan: zodiacPosition.decan,
      decan_ruler: zodiacPosition.decan_ruler,
      keywords: getDegreeKeywords(zodiacPosition.sign, Math.floor(zodiacPosition.degree_in_sign)),
      sabian_symbol: SABIAN_SYMBOLS[Math.floor(zodiacPosition.degree_in_sign)],
      element: getSignElement(zodiacPosition.sign),
      modality: getSignModality(zodiacPosition.sign)
    };

    entries.push({
      date: currentDate.toISOString().split('T')[0],
      zodiac_info: degreeInfo,
      solar_speed: solarSpeed,
      ingress_distance: ingressDistance,
      seasonal_context: seasonalContext
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const cardinalPoints = getCardinalPoints(year);
  const signDurations = getSignDurations(year);

  const calendar: AnnualCalendar = {
    year,
    entries,
    cardinal_points: {
      spring_equinox: cardinalPoints.springEquinox.toISOString().split('T')[0],
      summer_solstice: cardinalPoints.summerSolstice.toISOString().split('T')[0],
      autumn_equinox: cardinalPoints.autumnEquinox.toISOString().split('T')[0],
      winter_solstice: cardinalPoints.winterSolstice.toISOString().split('T')[0]
    },
    sign_durations: signDurations,
    metadata: {
      generated_at: new Date().toISOString(),
      accuracy: '±0.01° VSOP87',
      total_entries: entries.length
    }
  };

  annualCalendarCache.set(cacheKey, calendar);
  logger.info(`Built annual calendar for ${year} with ${entries.length} entries`);

  return calendar;
}

/**
 * Get degree information for a specific date
 */
export function getDegreeForDate(date: Date): DegreeInfo {
  const zodiacPosition = getZodiacPositionForDate(date);

  return {
    absolute_longitude: zodiacPosition.absolute_longitude,
    sign: zodiacPosition.sign,
    degree_in_sign: zodiacPosition.degree_in_sign,
    decan: zodiacPosition.decan,
    decan_ruler: zodiacPosition.decan_ruler,
    keywords: getDegreeKeywords(zodiacPosition.sign, Math.floor(zodiacPosition.degree_in_sign)),
    sabian_symbol: SABIAN_SYMBOLS[Math.floor(zodiacPosition.degree_in_sign)],
    element: getSignElement(zodiacPosition.sign),
    modality: getSignModality(zodiacPosition.sign)
  };
}

/**
 * Get current zodiac period information
 */
export function getCurrentZodiacPeriod(): {
  current_time: string,
  zodiac_position: ZodiacPosition,
  next_ingress: {
    sign: string,
    days: number,
    date: string;
  };
  solar_speed: number,
  seasonal_context: string;
} {
  const now = new Date();
  const zodiacPosition = getZodiacPositionForDate(now);
  const solarSpeed = getSolarSpeed(now);
  const seasonalContext = getSeasonalContext(now);

  const currentSignIndex = Math.floor(zodiacPosition.absolute_longitude / 30);
  const nextSignIndex = (currentSignIndex + 1) % 12;
  const nextSignName = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ][nextSignIndex];

  const daysUntilIngress = calculateDaysUntilNextIngress(zodiacPosition.absolute_longitude, now);
  const ingressDate = new Date(now.getTime() + daysUntilIngress * 24 * 60 * 60 * 1000);

  return {
    current_time: now.toISOString(),
    zodiac_position: zodiacPosition,
    next_ingress: {
      sign: nextSignName,
      days: Math.round(daysUntilIngress * 100) / 100,
      date: ingressDate.toISOString().split('T')[0]
    },
    solar_speed: Math.round(solarSpeed * 10000) / 10000,
    seasonal_context: seasonalContext
  };
}

/**
 * Get formatted monthly zodiac calendar
 */
export function getMonthlyZodiacCalendar(year: number, month: number): {
  year: number,
  month: number,
  month_name: string,
  days: Array<{
    date: string,
    day_of_month: number,
    zodiac_info: DegreeInfo,
    is_ingress_day: boolean,
    ingress_type?: string;
  }>;
  summary: {
    dominant_sign: string,
    sign_changes: number,
    solar_speed_range: { min: number; max: number; avg: number };
  };
} {
  const calendar = buildAnnualCalendar(year);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthEntries = calendar.entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === month;
  });

  const days = monthEntries.map((entry, index) => {
    const prevEntry = index > 0 ? monthEntries[index - 1] : null;
    const isIngressDay = prevEntry && prevEntry.zodiac_info.sign !== entry.zodiac_info.sign;

    let ingressType: string | undefined,
    if (isIngressDay) {
      ingressType = `${prevEntry!.zodiac_info.sign} → ${entry.zodiac_info.sign}`;
    }

    return {
      date: entry.date,
      day_of_month: new Date(entry.date).getDate(),
      zodiac_info: entry.zodiac_info,
      is_ingress_day: !!isIngressDay,
      ingress_type: ingressType
    };
  });

  // Calculate summary statistics
  const signs = days.map(d => d.zodiac_info.sign);
  const dominantSign = signs.reduce((a, b, i, arr) =>
    arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
  );

  const signChanges = days.filter(d => d.is_ingress_day).length;

  const solarSpeeds = monthEntries.map(e => e.solar_speed);
  const solarSpeedRange = {
    min: Math.min(...solarSpeeds),
    max: Math.max(...solarSpeeds),
    avg: solarSpeeds.reduce((a, b) => a + b, 0) / solarSpeeds.length
  };

  return {
    year,
    month,
    month_name: monthNames[month],
    days,
    summary: {
      dominant_sign: dominantSign,
      sign_changes: signChanges,
      solar_speed_range: {
        min: Math.round(solarSpeedRange.min * 10000) / 10000,
        max: Math.round(solarSpeedRange.max * 10000) / 10000,
        avg: Math.round(solarSpeedRange.avg * 10000) / 10000
      }
    }
  };
}

/**
 * Calculate days until next ingress from a given date
 */
export function daysUntilNextIngress(date: Date = new Date()): number {
  const currentLongitude = calculateSolarPosition(date);
  return calculateDaysUntilNextIngress(currentLongitude, date);
}

/**
 * Clear calendar cache (useful for memory management)
 */
export function clearCalendarCache(): void {
  annualCalendarCache.clear();
  logger.info('Cleared zodiac calendar cache');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  cached_years: number,
  total_entries: number,
  cache_size_mb: number;
} {
  let totalEntries = 0;
  annualCalendarCache.forEach(calendar => {
    totalEntries += calendar.entries.length,
  });

  // Rough estimate of memory usage
  const cacheSizeMB = (annualCalendarCache.size * 365 * 0.5) / 1024; // ~0.5KB per day entry

  return {
    cached_years: annualCalendarCache.size,
    total_entries: totalEntries,
    cache_size_mb: Math.round(cacheSizeMB * 100) / 100
  };
}

export default {
  buildAnnualCalendar,
  getDegreeForDate,
  getCurrentZodiacPeriod,
  getMonthlyZodiacCalendar,
  daysUntilNextIngress,
  clearCalendarCache,
  getCacheStats
};
