/**
 * GET/POST /api/alchemize
 * Returns enhanced alchemical analysis of current planetary positions.
 * Provides ESMS scores with sect, dignity, and aspect modifications.
 *
 * Three-layer calculation:
 * 1. Base ESMS from sect-aware planetary alchemy (day vs night)
 * 2. Dignity weighting (+10/+7 scale for domicile/exaltation)
 * 3. Aspect modifications based on planet-pair interactions
 *
 * Query parameters:
 * - date: ISO date string for specific moment (defaults to now)
 * - enhanced: true to use full enhanced calculation, false for legacy (defaults to true)
 */
import { NextResponse } from "next/server";
import { calculateComprehensiveAspects } from "@/utils/aspectCalculator";
import type { AspectWithStrength } from "@/utils/aspectESMSEffects";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { calculateEnhancedAlchemicalFromPlanets, isSectDiurnal } from "@/utils/planetaryAlchemyMapping";

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
    const useEnhanced = url.searchParams.get("enhanced") !== "false"; // Default to enhanced
    const date = dateParam ? new Date(dateParam) : new Date();

    const raw = getAccuratePlanetaryPositions(date);
    const signMap: Record<string, string> = {};
    const positionData: Record<string, any> = {};
    const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    const modalityCounts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };

    Object.entries(raw).forEach(([planet, pos]) => {
      const sign = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
      signMap[planet] = sign;

      // Build position data for aspects calculation
      positionData[planet] = {
        sign,
        degree: pos.degree,
        exactLongitude: pos.exactLongitude,
        isRetrograde: pos.isRetrograde,
      };

      const el = SIGN_TO_ELEMENT[sign];
      if (el) elementCounts[el]++;
      const mod = SIGN_TO_MODALITY[sign];
      if (mod) modalityCounts[mod]++;
    });

    // Determine sect (day vs night)
    const diurnal = isSectDiurnal(date);

    // Calculate comprehensive aspects
    const aspectsRaw = calculateComprehensiveAspects(positionData);

    // Convert aspect data to format expected by enhanced function
    const aspects: AspectWithStrength[] = aspectsRaw.map((a) => ({
      planet1: a.planet1,
      planet2: a.planet2,
      type: a.type,
      strength: a.strength,
    }));

    // Calculate ESMS with enhanced method (sect + dignity + aspects)
    const alch = useEnhanced
      ? calculateEnhancedAlchemicalFromPlanets(signMap, diurnal, aspects)
      : calculateEnhancedAlchemicalFromPlanets(signMap, diurnal); // Still enhanced but no aspects

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
      sect: diurnal ? "diurnal" : "nocturnal",
      calculationMethod: useEnhanced ? "enhanced-with-aspects" : "enhanced",
      positions: Object.fromEntries(
        Object.entries(raw).map(([p, pos]) => [p, {
          sign: typeof pos.sign === "string" ? pos.sign : String(pos.sign),
          degree: Math.round(pos.degree * 100) / 100,
          exactLongitude: pos.exactLongitude,
          isRetrograde: pos.isRetrograde,
        }])
      ),
      alchemical: {
        Spirit: Math.round(alch.Spirit * 100) / 100,
        Essence: Math.round(alch.Essence * 100) / 100,
        Matter: Math.round(alch.Matter * 100) / 100,
        Substance: Math.round(alch.Substance * 100) / 100,
      },
      aspects: aspects.slice(0, 10), // Top 10 strongest aspects
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
