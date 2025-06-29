import { NextResponse } from 'next/server';
import { _calculatePlanetaryPositions, calculateAspects, getDefaultPlanetaryPositions } from '@/utils/astrologyUtils';
import { getAccuratePlanetaryPositions } from '@/utils/accurateAstronomy';
import { _cache } from '@/utils/cache';

const CACHE_KEY = 'planetary-positions';
const _CACHE_TTL = 1 * 60; // 1 minute cache timeout

// GET endpoint returns default positions
export async function GET() {
  try {
    // Check cache first
    const cached = cache.get(CACHE_KEY);
    if (cached) return NextResponse.json(cached);

    // Instead of calculating positions, use the default positions that we've corrected
    const positions = getDefaultPlanetaryPositions();
    
    // Cache with TTL
    cache.set(CACHE_KEY, positions, CACHE_TTL);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      positions,
      source: 'default-positions'
    });
  } catch (error) {
    // console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate positions', fallback: true },
      { status: 500 }
    );
  }
}

// POST endpoint calculates positions for a specific date
export async function POST(request: Request) {
  try {
    const { date } = await request.json();
    const targetDate = new Date(date);
    
    // Get positions using our local function
    const positions = await calculatePlanetaryPositions(targetDate);
    
    // Validate positions before calculating aspects
    if (!positions || Object.keys(positions).length === 0) {
      return NextResponse.json({ message: 'Failed to calculate planetary positions' }, { status: 500 });
    }
    
    // Check for valid position structure
    const hasValidPositions = Object.values(positions).every(
      position => position && typeof position === 'object' && 'sign' in position
    );
    
    if (!hasValidPositions) {
      // console.warn("Some planetary positions are invalid or incomplete");
    }
    
    const aspects = calculateAspects(positions);
    
    return NextResponse.json({ 
      positions,
      aspects,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // console.error('Error calculating planetary positions:', error);
    return NextResponse.json({ 
      message: 'Error calculating planetary positions',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 