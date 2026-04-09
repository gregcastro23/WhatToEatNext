/**
 * User Charts (Cosmic Identities) API Route
 * GET  /api/user/charts - List all saved charts for the user
 * POST /api/user/charts - Create a new cosmic identity chart
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { userDatabase } from "@/services/userDatabaseService";
import type { Planet, ZodiacSignType, Element, Modality } from "@/types/celestial";
import type {
  BirthData,
  NatalChart,
  PlanetInfo,
  SavedChart,
  GroupMember,
} from "@/types/natalChart";
import { 
  calculateEnhancedAlchemicalFromPlanets,
  aggregateEnhancedZodiacElementals,
  isSectDiurnal
} from "@/utils/planetaryAlchemyMapping";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SIGN_TO_ELEMENT: Record<ZodiacSignType, Element> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

const SIGN_TO_MODALITY: Record<ZodiacSignType, Modality> = {
  aries: "Cardinal", cancer: "Cardinal", libra: "Cardinal", capricorn: "Cardinal",
  taurus: "Fixed", leo: "Fixed", scorpio: "Fixed", aquarius: "Fixed",
  gemini: "Mutable", virgo: "Mutable", sagittarius: "Mutable", pisces: "Mutable",
};

function calcDominantElement(positions: Record<Planet, ZodiacSignType>): Element {
  const counts: Record<Element, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  Object.values(positions).forEach((sign) => {
    const el = SIGN_TO_ELEMENT[sign];
    if (el) counts[el]++;
  });
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as Element;
}

function calcDominantModality(positions: Record<Planet, ZodiacSignType>): Modality {
  const counts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  Object.values(positions).forEach((sign) => {
    const m = SIGN_TO_MODALITY[sign];
    if (m) counts[m]++;
  });
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as Modality;
}

function hasMissingPlanetPrecision(chart: SavedChart): boolean {
  const planets = chart.natalChart?.planets || [];
  return planets.some(
    (planet) =>
      planet.name !== "Ascendant" &&
      (!Number.isFinite(planet.position) || planet.position <= 0),
  );
}

async function ensureSubArcminutePrecision(chart: SavedChart): Promise<SavedChart> {
  if (!hasMissingPlanetPrecision(chart)) return chart;

  try {
    const birthDate = new Date(chart.birthData.dateTime);
    if (Number.isNaN(birthDate.getTime())) return chart;

    const rawPositions = await getPlanetaryPositionsForDateTime(birthDate, {
      latitude: chart.birthData.latitude,
      longitude: chart.birthData.longitude,
    });

    const updatedPlanets = (chart.natalChart.planets || []).map((planet) => {
      const raw = rawPositions[planet.name];
      if (!raw || typeof raw.exactLongitude !== "number") return planet;
      return {
        ...planet,
        position: raw.exactLongitude,
        sign: raw.sign || planet.sign,
      };
    });

    const updatedPlanetaryPositions = { ...chart.natalChart.planetaryPositions };
    Object.entries(rawPositions).forEach(([planetName, value]) => {
      if (value?.sign) {
        updatedPlanetaryPositions[planetName as Planet] = value.sign;
      }
    });

    return {
      ...chart,
      natalChart: {
        ...chart.natalChart,
        planets: updatedPlanets,
        planetaryPositions: updatedPlanetaryPositions,
      },
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return chart;
  }
}

function toManualSavedChart(ownerId: string, member: GroupMember): SavedChart {
  return {
    id: member.id,
    ownerId,
    label: member.name,
    chartType: "manual",
    birthData: member.birthData,
    natalChart: member.natalChart,
    isPrimary: false,
    createdAt: member.createdAt,
    updatedAt: member.createdAt,
  };
}


/** GET /api/user/charts */
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const [savedChartsFromDb, manualCompanionsFromDb, user] = await Promise.all([
    commensalDatabase.getSavedChartsForUser(userId),
    commensalDatabase.getManualCompanionsForUser(userId),
    userDatabase.getUserById(userId),
  ]);

  // Backward-compatible support for legacy charts still stored in profile JSON.
  const legacySavedCharts = Array.isArray((user?.profile as any)?.savedCharts)
    ? ((user?.profile as any).savedCharts as SavedChart[])
    : [];
  const legacyManualMembers = Array.isArray((user?.profile as any)?.groupMembers)
    ? ((user?.profile as any).groupMembers as GroupMember[])
    : [];

  const combined = [
    ...savedChartsFromDb,
    ...legacySavedCharts,
    ...manualCompanionsFromDb.map((member) => toManualSavedChart(userId, member)),
    ...legacyManualMembers.map((member) => toManualSavedChart(userId, member)),
  ];

  const deduped = Array.from(
    new Map(combined.map((chart) => [chart.id, chart])).values(),
  );

  const hydratedCharts = await Promise.all(
    deduped.map((chart) => ensureSubArcminutePrecision(chart)),
  );

  // Primary first, then cosmic identities, then manual charts, newest first.
  hydratedCharts.sort((a, b) => {
    const score = (chart: SavedChart) =>
      (chart.isPrimary ? 100 : 0) +
      (chart.chartType === "cosmic_identity" ? 10 : 0) +
      new Date(chart.updatedAt).getTime() / 1e12;
    return score(b) - score(a);
  });

  return NextResponse.json({ success: true, charts: hydratedCharts });
}

/** POST /api/user/charts - Create a new cosmic identity */
export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON in request body" },
      { status: 400 },
    );
  }
  const { label, birthData } = body as {
    label?: string;
    birthData?: BirthData;
  };

  if (!label || !birthData?.dateTime || birthData.latitude === undefined || birthData.longitude === undefined) {
    return NextResponse.json(
      { success: false, message: "label, birthData.dateTime, latitude, and longitude are required" },
      { status: 400 },
    );
  }

  // Calculate natal chart
  const birthDate = new Date(birthData.dateTime);
  let rawPositions;
  try {
    rawPositions = await getPlanetaryPositionsForDateTime(birthDate, {
      latitude: birthData.latitude,
      longitude: birthData.longitude,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Planetary calculation service unavailable. Please try again later." },
      { status: 503 },
    );
  }

  const positions: Record<Planet, ZodiacSignType> = {
    Sun: rawPositions.Sun?.sign,
    Moon: rawPositions.Moon?.sign,
    Mercury: rawPositions.Mercury?.sign,
    Venus: rawPositions.Venus?.sign,
    Mars: rawPositions.Mars?.sign,
    Jupiter: rawPositions.Jupiter?.sign,
    Saturn: rawPositions.Saturn?.sign,
    Uranus: rawPositions.Uranus?.sign,
    Neptune: rawPositions.Neptune?.sign,
    Pluto: rawPositions.Pluto?.sign,
    Ascendant: rawPositions.Ascendant?.sign || "aries",
  };

  const planets: PlanetInfo[] = Object.entries(positions).map(([pname, sign]) => ({
    name: pname as Planet,
    sign,
    position: rawPositions[pname]?.exactLongitude ?? 0,
  }));

  const diurnal = isSectDiurnal(birthDate);

  const natalChart: NatalChart = {
    birthData: { dateTime: birthData.dateTime, latitude: birthData.latitude, longitude: birthData.longitude, timezone: birthData.timezone },
    planets,
    ascendant: positions.Ascendant,
    planetaryPositions: positions,
    dominantElement: calcDominantElement(positions),
    dominantModality: calcDominantModality(positions),
    elementalBalance: aggregateEnhancedZodiacElementals(positions, diurnal),
    alchemicalProperties: calculateEnhancedAlchemicalFromPlanets(positions, diurnal),
    calculatedAt: new Date().toISOString(),
  };

  const chart = await commensalDatabase.createSavedChart({
    ownerId: userId,
    label,
    chartType: "cosmic_identity",
    birthData: natalChart.birthData,
    natalChart,
  });

  if (!chart) {
    return NextResponse.json(
      { success: false, message: "Failed to save chart" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, chart }, { status: 201 });
}
