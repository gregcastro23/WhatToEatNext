/**
 * Group Recommendations API
 * POST /api/group-recommendations
 *
 * Calculates composite alchemical properties across a group of commensals
 * and returns cuisine/cooking-method recommendations optimised for the group.
 */

import { NextResponse } from "next/server";
import { CUISINES } from "@/data/cuisines/index";
import { validateRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import { socialDatabase } from "@/services/socialDatabaseService";
import type { Element, Modality } from "@/types/celestial";
import type { GroupMember, CompositeNatalChart } from "@/types/natalChart";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Build composite chart by averaging ESMS + elementals across all members */
function buildCompositeChart(members: GroupMember[]): CompositeNatalChart {
  const count = members.length;

  // Sum alchemical properties
  let sumSpirit = 0, sumEssence = 0, sumMatter = 0, sumSubstance = 0;
  let sumFire = 0, sumWater = 0, sumEarth = 0, sumAir = 0;

  const elementDistribution: Record<Element, number> = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  const modalityDistribution: Record<Modality, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };

  members.forEach((m) => {
    const ap = m.natalChart.alchemicalProperties;
    sumSpirit += ap.Spirit ?? 0;
    sumEssence += ap.Essence ?? 0;
    sumMatter += ap.Matter ?? 0;
    sumSubstance += ap.Substance ?? 0;

    const eb = m.natalChart.elementalBalance;
    sumFire += eb.Fire ?? 0;
    sumWater += eb.Water ?? 0;
    sumEarth += eb.Earth ?? 0;
    sumAir += eb.Air ?? 0;

    elementDistribution[m.natalChart.dominantElement]++;
    modalityDistribution[m.natalChart.dominantModality]++;
  });

  // Convert element/modality counts to percentages
  const eDist: Record<Element, number> = {
    Fire: elementDistribution.Fire / count,
    Water: elementDistribution.Water / count,
    Earth: elementDistribution.Earth / count,
    Air: elementDistribution.Air / count,
  };
  const mDist: Record<Modality, number> = {
    Cardinal: modalityDistribution.Cardinal / count,
    Fixed: modalityDistribution.Fixed / count,
    Mutable: modalityDistribution.Mutable / count,
  };

  const avgElemental = { Fire: sumFire / count, Water: sumWater / count, Earth: sumEarth / count, Air: sumAir / count };

  const dominantElement = (Object.entries(eDist).sort(([, a], [, b]) => b - a)[0][0] as Element);
  const dominantModality = (Object.entries(mDist).sort(([, a], [, b]) => b - a)[0][0] as Modality);

  return {
    groupId: `composite_${Date.now()}`,
    memberCount: count,
    dominantElement,
    dominantModality,
    elementalBalance: avgElemental,
    alchemicalProperties: {
      Spirit: sumSpirit / count,
      Essence: sumEssence / count,
      Matter: sumMatter / count,
      Substance: sumSubstance / count,
    },
    elementalDistribution: eDist,
    modalityDistribution: mDist,
    calculatedAt: new Date().toISOString(),
  };
}

/** Score a cuisine against composite ESMS (0-1 scale) */
function scoreCuisine(
  cuisine: (typeof CUISINES)[keyof typeof CUISINES],
  composite: CompositeNatalChart,
): number {
  const props = (cuisine as any).alchemical_properties ?? {};
  const total = (composite.alchemicalProperties.Spirit ?? 0)
    + (composite.alchemicalProperties.Essence ?? 0)
    + (composite.alchemicalProperties.Matter ?? 0)
    + (composite.alchemicalProperties.Substance ?? 0);
  if (total === 0) return 0.5;

  const cuisineTotal = (props.Spirit ?? 0) + (props.Essence ?? 0) + (props.Matter ?? 0) + (props.Substance ?? 0);
  if (cuisineTotal === 0) return 0.5;

  const dot =
    ((composite.alchemicalProperties.Spirit ?? 0) / total) * ((props.Spirit ?? 0) / cuisineTotal) +
    ((composite.alchemicalProperties.Essence ?? 0) / total) * ((props.Essence ?? 0) / cuisineTotal) +
    ((composite.alchemicalProperties.Matter ?? 0) / total) * ((props.Matter ?? 0) / cuisineTotal) +
    ((composite.alchemicalProperties.Substance ?? 0) / total) * ((props.Substance ?? 0) / cuisineTotal);

  return Math.min(1, Math.max(0, dot * 4)); // scale dot product (max ~0.25 for equal weights) to 0-1
}

/** Score per-member compatibility with the group recommendation */
function scoreMember(member: GroupMember, cuisineName: string): number {
  const ap = member.natalChart.alchemicalProperties;
  const el = member.natalChart.dominantElement;
  // Simple heuristic: members with Fire/Air tend to like bold cuisines, Earth/Water = grounded
  const elementBonus: Record<Element, number> = { Fire: 0.1, Air: 0.05, Water: -0.05, Earth: 0 };
  const base = 0.65 + (elementBonus[el] ?? 0);
  const spirit = (ap.Spirit ?? 0) / 10;
  return Math.min(1, Math.max(0, base + spirit * 0.1));
}

/** POST /api/group-recommendations */
export async function POST(request: NextRequest) {
  const authResult = await validateRequest(request);
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const { commensalIds, groupId, strategy = "average" } = body as {
    commensalIds?: string[];
    groupId?: string;
    strategy?: "average" | "minimum" | "consensus";
  };

  const userId = authResult.user.userId;
  const user = await userDatabase.getUserById(userId);
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  // Resolve member list from group or explicit IDs
  let memberIds: string[] = commensalIds ?? [];
  const { linkedUserIds } = body as { linkedUserIds?: string[] };
  let linkedIds: string[] = linkedUserIds ?? [];

  if (!memberIds.length && !linkedIds.length && groupId) {
    const group = (user.profile.diningGroups ?? []).find((g) => g.id === groupId);
    if (!group) {
      return NextResponse.json({ success: false, message: "Dining group not found" }, { status: 404 });
    }
    memberIds = group.memberIds;
    // If this is an ExtendedDiningGroup, also pull linked user IDs
    linkedIds = (group as any).linkedUserIds ?? [];
  }

  if (!memberIds.length && !linkedIds.length) {
    return NextResponse.json(
      { success: false, message: "Provide commensalIds, linkedUserIds, or a valid groupId" },
      { status: 400 },
    );
  }

  // Resolve manual commensals
  const allMembers = user.profile.groupMembers ?? [];
  const selectedMembers = allMembers.filter((m) => memberIds.includes(m.id));

  // Resolve linked friends (registered users with accepted friendships)
  const allLinkedFriends = await socialDatabase.getLinkedFriendsForUser(userId);
  const selectedLinked: GroupMember[] = allLinkedFriends
    .filter((lf) => linkedIds.includes(lf.userId))
    .map((lf) => ({
      id: lf.userId,
      name: lf.name,
      relationship: "friend" as const,
      birthData: lf.birthData,
      natalChart: lf.natalChart,
      createdAt: lf.syncedAt,
    }));

  const combinedMembers = [...selectedMembers, ...selectedLinked];

  if (combinedMembers.length === 0) {
    return NextResponse.json({ success: false, message: "No valid commensals or linked friends found" }, { status: 400 });
  }

  // Include the requesting user as a member if they have a natal chart
  const membersForCalc: GroupMember[] = [...combinedMembers];
  if (user.profile.natalChart && user.profile.birthData) {
    membersForCalc.unshift({
      id: userId,
      name: user.profile.name || "You",
      relationship: "other",
      birthData: user.profile.birthData,
      natalChart: user.profile.natalChart,
      createdAt: new Date().toISOString(),
    });
  }

  const composite = buildCompositeChart(membersForCalc);

  // Score all cuisines
  const scored = Object.entries(CUISINES).map(([id, cuisine]) => {
    const groupScore = scoreCuisine(cuisine, composite);

    const memberScores = membersForCalc.map((m) => ({
      memberId: m.id,
      memberName: m.name,
      score: scoreMember(m, id),
      compatibility: scoreMember(m, id),
      reasons: [`${m.natalChart.dominantElement} element resonates with ${(cuisine as any).name ?? id}`],
    }));

    const aggregatedScore =
      strategy === "minimum"
        ? Math.min(...memberScores.map((ms) => ms.score))
        : memberScores.reduce((acc, ms) => acc + ms.score, 0) / memberScores.length;

    const harmony =
      1 -
      Math.sqrt(
        memberScores.reduce((acc, ms) => acc + Math.pow(ms.score - aggregatedScore, 2), 0) /
          memberScores.length,
      );

    return {
      cuisineId: id,
      cuisineName: (cuisine as any).name ?? id,
      groupScore: Math.round(groupScore * 100) / 100,
      memberScores,
      aggregatedScore: Math.round(aggregatedScore * 100) / 100,
      harmony: Math.round(harmony * 100) / 100,
      dominantElement: composite.dominantElement,
      reasons: [
        `Group dominant element: ${composite.dominantElement}`,
        `Aggregation: ${strategy}`,
        `${membersForCalc.length} members considered`,
      ],
    };
  });

  // Sort by aggregated score descending
  scored.sort((a, b) => b.aggregatedScore - a.aggregatedScore);

  return NextResponse.json({
    success: true,
    composite,
    recommendations: scored.slice(0, 8),
    memberCount: membersForCalc.length,
    strategy,
  });
}
