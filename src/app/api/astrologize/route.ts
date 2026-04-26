/**
 * Astrologize API Route
 *
 * Primary: Calls Railway backend (pyswisseph - NASA JPL DE precision)
 * Fallback: Uses local astronomy-engine library
 *
 * GET  /api/astrologize?latitude=40.7&longitude=-73.8&zodiacSystem=tropical
 * POST /api/astrologize { year, month, date, hour, minute, latitude, longitude, zodiacSystem }
 */

import { NextResponse } from "next/server";
import {
  parseRailwayResponse,
  PlanetaryRequestSchema,
  type PlanetaryRequest,
  type RailwayPositionsResponse,
  type RailwayPlanetData,
} from "@/lib/validation/railway";
import { getAccuratePlanetaryPositions, getSignFromLongitude } from "@/utils/astrology/positions";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const RAILWAY_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

// ─── Shared response body shape ──────────────────────────────────────────────

interface ArcDegrees {
  degrees: number;
  minutes: number;
  seconds: number;
}

interface CelestialBody {
  key: string;
  label: string;
  Sign: { key: string; zodiac: string; label: string };
  ChartPosition: { Ecliptic: { DecimalDegrees: number; ArcDegrees: ArcDegrees } };
  isRetrograde: boolean;
}

interface AscendantData {
  sign: string;
  degree: number;
  minute: number;
  exactLongitude: number;
}

interface AstrologizeResponse {
  success: boolean;
  _celestialBodies: { all: CelestialBody[] } & Record<string, CelestialBody | CelestialBody[]>;
  ascendant?: AscendantData;
  birth_info: {
    year: number;
    month: number;
    date: number;
    hour: number;
    minute: number;
    latitude: number;
    longitude: number;
    ayanamsa: string;
  };
  source: string;
  precision: string;
}

// ─── Railway backend ──────────────────────────────────────────────────────────

/**
 * Try Railway backend first for high-precision pyswisseph calculations.
 * Returns null if Railway is unavailable or returns an unexpected shape.
 */
async function fetchFromRailway(params: PlanetaryRequest): Promise<RailwayPositionsResponse | null> {
  if (!RAILWAY_URL) return null;

  try {
    const response = await fetch(`${RAILWAY_URL}/api/planetary/positions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
      },
      body: JSON.stringify({
        year: params.year,
        month: params.month,
        day: params.date ?? params.day,
        hour: params.hour,
        minute: params.minute,
        latitude: params.latitude,
        longitude: params.longitude,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      console.error(`Railway backend error: ${response.status}`);
      return null;
    }

    const raw: unknown = await response.json();
    return parseRailwayResponse(raw);
  } catch (error) {
    console.error(
      "Railway backend unavailable:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/**
 * Convert Railway backend response to the _celestialBodies format
 * that the frontend expects.
 */
function formatRailwayResponse(
  railwayData: RailwayPositionsResponse,
  params: PlanetaryRequest,
): AstrologizeResponse {
  const planetKeys = [
    "sun", "moon", "mercury", "venus", "mars",
    "jupiter", "saturn", "uranus", "neptune", "pluto",
  ];

  const bodies: Record<string, CelestialBody> = {};
  const allBodies: CelestialBody[] = [];

  const positionsData =
    railwayData.planetary_positions ??
    railwayData.positions ??
    (railwayData as Record<string, RailwayPlanetData>);

  for (const key of planetKeys) {
    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
    const planetData =
      (positionsData)[key] ??
      (positionsData)[capitalizedKey];
    if (!planetData || typeof planetData !== "object") continue;

    const pd = planetData;
    const longitude =
      pd.exactLongitude ??
      pd.longitude ??
      pd.eclipticLongitude ??
      0;

    const { sign, degree: degreeInSign } = getSignFromLongitude(longitude);
    const degrees = Math.floor(degreeInSign);
    const minutes = Math.floor((degreeInSign - degrees) * 60);
    const seconds = Math.round(((degreeInSign - degrees) * 60 - minutes) * 60);

    const body: CelestialBody = {
      key,
      label: capitalizedKey,
      Sign: {
        key: sign,
        zodiac: sign,
        label: sign.charAt(0).toUpperCase() + sign.slice(1),
      },
      ChartPosition: {
        Ecliptic: {
          DecimalDegrees: longitude,
          ArcDegrees: { degrees, minutes, seconds },
        },
      },
      isRetrograde: Boolean(pd.isRetrograde ?? pd.retrograde ?? false),
    };

    bodies[key] = body;
    allBodies.push(body);
  }

  // Extract Ascendant if the backend computed it (added via PySwisseph modifications)
  let ascendant: AscendantData | undefined;
  const positionsRecord = positionsData;
  const ascData =
    (positionsRecord.Ascendant as RailwayPlanetData | undefined) ??
    (positionsRecord.ascendant as RailwayPlanetData | undefined);

  if (ascData) {
    const ascLong =
      ascData.exactLongitude ??
      ascData.longitude ??
      ascData.eclipticLongitude ??
      0;
    const { sign: ascSign, degree: ascDeg } = getSignFromLongitude(ascLong);
    ascendant = {
      sign: ascSign,
      degree: Math.floor(ascDeg),
      minute: Math.floor((ascDeg - Math.floor(ascDeg)) * 60),
      exactLongitude: ascLong,
    };
  }

  return {
    success: true,
    _celestialBodies: { all: allBodies, ...bodies },
    ascendant,
    birth_info: {
      year: params.year,
      month: params.month,
      date: params.date ?? params.day ?? 1,
      hour: params.hour,
      minute: params.minute,
      latitude: params.latitude ?? 0,
      longitude: params.longitude ?? 0,
      ayanamsa: params.zodiacSystem === "sidereal" ? "LAHIRI" : "TROPICAL",
    },
    source: "backend-pyswisseph",
    precision: "NASA JPL DE",
  };
}

// ─── Local fallback ───────────────────────────────────────────────────────────

function calculateLocally(params: PlanetaryRequest): AstrologizeResponse {
  const date = new Date(
    Date.UTC(
      params.year,
      params.month - 1,
      params.date ?? params.day ?? 1,
      params.hour,
      params.minute,
    ),
  );
  const positions = getAccuratePlanetaryPositions(date);

  const planetKeys = [
    "Sun", "Moon", "Mercury", "Venus", "Mars",
    "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  ];
  const allBodies: CelestialBody[] = [];
  const bodies: Record<string, CelestialBody> = {};

  for (const key of planetKeys) {
    const pos = positions[key];
    if (!pos) continue;

    const apiKey = key.toLowerCase();
    const degrees = Math.floor(pos.degree);
    const minutes = Math.floor((pos.degree - degrees) * 60);
    const seconds = Math.round(((pos.degree - degrees) * 60 - minutes) * 60);

    const body: CelestialBody = {
      key: apiKey,
      label: key,
      Sign: {
        key: typeof pos.sign === "string" ? pos.sign : "aries",
        zodiac: typeof pos.sign === "string" ? pos.sign : "aries",
        label:
          typeof pos.sign === "string"
            ? pos.sign.charAt(0).toUpperCase() + pos.sign.slice(1)
            : "Aries",
      },
      ChartPosition: {
        Ecliptic: {
          DecimalDegrees: pos.exactLongitude,
          ArcDegrees: { degrees, minutes, seconds },
        },
      },
      isRetrograde: pos.isRetrograde,
    };

    bodies[apiKey] = body;
    allBodies.push(body);
  }

  let ascendant: AscendantData | undefined;
  if (positions.Ascendant) {
    const asc = positions.Ascendant;
    ascendant = {
      sign: typeof asc.sign === "string" ? asc.sign : "aries",
      degree: Math.floor(asc.degree),
      minute: Math.floor((asc.degree - Math.floor(asc.degree)) * 60),
      exactLongitude: asc.exactLongitude,
    };
  }

  return {
    success: true,
    _celestialBodies: { all: allBodies, ...bodies },
    ascendant,
    birth_info: {
      year: params.year,
      month: params.month,
      date: params.date ?? params.day ?? 1,
      hour: params.hour,
      minute: params.minute,
      latitude: params.latitude ?? 0,
      longitude: params.longitude ?? 0,
      ayanamsa: "TROPICAL",
    },
    source: "astronomy-engine",
    precision: "sub-arcminute",
  };
}

// ─── Query-string parser ──────────────────────────────────────────────────────

function parseParams(searchParams: URLSearchParams): PlanetaryRequest {
  const now = new Date();
  const parseOptionalInt = (value: string | null): number | undefined => {
    if (value === null || value.trim() === "") return undefined;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };
  const parseOptionalFloat = (value: string | null): number | undefined => {
    if (value === null || value.trim() === "") return undefined;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  return PlanetaryRequestSchema.parse({
    year: parseOptionalInt(searchParams.get("year")) ?? now.getUTCFullYear(),
    month: parseOptionalInt(searchParams.get("month")) ?? now.getUTCMonth() + 1,
    date: parseOptionalInt(searchParams.get("date") ?? searchParams.get("day")) ?? now.getUTCDate(),
    hour: parseOptionalInt(searchParams.get("hour")) ?? now.getUTCHours(),
    minute: parseOptionalInt(searchParams.get("minute")) ?? now.getUTCMinutes(),
    latitude: parseOptionalFloat(searchParams.get("latitude")),
    longitude: parseOptionalFloat(searchParams.get("longitude")),
    zodiacSystem: (searchParams.get("zodiacSystem") as "tropical" | "sidereal") || "tropical",
  });
}

// ─── Route handlers ───────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = parseParams(searchParams);

  const railwayData = await fetchFromRailway(params);
  if (railwayData) return NextResponse.json(formatRailwayResponse(railwayData, params));

  return NextResponse.json(calculateLocally(params));
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const parsed = PlanetaryRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "year, month, and date are required for POST calculations",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const params = parsed.data;

    const railwayData = await fetchFromRailway(params);
    if (railwayData) return NextResponse.json(formatRailwayResponse(railwayData, params));

    return NextResponse.json(calculateLocally(params));
  } catch (error) {
    console.error("Astrologize API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate planetary positions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
