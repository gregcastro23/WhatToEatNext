/**
 * GET /api/cuisines/recommend
 * Returns cuisine recommendations based on current planetary positions.
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

const CUISINE_MAP: Record<string, { cuisines: string[]; cookingMethods: string[]; flavors: string[] }> = {
  Fire:  { cuisines: ["Mexican", "Indian", "Ethiopian", "Sichuan", "Thai"], cookingMethods: ["Grilling", "Roasting", "Searing", "Flambéing"], flavors: ["Spicy", "Smoky", "Bold"] },
  Water: { cuisines: ["Japanese", "Peruvian", "Vietnamese", "Greek", "Korean"], cookingMethods: ["Steaming", "Poaching", "Braising", "Simmering"], flavors: ["Umami", "Briny", "Delicate"] },
  Earth: { cuisines: ["Italian", "French", "Mediterranean", "Middle-Eastern", "Turkish"], cookingMethods: ["Baking", "Slow-cooking", "Fermenting", "Curing"], flavors: ["Hearty", "Earthy", "Rich"] },
  Air:   { cuisines: ["Fusion", "Californian", "Moroccan", "Lebanese", "Spanish"], cookingMethods: ["Sautéing", "Wok-frying", "Smoking", "Dehydrating"], flavors: ["Light", "Aromatic", "Fresh"] },
};

export async function GET() {
  try {
    const positions = getAccuratePlanetaryPositions(new Date());

    const elementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    Object.values(positions).forEach((pos) => {
      const sign = typeof pos.sign === "string" ? pos.sign : "";
      const el = SIGN_TO_ELEMENT[sign];
      if (el) elementCounts[el]++;
    });

    const sorted = Object.entries(elementCounts).sort(([, a], [, b]) => b - a);
    const dominant = sorted[0][0];
    const secondary = sorted[1][0];

    const primData = CUISINE_MAP[dominant];
    const secData = CUISINE_MAP[secondary];

    return NextResponse.json({
      success: true,
      dominantElement: dominant,
      secondaryElement: secondary,
      recommendations: {
        cuisines: [...primData.cuisines.slice(0, 3), ...secData.cuisines.slice(0, 2)],
        cookingMethods: [...primData.cookingMethods.slice(0, 2), ...secData.cookingMethods.slice(0, 2)],
        flavors: [...primData.flavors, ...secData.flavors],
      },
      elementDistribution: elementCounts,
      calculatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to compute recommendations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET();
}
