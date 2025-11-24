import { NextResponse } from "next/server";
import { calculatePlanetaryPositions } from "@/app/api/astrologize/route";
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

    // Get current planetary positions - using direct calculation instead of HTTP request
    const planetaryPositions = await calculatePlanetaryPositions(new Date(), "tropical");

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

    // Calculate kinetics based on actual alchemical properties
    // Velocity: Rate of change based on thermodynamic gradients
    // Using reactivity as the driving force and heat/entropy as constraints
    const { heat, entropy, reactivity, gregsEnergy } =
      alchemicalResult.thermodynamicProperties;

    // Base velocity factor from thermodynamic state
    const velocityFactor = reactivity * (1 + Math.abs(gregsEnergy) / 10);

    // Velocity: Each quantity's tendency to change based on its relative strength
    const totalQuantity =
      quantities.Spirit + quantities.Essence + quantities.Matter + quantities.Substance;
    const kinetics: KineticData = {
      velocity: {
        Spirit:
          ((quantities.Spirit / totalQuantity - 0.25) * velocityFactor * heat) / 10,
        Essence:
          ((quantities.Essence / totalQuantity - 0.25) * velocityFactor * (1 - entropy)) /
          10,
        Matter:
          ((quantities.Matter / totalQuantity - 0.25) * velocityFactor * (1 / reactivity)) /
          10,
        Substance:
          ((quantities.Substance / totalQuantity - 0.25) *
            velocityFactor *
            (heat + entropy)) /
          20,
      },
      acceleration: {
        Spirit: (gregsEnergy * heat) / 100,
        Essence: (gregsEnergy * (1 - entropy)) / 100,
        Matter: (-gregsEnergy * reactivity) / 100,
        Substance: (gregsEnergy * (heat - entropy)) / 100,
      },
      momentum: {
        Spirit:
          quantities.Spirit *
          ((quantities.Spirit / totalQuantity - 0.25) * velocityFactor * heat) /
          10,
        Essence:
          quantities.Essence *
          ((quantities.Essence / totalQuantity - 0.25) * velocityFactor * (1 - entropy)) /
          10,
        Matter:
          quantities.Matter *
          ((quantities.Matter / totalQuantity - 0.25) * velocityFactor * (1 / reactivity)) /
          10,
        Substance:
          quantities.Substance *
          ((quantities.Substance / totalQuantity - 0.25) *
            velocityFactor *
            (heat + entropy)) /
          20,
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
