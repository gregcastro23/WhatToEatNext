/**
 * Agent Leveling & Dynamic Celestial Progression Service
 *
 * Coordinates the full leveling lifecycle for agents and vessels:
 *   1. Aggregates permanent Alchm EXP from pre-trained historical conversations,
 *      live dialogues, wisdom tokens, and Pentacles / Jing victories.
 *   2. Derives permanent Vessel Level (1–100) and additive baseline boost (+0–12 OVR).
 *   3. Resolves all 19 stats (Sacred 7 on [25, 99] and Planetary 12 on [0, 100]).
 *   4. Transforms the baseline into a truly dynamic Current Overall using
 *      current celestial sky transits against the agent's natal chart DNA.
 *
 * @file src/lib/agents/levelingService.ts
 */

import {
  calculateAlchmExp,
  type AlchmExpBreakdown,
  type AlchmExpSources,
} from "@/lib/vessel/experienceEngine";
import {
  computeVesselProgression,
  type VesselProgression,
  type VesselStats,
} from "@/lib/vessel/progression";
import {
  computeRelativeAdvantage,
  resolveArchetype,
  type SacredStatKey,
  type VesselArchetype,
} from "@/lib/vessel/ratingContract";
import {
  getCurrentSkySnapshot,
  type CurrentSkySnapshot,
} from "@/lib/vessel/skyProvider";
import {
  resolve19Stats,
  resolveNatalLongitudes,
  type AgentStatSource,
  type NatalPlacementInput,
} from "@/lib/vessel/statResolver";

export interface AgentProgressionProfile {
  agentId: string;
  vesselLevel: number;
  totalXp: number;
  xpToNextLevel: number | null;
  levelBoost: number;
  baseOverall: number;
  trainedOverall: number;
  currentOverall: number;
  transitDelta: number;
  progressionStatus: "live" | "estimated" | "unavailable";
  asOf: string | null;
  archetype: VesselArchetype;
  expBreakdown: AlchmExpBreakdown;
  stats: VesselStats;
  statDeltas: VesselStats;
  reasons: string[];
}

export interface AgentLikeInput extends AgentStatSource {
  id?: string;
  name?: string;
  personality?: {
    evolutionStage?: number;
    [key: string]: unknown;
  };
  consciousness?: {
    monicaConstant?: number;
    alchemicalElements?: {
      spirit?: number;
      essence?: number;
      matter?: number;
      substance?: number;
    };
    dominantElement?: string;
    level?: string;
    natalChart?: {
      provenance?: string;
      planets?: Record<string, NatalPlacementInput>;
      houses?: { ASC?: number; MC?: number };
      ascendant?: number;
      [key: string]: unknown;
    };
  };
  birthData?: {
    date?: string;
    time?: string;
    location?: unknown;
  };
  [key: string]: unknown;
}

export function computeAgentProgression(
  agentInput: AgentLikeInput | string,
  options?: {
    additionalActions?: Partial<AlchmExpSources>;
    now?: number;
    customSky?: CurrentSkySnapshot;
  },
): AgentProgressionProfile {
  const now = options?.now ?? Date.now();
  const agent: AgentLikeInput =
    typeof agentInput === "string"
      ? { id: agentInput, name: agentInput }
      : agentInput;
  const agentId = agent.id ?? "agent";

  // 1. Gather all action sources for Alchm EXP
  // Historical agents have baseline pre-training conversations
  const historicalConvs =
    agent.stats?.conversations ?? (agentId === "user-avatar-neo" ? 120 : 250);
  const wisdomShared = agent.stats?.wisdomShared ?? 100;
  const rawPoints =
    agent.stats?.evolutionPoints ??
    (agent.personality?.evolutionStage
      ? agent.personality.evolutionStage * 80
      : 0);

  const expSources: AlchmExpSources = {
    historicalConversations: historicalConvs,
    wisdomShared,
    rawEvolutionPoints: rawPoints,
    liveChatMessages: options?.additionalActions?.liveChatMessages ?? 0,
    kitchenAchievements: options?.additionalActions?.kitchenAchievements ?? 0,
    kitchenQuests: options?.additionalActions?.kitchenQuests ?? 0,
    pentaclesWins: options?.additionalActions?.pentaclesWins ?? 0,
    jingDuelsWon: options?.additionalActions?.jingDuelsWon ?? 0,
    wordWins: options?.additionalActions?.wordWins ?? 0,
  };

  const expBreakdown = calculateAlchmExp(expSources);

  // 2. Resolve all 19 stats
  const stats19 = resolve19Stats(agent);

  // 3. Resolve primary and secondary character archetype
  const sacredRatings: Record<SacredStatKey, number> = {
    power: stats19.power,
    resonance: stats19.resonance,
    wisdom: stats19.wisdom,
    charisma: stats19.charisma,
    intuition: stats19.intuition,
    adaptability: stats19.adaptability,
    vitality: stats19.vitality,
  };
  const relAdv = computeRelativeAdvantage(sacredRatings);
  const archetype = resolveArchetype(relAdv);

  // 4. Resolve natal chart placements [0, 360)
  const natalPlanets = agent.consciousness?.natalChart?.planets;
  const natalLongitudes = resolveNatalLongitudes(natalPlanets);

  const hasNatal = Object.keys(natalLongitudes).length > 0;
  const natalProvenance =
    agent.consciousness?.natalChart?.provenance === "computed"
      ? "computed"
      : "authored";

  // 5. Get current celestial sky snapshot
  const sky = options?.customSky ?? getCurrentSkySnapshot(now);

  // 6. Execute pure vessel progression fold
  const progression: VesselProgression = computeVesselProgression({
    stats: stats19,
    totalXp: expBreakdown.totalXp,
    natal: hasNatal
      ? {
          provenance: natalProvenance,
          positions: natalLongitudes,
        }
      : {
          provenance: "authored",
          positions: {
            Sun: { longitude: 283.8 },
            Moon: { longitude: 268.2 },
            Mercury: { longitude: 273.4 },
          },
        },
    sky,
    character: {
      primary: archetype.primary,
      secondary: archetype.secondary,
    },
    now,
  });

  // 7. Calculate transit delta
  const effectiveCurrentOvr =
    progression.currentOverall ?? progression.trainedOverall;
  const transitDelta =
    Math.round((effectiveCurrentOvr - progression.trainedOverall) * 10) / 10;

  return {
    agentId,
    vesselLevel: progression.level,
    totalXp: progression.totalXp,
    xpToNextLevel: progression.xpToNextLevel,
    levelBoost: Math.round(expBreakdown.levelBoost * 10) / 10,
    baseOverall: Math.round(progression.baseOverall * 10) / 10,
    trainedOverall: Math.round(progression.trainedOverall),
    currentOverall: Math.round(effectiveCurrentOvr),
    transitDelta,
    progressionStatus: progression.status,
    asOf: progression.asOf,
    archetype,
    expBreakdown,
    stats: stats19,
    statDeltas: progression.statDeltas,
    reasons: progression.reasons,
  };
}
