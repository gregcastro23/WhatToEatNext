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
import type { NextRequest } from "next/server";
import { getAccuratePlanetaryPositions, getSignFromLongitude } from "@/utils/astrology/positions";

export const dynamic = "force-dynamic";

const RAILWAY_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

interface PlanetaryRequest {
  year: number;
  month: number;
  date: number;
  hour: number;
  minute: number;
  latitude?: number;
  longitude?: number;
  zodiacSystem?: "tropical" | "sidereal";
}

/**
 * Try Railway backend first for high-precision pyswisseph calculations.
 * Returns null if Railway is unavailable.
 */
async function fetchFromRailway(params: PlanetaryRequest) {
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
        day: params.date,
        hour: params.hour,
        minute: params.minute,
        latitude: params.latitude,
        longitude: params.longitude,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.error(`Railway backend error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Railway backend unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Convert Railway backend response to the _celestialBodies format
 * that the frontend expects.
 */
function formatRailwayResponse(railwayData: any, params: PlanetaryRequest) {
  const planetKeys = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

  const bodies: Record<string, any> = {};
  const allBodies: any[] = [];

  for (const key of planetKeys) {
    const planetData = railwayData[key] || railwayData[key.charAt(0).toUpperCase() + key.slice(1)];
    if (!planetData) continue;

    const longitude = planetData.longitude ?? planetData.eclipticLongitude ?? 0;
    const { sign, degree: degreeInSign } = getSignFromLongitude(longitude);
    const degrees = Math.floor(degreeInSign);
    const minutes = Math.floor((degreeInSign - degrees) * 60);
    const seconds = Math.floor(((degreeInSign - degrees) * 60 - minutes) * 60);

    const body = {
      key: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
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
      isRetrograde: planetData.isRetrograde ?? planetData.retrograde ?? false,
    };

    bodies[key] = body;
    allBodies.push(body);
  }

  // Extract Ascendant if the backend computed it
  let ascendant: { sign: string; degree: number; minute: number; exactLongitude: number } | undefined;
  if (railwayData.ascendant) {
    const ascLong = railwayData.ascendant.longitude ?? railwayData.ascendant.eclipticLongitude ?? 0;
    const { sign: ascSign, degree: ascDeg } = getSignFromLongitude(ascLong);
    ascendant = {
      sign: ascSign,
      degree: Math.floor(ascDeg),
      minute: Math.floor((ascDeg - Math.floor(ascDeg)) * 60),
      exactLongitude: ascLong,
    };
  }

  return {
    _celestialBodies: {
      all: allBodies,
      ...bodies,
    },
    ascendant,
    birth_info: {
      year: params.year,
      month: params.month,
      date: params.date,
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

/**
 * Fall back to local astronomy-engine calculations.
 */
function calculateLocally(params: PlanetaryRequest) {
  const date = new Date(params.year, params.month - 1, params.date, params.hour, params.minute);
  const positions = getAccuratePlanetaryPositions(date);

  const planetKeys = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
  const allBodies: any[] = [];
  const bodies: Record<string, any> = {};

  for (const key of planetKeys) {
    const pos = positions[key];
    if (!pos) continue;

    const apiKey = key.toLowerCase();
    const degrees = Math.floor(pos.degree);
    const minutes = Math.floor((pos.degree - degrees) * 60);
    const seconds = Math.floor(((pos.degree - degrees) * 60 - minutes) * 60);

    const body = {
      key: apiKey,
      label: key,
      Sign: {
        key: typeof pos.sign === "string" ? pos.sign : "aries",
        zodiac: typeof pos.sign === "string" ? pos.sign : "aries",
        label: typeof pos.sign === "string"
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

  // Calculate Ascendant from positions if available
  let ascendant: { sign: string; degree: number; minute: number; exactLongitude: number } | undefined;
  if (positions.Ascendant) {
    ascendant = {
      sign: typeof positions.Ascendant.sign === "string" ? positions.Ascendant.sign : "aries",
      degree: Math.floor(positions.Ascendant.degree),
      minute: Math.floor((positions.Ascendant.degree - Math.floor(positions.Ascendant.degree)) * 60),
      exactLongitude: positions.Ascendant.exactLongitude,
    };
  }

  return {
    _celestialBodies: {
      all: allBodies,
      ...bodies,
    },
    ascendant,
    birth_info: {
      year: params.year,
      month: params.month,
      date: params.date,
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

function parseParams(searchParams: URLSearchParams): PlanetaryRequest {
  const now = new Date();
  return {
    year: parseInt(searchParams.get("year") || "") || now.getFullYear(),
    month: parseInt(searchParams.get("month") || "") || (now.getMonth() + 1),
    date: parseInt(searchParams.get("date") || searchParams.get("day") || "") || now.getDate(),
    hour: parseInt(searchParams.get("hour") || "") || now.getHours(),
    minute: parseInt(searchParams.get("minute") || "") || now.getMinutes(),
    latitude: parseFloat(searchParams.get("latitude") || "") || undefined,
    longitude: parseFloat(searchParams.get("longitude") || "") || undefined,
    zodiacSystem: (searchParams.get("zodiacSystem") as "tropical" | "sidereal") || "tropical",
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = parseParams(searchParams);

  // Try Railway backend first
  const railwayData = await fetchFromRailway(params);
  if (railwayData) {
    return NextResponse.json(formatRailwayResponse(railwayData, params));
  }

  // Fall back to local astronomy-engine
  return NextResponse.json(calculateLocally(params));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params: PlanetaryRequest = {
      year: body.year,
      month: body.month,
      date: body.date || body.day,
      hour: body.hour,
      minute: body.minute,
      latitude: body.latitude,
      longitude: body.longitude,
      zodiacSystem: body.zodiacSystem || "tropical",
    };

    // Validate required fields
    if (!params.year || !params.month || !params.date) {
      const now = new Date();
      params.year = params.year || now.getFullYear();
      params.month = params.month || (now.getMonth() + 1);
      params.date = params.date || now.getDate();
      params.hour = params.hour ?? now.getHours();
      params.minute = params.minute ?? now.getMinutes();
    }

    // Try Railway backend first
    const railwayData = await fetchFromRailway(params);
    if (railwayData) {
      return NextResponse.json(formatRailwayResponse(railwayData, params));
    }

    // Fall back to local astronomy-engine
    return NextResponse.json(calculateLocally(params));
  } catch (error) {
    console.error("Astrologize API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate planetary positions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
