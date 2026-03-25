/**
 * Group Recommendations API Route
 * POST /api/group-recommendations
 *
 * Computes cuisine recommendations for a group of dining companions.
 * Aggregates natal chart data across all members to find cuisines with
 * the best collective harmony.
 *
 * Body: {
 *   commensalIds: string[]    — IDs of manual commensals (from user's groupMembers)
 *   linkedUserIds: string[]   — IDs of linked friends (accepted friendships with charts)
 *   strategy: 'average' | 'minimum' | 'consensus'
 * }
 *
 * @file src/app/api/group-recommendations/route.ts
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import { socialDatabase } from "@/services/socialDatabaseService";
import { CUISINES } from "@/data/cuisines/index";

// Normalize CUISINES object into an iterable array with id field
const CUISINE_LIST = Object.entries(CUISINES).map(([key, val]) => ({
  id: key,
  ...val,
}));
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import type { Element, ElementalProperties as CelestialElementalProperties } from "@/types/celestial";
import type { AlchemicalProperties } from "@/types/alchemy";

// Use a unified elemental type that satisfies both celestial and alchemy interfaces
type ElementalProperties = Record<string, number> & {
  Fire: number; Water: number; Earth: number; Air: number;
};
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ELEMENT_ORDER: Element[] = ["Fire", "Water", "Earth", "Air"];

/** Average a list of elemental property objects */
function avgElemental(items: ElementalProperties[]): ElementalProperties {
  if (items.length === 0) return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  const sum = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  for (const e of items) {
    sum.Fire += e.Fire ?? 0;
    sum.Water += e.Water ?? 0;
    sum.Earth += e.Earth ?? 0;
    sum.Air += e.Air ?? 0;
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
    sum.Spirit += a.Spirit ?? 0;
    sum.Essence += a.Essence ?? 0;
    sum.Matter += a.Matter ?? 0;
    sum.Substance += a.Substance ?? 0;
  }
  return {
    Spirit: sum.Spirit / items.length,
    Essence: sum.Essence / items.length,
    Matter: sum.Matter / items.length,
    Substance: sum.Substance / items.length,
  };
}

/** Cosine similarity between two elemental property vectors */
function elementalHarmony(a: ElementalProperties, b: ElementalProperties): number {
  const va = ELEMENT_ORDER.map((e) => (a as any)[e] ?? 0);
  const vb = ELEMENT_ORDER.map((e) => (b as any)[e] ?? 0);
  const dot = va.reduce((s, ai, i) => s + ai * vb[i], 0);
  const magA = Math.sqrt(va.reduce((s, ai) => s + ai * ai, 0));
  const magB = Math.sqrt(vb.reduce((s, bi) => s + bi * bi, 0));
  if (magA === 0 || magB === 0) return 0.7; // Neutral harmony for empty vectors
  return Math.max(0, Math.min(1, dot / (magA * magB)));
}

/** Dominant element from an elemental property object */
function dominantElement(e: ElementalProperties): Element {
  return (Object.entries(e).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "Fire") as Element;
}

export async function POST(request: NextRequest) {
  try {
    // Auth: try session first, then query param
    let userId = await getUserIdFromRequest(request);

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    if (!userId) userId = body.userId as string | null;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const {
      commensalIds = [],
      linkedUserIds = [],
      strategy = "average",
    } = body as {
      commensalIds?: string[];
      linkedUserIds?: string[];
      strategy?: "average" | "minimum" | "consensus";
    };

    // Load the current user's profile
    let currentUser = await userDatabase.getUserById(userId);
    if (!currentUser) {
      try {
        const { auth } = await import("@/lib/auth/auth");
        const session = await auth();
        if (session?.user?.email) {
          currentUser = await userDatabase.getUserByEmail(session.user.email);
        }
      } catch {
        // ignore
      }
    }

    // Collect elemental + alchemical data from all group members
    const elementalList: ElementalProperties[] = [];
    const alchemicalList: AlchemicalProperties[] = [];
    const memberInfo: Array<{ id: string; name: string; element: Element }> = [];

    // Include the current user if they have a natal chart
    const ownerChart = currentUser?.profile?.natalChart;
    if (ownerChart) {
      const el = (ownerChart.elementalBalance ?? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }) as any;
      const alch = (ownerChart.alchemicalProperties ?? calculateAlchemicalFromPlanets(ownerChart.planetaryPositions ?? {})) as any;
      elementalList.push(el);
      alchemicalList.push(alch);
      memberInfo.push({ id: userId, name: currentUser?.profile?.name ?? "You", element: dominantElement(el) });
    }

    // Manual commensals from the user's groupMembers
    if ((commensalIds as string[]).length > 0) {
      const groupMembers = currentUser?.profile?.groupMembers ?? [];
      for (const commensal of groupMembers) {
        if (!(commensalIds as string[]).includes(commensal.id)) continue;
        const chart = commensal.natalChart;
        if (!chart) continue;
        const el = (chart.elementalBalance ?? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }) as any;
        const alch = (chart.alchemicalProperties ?? calculateAlchemicalFromPlanets(chart.planetaryPositions ?? {})) as any;
        elementalList.push(el);
        alchemicalList.push(alch);
        memberInfo.push({ id: commensal.id, name: commensal.name, element: dominantElement(el) });
      }
    }

    // Linked friends (accepted friendships)
    if ((linkedUserIds as string[]).length > 0) {
      try {
        const linkedFriends = await socialDatabase.getLinkedFriendsForUser(userId);
        for (const friend of linkedFriends) {
          if (!(linkedUserIds as string[]).includes(friend.userId)) continue;
          const chart = friend.natalChart;
          if (!chart) continue;
          const el = (chart.elementalBalance ?? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }) as any;
          const alch = (chart.alchemicalProperties ?? calculateAlchemicalFromPlanets(chart.planetaryPositions ?? {})) as any;
          elementalList.push(el);
          alchemicalList.push(alch);
          memberInfo.push({ id: friend.userId, name: friend.name, element: dominantElement(el) });
        }
      } catch {
        // Social DB unavailable — skip linked friends
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

    // Score all cuisines
    const allCuisines: Array<{ id: string; name: string; elemental: ElementalProperties }> = CUISINE_LIST.map((c) => ({
      id: c.id,
      name: (c as any).name ?? c.id,
      elemental: ((c as any).elementalProperties ?? (c as any).elementalState ?? { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }) as ElementalProperties,
    }));

    // Compute harmony for each cuisine using the requested aggregation strategy
    const scoredCuisines = allCuisines.map((cuisine) => {
      let groupScore: number;
      const memberScores = memberInfo.map((m) => {
        const memberEl = elementalList[memberInfo.indexOf(m)] ?? compositeElemental;
        return {
          memberId: m.id,
          memberName: m.name,
          score: elementalHarmony(memberEl, cuisine.elemental),
        };
      });

      const scores = memberScores.map((ms) => ms.score);
      if (strategy === "minimum") {
        groupScore = Math.min(...scores);
      } else if (strategy === "consensus") {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const stddev = Math.sqrt(scores.reduce((s, x) => s + (x - avg) ** 2, 0) / scores.length);
        // Penalise high variance (low consensus)
        groupScore = avg * (1 - stddev);
      } else {
        // average
        groupScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      }

      const harmony = elementalHarmony(compositeElemental, cuisine.elemental);

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

    // Sort by aggregated score desc and return top results
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
    console.error("Group recommendations error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to compute group recommendations" },
      { status: 500 },
    );
  }
}
