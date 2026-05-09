/**
 * GET /api/alchm-quantities/echoes?planet=Pluto[&ref=ISO]
 *
 * Returns the historical moment when the requested outer planet was at the
 * same longitude it occupies at `ref` (default: now), refined to ~1
 * arc-minute precision. Includes the full chart and alchemical state at the
 * echo moment for direct comparison.
 *
 * Defaults to Pluto since its 248-year orbit means each return is unique
 * within recorded history.
 */
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import {
  ECHO_PLANETS,
  findOuterPlanetEcho,
  getEchoFileMeta,
  type EchoPlanet,
} from "@/utils/historicalEchoFinder";
import { createLogger } from "@/utils/logger";

const logger = createLogger("AlchmQuantitiesEchoesAPI");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

function isEchoPlanet(value: string | null): value is EchoPlanet {
  return value !== null && (ECHO_PLANETS as readonly string[]).includes(value);
}

const RATE_LIMIT = { window: 60_000, max: 30, bucket: "alchm-quantities-echoes" };

export async function GET(request: Request) {
  const rl = rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const url = new URL(request.url);
    const planetParam = url.searchParams.get("planet");
    const refParam = url.searchParams.get("ref");

    const planet: EchoPlanet = isEchoPlanet(planetParam) ? planetParam : "Pluto";
    const refDate = (() => {
      if (!refParam) return new Date();
      const ms = Date.parse(refParam);
      return Number.isFinite(ms) ? new Date(ms) : new Date();
    })();

    const echo = await findOuterPlanetEcho(planet, refDate);

    return NextResponse.json(
      {
        success: true,
        file: getEchoFileMeta(),
        echo,
      },
      {
        // Echoes shift slowly — Pluto stays within 1° for weeks. 1h cache.
        headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Failed to compute historical echo", { error: message });
    return NextResponse.json(
      { success: false, error: "Failed to compute historical echo", details: message },
      { status: 500 },
    );
  }
}
