import { alchemize } from '@/constants/alchemicalPillars';
import { getCurrentPlanetaryPositions } from '@/services/astrologizeApi';
import { logger } from '@/utils/logger';
import { calculateAlchemicalFromPlanets } from '@/utils/planetaryAlchemyMapping';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/philosophers-stone/positions - Get planetary positions with alchemical calculations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const includeAlchemical = searchParams.get('alchemical') !== 'false'; // Default to true

    logger.info(`Philosophers stone positions requested for date: ${date || 'current'}`);

    // Get current planetary positions
    const planetaryPositions = await getCurrentPlanetaryPositions();

    const response: any = {
      timestamp: new Date().toISOString(),
      date: date || new Date().toISOString().split('T')[0],
      planetaryPositions,
      source: astroState.metadata?.source || 'calculated'
    };

    // Add alchemical calculations if requested
    if (includeAlchemical) {
      try {
        // Calculate alchemical properties from planetary positions
        const alchemicalProperties = calculateAlchemicalFromPlanets(planetaryPositions);

        // Calculate thermodynamic metrics using the alchemizer engine
        const thermodynamicMetrics = alchemize(planetaryPositions);

        response.alchemicalProperties = alchemicalProperties;
        response.thermodynamicMetrics = thermodynamicMetrics;

        // Add philosophers stone interpretation
        response.interpretation = {
          spiritualEssence: alchemicalProperties.Spirit,
          materialManifestation: alchemicalProperties.Matter,
          transformativePower: alchemicalProperties.Substance,
          elementalBalance: {
            Fire: alchemicalProperties.Fire,
            Water: alchemicalProperties.Water,
            Earth: alchemicalProperties.Earth,
            Air: alchemicalProperties.Air
          },
          thermodynamicState: {
            heat: thermodynamicMetrics.heat,
            entropy: thermodynamicMetrics.entropy,
            reactivity: thermodynamicMetrics.reactivity,
            gregEnergy: thermodynamicMetrics.gregsEnergy,
            kalchm: thermodynamicMetrics.kalchm,
            monica: thermodynamicMetrics.monica
          }
        };

        logger.info('Alchemical calculations completed successfully');
      } catch (alchemicalError) {
        logger.warn('Alchemical calculation failed:', alchemicalError);
        response.alchemicalError = 'Failed to calculate alchemical properties';
        // Continue without alchemical data rather than failing the request
      }
    }

    return NextResponse.json({
      success: true,
      ...response
    });

  } catch (error) {
    logger.error('Philosophers stone positions error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve planetary positions',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/philosophers-stone/positions - Calculate positions for specific date/location
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      latitude,
      longitude,
      includeAlchemical = true,
      customPlanets // Optional: override with custom planetary positions
    } = body;

    logger.info(`Custom philosophers stone calculation requested`, {
      date,
      hasLocation: !!(latitude && longitude),
      includeAlchemical
    });

    let planetaryPositions = customPlanets;

    // If no custom planets provided, calculate for the given date/location
    if (!planetaryPositions) {
      // For now, use the default calculation
      // In a full implementation, this would calculate positions for specific date/location
      planetaryPositions = await getCurrentPlanetaryPositions();
    }

    const response: any = {
      timestamp: new Date().toISOString(),
      requestDate: date,
      location: latitude && longitude ? { latitude, longitude } : null,
      planetaryPositions
    };

    // Add alchemical calculations
    if (includeAlchemical) {
      try {
        const alchemicalProperties = calculateAlchemicalFromPlanets(planetaryPositions);
        const thermodynamicMetrics = alchemize(planetaryPositions);

        response.alchemicalProperties = alchemicalProperties;
        response.thermodynamicMetrics = thermodynamicMetrics;

        // Enhanced interpretation for specific date/location
        response.philosophersStone = {
          stone: {
            essence: alchemicalProperties.Spirit > 0.5 ? 'refined' : 'raw',
            matter: alchemicalProperties.Matter > 0.5 ? 'purified' : 'impure',
            substance: alchemicalProperties.Substance > 0.5 ? 'transmuted' : 'base'
          },
          elementalHarmony: {
            balanced: Math.abs(alchemicalProperties.Fire - alchemicalProperties.Water) < 0.3 &&
                     Math.abs(alchemicalProperties.Earth - alchemicalProperties.Air) < 0.3,
            dominantElement: getDominantElement(alchemicalProperties),
            complementaryElements: getComplementaryElements(alchemicalProperties)
          },
          alchemicalPotential: {
            transformationReadiness: thermodynamicMetrics.reactivity,
            stabilityIndex: 1 - thermodynamicMetrics.entropy,
            energeticPotential: thermodynamicMetrics.gregsEnergy
          }
        };

      } catch (alchemicalError) {
        logger.warn('Alchemical calculation failed:', alchemicalError);
        response.alchemicalError = 'Failed to calculate alchemical properties';
      }
    }

    return NextResponse.json({
      success: true,
      ...response
    });

  } catch (error) {
    logger.error('Custom philosophers stone calculation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate custom planetary positions',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Helper function to determine dominant element
 */
function getDominantElement(properties: any): string {
  const elements = [
    { name: 'Fire', value: properties.Fire || 0 },
    { name: 'Water', value: properties.Water || 0 },
    { name: 'Earth', value: properties.Earth || 0 },
    { name: 'Air', value: properties.Air || 0 }
  ];

  return elements.reduce((max, current) =>
    current.value > max.value ? current : max
  ).name;
}

/**
 * Helper function to get complementary elements
 */
function getComplementaryElements(properties: any): string[] {
  const elements = [
    { name: 'Fire', value: properties.Fire || 0 },
    { name: 'Water', value: properties.Water || 0 },
    { name: 'Earth', value: properties.Earth || 0 },
    { name: 'Air', value: properties.Air || 0 }
  ];

  // Elements work best with themselves and similar values
  const sorted = elements.sort((a, b) => b.value - a.value);
  const dominant = sorted[0];

  // Return elements that are reasonably close in value (within 0.3)
  return sorted
    .filter(el => Math.abs(el.value - dominant.value) <= 0.3)
    .map(el => el.name);
}
