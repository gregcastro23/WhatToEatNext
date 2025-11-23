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

    // Calculate quantities for the past 7 days to see meaningful planetary trends
    // Sample every 4 hours for better resolution (42 data points)
    // This captures the Moon's movement (changes sign every ~2.5 days)
    // and shows daily variation from the Sun and faster planets
    const daysToShow = 7;
    const intervalHours = 4;
    const totalHours = daysToShow * 24;

    for (let i = totalHours; i >= 0; i -= intervalHours) {
      const timePoint = new Date(now.getTime() - i * 60 * 60 * 1000);

      try {
        // Get planetary positions for this specific time
        const planetaryPositions = await getPlanetaryPositionsForDateTime(timePoint);

        // Calculate alchemical properties for this moment
        const alchemicalResult = alchemize(planetaryPositions);

        // Format time - show date for multi-day trends
        const timeLabel =
          i >= 24
            ? timePoint.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
              })
            : timePoint.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });

        trends.push({
          time: timeLabel,
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

    logger.info(`Successfully calculated ${trends.length} trend data points over ${daysToShow} days`);

    return NextResponse.json(
      { trends },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour (longer for historical data)
        },
      }
    );
  } catch (error) {
    logger.error("API Error generating Alchm quantity trends:", error as any);
    return NextResponse.json({ error: "Failed to calculate trends" }, { status: 500 });
  }
}
