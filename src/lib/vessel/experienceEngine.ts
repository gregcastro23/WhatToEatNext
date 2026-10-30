/**
 * Alchm Experience Engine — Cross-Site Progression & XP Accumulation
 *
 * Computes permanent Alchm EXP and Vessel Level across all ecosystem actions:
 *   1. Chat & Training Experience (Pre-training historical conversations, live chat, wisdom)
 *   2. Kitchen Achievements & Quests (Recipes created, critiques, achievements, quests)
 *   3. Pentacles Arena & Minigame Winnings (Pentacles melee, 14-Pillars duels, Jing duels)
 *
 * Invariant Rules:
 *   - Vessel Level only accumulates; it NEVER falls.
 *   - Vessel Level additively boosts baseline capability (+0 to +12 OVR points).
 *   - The dynamic sky transforms Current Overall above or below this trained baseline.
 *
 * @file src/lib/vessel/experienceEngine.ts
 */

export interface AlchmExpSources {
  historicalConversations?: number;
  liveChatMessages?: number;
  wisdomShared?: number;
  kitchenAchievements?: number;
  kitchenQuests?: number;
  pentaclesWins?: number;
  jingDuelsWon?: number;
  wordWins?: number;
  rawEvolutionPoints?: number;
}

export interface AlchmExpBreakdown {
  totalXp: number;
  level: number;
  xpToNextLevel: number | null;
  levelBoost: number;
  categoryXp: {
    chatAndTraining: number;
    kitchen: number;
    pentaclesAndArena: number;
    bonus: number;
  };
  sources: Required<AlchmExpSources>;
}

export const ALCHM_EXP_WEIGHTS = Object.freeze({
  HISTORICAL_CONVERSATION: 25,
  LIVE_CHAT_MESSAGE: 15,
  WISDOM_SHARED: 8,
  KITCHEN_ACHIEVEMENT: 120,
  KITCHEN_QUEST: 60,
  PENTACLES_WIN: 75,
  JING_DUEL_WIN: 50,
  WORD_WIN: 40,
});

export function computeVesselLevel(totalXp: number): number {
  if (!Number.isFinite(totalXp) || totalXp <= 0) return 1;
  return Math.min(100, Math.max(1, 1 + Math.floor(Math.sqrt(totalXp / 100))));
}

export function computeXpToNextLevel(
  level: number,
  totalXp: number,
): number | null {
  if (level >= 100) return null;
  const requiredForNext = 100 * level ** 2;
  return Math.max(0, requiredForNext - Math.max(0, totalXp));
}

export function computeLevelBoost(level: number): number {
  const clampedLevel = Math.max(1, Math.min(100, Math.floor(level)));
  return (12 * (clampedLevel - 1)) / 99;
}

export function calculateAlchmExp(sources: AlchmExpSources): AlchmExpBreakdown {
  const safe = {
    historicalConversations: Math.max(
      0,
      Math.round(sources.historicalConversations ?? 0),
    ),
    liveChatMessages: Math.max(0, Math.round(sources.liveChatMessages ?? 0)),
    wisdomShared: Math.max(0, Math.round(sources.wisdomShared ?? 0)),
    kitchenAchievements: Math.max(
      0,
      Math.round(sources.kitchenAchievements ?? 0),
    ),
    kitchenQuests: Math.max(0, Math.round(sources.kitchenQuests ?? 0)),
    pentaclesWins: Math.max(0, Math.round(sources.pentaclesWins ?? 0)),
    jingDuelsWon: Math.max(0, Math.round(sources.jingDuelsWon ?? 0)),
    wordWins: Math.max(0, Math.round(sources.wordWins ?? 0)),
    rawEvolutionPoints: Math.max(
      0,
      Math.round(sources.rawEvolutionPoints ?? 0),
    ),
  };

  const chatAndTraining =
    safe.historicalConversations * ALCHM_EXP_WEIGHTS.HISTORICAL_CONVERSATION +
    safe.liveChatMessages * ALCHM_EXP_WEIGHTS.LIVE_CHAT_MESSAGE +
    safe.wisdomShared * ALCHM_EXP_WEIGHTS.WISDOM_SHARED;

  const kitchen =
    safe.kitchenAchievements * ALCHM_EXP_WEIGHTS.KITCHEN_ACHIEVEMENT +
    safe.kitchenQuests * ALCHM_EXP_WEIGHTS.KITCHEN_QUEST;

  const pentaclesAndArena =
    safe.pentaclesWins * ALCHM_EXP_WEIGHTS.PENTACLES_WIN +
    safe.jingDuelsWon * ALCHM_EXP_WEIGHTS.JING_DUEL_WIN +
    safe.wordWins * ALCHM_EXP_WEIGHTS.WORD_WIN;

  const bonus = safe.rawEvolutionPoints;

  const totalXp = Math.min(
    Number.MAX_SAFE_INTEGER,
    chatAndTraining + kitchen + pentaclesAndArena + bonus,
  );
  const level = computeVesselLevel(totalXp);
  const xpToNextLevel = computeXpToNextLevel(level, totalXp);
  const levelBoost = computeLevelBoost(level);

  return {
    totalXp,
    level,
    xpToNextLevel,
    levelBoost,
    categoryXp: {
      chatAndTraining,
      kitchen,
      pentaclesAndArena,
      bonus,
    },
    sources: safe,
  };
}
