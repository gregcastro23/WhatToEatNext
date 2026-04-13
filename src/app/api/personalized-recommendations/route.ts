/**
 * Personalized Recommendations API Route
 * POST /api/personalized-recommendations
 *
 * Computes alchemical chart comparison and cuisine recommendations
 * from the user's natal chart vs. current planetary positions.
 * Previously a Cloudflare proxy stub — now a real implementation.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import type { Planet, ZodiacSignType } from "@/types/celestial";
import { extractPlanetaryPositions } from "@/utils/astrology/chartDataUtils";
import { getAccuratePlanetaryPositions } from "@/utils/astrology/positions";
import { calculateEnhancedAlchemicalFromPlanets, isSectDiurnal } from "@/utils/planetaryAlchemyMapping";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SIGN_TO_ELEMENT: Record<string, string> = {
  aries: "Fire", leo: "Fire", sagittarius: "Fire",
  taurus: "Earth", virgo: "Earth", capricorn: "Earth",
  gemini: "Air", libra: "Air", aquarius: "Air",
  cancer: "Water", scorpio: "Water", pisces: "Water",
};

const ELEMENT_CUISINES: Record<string, string[]> = {
  Fire:  ["Mexican", "Indian", "Ethiopian", "Sichuan", "Thai"],
  Water: ["Japanese", "Peruvian", "Vietnamese", "Greek", "Korean"],
  Earth: ["Italian", "French", "Mediterranean", "Middle-Eastern", "Turkish"],
  Air:   ["Fusion", "Californian", "Moroccan", "Lebanese", "Spanish"],
};

const ELEMENT_METHODS: Record<string, string[]> = {
  Fire:  ["Grilling", "Roasting", "Searing", "Flambéing"],
  Water: ["Steaming", "Poaching", "Braising", "Simmering"],
  Earth: ["Baking", "Slow-cooking", "Fermenting", "Curing"],
  Air:   ["Sautéing", "Wok-frying", "Smoking", "Dehydrating"],
};

export async function POST(request: NextRequest) {
  try {
    // Auth — allow the call to succeed even without a session (guest mode)
    const user = await getDatabaseUserFromRequest(request).catch(() => null);

    // Parse request body for any extra hints
    const body = await request.json().catch(() => ({}));
    const includeChartAnalysis = body?.includeChartAnalysis ?? false;

    // Get natal chart from user profile if available
    const natalChart = (user?.profile as any)?.natalChart ?? null;
    const natalPositions: Record<string, string> = {};

    if (natalChart) {
      const signs = extractPlanetaryPositions(natalChart);
      Object.entries(signs).forEach(([planet, sign]) => {
        if (typeof sign === "string") natalPositions[planet] = sign;
      });
    }

    // Current sky positions
    const currentRaw = getAccuratePlanetaryPositions(new Date());
    const currentPositions: Record<string, string> = {};
    Object.entries(currentRaw).forEach(([planet, pos]) => {
      if (pos?.sign) currentPositions[planet] = typeof pos.sign === "string" ? pos.sign : String(pos.sign);
    });

    // Elemental counts for current sky
    const currentElementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    Object.values(currentPositions).forEach((sign) => {
      const el = SIGN_TO_ELEMENT[sign];
      if (el) currentElementCounts[el]++;
    });
    const total = Object.values(currentElementCounts).reduce((a, b) => a + b, 0) || 1;

    // Sort elements by strength
    const sortedElements = Object.entries(currentElementCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([el]) => el);

    const favorableElements = sortedElements.slice(0, 2);
    const challengingElements = sortedElements.slice(-1);

    // Find planets in favorable signs (same element as dominant)
    const dominantElement = sortedElements[0];
    const harmonicPlanets = Object.entries(currentPositions)
      .filter(([, sign]) => SIGN_TO_ELEMENT[sign] === dominantElement)
      .map(([planet]) => planet)
      .slice(0, 4);

    // Cuisine & cooking method suggestions from current sky
    const suggestedCuisines = [
      ...(ELEMENT_CUISINES[favorableElements[0]] ?? []).slice(0, 2),
      ...(ELEMENT_CUISINES[favorableElements[1]] ?? []).slice(0, 2),
    ];
    const suggestedCookingMethods = [
      ...(ELEMENT_METHODS[favorableElements[0]] ?? []).slice(0, 2),
      ...(ELEMENT_METHODS[favorableElements[1]] ?? []).slice(0, 2),
    ];

    // Insights
    const insights = [
      `The sky is strongly ${dominantElement}-aligned — ideal for bold, ${dominantElement === "Fire" ? "spiced" : dominantElement === "Water" ? "umami-rich" : dominantElement === "Earth" ? "hearty" : "light"} dishes.`,
      `${harmonicPlanets.slice(0, 2).join(" and ")} are in harmonious signs, amplifying ${dominantElement} energy.`,
      `Favor ${suggestedCuisines[0]} or ${suggestedCuisines[1]} cuisine for maximum cosmic alignment today.`,
    ];

    // Chart comparison (only if natal chart available and requested)
    let chartComparison = null;
    if (includeChartAnalysis && Object.keys(natalPositions).length > 0) {
      const natalDiurnal = natalChart?.birthData?.dateTime ? isSectDiurnal(new Date(natalChart.birthData.dateTime)) : true;
      const currentDiurnal = isSectDiurnal(new Date());

      const natalAlch = calculateEnhancedAlchemicalFromPlanets(natalPositions as Record<Planet, ZodiacSignType>, natalDiurnal);
      const currentAlch = calculateEnhancedAlchemicalFromPlanets(currentPositions as Record<Planet, ZodiacSignType>, currentDiurnal);

      const natalTotal = Object.values(natalAlch).reduce((a, b) => a + Number(b), 0) || 1;
      const currentTotal = Object.values(currentAlch).reduce((a, b) => a + Number(b), 0) || 1;

      // Cosine-like similarity for alchemical alignment
      const keys = ["Spirit", "Essence", "Matter", "Substance"] as const;
      let dot = 0, magN = 0, magC = 0;
      keys.forEach((k) => {
        const n = (natalAlch[k] ?? 0) / natalTotal;
        const c = (currentAlch[k] ?? 0) / currentTotal;
        dot += n * c;
        magN += n * n;
        magC += c * c;
      });
      const alchemicalAlignment = magN > 0 && magC > 0 ? dot / (Math.sqrt(magN) * Math.sqrt(magC)) : 0.5;

      // Elemental harmony — overlap between natal and current
      const natalEl: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
      Object.values(natalPositions).forEach((sign) => {
        const el = SIGN_TO_ELEMENT[sign]; if (el) natalEl[el]++;
      });
      const natalElTotal = Object.values(natalEl).reduce((a, b) => a + b, 0) || 1;
      let elementalOverlap = 0;
      Object.keys(natalEl).forEach((el) => {
        elementalOverlap += Math.min(natalEl[el] / natalElTotal, currentElementCounts[el] / total);
      });
      const elementalHarmony = Math.min(elementalOverlap, 1);

      // Planetary resonance — planets in same sign natal vs current
      const sharedSigns = Object.keys(natalPositions).filter(
        (p) => natalPositions[p] === currentPositions[p]
      ).length;
      const planetaryResonance = Math.min(sharedSigns / Math.max(Object.keys(natalPositions).length, 1), 1);

      const overallHarmony = (alchemicalAlignment * 0.4 + elementalHarmony * 0.35 + planetaryResonance * 0.25);

      // @ts-expect-error - Auto-fixed by script
      chartComparison = {
        overallHarmony,
        elementalHarmony,
        alchemicalAlignment,
        planetaryResonance,
        insights: {
          favorableElements,
          challengingElements,
          harmonicPlanets,
          recommendations: insights,
        },
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        chartComparison,
        recommendations: {
          favorableElements,
          challengingElements,
          harmonicPlanets,
          insights,
          suggestedCuisines,
          suggestedCookingMethods,
        },
      },
    });
  } catch (error) {
    console.error("[personalized-recommendations] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute recommendations" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST with optional { includeChartAnalysis: true }" });
}
