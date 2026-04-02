/**
 * GET/POST /api/current-moment
 * Returns current astrological moment — planetary positions + elemental snapshot.
 */
import { NextResponse } from "next/server";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SIGN_TO_ELEMENT: Record<string, string> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

export async function GET() {
  try {
    const now = new Date();
    const raw = getAccuratePlanetaryPositions(now);
    const positions: Record<string, { sign: string; degree: number; exactLongitude: number; isRetrograde: boolean }> = {};
    const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };

    Object.entries(raw).forEach(([planet, pos]) => {
      const sign = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
      positions[planet] = { sign, degree: Math.round(pos.degree * 100) / 100, exactLongitude: pos.exactLongitude, isRetrograde: pos.isRetrograde };
      const el = SIGN_TO_ELEMENT[sign];
      if (el) elementCounts[el]++;
    });

    const dominant = Object.entries(elementCounts).sort(([, a], [, b]) => b - a)[0][0];

    const hour = now.getHours();
    let timeOfDay: string;
    if (hour >= 6 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
    else if (hour >= 18 && hour < 22) timeOfDay = "evening";
    else timeOfDay = "night";

    const month = now.getMonth();
    let season: string;
    if (month >= 2 && month <= 4) season = "spring";
    else if (month >= 5 && month <= 7) season = "summer";
    else if (month >= 8 && month <= 10) season = "autumn";
    else season = "winter";

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      positions,
      dominantElement: dominant,
      elementalBalance: elementCounts,
      timeOfDay,
      season,
    });
  } catch (error) {
    console.error("[current-moment] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to compute current moment" }, { status: 500 });
  }
}

export async function POST() { return GET(); }
