/**
 * Commensals API Route
 * GET  /api/user/commensals - List all commensals for the authenticated user
 * POST /api/user/commensals - Add a new commensal with birth data (auto-calculates natal chart)
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { getPlanetaryPositionsForDateTime } from "@/services/astrologizeApi";
import { userDatabase } from "@/services/userDatabaseService";
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
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const user = await userDatabase.getUserById(userId);
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    commensals: user.profile.groupMembers || [],
  });
}

/** POST /api/user/commensals - Add a new commensal */
export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  let user = await userDatabase.getUserById(userId);

  // If userId lookup failed (e.g. Google sub vs DB id mismatch), try email
  if (!user) {
    try {
      const { auth } = await import("@/lib/auth/auth");
      const session = await auth();
      if (session?.user?.email) {
        user = await userDatabase.getUserByEmail(session.user.email);
      }
    } catch {
      // Auth session unavailable
    }
  }

  if (!user) {
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

  const newCommensal: GroupMember = {
    id: `commensal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    relationship: relationship || "friend",
    birthData: natalChart.birthData,
    natalChart,
    createdAt: new Date().toISOString(),
  };

  const existingMembers = user.profile.groupMembers || [];
  const updatedMembers = [...existingMembers, newCommensal];

  await userDatabase.updateUserProfile(userId, { groupMembers: updatedMembers });

  return NextResponse.json({ success: true, commensal: newCommensal }, { status: 201 });
}
