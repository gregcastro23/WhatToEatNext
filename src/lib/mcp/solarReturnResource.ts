/**
 * @file src/lib/mcp/solarReturnResource.ts
 *
 * Dedicated resolver for alchm://solar-return/{year} MCP resources.
 */
import { LocalRecipeService } from "@/services/LocalRecipeService";
import {
  findSolarReturnForYear,
  getZodiacSeason,
  SOLAR_RETURN_MIN_YEAR,
} from "@/utils/historicalEchoFinder";
import { pickSolarReturnRecipes } from "@/utils/solarReturnRecipes";
import type { ResourceContents } from "./resourceCatalog";

function makeTextResult(uri: string, payload: unknown): { contents: ResourceContents[] } {
  return {
    contents: [
      {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

async function loadSolarReturnRecipes(echo: Awaited<ReturnType<typeof findSolarReturnForYear>>) {
  if (!echo.cuisineMatches?.length) return [];
  const catalog = await LocalRecipeService.getAllRecipes().catch(() => []);
  return pickSolarReturnRecipes(
    catalog,
    echo.cuisineMatches,
    echo.echo.alchemical.elementalProperties,
    getZodiacSeason(echo.echo.sign),
    echo.echo.iso.slice(0, 10),
    6,
  );
}

export async function readSolarReturnResource(
  uri: string,
): Promise<{ contents: ResourceContents[] }> {
  const yearStr = uri.replace("alchm://solar-return/", "").trim();
  const year = Number(yearStr);
  const maxYear = new Date().getUTCFullYear() - 1;

  if (!Number.isInteger(year) || year < SOLAR_RETURN_MIN_YEAR || year > maxYear) {
    return makeTextResult(uri, {
      error: "Invalid solar return year",
      requestedYear: yearStr,
      validRange: { min: SOLAR_RETURN_MIN_YEAR, max: maxYear },
      remediation: `Provide an integer year between ${SOLAR_RETURN_MIN_YEAR} and ${maxYear}.`,
    });
  }

  try {
    const echo = await findSolarReturnForYear(year);
    const recipes = await loadSolarReturnRecipes(echo);

    return makeTextResult(uri, {
      year,
      echo: {
        planet: echo.planet,
        moment: echo.echo.iso,
        yearsAgo: echo.echo.yearsAgo,
        sign: echo.echo.sign,
        degree: echo.echo.degree,
        minute: echo.echo.minute,
        alchemical: echo.echo.alchemical,
      },
      cuisineMatches: echo.cuisineMatches ?? [],
      recipes,
      resourceUri: uri,
    });
  } catch (error) {
    return makeTextResult(uri, {
      error: "Failed to compute solar return",
      year,
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
