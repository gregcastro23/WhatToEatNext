import { NextResponse } from "next/server";
import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import { alchemize } from "@/services/RealAlchemizeService";
import { createLogger } from "@/utils/logger";

const logger = createLogger("AlchmQuantitiesTrendsAPI");

export const dynamic = "force-dynamic";
export const revalidate = 0;

type QuantityPoint = {
  time: string;
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
};

export async function GET() {
  try {
    logger.info("Alchm Quantities Trends API called");

    const trends: QuantityPoint[] = [];
    const now = new Date();

    // Calculate quantities for each hour in the past 24 hours
    // We'll sample every 2 hours to reduce API calls (12 data points)
    for (let i = 23; i >= 0; i -= 2) {
      const timePoint = new Date(now.getTime() - i * 60 * 60 * 1000);

      try {
        // Get planetary positions for this specific time
        const planetaryPositions = await getPlanetaryPositionsForDateTime(timePoint);

        // Calculate alchemical properties for this moment
        const alchemicalResult = alchemize(planetaryPositions);

        trends.push({
          time: timePoint.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          Spirit: alchemicalResult.esms.Spirit,
          Essence: alchemicalResult.esms.Essence,
          Matter: alchemicalResult.esms.Matter,
          Substance: alchemicalResult.esms.Substance,
        });
      } catch (error) {
        logger.error(`Failed to calculate quantities for ${timePoint.toISOString()}:`, error as any);
        // Skip this data point on error
        continue;
      }
    }

    logger.info(`Successfully calculated ${trends.length} trend data points`);

    return NextResponse.json(
      { trends },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300", // Cache for 5 minutes
        },
      }
    );
  } catch (error) {
    logger.error("API Error generating Alchm quantity trends:", error as any);
    return NextResponse.json({ error: "Failed to calculate trends" }, { status: 500 });
  }
}
