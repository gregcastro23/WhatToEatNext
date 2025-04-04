import { NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import { handleApiError } from '@/app/api/error';
import { Cache } from '@/utils/cache';
import { AstrologicalService } from '@/services/AstrologicalService';

// Initialize cache
const cache = new Cache(3600000); // 1 hour cache timeout
const CACHE_KEY = 'celestial_positions';

export async function GET(request: Request) {
  try {
    // Check cache first
    const cachedData = cache.get(CACHE_KEY);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Get the current astrological state
    const astroState = await AstrologicalService.getCurrentState();
    
    // Cache the result
    cache.set(CACHE_KEY, astroState);

    return NextResponse.json(astroState);
  } catch (error) {
    logger.error('Astrology API Error:', error);
    return handleApiError(error);
  }
} 