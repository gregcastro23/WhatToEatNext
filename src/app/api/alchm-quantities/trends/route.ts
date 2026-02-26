import { NextResponse } from "next/server";
import { alchemize } from "@/services/RealAlchemizeService";
import { createLogger } from "@/utils/logger";
import { isSectDiurnal } from "@/utils/planetaryAlchemyMapping";
import {
  calculatePlanetaryPositions,
  getFallbackPlanetaryPositions,
} from "@/utils/serverPlanetaryCalculations";

const logger = createLogger("AlchmQuantitiesTrendsAPI");

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TrendPoint {
  time: string;
  /** ISO timestamp of this data point (for client-side formatting) */
  iso: string;
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  /** Elemental totals (shift with sect at sunrise/sunset) */
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  /** Whether this moment is diurnal (day) or nocturnal (night) */
  isDiurnal: boolean;
}

export async function GET() {
  try {
    logger.info("Alchm Quantities Trends API called");

    const trends: TrendPoint[] = [];
    const now = new Date();

    // Sample every 2 hours for 7 days (84 data points).
    // The finer resolution (vs old 4-hour) captures the day/night sect flip
    // which causes dramatic elemental shifts twice daily.
    const daysToShow = 7;
    const intervalHours = 2;
    const totalHours = daysToShow * 24;

    for (let i = totalHours; i >= 0; i -= intervalHours) {
      const timePoint = new Date(now.getTime() - i * 60 * 60 * 1000);

      try {
        // Get planetary positions for this specific time
        let planetaryPositions;
        try {
          planetaryPositions = await calculatePlanetaryPositions(timePoint);
        } catch (calcError) {
          logger.warn(
            `Failed to calculate positions for ${timePoint.toISOString()}, using fallback:`,
            calcError,
          );
          planetaryPositions = getFallbackPlanetaryPositions();
        }

        // Calculate alchemical properties for this moment.
        // CRITICAL: pass timePoint so the sect (day/night) is correct for
        // that historical moment, not always "now".
        const alchemicalResult = alchemize(planetaryPositions, timePoint);

        // Format time label
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

        // Extract raw elemental totals (un-normalized) for the chart.
        // Elemental properties from alchemize are normalized (sum ≈ 1).
        // Scale them up for readability alongside the ESMS integers.
        const ep = alchemicalResult.elementalProperties;
        const totalESMS =
          alchemicalResult.esms.Spirit +
          alchemicalResult.esms.Essence +
          alchemicalResult.esms.Matter +
          alchemicalResult.esms.Substance;
        // Scale so elemental totals are on a comparable axis to ESMS
        const scaleFactor = totalESMS > 0 ? totalESMS : 1;

        trends.push({
          time: timeLabel,
          iso: timePoint.toISOString(),
          Spirit: parseFloat(alchemicalResult.esms.Spirit.toFixed(2)),
          Essence: parseFloat(alchemicalResult.esms.Essence.toFixed(2)),
          Matter: parseFloat(alchemicalResult.esms.Matter.toFixed(2)),
          Substance: parseFloat(alchemicalResult.esms.Substance.toFixed(2)),
          Fire: parseFloat((ep.Fire * scaleFactor).toFixed(2)),
          Water: parseFloat((ep.Water * scaleFactor).toFixed(2)),
          Earth: parseFloat((ep.Earth * scaleFactor).toFixed(2)),
          Air: parseFloat((ep.Air * scaleFactor).toFixed(2)),
          isDiurnal: isSectDiurnal(timePoint),
        });
      } catch (error) {
        logger.error(
          `Failed to calculate quantities for ${timePoint.toISOString()}:`,
          error as any,
        );
        continue;
      }
    }

    logger.info(
      `Successfully calculated ${trends.length} trend data points over ${daysToShow} days`,
    );

    return NextResponse.json(
      { trends },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error("API Error generating Alchm quantity trends:", {
      error: errorMessage,
      stack: errorStack,
    });
    return NextResponse.json(
      {
        error: "Failed to calculate trends",
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
