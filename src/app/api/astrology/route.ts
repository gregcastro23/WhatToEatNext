import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { handleApiError } from '@/app/api/error';
import { Cache } from '@/utils/cache';
import { config } from '@/config';

const cache = new Cache(config.api.celestialUpdateInterval);
const CACHE_KEY = 'celestial_positions';

interface CelestialResponse {
  sunSign: {
    sign: string;
    degree: number;
    minutes: number;
  };
  moonSign: {
    sign: string;
    degree: number;
    minutes: number;
  };
  timestamp: number;
}

export async function GET() {
  try {
    // Check cache first
    const cachedData = cache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Calculate positions (simplified for example)
    const now = new Date();
    const data: CelestialResponse = {
      sunSign: calculateSunPosition(now),
      moonSign: calculateMoonPosition(now),
      timestamp: Date.now()
    };

    // Validate data
    if (!isValidCelestialData(data)) {
      throw new Error('Invalid celestial calculation results');
    }

    // Cache the result
    cache.set(CACHE_KEY, data);

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Astrology API Error:', error);
    return handleApiError(error);
  }
}

function calculateSunPosition(date: Date) {
  try {
    // Simplified calculation - replace with actual astronomical calculations
    const dayOfYear = getDayOfYear(date);
    const zodiacPeriod = 365.25 / 12;
    const zodiacIndex = Math.floor(dayOfYear / zodiacPeriod);
    const degree = (dayOfYear % zodiacPeriod) * (30 / zodiacPeriod);

    return {
      sign: getZodiacSign(zodiacIndex),
      degree: Math.floor(degree),
      minutes: Math.floor((degree % 1) * 60)
    };
  } catch (error) {
    logger.error('Error calculating sun position:', error);
    return {
      sign: 'Aries',
      degree: 0,
      minutes: 0
    };
  }
}

function calculateMoonPosition(date: Date) {
  try {
    // Simplified calculation - replace with actual astronomical calculations
    const dayOfYear = getDayOfYear(date);
    const lunarCycle = 29.53059; // days
    const zodiacPeriod = lunarCycle / 12;
    const zodiacIndex = Math.floor((dayOfYear % lunarCycle) / zodiacPeriod);
    const degree = ((dayOfYear % zodiacPeriod) * (30 / zodiacPeriod));

    return {
      sign: getZodiacSign(zodiacIndex),
      degree: Math.floor(degree),
      minutes: Math.floor((degree % 1) * 60)
    };
  } catch (error) {
    logger.error('Error calculating moon position:', error);
    return {
      sign: 'Taurus',
      degree: 0,
      minutes: 0
    };
  }
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getZodiacSign(index: number): string {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  return signs[index % 12];
}

function isValidCelestialData(data: CelestialResponse): boolean {
  return (
    data &&
    data.sunSign &&
    data.moonSign &&
    typeof data.sunSign.sign === 'string' &&
    typeof data.sunSign.degree === 'number' &&
    typeof data.sunSign.minutes === 'number' &&
    typeof data.moonSign.sign === 'string' &&
    typeof data.moonSign.degree === 'number' &&
    typeof data.moonSign.minutes === 'number' &&
    typeof data.timestamp === 'number'
  );
} 