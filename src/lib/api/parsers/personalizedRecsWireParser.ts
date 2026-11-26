/**
 * Pure runtime wire parser for `/api/personalized-recommendations`.
 *
 * @file src/lib/api/parsers/personalizedRecsWireParser.ts
 */

import {
  isPlainObject,
  readFiniteNumber,
  readString,
  readStringArray,
} from "./wirePrimitives";

export interface PersonalizedData {
  chartComparison: {
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
  } | null;
  currentAlchemy?: {
    kalchm: number;
    monica: number;
    esms: { Spirit: number; Essence: number; Matter: number; Substance: number };
    dominantElement: string;
    degraded?: boolean;
  } | null;
  recommendations: {
    favorableElements: string[];
    challengingElements: string[];
    harmonicPlanets: string[];
    insights: string[];
    suggestedCuisines: string[];
    suggestedCookingMethods: string[];
  };
}

function parseEsms(
  raw: unknown,
): { Spirit: number; Essence: number; Matter: number; Substance: number } | null {
  if (!isPlainObject(raw)) return null;
  const Spirit = readFiniteNumber(raw.Spirit);
  const Essence = readFiniteNumber(raw.Essence);
  const Matter = readFiniteNumber(raw.Matter);
  const Substance = readFiniteNumber(raw.Substance);
  if (
    Spirit === undefined ||
    Essence === undefined ||
    Matter === undefined ||
    Substance === undefined
  ) {
    return null;
  }
  return { Spirit, Essence, Matter, Substance };
}

function parseChartComparison(raw: unknown): PersonalizedData["chartComparison"] {
  if (!isPlainObject(raw) || !isPlainObject(raw.insights)) return null;
  const overallHarmony = readFiniteNumber(raw.overallHarmony);
  const elementalHarmony = readFiniteNumber(raw.elementalHarmony);
  const alchemicalAlignment = readFiniteNumber(raw.alchemicalAlignment);
  const planetaryResonance = readFiniteNumber(raw.planetaryResonance);
  if (
    overallHarmony === undefined ||
    elementalHarmony === undefined ||
    alchemicalAlignment === undefined ||
    planetaryResonance === undefined
  ) {
    return null;
  }
  return {
    overallHarmony,
    elementalHarmony,
    alchemicalAlignment,
    planetaryResonance,
    insights: {
      favorableElements: readStringArray(raw.insights.favorableElements),
      challengingElements: readStringArray(raw.insights.challengingElements),
      harmonicPlanets: readStringArray(raw.insights.harmonicPlanets),
      recommendations: readStringArray(raw.insights.recommendations),
    },
  };
}

function parseCurrentAlchemy(raw: unknown): PersonalizedData["currentAlchemy"] {
  if (raw === null) return null;
  if (!isPlainObject(raw)) return undefined;
  const kalchm = readFiniteNumber(raw.kalchm);
  const monica = readFiniteNumber(raw.monica);
  const esms = parseEsms(raw.esms);
  const dominantElement = readString(raw.dominantElement);
  if (kalchm === undefined || monica === undefined || !esms || !dominantElement) {
    return undefined;
  }
  const out: NonNullable<PersonalizedData["currentAlchemy"]> = {
    kalchm,
    monica,
    esms,
    dominantElement,
  };
  if (typeof raw.degraded === "boolean") out.degraded = raw.degraded;
  return out;
}

/** Producer: `src/app/api/personalized-recommendations/route.ts:311-325` */
export function parsePersonalizedRecommendationsResponse(raw: unknown): {
  success: boolean;
  data?: PersonalizedData;
} {
  if (!isPlainObject(raw)) return { success: false };
  const success = raw.success === true;
  if (!isPlainObject(raw.data) || !isPlainObject(raw.data.recommendations)) {
    return { success };
  }
  const recs = raw.data.recommendations;
  const data: PersonalizedData = {
    chartComparison: parseChartComparison(raw.data.chartComparison),
    recommendations: {
      favorableElements: readStringArray(recs.favorableElements),
      challengingElements: readStringArray(recs.challengingElements),
      harmonicPlanets: readStringArray(recs.harmonicPlanets),
      insights: readStringArray(recs.insights),
      suggestedCuisines: readStringArray(recs.suggestedCuisines),
      suggestedCookingMethods: readStringArray(recs.suggestedCookingMethods),
    },
  };
  const currentAlchemy = parseCurrentAlchemy(raw.data.currentAlchemy);
  if (currentAlchemy !== undefined) data.currentAlchemy = currentAlchemy;
  return { success, data };
}
