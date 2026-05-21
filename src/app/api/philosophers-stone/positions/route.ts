import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { getCurrentPlanetaryPositions } from "@/services/astrologizeApi";
import { alchemize } from "@/services/RealAlchemizeService";
import { logger } from "@/utils/logger";
import { calculateEnhancedAlchemicalFromPlanets, isSectDiurnal } from "@/utils/planetaryAlchemyMapping";
import type { NextRequest } from "next/server";

const RATE_LIMIT = { window: 60_000, max: 30, bucket: "philosophers-stone-positions" };

/**
 * GET /api/philosophers-stone/positions - Get planetary positions with alchemical calculations
 */
export async function GET(request: NextRequest) {
  const rl = await rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const includeAlchemical = searchParams.get("alchemical") !== "false"; // Default to true

    logger.info(
      `Philosophers stone positions requested for date: ${date || "current"}`,
    );

    // Get current planetary positions
    const planetaryPositions = await getCurrentPlanetaryPositions();

    const response: any = {
      timestamp: new Date().toISOString(),
      date: date || new Date().toISOString().split("T")[0],
      planetaryPositions,
      source: "calculated",
    };

    // Add alchemical calculations if requested
    if (includeAlchemical) {
      try {
        // Calculate alchemical properties from planetary positions
        const requestDate = date ? new Date(date) : new Date();
        const diurnal = isSectDiurnal(requestDate);
        
        const signMap: Record<string, string> = {};
        for (const [planet, data] of Object.entries(planetaryPositions)) {
          signMap[planet] = typeof data === 'object' && data !== null ? (data as any).sign : String(data);
        }
        
        const alchemicalProperties = calculateEnhancedAlchemicalFromPlanets(
          signMap,
          diurnal
        );

        // Calculate thermodynamic metrics using the alchemizer engine
        const alchemizeResult = alchemize(planetaryPositions);
        const { heat, entropy, reactivity, gregsEnergy } =
          alchemizeResult.thermodynamicProperties;
        const { kalchm, monica } = alchemizeResult;

        // Derive elemental properties from thermodynamics
        const Fire = heat * 0.2 + reactivity * 0.2;
        const Water = monica * 0.6 + (1 - heat) * 0.4;
        const Earth = kalchm * 0.5 + (1 - entropy) * 0.5;
        const Air = entropy * 0.2 + reactivity * 0.2;
        const total = Fire + Water + Earth + Air;
        const elementalBalance = {
          Fire: Fire / total,
          Water: Water / total,
          Earth: Earth / total,
          Air: Air / total,
        };

        response.alchemicalProperties = alchemicalProperties;
        response.thermodynamicMetrics = { heat, entropy, reactivity, gregsEnergy, kalchm, monica };

        // Add philosophers stone interpretation
        response.interpretation = {
          spiritualEssence: alchemicalProperties.Spirit,
          materialManifestation: alchemicalProperties.Matter,
          transformativePower: alchemicalProperties.Substance,
          elementalBalance,
          thermodynamicState: {
            heat,
            entropy,
            reactivity,
            gregEnergy: gregsEnergy,
            kalchm,
            monica,
          },
        };

        logger.info("Alchemical calculations completed successfully");
      } catch (alchemicalError) {
        logger.warn("Alchemical calculation failed:", alchemicalError);
        response.alchemicalError = "Failed to calculate alchemical properties";
        // Continue without alchemical data rather than failing the request
      }
    }

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    logger.error("Philosophers stone positions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve planetary positions",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/philosophers-stone/positions - Calculate positions for specific date/location
 */
export async function POST(request: NextRequest) {
  const rl = await rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const body = await request.json();
    const {
      date,
      latitude,
      longitude,
      includeAlchemical = true,
      customPlanets, // Optional: override with custom planetary positions
    } = body;

    logger.info(`Custom philosophers stone calculation requested`, {
      date,
      hasLocation: !!(latitude && longitude),
      includeAlchemical,
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
      planetaryPositions,
    };

    // Add alchemical calculations
    if (includeAlchemical) {
      try {
        const requestDate = date ? new Date(date) : new Date();
        const diurnal = isSectDiurnal(requestDate);
        
        const signMap: Record<string, string> = {};
        for (const [planet, data] of Object.entries(planetaryPositions)) {
          signMap[planet] = typeof data === 'object' && data !== null ? (data as any).sign : String(data);
        }
        
        const alchemicalProperties = calculateEnhancedAlchemicalFromPlanets(
          signMap,
          diurnal
        );
        const alchemizeResult2 = alchemize(planetaryPositions);
        const {
          heat: heat2,
          entropy: entropy2,
          reactivity: reactivity2,
          gregsEnergy: gregsEnergy2,
        } = alchemizeResult2.thermodynamicProperties;
        const { kalchm: kalchm2, monica: monica2 } = alchemizeResult2;

        // Derive elemental properties from thermodynamics
        const Fire2 = heat2 * 0.2 + reactivity2 * 0.2;
        const Water2 = monica2 * 0.6 + (1 - heat2) * 0.4;
        const Earth2 = kalchm2 * 0.5 + (1 - entropy2) * 0.5;
        const Air2 = entropy2 * 0.2 + reactivity2 * 0.2;
        const total2 = Fire2 + Water2 + Earth2 + Air2;
        const elementalBalance2 = {
          Fire: Fire2 / total2,
          Water: Water2 / total2,
          Earth: Earth2 / total2,
          Air: Air2 / total2,
        };

        response.alchemicalProperties = alchemicalProperties;
        response.thermodynamicMetrics = {
          heat: heat2,
          entropy: entropy2,
          reactivity: reactivity2,
          gregsEnergy: gregsEnergy2,
          kalchm: kalchm2,
          monica: monica2,
        };

        // Enhanced interpretation for specific date/location
        response.philosophersStone = {
          stone: {
            essence: alchemicalProperties.Spirit > 0.5 ? "refined" : "raw",
            matter: alchemicalProperties.Matter > 0.5 ? "purified" : "impure",
            substance:
              alchemicalProperties.Substance > 0.5 ? "transmuted" : "base",
          },
          elementalProfile: {
            // Elements reinforce themselves - no opposing forces
            Fire: elementalBalance2.Fire,
            Water: elementalBalance2.Water,
            Earth: elementalBalance2.Earth,
            Air: elementalBalance2.Air,
            dominantElement: getDominantElement(elementalBalance2),
          },
          alchemicalPotential: {
            transformationReadiness: reactivity2,
            stabilityIndex: 1 - entropy2,
            energeticPotential: gregsEnergy2,
          },
        };
      } catch (alchemicalError) {
        logger.warn("Alchemical calculation failed:", alchemicalError);
        response.alchemicalError = "Failed to calculate alchemical properties";
      }
    }

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    logger.error("Custom philosophers stone calculation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate custom planetary positions",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * Helper function to determine dominant element
 */
function getDominantElement(properties: any): string {
  const elements = [
    { name: "Fire", value: properties.Fire || 0 },
    { name: "Water", value: properties.Water || 0 },
    { name: "Earth", value: properties.Earth || 0 },
    { name: "Air", value: properties.Air || 0 },
  ];

  return elements.reduce((max, current) =>
    current.value > max.value ? current : max,
  ).name;
}
