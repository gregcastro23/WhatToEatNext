import { NextResponse } from "next/server";
import { getCurrentPlanetaryPositions } from "@/services/astrologizeApi";
import { alchemize } from "@/services/RealAlchemizeService";
import { createLogger } from "@/utils/logger";

const logger = createLogger("AlchmQuantitiesAPI");

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Define types
type AlchemyQuantities = {
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  ANumber: number;
  DayEssence: number;
  NightEssence: number;
};

type KineticData = {
  velocity: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  acceleration: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  momentum: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
};

export async function GET() {
  try {
    logger.info("Alchm Quantities API called");

    // Get current planetary positions
    const planetaryPositions = await getCurrentPlanetaryPositions();

    // Get alchemical properties using real service (synchronous function)
    const alchemicalResult = alchemize(planetaryPositions);

    const now = new Date();
    const timeOfDay = now.getHours() + now.getMinutes() / 60;

    // Extract ESMS quantities
    const quantities: AlchemyQuantities = {
      Spirit: alchemicalResult.esms.Spirit,
      Essence: alchemicalResult.esms.Essence,
      Matter: alchemicalResult.esms.Matter,
      Substance: alchemicalResult.esms.Substance,
      ANumber:
        alchemicalResult.esms.Spirit +
        alchemicalResult.esms.Essence +
        alchemicalResult.esms.Matter +
        alchemicalResult.esms.Substance,
      DayEssence: alchemicalResult.esms.Essence * 0.6,
      NightEssence: alchemicalResult.esms.Essence * 0.4,
    };

    // Calculate kinetics (mock data - replace with real calculations if available)
    const kinetics: KineticData = {
      velocity: {
        Spirit: Math.sin((timeOfDay / 12) * Math.PI) * 0.5,
        Essence: Math.cos((timeOfDay / 12) * Math.PI) * 0.3,
        Matter: Math.sin(((timeOfDay + 6) / 12) * Math.PI) * 0.2,
        Substance: Math.cos(((timeOfDay + 3) / 12) * Math.PI) * 0.4,
      },
      acceleration: {
        Spirit: Math.cos((timeOfDay / 6) * Math.PI) * 0.1,
        Essence: Math.sin((timeOfDay / 6) * Math.PI) * 0.08,
        Matter: Math.cos(((timeOfDay + 3) / 6) * Math.PI) * 0.05,
        Substance: Math.sin(((timeOfDay + 1.5) / 6) * Math.PI) * 0.12,
      },
      momentum: {
        Spirit: quantities.Spirit * Math.sin((timeOfDay / 12) * Math.PI) * 0.5,
        Essence: quantities.Essence * Math.cos((timeOfDay / 12) * Math.PI) * 0.3,
        Matter: quantities.Matter * Math.sin(((timeOfDay + 6) / 12) * Math.PI) * 0.2,
        Substance:
          quantities.Substance * Math.cos(((timeOfDay + 3) / 12) * Math.PI) * 0.4,
      },
    };

    // Determine dominant element from elementalProperties
    const elements = alchemicalResult.elementalProperties;
    const dominantElement = Object.entries(elements).reduce((a, b) =>
      elements[a[0] as keyof typeof elements] > elements[b[0] as keyof typeof elements]
        ? a
        : b
    )[0];

    const responseData = {
      quantities,
      kinetics,
      dominantElement,
      heat: alchemicalResult.thermodynamicProperties.heat,
      entropy: alchemicalResult.thermodynamicProperties.entropy,
      reactivity: alchemicalResult.thermodynamicProperties.reactivity,
      energy: alchemicalResult.thermodynamicProperties.gregsEnergy,
      timestamp: now.toISOString(),
    };

    logger.info("Alchm quantities calculated successfully");

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    logger.error("API Error generating Alchm quantities:", error as any);
    return NextResponse.json(
      { error: "Failed to calculate quantities" },
      { status: 500 }
    );
  }
}
