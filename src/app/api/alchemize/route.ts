/**
 * GET/POST /api/alchemize
 * Returns full alchemical analysis of current planetary positions.
 * Provides ESMS scores, elemental balance, and thermodynamic properties.
 */
import { NextResponse } from "next/server";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SIGN_TO_ELEMENT: Record<string, string> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

const SIGN_TO_MODALITY: Record<string, string> = {
  aries: "Cardinal", cancer: "Cardinal", libra: "Cardinal", capricorn: "Cardinal",
  taurus: "Fixed", leo: "Fixed", scorpio: "Fixed", aquarius: "Fixed",
  gemini: "Mutable", virgo: "Mutable", sagittarius: "Mutable", pisces: "Mutable",
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    // Allow custom date via query param
    const dateParam = url.searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    const raw = getAccuratePlanetaryPositions(date);
    const signMap: Record<string, string> = {};
    const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const modalityCounts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };

    Object.entries(raw).forEach(([planet, pos]) => {
      const sign = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
      signMap[planet] = sign;
      const el = SIGN_TO_ELEMENT[sign];
      if (el) elementCounts[el]++;
      const mod = SIGN_TO_MODALITY[sign];
      if (mod) modalityCounts[mod]++;
    });

    const alch = calculateAlchemicalFromPlanets(signMap as any);
    const total = Object.values(alch).reduce((a, b) => a + b, 0) || 1;
    const elTotal = Object.values(elementCounts).reduce((a, b) => a + b, 0) || 1;

    const dominantElement = Object.entries(elementCounts).sort(([, a], [, b]) => b - a)[0][0];
    const dominantModality = Object.entries(modalityCounts).sort(([, a], [, b]) => b - a)[0][0];

    // Thermodynamic properties derived from ESMS
    const spirit = alch.Spirit / total;
    const essence = alch.Essence / total;
    const matter = alch.Matter / total;
    const substance = alch.Substance / total;

    return NextResponse.json({
      success: true,
      timestamp: date.toISOString(),
      positions: Object.fromEntries(
        Object.entries(raw).map(([p, pos]) => [p, {
          sign: typeof pos.sign === "string" ? pos.sign : String(pos.sign),
          degree: Math.round(pos.degree * 100) / 100,
          exactLongitude: pos.exactLongitude,
          isRetrograde: pos.isRetrograde,
        }])
      ),
      alchemical: {
        Spirit: alch.Spirit,
        Essence: alch.Essence,
        Matter: alch.Matter,
        Substance: alch.Substance,
      },
      elementalBalance: {
        Fire: elementCounts.Fire / elTotal,
        Water: elementCounts.Water / elTotal,
        Earth: elementCounts.Earth / elTotal,
        Air: elementCounts.Air / elTotal,
      },
      modalityBalance: {
        Cardinal: modalityCounts.Cardinal / (Object.values(modalityCounts).reduce((a, b) => a + b, 0) || 1),
        Fixed: modalityCounts.Fixed / (Object.values(modalityCounts).reduce((a, b) => a + b, 0) || 1),
        Mutable: modalityCounts.Mutable / (Object.values(modalityCounts).reduce((a, b) => a + b, 0) || 1),
      },
      dominantElement,
      dominantModality,
      thermodynamic: {
        heat: Math.round(spirit * 10 * 100) / 100,
        entropy: Math.round((1 - Math.max(...Object.values(elementCounts).map(v => v / elTotal))) * 100) / 100,
        reactivity: Math.round(spirit * 100) / 100,
        conductivity: Math.round(essence * 100) / 100,
        stability: Math.round(matter * 100) / 100,
        density: Math.round(substance * 100) / 100,
      },
    });
  } catch (error) {
    console.error("[alchemize] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to compute alchemical analysis" }, { status: 500 });
  }
}

export async function POST(request: Request) { return GET(request); }
