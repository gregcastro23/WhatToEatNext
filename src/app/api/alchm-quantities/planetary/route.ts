import { NextResponse } from "next/server";
import { calculatePlanetaryPositions, getFallbackPlanetaryPositions } from "@/utils/serverPlanetaryCalculations";
import { PLANETARY_ALCHEMY } from "@/utils/planetaryAlchemyMapping";
import { calculateNextSignTransition } from "@/utils/planetaryTransitions";
import { createLogger } from "@/utils/logger";
import type { PlanetPosition } from "@/utils/astrologyUtils";

const logger = createLogger("PlanetaryContributionsAPI");

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Type definitions
type PlanetaryData = {
  name: string;
  position: PlanetPosition;
  esms: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  transition: {
    nextSign: string;
    estimatedDate: Date;
    daysUntil: number;
    direction: "forward" | "retrograde";
  };
};

export async function GET() {
  try {
    logger.info("Planetary Contributions API called - starting processing");

    // Get current planetary positions using direct server-side calculation
    let planetaryPositions;
    try {
      logger.info("Attempting to calculate planetary positions...");
      planetaryPositions = await calculatePlanetaryPositions();
      logger.info(`Got ${Object.keys(planetaryPositions).length} planetary positions`);
    } catch (calcError) {
      const errorMessage = calcError instanceof Error ? calcError.message : String(calcError);
      logger.warn("Failed to calculate planetary positions, using fallback:", { error: errorMessage });
      planetaryPositions = getFallbackPlanetaryPositions();
    }

    // Process each planet
    const planetNames = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
    const planets: PlanetaryData[] = [];

    for (const planetName of planetNames) {
      const position = planetaryPositions[planetName];

      if (!position) {
        logger.warn(`No position data for ${planetName}`);
        continue;
      }

      // Get ESMS contributions from PLANETARY_ALCHEMY
      const alchemyData = PLANETARY_ALCHEMY[planetName as keyof typeof PLANETARY_ALCHEMY];

      if (!alchemyData) {
        logger.warn(`No alchemy data for ${planetName}`);
        continue;
      }

      // Calculate next sign transition
      const transition = calculateNextSignTransition(planetName, position);

      planets.push({
        name: planetName,
        position,
        esms: {
          Spirit: alchemyData.Spirit,
          Essence: alchemyData.Essence,
          Matter: alchemyData.Matter,
          Substance: alchemyData.Substance,
        },
        transition,
      });
    }

    const responseData = {
      planets,
      timestamp: new Date().toISOString(),
    };

    logger.info(`Successfully calculated data for ${planets.length} planets`);

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error("API Error generating planetary contributions:", { error: errorMessage, stack: errorStack });
    return NextResponse.json(
      {
        error: "Failed to calculate planetary contributions",
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
