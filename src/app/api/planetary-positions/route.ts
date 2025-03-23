import { NextResponse } from 'next/server';
import { getDefaultPlanetaryPositions } from '@/utils/astrologyUtils';

// This API route returns both our calculated positions and a note that
// for real-time comparison, users should check jessicaadams.com
export async function GET() {
  try {
    // Get our calculated positions
    const calculatedPositions = getDefaultPlanetaryPositions();
    
    // Format for consistent display
    const formattedCalculatedPositions = Object.entries(calculatedPositions).reduce((acc, [planet, position]) => {
      acc[planet] = {
        sign: position.sign.toLowerCase(),
        degree: Math.floor(position.degree),
        minute: Math.floor((position.degree % 1) * 60),
        isRetrograde: position.isRetrograde || false
      };
      return acc;
    }, {} as Record<string, any>);
    
    // Return our current data with reference website
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      calculatedPositions: formattedCalculatedPositions,
      reference: {
        source: "jessicaadams.com/astrology/current-planetary-positions/",
        note: "For current positions, please visit the reference website directly."
      }
    });
  } catch (error) {
    console.error('Error in planetary positions API:', error);
    return NextResponse.json({ error: 'Failed to retrieve planetary positions' }, { status: 500 });
  }
} 