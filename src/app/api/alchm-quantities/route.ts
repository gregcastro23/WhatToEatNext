/**
 * GET/POST /api/alchm-quantities
 * Returns kinetics and circuit data for the Alchm Kinetics and Quantities displays.
 * Sub-routes (/aspects, /planetary, /trends) have their own real implementations.
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

export async function GET() {
  try {
    const now = new Date();
    const raw = getAccuratePlanetaryPositions(now);

    // Build sign map for alchemical calculation
    const signMap: Record<string, string> = {};
    const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    Object.entries(raw).forEach(([planet, pos]) => {
      const sign = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
      signMap[planet] = sign;
      const el = SIGN_TO_ELEMENT[sign];
      if (el) elementCounts[el]++;
    });

    const alch = calculateAlchemicalFromPlanets(signMap as any);
    const total = Object.values(alch).reduce((a, b) => a + b, 0) || 1;

    // ESMS percentages
    const spirit = alch.Spirit / total;
    const essence = alch.Essence / total;
    const matter = alch.Matter / total;
    const substance = alch.Substance / total;

    // Kinetic properties: model as P=IV circuit
    const voltage = spirit * 10 + essence * 8;   // potential energy
    const current = matter * 5 + substance * 3;   // flow
    const power = voltage * current;
    const resistance = voltage / (current || 0.001);

    // Elemental balance normalized
    const elTotal = Object.values(elementCounts).reduce((a, b) => a + b, 0) || 1;

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      alchemical: { Spirit: alch.Spirit, Essence: alch.Essence, Matter: alch.Matter, Substance: alch.Substance },
      kinetics: {
        voltage: Math.round(voltage * 100) / 100,
        current: Math.round(current * 100) / 100,
        power: Math.round(power * 100) / 100,
        resistance: Math.round(resistance * 100) / 100,
        reactivity: Math.round(spirit * 100) / 100,
        entropy: Math.round((1 - Math.max(...Object.values(elementCounts).map(v => v / elTotal))) * 100) / 100,
      },
      circuit: {
        primaryElement: Object.entries(elementCounts).sort(([, a], [, b]) => b - a)[0][0],
        elementalBalance: {
          Fire: elementCounts.Fire / elTotal,
          Water: elementCounts.Water / elTotal,
          Earth: elementCounts.Earth / elTotal,
          Air: elementCounts.Air / elTotal,
        },
        esmsBalance: { Spirit: spirit, Essence: essence, Matter: matter, Substance: substance },
      },
    });
  } catch (error) {
    console.error("[alchm-quantities] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to compute alchemical quantities" }, { status: 500 });
  }
}

export async function POST() { return GET(); }
