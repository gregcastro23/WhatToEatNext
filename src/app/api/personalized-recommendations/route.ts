/**
 * Personalized Recommendations API Route
 * POST /api/personalized-recommendations
 *
 * Computes alchemical chart comparison and cuisine recommendations
 * from the user's natal chart vs. current planetary positions.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { withObservability } from "@/lib/observability/withObservability";
import { rateLimit } from "@/lib/rateLimit";
import { getCurrentAlchemicalState } from "@/services/RealAlchemizeService";
import type { CelestialPosition } from "@/types/celestial";
import type { NatalChart } from "@/types/natalChart";
import {
  extractAlchemicalPlanetPositions,
  extractPlanetaryPositions,
} from "@/utils/astrology/chartDataUtils";
import {
  getAccuratePlanetaryPositions,
  isCurrentSkyDiurnal,
} from "@/utils/astrology/positions";
import {
  calculateAlchemicalFromPlanets,
  isSectDiurnalForBirth,
} from "@/utils/planetaryAlchemyMapping";
import { isObject } from "@/utils/typeGuards";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RECS_LIMIT = { window: 60_000, max: 20, bucket: "personalized-recs" };

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

interface RecommendationRequestBody {
  includeChartAnalysis?: boolean;
}

interface ChartComparisonResult {
  overallHarmony: number;
  elementalHarmony: number;
  alchemicalAlignment: number;
  planetaryResonance: number;
  insights: {
    favorableElements: string[];
    challengingElements: string[];
    harmonicPlanets: string[];
    recommendations: string[];
  };
}

interface ChartComparisonContext {
  natalChart: NatalChart;
  natalPositions: Record<string, string>;
  currentRaw: Record<string, CelestialPosition>;
  currentPositions: Record<string, string>;
  currentElementCounts: Record<string, number>;
  total: number;
  favorableElements: string[];
  challengingElements: string[];
  harmonicPlanets: string[];
  insights: string[];
}

function computeChartComparison(ctx: ChartComparisonContext): ChartComparisonResult {
  const {
    natalChart,
    natalPositions,
    currentRaw,
    currentPositions,
    currentElementCounts,
    total,
    favorableElements,
    challengingElements,
    harmonicPlanets,
    insights,
  } = ctx;

  const natalDiurnal = natalChart.birthData.dateTime
    ? isSectDiurnalForBirth(natalChart.birthData)
    : true;
  const currentDiurnal = isCurrentSkyDiurnal(new Date());

  const currentAlchPositions: Record<string, { sign: string; degree?: number; exactLongitude?: number }> = {};
  for (const [k, v] of Object.entries(currentRaw)) {
    if (v.sign) {
      currentAlchPositions[k] = {
        sign: v.sign,
        degree: v.degree,
        exactLongitude: v.exactLongitude,
      };
    }
  }

  const natalAlch = calculateAlchemicalFromPlanets(
    extractAlchemicalPlanetPositions(natalChart),
    natalDiurnal,
  );
  const currentAlch = calculateAlchemicalFromPlanets(
    currentAlchPositions,
    currentDiurnal,
  );

  const natalTotal = Object.values(natalAlch).reduce((a, b) => a + Number(b), 0) || 1;
  const currentTotal = Object.values(currentAlch).reduce((a, b) => a + Number(b), 0) || 1;

  // Cosine-like similarity for alchemical alignment
  const keys = ["Spirit", "Essence", "Matter", "Substance"] as const;
  let dot = 0;
  let magN = 0;
  let magC = 0;
  keys.forEach((k) => {
    const n = natalAlch[k] / natalTotal;
    const c = currentAlch[k] / currentTotal;
    dot += n * c;
    magN += n * n;
    magC += c * c;
  });
  const alchemicalAlignment = magN > 0 && magC > 0 ? dot / (Math.sqrt(magN) * Math.sqrt(magC)) : 0.5;

  // Elemental harmony — overlap between natal and current
  const natalEl: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  Object.values(natalPositions).forEach((sign) => {
    const el = SIGN_TO_ELEMENT[sign];
    const natalCount = el ? natalEl[el] : undefined;
    if (el && natalCount !== undefined) natalEl[el] = natalCount + 1;
  });
  const natalElTotal = Object.values(natalEl).reduce((a, b) => a + b, 0) || 1;
  let elementalOverlap = 0;
  Object.keys(natalEl).forEach((el) => {
    elementalOverlap += Math.min((natalEl[el] ?? 0) / natalElTotal, (currentElementCounts[el] ?? 0) / total);
  });
  const elementalHarmony = Math.min(elementalOverlap, 1);

  // Planetary resonance — planets in same sign natal vs current
  const sharedSigns = Object.keys(natalPositions).filter(
    (p) => natalPositions[p] === currentPositions[p],
  ).length;
  const planetaryResonance = Math.min(sharedSigns / Math.max(Object.keys(natalPositions).length, 1), 1);

  const overallHarmony = (alchemicalAlignment * 0.4 + elementalHarmony * 0.35 + planetaryResonance * 0.25);

  return {
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

async function handlePost(request: NextRequest): Promise<NextResponse> {
  const rl = await rateLimit(request, RECS_LIMIT);
  if (!rl.allowed) return rl.response!;
  try {
    // Auth — allow the call to succeed even without a session (guest mode)
    const user = await getDatabaseUserFromRequest(request).catch(() => null);

    // Parse request body for any extra hints
    const body = (await request.json().catch(() => ({}))) as RecommendationRequestBody;
    const includeChartAnalysis = body.includeChartAnalysis ?? false;

    // Get natal chart from user profile if available
    const userProfile = isObject(user?.profile) ? (user.profile as Record<string, unknown>) : null;
    const natalChart = (userProfile?.natalChart as NatalChart | undefined) ?? null;
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
      currentPositions[planet] = pos.sign;
    });

    // Elemental counts for current sky
    const currentElementCounts: Record<string, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    Object.values(currentPositions).forEach((sign) => {
      const el = SIGN_TO_ELEMENT[sign];
      const currentCount = el ? currentElementCounts[el] : undefined;
      if (el && currentCount !== undefined) currentElementCounts[el] = currentCount + 1;
    });
    const total = Object.values(currentElementCounts).reduce((a, b) => a + b, 0) || 1;

    // Sort elements by strength
    const sortedElements = Object.entries(currentElementCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([el]) => el);

    const favorableElements = sortedElements.slice(0, 2);
    const challengingElements = sortedElements.slice(-1);

    // Find planets in favorable signs (same element as dominant)
    const [dominantElement] = sortedElements;
    const harmonicPlanets = Object.entries(currentPositions)
      .filter(([, sign]) => SIGN_TO_ELEMENT[sign] === dominantElement)
      .map(([planet]) => planet)
      .slice(0, 4);

    // Cuisine & cooking method suggestions from current sky
    const [favorablePrimary, favorableSecondary] = favorableElements;
    const suggestedCuisines = [
      ...(favorablePrimary === undefined ? [] : (ELEMENT_CUISINES[favorablePrimary] ?? [])).slice(0, 2),
      ...(favorableSecondary === undefined ? [] : (ELEMENT_CUISINES[favorableSecondary] ?? [])).slice(0, 2),
    ];
    const suggestedCookingMethods = [
      ...(favorablePrimary === undefined ? [] : (ELEMENT_METHODS[favorablePrimary] ?? [])).slice(0, 2),
      ...(favorableSecondary === undefined ? [] : (ELEMENT_METHODS[favorableSecondary] ?? [])).slice(0, 2),
    ];

    // Insights
    const insights = [
      `The sky is strongly ${dominantElement}-aligned — ideal for bold, ${dominantElement === "Fire" ? "spiced" : dominantElement === "Water" ? "umami-rich" : dominantElement === "Earth" ? "hearty" : "light"} dishes.`,
      `${harmonicPlanets.slice(0, 2).join(" and ")} are in harmonious signs, amplifying ${dominantElement} energy.`,
      `Favor ${suggestedCuisines[0]} or ${suggestedCuisines[1]} cuisine for maximum cosmic alignment today.`,
    ];

    // Chart comparison (only if natal chart available and requested)
    let chartComparison: ChartComparisonResult | null = null;
    if (includeChartAnalysis && natalChart && Object.keys(natalPositions).length > 0) {
      chartComparison = computeChartComparison({
        natalChart,
        natalPositions,
        currentRaw,
        currentPositions,
        currentElementCounts,
        total,
        favorableElements,
        challengingElements,
        harmonicPlanets,
        insights,
      });
    }

    // Today's real alchemical signature from the canonical engine: kalchm and
    // monica are derived from the Spirit/Essence/Matter/Substance axes (the
    // elemental-only path cannot produce them). Additive — the harmony meters
    // above are unchanged. `degraded` is surfaced when the sky positions weren't
    // fully live; null only if the engine itself throws.
    let currentAlchemy: {
      kalchm: number;
      monica: number;
      esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
      dominantElement: string;
      degraded?: boolean;
    } | null = null;
    try {
      const live = getCurrentAlchemicalState();
      currentAlchemy = {
        kalchm: live.kalchm,
        monica: live.monica,
        esms: live.esms,
        dominantElement: live.metadata.dominantElement,
        ...(live.degraded ? { degraded: true } : {}),
      };
    } catch (alchemyError) {
      _logger.error("[personalized-recommendations] live alchemy unavailable:", alchemyError);
    }

    return NextResponse.json({
      success: true,
      data: {
        chartComparison,
        currentAlchemy,
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
    _logger.error("[personalized-recommendations] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute recommendations" },
      { status: 500 },
    );
  }
}

function handleGet(): NextResponse {
  return NextResponse.json({ message: "Use POST with optional { includeChartAnalysis: true }" });
}

export const POST = withObservability(
  { routeName: "/api/personalized-recommendations" },
  handlePost,
);
export const GET = withObservability(
  { routeName: "/api/personalized-recommendations", skipUserResolution: true },
  handleGet,
);
