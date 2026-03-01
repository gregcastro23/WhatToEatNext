/**
 * Astrologize API Route
 *
 * Calculates planetary positions using:
 *  1. Python backend (pyswisseph) - high precision, if available
 *  2. astronomy-engine (JS) - moderate precision fallback
 *  3. Static fallback positions - last resort
 *
 * Returns data in the format expected by astrologizeApi.ts callers.
 */

import { NextResponse } from "next/server";
import { calculatePlanetaryPositions } from "@/utils/serverPlanetaryCalculations";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Map lowercase zodiac key to title-case label */
const zodiacLabels: Record<string, string> = {
  aries: "Aries",
  taurus: "Taurus",
  gemini: "Gemini",
  cancer: "Cancer",
  leo: "Leo",
  virgo: "Virgo",
  libra: "Libra",
  scorpio: "Scorpio",
  sagittarius: "Sagittarius",
  capricorn: "Capricorn",
  aquarius: "Aquarius",
  pisces: "Pisces",
};

/**
 * Build the _celestialBodies structure that astrologizeApi.ts expects
 */
function buildCelestialBodies(
  positions: Record<string, any>,
  requestInfo: Record<string, any>,
) {
  const planetKeys = [
    "sun",
    "moon",
    "mercury",
    "venus",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
  ];

  const bodies: Record<string, any> = { all: [] };

  for (const key of planetKeys) {
    const titleKey = key.charAt(0).toUpperCase() + key.slice(1);
    const pos = positions[titleKey];
    if (!pos) continue;

    const signKey = (pos.sign || "aries").toLowerCase();

    const body = {
      key: titleKey,
      label: titleKey,
      Sign: {
        key: signKey,
        zodiac: signKey,
        label: zodiacLabels[signKey] || signKey,
      },
      ChartPosition: {
        Ecliptic: {
          DecimalDegrees: pos.exactLongitude ?? 0,
          ArcDegrees: {
            degrees: pos.degree ?? 0,
            minutes: pos.minute ?? 0,
            seconds: 0,
          },
        },
      },
      isRetrograde: pos.isRetrograde ?? false,
    };

    bodies[key] = body;
    bodies.all.push(body);
  }

  return {
    _celestialBodies: bodies,
    birth_info: {
      year: requestInfo.year,
      month: requestInfo.month,
      date: requestInfo.date,
      hour: requestInfo.hour,
      minute: requestInfo.minute,
      latitude: requestInfo.latitude ?? 40.7498,
      longitude: requestInfo.longitude ?? -73.7976,
      ayanamsa: "TROPICAL",
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      year,
      month,
      date: day,
      hour,
      minute,
      latitude,
      longitude,
    } = body;

    // Build a Date from the provided fields, or use now
    let targetDate: Date;
    if (year && month && day) {
      targetDate = new Date(year, (month as number) - 1, day, hour ?? 12, minute ?? 0);
    } else {
      targetDate = new Date();
    }

    const positions = await calculatePlanetaryPositions(targetDate);

    const now = new Date();
    const requestInfo = {
      year: year ?? now.getFullYear(),
      month: month ?? now.getMonth() + 1,
      date: day ?? now.getDate(),
      hour: hour ?? now.getHours(),
      minute: minute ?? now.getMinutes(),
      latitude,
      longitude,
    };

    const response = buildCelestialBodies(positions, requestInfo);

    return NextResponse.json(
      {
        success: true,
        ...response,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[astrologize] POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Calculation failed",
        _celestialBodies: { all: [] },
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");

    const targetDate = new Date();
    const positions = await calculatePlanetaryPositions(targetDate);

    const requestInfo = {
      year: targetDate.getFullYear(),
      month: targetDate.getMonth() + 1,
      date: targetDate.getDate(),
      hour: targetDate.getHours(),
      minute: targetDate.getMinutes(),
      latitude: latitude ? parseFloat(latitude) : 40.7498,
      longitude: longitude ? parseFloat(longitude) : -73.7976,
    };

    const response = buildCelestialBodies(positions, requestInfo);

    return NextResponse.json(
      {
        success: true,
        ...response,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[astrologize] GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Calculation failed",
        _celestialBodies: { all: [] },
      },
      { status: 500 },
    );
  }
}
