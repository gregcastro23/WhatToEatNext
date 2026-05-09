/**
 * GET /api/astrology
 * Returns current planetary positions and astrological state.
 * Used by useAstrology hook for location-aware calculations.
 *
 * Query params:
 *   lat  — latitude (optional)
 *   lng  — longitude (optional)
 *   date — ISO date string (optional, defaults to now)
 */

import { NextResponse } from "next/server";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { calculateLunarPhase, getLunarPhaseName } from "@/utils/safeAstrology";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SIGN_TO_ELEMENT: Record<string, string> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const raw = getAccuratePlanetaryPositions(targetDate);
    const positions: Record<string, { sign: string; degree: number; exactLongitude: number; isRetrograde: boolean }> = {};
    const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    Object.entries(raw).forEach(([planet, pos]) => {
      const sign = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
      positions[planet] = {
        sign,
        degree: Math.round(pos.degree * 100) / 100,
        exactLongitude: pos.exactLongitude,
        isRetrograde: pos.isRetrograde,
      };
      const el = SIGN_TO_ELEMENT[sign];
      if (el) elementCounts[el]++;
    });

    const currentSign = positions["Sun"]?.sign ?? "aries";
    const lunarPhaseValue = calculateLunarPhase();
    const lunarPhase = getLunarPhaseName(lunarPhaseValue);

    const dominant = Object.entries(elementCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Fire";
    const total = Object.values(elementCounts).reduce((s, v) => s + v, 0) || 1;
    const aspectsInfluence = elementCounts[dominant] / total;

    return NextResponse.json({
      success: true,
      data: {
        positions,
        currentSign,
        lunarPhase,
        elementalBalance: elementCounts,
        aspectsInfluence: Math.round(aspectsInfluence * 100) / 100,
        dominantElement: dominant,
      },
    });
  } catch (error) {
    console.error("[astrology] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute astrological data" },
      { status: 500 },
    );
  }
}
