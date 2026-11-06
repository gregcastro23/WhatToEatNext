/**
 * GET /api/alchm-quantities/echoes?planet=Sun[&ref=ISO][&year=YYYY]
 *
 * Returns the historical moment when the requested planet was at the same
 * longitude it occupies at `ref` (default: now), refined to ~1 arc-minute
 * precision. For planet=Sun, returns the 1-year Solar Return with full chart
 * placements and curated cuisine matches. For outer planets (Pluto, Neptune,
 * Uranus, Saturn, Jupiter), returns the deep historical epoch return.
 *
 * planet=Sun extras:
 *   - `year=YYYY` targets the Solar Return in that past calendar year (the
 *     moment the Sun stood at today's exact degree — "this day" in YYYY)
 *     instead of the default 1 year ago.
 *   - `recipes` — top catalog recipes for the return chart's cuisine matches.
 */
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import {
  ECHO_PLANETS,
  SOLAR_RETURN_MIN_YEAR,
  findOuterPlanetEcho,
  findSolarReturnForYear,
  getEchoFileMeta,
  getZodiacSeason,
  type EchoPlanet,
  type HistoricalEchoResult,
} from "@/utils/historicalEchoFinder";
import { createLogger } from "@/utils/logger";
import { pickSolarReturnRecipes, type SolarReturnRecipe } from "@/utils/solarReturnRecipes";

const logger = createLogger("AlchmQuantitiesEchoesAPI");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

function isEchoPlanet(value: string | null): value is EchoPlanet {
  return value !== null && (ECHO_PLANETS as readonly string[]).includes(value);
}

const RATE_LIMIT = { window: 60_000, max: 30, bucket: "alchm-quantities-echoes" };
const RECIPE_LOOKUP_TIMEOUT_MS = 4_000;

/** Best-effort recipe lookup — never fails the echo response. */
async function recipesForSolarReturn(echo: HistoricalEchoResult): Promise<SolarReturnRecipe[]> {
  if (!echo.cuisineMatches?.length) return [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const catalog = await Promise.race([
      LocalRecipeService.getAllRecipes(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("recipe lookup timed out")), RECIPE_LOOKUP_TIMEOUT_MS);
      }),
    ]);
    return pickSolarReturnRecipes(
      catalog,
      echo.cuisineMatches,
      echo.echo.alchemical.elementalProperties,
      getZodiacSeason(echo.echo.sign),
      echo.echo.iso.slice(0, 10),
    );
  } catch (error) {
    logger.warn("Solar return recipe lookup failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function parseRefDate(refParam: string | null): Date {
  if (!refParam) return new Date();
  const ms = Date.parse(refParam);
  return Number.isFinite(ms) ? new Date(ms) : new Date();
}

function parseTargetYear(
  yearParam: string | null,
  planet: EchoPlanet,
  refDate: Date,
): { targetYear: number | null; error?: string } {
  if (yearParam === null || yearParam === "") return { targetYear: null };
  const maxYear = refDate.getUTCFullYear() - 1;
  const parsed = Number(yearParam);
  if (planet !== "Sun") {
    return { targetYear: null, error: "`year` is only supported for planet=Sun" };
  }
  if (!Number.isInteger(parsed) || parsed < SOLAR_RETURN_MIN_YEAR || parsed > maxYear) {
    return {
      targetYear: null,
      error: `\`year\` must be an integer between ${SOLAR_RETURN_MIN_YEAR} and ${maxYear}`,
    };
  }
  return { targetYear: parsed };
}

export async function GET(request: Request): Promise<Response> {
  const rl = await rateLimit(request, RATE_LIMIT);
  if (!rl.allowed) return rl.response!;

  try {
    const url = new URL(request.url);
    const planetParam = url.searchParams.get("planet");
    const planet: EchoPlanet = isEchoPlanet(planetParam) ? planetParam : "Pluto";
    const refDate = parseRefDate(url.searchParams.get("ref"));
    const { targetYear, error } = parseTargetYear(url.searchParams.get("year"), planet, refDate);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const echo =
      targetYear !== null
        ? await findSolarReturnForYear(targetYear, refDate)
        : await findOuterPlanetEcho(planet, refDate);

    const recipes = planet === "Sun" ? await recipesForSolarReturn(echo) : undefined;

    return NextResponse.json(
      {
        success: true,
        file: getEchoFileMeta(),
        echo,
        ...(recipes ? { recipes } : {}),
      },
      {
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
