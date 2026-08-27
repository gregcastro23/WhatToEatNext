import { NextResponse } from "next/server";
import { CUISINES } from "@/data/cuisines/index";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import type { AlchemicalProperties } from "@/types/alchemy";
import type { Element } from "@/types/celestial";
import type { GroupMember, NatalChart } from "@/types/natalChart";
import { extractAlchemicalPlanetPositions } from "@/utils/astrology/chartDataUtils";
import { elementalCosineHarmony } from "@/utils/elemental/harmony";
import {
  calculateAlchemicalFromPlanets,
  isSectDiurnalForBirth,
} from "@/utils/planetaryAlchemyMapping";
import type { NextRequest } from "next/server";

/**
 * Group Recommendations API Route
 * POST /api/group-recommendations
 *
 * Computes cuisine recommendations for a group of dining companions.
 * Aggregates natal chart data across all members to find cuisines with
 * the best collective harmony.
 */

interface CuisineDefinition {
  name?: string;
  elementalProperties?: Record<string, number>;
  elementalState?: Record<string, number>;
  [key: string]: unknown;
}

const CUISINE_LIST = Object.entries(CUISINES as Record<string, CuisineDefinition>).map(([key, val]) => ({
  id: key,
  name: typeof val.name === "string" ? val.name : key,
  elemental: parseElementalBalance(val.elementalProperties ?? val.elementalState),
}));

// Use a unified elemental interface that satisfies both celestial and alchemy interfaces
interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: number;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseElementalBalance(raw: unknown): ElementalProperties {
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    const fire = typeof r.Fire === "number" && Number.isFinite(r.Fire) ? r.Fire : 0.25;
    const water = typeof r.Water === "number" && Number.isFinite(r.Water) ? r.Water : 0.25;
    const earth = typeof r.Earth === "number" && Number.isFinite(r.Earth) ? r.Earth : 0.25;
    const air = typeof r.Air === "number" && Number.isFinite(r.Air) ? r.Air : 0.25;
    return { Fire: fire, Water: water, Earth: earth, Air: air };
  }
  return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
}

function parseAlchemicalProperties(
  raw: unknown,
  chart: NatalChart | null | undefined,
  diurnal: boolean,
): AlchemicalProperties {
  if (raw && typeof raw === "object") {
    const r = raw as Record<string, unknown>;
    if (
      typeof r.Spirit === "number" &&
      typeof r.Essence === "number" &&
      typeof r.Matter === "number" &&
      typeof r.Substance === "number"
    ) {
      return { Spirit: r.Spirit, Essence: r.Essence, Matter: r.Matter, Substance: r.Substance };
    }
  }
  if (chart) {
    return calculateAlchemicalFromPlanets(extractAlchemicalPlanetPositions(chart), diurnal);
  }
  return { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
}

/** Average a list of elemental property objects */
function avgElemental(items: ElementalProperties[]): ElementalProperties {
  if (items.length === 0) return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const sum = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  for (const e of items) {
    sum.Fire += e.Fire;
    sum.Water += e.Water;
    sum.Earth += e.Earth;
    sum.Air += e.Air;
  }
  return {
    Fire: sum.Fire / items.length,
    Water: sum.Water / items.length,
    Earth: sum.Earth / items.length,
    Air: sum.Air / items.length,
  };
}

/** Average a list of alchemical property objects */
function avgAlchemical(items: AlchemicalProperties[]): AlchemicalProperties {
  if (items.length === 0) return { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  const sum = { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  for (const a of items) {
    sum.Spirit += a.Spirit;
    sum.Essence += a.Essence;
    sum.Matter += a.Matter;
    sum.Substance += a.Substance;
  }
  return {
    Spirit: sum.Spirit / items.length,
    Essence: sum.Essence / items.length,
    Matter: sum.Matter / items.length,
    Substance: sum.Substance / items.length,
  };
}

/** Dominant element from an elemental property object */
function dominantElement(e: ElementalProperties): Element {
  const sorted = (Object.entries(e) as Array<[Element, number]>).sort(([, a], [, b]) => b - a);
  return sorted[0]?.[0] ?? "Fire";
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const currentUser = await getDatabaseUserFromRequest(request);
    if (!currentUser) {
      _logger.warn("[POST /api/group-recommendations] User not found or not authenticated");
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }
    const userId = currentUser.id;

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }
    const commensalIds = Array.isArray(body.commensalIds) ? (body.commensalIds as string[]) : [];
    const linkedUserIds = Array.isArray(body.linkedUserIds) ? (body.linkedUserIds as string[]) : [];
    const strategy = typeof body.strategy === "string" ? body.strategy : "average";

    // Collect elemental + alchemical data from all group members
    const elementalList: ElementalProperties[] = [];
    const alchemicalList: AlchemicalProperties[] = [];
    const memberInfo: Array<{ id: string; name: string; element: Element }> = [];

    // Include the current user if they have a natal chart
    const ownerChart = currentUser.profile.natalChart;
    if (ownerChart) {
      const el = parseElementalBalance(ownerChart.elementalBalance);
      const diurnal = isSectDiurnalForBirth(ownerChart.birthData);
      const alch = parseAlchemicalProperties(ownerChart.alchemicalProperties, ownerChart, diurnal);
      elementalList.push(el);
      alchemicalList.push(alch);
      memberInfo.push({ id: userId, name: currentUser.profile.name ?? "You", element: dominantElement(el) });
    }

    if (commensalIds.length > 0) {
      const legacyMembers: GroupMember[] = currentUser.profile.groupMembers ?? [];
      let tableMembers: GroupMember[] = [];
      try {
        tableMembers = await commensalDatabase.getManualCompanionsForUser(userId);
      } catch (err) {
        _logger.error(
          `[POST /api/group-recommendations] Manual companions lookup failed for user ${userId}`,
          err,
        );
      }
      const mergedById = new Map<string, GroupMember>();
      for (const m of legacyMembers) mergedById.set(m.id, m);
      for (const m of tableMembers) mergedById.set(m.id, m);
      for (const commensal of mergedById.values()) {
        if (!commensalIds.includes(commensal.id)) continue;
        const chart = commensal.natalChart;
        const el = parseElementalBalance(chart.elementalBalance);
        const diurnal = isSectDiurnalForBirth(chart.birthData);
        const alch = parseAlchemicalProperties(chart.alchemicalProperties, chart, diurnal);
        elementalList.push(el);
        alchemicalList.push(alch);
        memberInfo.push({ id: commensal.id, name: commensal.name, element: dominantElement(el) });
      }
    }

    if (linkedUserIds.length > 0) {
      try {
        const linkedFriends = await commensalDatabase.getLinkedCommensalsForUser(userId);
        for (const friend of linkedFriends) {
          if (!linkedUserIds.includes(friend.userId)) continue;
          const chart = friend.natalChart;
          const el = parseElementalBalance(chart.elementalBalance);
          const diurnal = isSectDiurnalForBirth(chart.birthData);
          const alch = parseAlchemicalProperties(chart.alchemicalProperties, chart, diurnal);
          elementalList.push(el);
          alchemicalList.push(alch);
          memberInfo.push({ id: friend.userId, name: friend.name, element: dominantElement(el) });
        }
      } catch (err) {
        _logger.error(`[POST /api/group-recommendations] Social DB error for user ${userId}`, err);
      }
    }

    if (elementalList.length === 0) {
      return NextResponse.json(
        { success: false, message: "No natal chart data available for selected members. Please ensure all members have birth data entered." },
        { status: 422 },
      );
    }

    // Compute composite chart
    const compositeElemental = avgElemental(elementalList);
    const compositeAlchemical = avgAlchemical(alchemicalList);
    const compositeEl = dominantElement(compositeElemental);

    // Build element distribution
    const elementCounts: Record<Element, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    memberInfo.forEach((m) => { elementCounts[m.element]++; });
    const total = memberInfo.length || 1;
    const elementalDistribution = {
      Fire: elementCounts.Fire / total,
      Water: elementCounts.Water / total,
      Earth: elementCounts.Earth / total,
      Air: elementCounts.Air / total,
    };

    // Compute harmony for each cuisine using the requested aggregation strategy
    const scoredCuisines = CUISINE_LIST.map((cuisine) => {
      let groupScore: number;
      const memberScores = memberInfo.map((m, idx) => {
        const memberEl = elementalList[idx] ?? compositeElemental;
        return {
          memberId: m.id,
          memberName: m.name,
          score: elementalCosineHarmony(memberEl, cuisine.elemental),
        };
      });
      const scores = memberScores.map((ms) => ms.score);
      if (strategy === "minimum") {
        groupScore = Math.min(...scores);
      } else if (strategy === "consensus") {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const stddev = Math.sqrt(scores.reduce((s, x) => s + (x - avg) ** 2, 0) / scores.length);
        groupScore = avg * (1 - stddev);
      } else {
        groupScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
      const harmony = elementalCosineHarmony(compositeElemental, cuisine.elemental);
      return {
        cuisineId: cuisine.id,
        cuisineName: cuisine.name,
        aggregatedScore: Math.round(groupScore * 1000) / 1000,
        harmony: Math.round(harmony * 1000) / 1000,
        dominantElement: compositeEl,
        memberScores,
        reasons: [
          `Group's composite element: ${compositeEl}`,
          `Harmony with ${cuisine.name}: ${Math.round(harmony * 100)}%`,
        ],
      };
    });

    scoredCuisines.sort((a, b) => b.aggregatedScore - a.aggregatedScore);
    const recommendations = scoredCuisines.slice(0, 10);

    return NextResponse.json({
      success: true,
      composite: {
        groupId: `group_${Date.now()}`,
        memberCount: memberInfo.length,
        dominantElement: compositeEl,
        dominantModality: "Fixed" as const,
        elementalBalance: compositeElemental,
        alchemicalProperties: compositeAlchemical,
        elementalDistribution,
        modalityDistribution: { Cardinal: 0.33, Fixed: 0.34, Mutable: 0.33 },
        calculatedAt: new Date().toISOString(),
      },
      recommendations,
      memberCount: memberInfo.length,
      strategy,
    });
  } catch (error) {
    _logger.error("[POST /api/group-recommendations] Compute error", error);
    return NextResponse.json(
      { success: false, message: "Failed to compute group recommendations" },
      { status: 500 },
    );
  }
}
