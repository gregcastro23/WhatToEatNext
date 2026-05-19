/**
 * Group Dynamics Computation
 *
 * Aggregates per-user elemental profiles into a group harmony score,
 * power amplification, momentum flow, and per-user contributions.
 * Used by PlanetaryKineticsClient and PlanetaryAgentsAdapter to compute
 * real group dynamics from saved birth charts.
 */

import { _logger } from "@/lib/logger";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import type { ElementalProperties as AlchemyElementalProperties } from "@/types/alchemy";
import type { ElementalProperties } from "@/types/celestial";
import type { GroupDynamicsData } from "@/types/kinetics";
import { calculateElementalHarmony } from "@/utils/astrology/elementalValidation";

export interface ComputedGroupDynamics extends GroupDynamicsData {
  profilesFound: number;
  profilesMissing: number;
}

const EMPTY_GROUP_DYNAMICS: GroupDynamicsData = {
  harmony: 0,
  powerAmplification: 1,
  momentumFlow: "sustained",
  groupResonance: 0,
  individualContributions: {},
};

export async function computeGroupDynamics(
  userIds: string[],
): Promise<ComputedGroupDynamics> {
  if (userIds.length === 0) {
    return { ...EMPTY_GROUP_DYNAMICS, profilesFound: 0, profilesMissing: 0 };
  }

  const profileResults = await Promise.all(
    userIds.map(async (id) => ({
      userId: id,
      profile: await commensalDatabase.getUserElementalProfile(id),
    })),
  );

  const withProfiles = profileResults.filter(
    (p): p is { userId: string; profile: ElementalProperties } => p.profile !== null,
  );
  const profilesFound = withProfiles.length;
  const profilesMissing = profileResults.length - profilesFound;

  const individualContributions: Record<
    string,
    { powerContribution: number; harmonyImpact: number }
  > = {};

  if (profilesFound === 0) {
    _logger.warn(
      `computeGroupDynamics: no elemental profiles found for ${userIds.length} user(s)`,
    );
    for (const id of userIds) {
      individualContributions[id] = { powerContribution: 0, harmonyImpact: 0 };
    }
    return {
      ...EMPTY_GROUP_DYNAMICS,
      individualContributions,
      profilesFound: 0,
      profilesMissing,
    };
  }

  // Group-averaged elemental properties
  const groupAverage: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  for (const { profile } of withProfiles) {
    groupAverage.Fire += profile.Fire;
    groupAverage.Water += profile.Water;
    groupAverage.Earth += profile.Earth;
    groupAverage.Air += profile.Air;
  }
  groupAverage.Fire /= profilesFound;
  groupAverage.Water /= profilesFound;
  groupAverage.Earth /= profilesFound;
  groupAverage.Air /= profilesFound;

  // Pairwise elemental harmony
  const pairwiseHarmonies: number[] = [];
  const perUserHarmonies: Record<string, number[]> = {};
  for (const { userId } of withProfiles) perUserHarmonies[userId] = [];

  for (let i = 0; i < withProfiles.length; i++) {
    for (let j = i + 1; j < withProfiles.length; j++) {
      let h: number;
      try {
        h = calculateElementalHarmony(
          withProfiles[i].profile as AlchemyElementalProperties,
          withProfiles[j].profile as AlchemyElementalProperties,
        );
      } catch {
        h = 0.7;
      }
      pairwiseHarmonies.push(h);
      perUserHarmonies[withProfiles[i].userId].push(h);
      perUserHarmonies[withProfiles[j].userId].push(h);
    }
  }

  // Single-member groups have no pairs — harmony defaults to self-resonance
  const harmony =
    pairwiseHarmonies.length > 0
      ? pairwiseHarmonies.reduce((a, b) => a + b, 0) / pairwiseHarmonies.length
      : 1.0;

  // Group resonance — inverse variance of per-element values across members
  const elements: Array<keyof ElementalProperties> = ["Fire", "Water", "Earth", "Air"];
  let varianceSum = 0;
  for (const el of elements) {
    let v = 0;
    for (const { profile } of withProfiles) {
      v += (profile[el] - groupAverage[el]) ** 2;
    }
    varianceSum += v / profilesFound;
  }
  // Variance ranges roughly 0..0.5 in practice; scale to 0..1 resonance
  const groupResonance = Math.max(0, Math.min(1, 1 - varianceSum * 2));

  // Power amplification — driven by dominant element strength + log scaling on group size
  const dominantStrength = Math.max(
    groupAverage.Fire,
    groupAverage.Water,
    groupAverage.Earth,
    groupAverage.Air,
  );
  const powerAmplification = 1 + dominantStrength * Math.log2(profilesFound + 1) * 0.3;

  // Momentum flow — masculine (Fire/Air) vs feminine (Water/Earth) tilt
  const fireAir = groupAverage.Fire + groupAverage.Air;
  const waterEarth = groupAverage.Water + groupAverage.Earth;
  let momentumFlow: GroupDynamicsData["momentumFlow"];
  if (fireAir > waterEarth + 0.1) momentumFlow = "accelerating";
  else if (waterEarth > fireAir + 0.1) momentumFlow = "decelerating";
  else momentumFlow = "sustained";

  // Per-user contributions
  for (const { userId, profile } of withProfiles) {
    const dom = Math.max(profile.Fire, profile.Water, profile.Earth, profile.Air);
    const userHarmonies = perUserHarmonies[userId];
    const avgHarmony =
      userHarmonies.length > 0
        ? userHarmonies.reduce((a, b) => a + b, 0) / userHarmonies.length
        : 1.0;
    individualContributions[userId] = {
      powerContribution: dom,
      harmonyImpact: avgHarmony,
    };
  }
  for (const { userId, profile } of profileResults) {
    if (!profile) {
      individualContributions[userId] = { powerContribution: 0, harmonyImpact: 0 };
    }
  }

  return {
    harmony,
    powerAmplification,
    momentumFlow,
    groupResonance,
    individualContributions,
    profilesFound,
    profilesMissing,
  };
}
