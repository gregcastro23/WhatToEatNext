/**
 * Commensals API Route
 * GET  /api/user/commensals - List all commensals for the authenticated user
 * POST /api/user/commensals - Add a new commensal with birth data (auto-calculates natal chart)
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import { commensalDatabase } from "@/services/commensalDatabaseService";

import type { Planet, ZodiacSignType, Element, Modality } from "@/types/celestial";
import type { BirthData, NatalChart, PlanetInfo, GroupMember } from "@/types/natalChart";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
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
  return (Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as Element);
}

function calcDominantModality(positions: Record<Planet, ZodiacSignType>): Modality {
  const counts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  Object.values(positions).forEach((sign) => {
    const m = SIGN_TO_MODALITY[sign];
    if (m) counts[m]++;
  });
  return (Object.entries(counts).sort(([, a], [, b]) => b - a)[0][0] as Modality);
}

function calcElementalBalance(positions: Record<Planet, ZodiacSignType>) {
  const counts: Record<Element, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  Object.values(positions).forEach((sign) => {
    const el = SIGN_TO_ELEMENT[sign];
    if (el) counts[el]++;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return {
    Fire: counts.Fire / total,
    Water: counts.Water / total,
    Earth: counts.Earth / total,
    Air: counts.Air / total,
  };
}

/** GET /api/user/commensals */
export async function GET(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    _logger.warn("[GET /api/user/commensals] User not found or not authenticated");
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  const legacyManual = user.profile.groupMembers || [];
  const [newManual, linked] = await Promise.all([
    commensalDatabase.getManualCompanionsForUser(user.id),
    commensalDatabase.getLinkedCommensalsForUser(user.id),
  ]);

  // Combine manual companions (filtering out any that might have been migrated to the table but still exist in JSONB)
  const combinedManual = [...newManual];
  legacyManual.forEach(leg => {
    if (!combinedManual.some(m => m.id === leg.id)) {
      combinedManual.push(leg);
    }
  });

  return NextResponse.json({
    success: true,
    commensals: combinedManual,
    linkedCommensals: linked,
    totalCount: combinedManual.length + linked.length,
  });
}

/** POST /api/user/commensals - Add a new commensal */
export async function POST(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);

  if (!user) {
    _logger.warn("[POST /api/user/commensals] User not found or not authenticated");
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
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
  const { name, relationship, birthData } = body as {
    name: string;
    relationship?: GroupMember["relationship"];
    birthData: BirthData;
  };

  if (!name || !birthData?.dateTime || birthData.latitude === undefined || birthData.longitude === undefined) {
    return NextResponse.json(
      { success: false, message: "name, birthData.dateTime, latitude, and longitude are required" },
      { status: 400 },
    );
  }

  // Calculate natal chart for the commensal
  const birthDate = new Date(birthData.dateTime);
  let rawPositions;
  try {
    rawPositions = await getPlanetaryPositionsForDateTime(birthDate, {
      latitude: birthData.latitude,
      longitude: birthData.longitude,
    });
  } catch (error) {
    _logger.error("[POST /api/user/commensals] Planetary calculation failed", error as any);
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

  const natalChart: NatalChart = {
    birthData: { dateTime: birthData.dateTime, latitude: birthData.latitude, longitude: birthData.longitude, timezone: birthData.timezone },
    planets,
    ascendant: positions.Ascendant,
    planetaryPositions: positions,
    dominantElement: calcDominantElement(positions),
    dominantModality: calcDominantModality(positions),
    elementalBalance: calcElementalBalance(positions),
    alchemicalProperties: calculateAlchemicalFromPlanets(positions),
    calculatedAt: new Date().toISOString(),
  };

  try {
    const created = await commensalDatabase.createManualCompanion({
      ownerId: user.id,
      name,
      relationship: relationship || "friend",
      birthData: natalChart.birthData,
      natalChart,
    });

    if (!created) {
      throw new Error("Database insertion failed");
    }

    return NextResponse.json({ success: true, commensal: created }, { status: 201 });
  } catch (error) {
    _logger.error("[POST /api/user/commensals] Failed to create companion", error as any);
    return NextResponse.json({ success: false, message: "Failed to save companion chart" }, { status: 500 });
  }
}
