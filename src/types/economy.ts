/**
 * Alchemical Token Economy Type Definitions
 *
 * Types for the Spirit, Essence, Matter & Substance token economy.
 * Maps directly to the AlchemicalProperties interface in celestial.ts.
 *
 * @file src/types/economy.ts
 */

// ─── Core Token Types ──────────────────────────────────────────────────

/** The four alchemical token types, matching AlchemicalProperty in celestial.ts */
export type TokenType = "Spirit" | "Essence" | "Matter" | "Substance";

/** All valid token types as a runtime array */
export const TOKEN_TYPES: TokenType[] = ["Spirit", "Essence", "Matter", "Substance"];

/** Source of a token transaction */
export type TransactionSourceType =
  | "daily_yield"
  | "agents_yield"
  | "agents_operation"
  | "quest_reward"
  | "purchase"
  | "premium_purchase"
  | "transmutation"
  | "streak_bonus"
  | "alchemical_log"
  | "signup_grant"
  | "admin"
  /**
   * One-shot ESMS bundle purchased via Stripe — drives the MCP top-up
   * SKUs ($5/$20/$50 → 50/250/750 of each axis). Credited from the
   * Stripe webhook on `checkout.session.completed` with the Stripe
   * session id as the idempotency key.
   */
  | "mcp_top_up"
  /**
   * Automatic "Sky Drop" airdrop — a degree-exact planetary transit activated
   * the user's natal chart. Detected by the Planetary Agents reservoir engine
   * (separate Neon DB) and credited into the canonical Railway wallet via
   * POST /api/economy/sync-credit with per-axis amounts. Idempotency key shape:
   * `attune:human:<userId>:<degreeAgentId>:<YYYY-MM-DD>` (one per transit/day).
   */
  | "transit_attunement"
  /**
   * Reward for participating in planetary agent group chats.
   * Credited from the Planetary Agents engine.
   */
  | "group_chat_quest"
  /**
   * Debit for AI recipe ingestion — a user added a recipe by pasting text or
   * uploading a photo (GPT-4o extraction) via POST /api/recipes/extract.
   * Live-priced per extraction like refine_oracle; refunded if extraction fails.
   */
  | "recipe_ingestion"
  | "restaurant_order"
  /**
   * Re-credit of a restaurant_order debit when the restaurant settlement
   * (Stripe transfer) could not be confirmed and an operator refunds the
   * exact ESMS basket. Idempotency key shape: `restaurant_refund:<orderId>`.
   * See src/app/api/admin/restaurants/settlement/route.ts.
   */
  | "restaurant_refund"
  /**
   * Re-credit of a `recipe-nft-mint` debit when the off-chain mint could not be
   * recorded — e.g. a concurrent mint of the same recipe content won the
   * content_hash race, or the ledger write failed after the ESMS was debited.
   * Makes the off-chain spend exactly-once per content hash. Idempotency key
   * shape: `mint_refund:<contentHash>`. See src/app/api/recipes/mint/route.ts.
   */
  | "mint_refund"
  /**
   * Debit that moves a snapshot of the user's off-chain balance on-chain: the
   * four coins are debited atomically and EsmsToken.claimMint mints the same
   * amounts (18-dp scaled) to the user's linked wallet. source_id is the
   * esms_onchain_claims row id; idempotency key shape: `onchain_claim:<claimRowId>`.
   * See src/app/api/economy/claim-onchain/route.ts.
   */
  | "onchain_claim"
  /**
   * Re-credit of an `onchain_claim` debit when the claim could not be minted
   * and was verified never-claimed on-chain. Idempotency key shape:
   * `onchain_claim_refund:<claimRowId>`.
   */
  | "onchain_claim_refund"
  /**
   * Invisible practice reward — a natural product action (cooking a recipe,
   * acting on a recommendation, feed presence, discovering a surface) that
   * quietly pays. No quest UI advertises these; the delight toast reveals
   * them. source_id is the practice type; idempotency key shape:
   * `practice:<userId>:<type>:<dedupeKey>`. See src/lib/economy/practices.ts.
   */
  | "practice_reward";

// ─── Token Balances ────────────────────────────────────────────────────

/** User's current ESMS token balances */
export interface TokenBalances {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  lastDailyClaimAt: string | null;
  lastDailyClaimAgentsAt: string | null;
  updatedAt: string;
}

/** Default empty balances */
export const EMPTY_BALANCES: TokenBalances = {
  spirit: 0,
  essence: 0,
  matter: 0,
  substance: 0,
  lastDailyClaimAt: null,
  lastDailyClaimAgentsAt: null,
  updatedAt: new Date().toISOString(),
};

// ─── Token Transactions ────────────────────────────────────────────────

/** A single ledger entry */
export interface TokenTransaction {
  id: number;
  transactionGroupId: string;
  userId: string;
  tokenType: TokenType;
  amount: number;
  sourceType: TransactionSourceType;
  sourceId: string | null;
  description: string | null;
  createdAt: string;
}

// ─── Daily Yield ───────────────────────────────────────────────────────

/** Per-user yield weights derived from natal chart */
export interface YieldProfile {
  spiritWeight: number;
  essenceWeight: number;
  matterWeight: number;
  substanceWeight: number;
  natalChartHash: string | null;
  calculatedAt: string;
}

/** Result of calculating a daily yield */
export interface DailyYieldResult {
  baseTokens: number;
  streakMultiplier: number;
  /** Multiplier from current ESMS holdings (see getHoldingsMultiplier). */
  holdingsMultiplier: number;
  totalTokens: number;
  distribution: {
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
  };
  transitBonus: {
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
  };
  newBalances: TokenBalances;
  streakCount: number;
  /** Set when this claim crossed a streak milestone and its bonus was granted. */
  milestoneBonus?: {
    days: number;
    totalTokens: number;
  };
}

// ─── Streaks ───────────────────────────────────────────────────────────

/** User streak state */
export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  streakFrozenUntil: string | null;
  updatedAt: string;
}

// ─── Quests ────────────────────────────────────────────────────────────

/** Quest frequency type */
export type QuestType = "daily" | "weekly" | "achievement";

/** Quest definition from the database */
export interface QuestDefinition {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  questType: QuestType;
  tokenRewardType: TokenType | "all";
  tokenRewardAmount: number;
  triggerEvent: string;
  triggerThreshold: number;
  isActive: boolean;
  sortOrder?: number;
}

/** User's progress on a specific quest */
export interface QuestProgress {
  quest: QuestDefinition;
  progress: number;
  completedAt: string | null;
  claimedAt: string | null;
  periodStart: string | null;
}

/** Full quest panel data */
export interface QuestPanelData {
  daily: QuestProgress[];
  weekly: QuestProgress[];
  achievements: QuestProgress[];
}

// ─── Shop ──────────────────────────────────────────────────────────────

/** An item in the Alchemist Shop */
export interface ShopItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  costSpirit: number;
  costEssence: number;
  costMatter: number;
  costSubstance: number;
  isOneTime: boolean;
  isActive: boolean;
}

/** Whether the user can afford an item */
export interface AffordabilityCheck {
  canAfford: boolean;
  missing: {
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
  };
}

// ─── Transmutation ─────────────────────────────────────────────────────

/** Transmutation ratio: 3 of source → 1 of target */
export const TRANSMUTATION_RATIO = 3;

export interface TransmutationRequest {
  fromToken: TokenType;
  toToken: TokenType;
  amount: number; // amount of target tokens to receive
}

export interface TransmutationResult {
  spent: { tokenType: TokenType; amount: number };
  received: { tokenType: TokenType; amount: number };
  newBalances: TokenBalances;
}

// ─── Economy Constants ─────────────────────────────────────────────────

/** Base daily token reward before multipliers */
export const BASE_DAILY_TOKENS = 10;

/** Premium subscribers get 2× daily yield */
export const PREMIUM_YIELD_MULTIPLIER = 2.0;

/** Maximum streak multiplier (reached at 30-day streak) */
export const MAX_STREAK_MULTIPLIER = 2.0;

/** Streak multiplier ramp: starts at 1.0, increases by 0.033 per day up to MAX */
export function getStreakMultiplier(streakCount: number): number {
  // Day 0–1: 1.0x, Day 7: ~1.23x, Day 15: ~1.5x, Day 30+: 2.0x
  const multiplier = 1.0 + (streakCount * (MAX_STREAK_MULTIPLIER - 1.0)) / 30;
  return Math.min(multiplier, MAX_STREAK_MULTIPLIER);
}

/** Bonus scale factor for transit ESMS deltas */
export const TRANSIT_BONUS_SCALE = 2.0;

// ─── Streak Milestone Bonuses ────────────────────────────────────────────

/**
 * One-shot bonus (total ESMS, split evenly across the four coins) granted the
 * day a claim streak reaches each milestone — the `streak_bonus` ledger source.
 * Rebuilding a broken streak re-earns the milestone (it can't double-fire on
 * the same day thanks to the day-scoped idempotency key).
 */
export const STREAK_MILESTONE_BONUSES: ReadonlyArray<{ days: number; totalTokens: number }> = [
  { days: 7, totalTokens: 10 },
  { days: 14, totalTokens: 16 },
  { days: 30, totalTokens: 40 },
  { days: 60, totalTokens: 80 },
  { days: 100, totalTokens: 150 },
  { days: 365, totalTokens: 500 },
];

/** The milestone hit exactly at `streakCount`, if any. */
export function getStreakMilestone(streakCount: number): { days: number; totalTokens: number } | null {
  return STREAK_MILESTONE_BONUSES.find((m) => m.days === streakCount) ?? null;
}

// ─── Holdings-Scaled Yield ───────────────────────────────────────────────

/** Coefficient on the log term of the holdings multiplier. */
export const HOLDINGS_YIELD_COEFF = 0.25;
/** Total ESMS that constitutes one "decade" of holdings for the log term. */
export const HOLDINGS_YIELD_SCALE = 100;
/** Hard cap on the holdings multiplier (guards against runaway compounding). */
export const HOLDINGS_YIELD_MAX = 2.0;

/**
 * Daily-yield multiplier derived from the user's current total ESMS holdings:
 * the more you hold, the more you draw each day. Uses log10 + a hard cap so the
 * reward has steep diminishing returns — loyalty is rewarded without letting
 * large balances compound away from everyone else.
 *
 *   0 → 1.00× · 100 → ~1.08× · 500 → ~1.19× · 1k → ~1.26× · 5k → ~1.43× · cap 2.00×
 */
export function getHoldingsMultiplier(totalHoldings: number): number {
  const safe = Math.max(0, totalHoldings);
  const multiplier =
    1 + HOLDINGS_YIELD_COEFF * Math.log10(1 + safe / HOLDINGS_YIELD_SCALE);
  return Math.min(multiplier, HOLDINGS_YIELD_MAX);
}

// ─── API Response Types ────────────────────────────────────────────────

export interface EconomyBalanceResponse {
  success: boolean;
  balances: TokenBalances;
  streak: UserStreak;
  canClaimDaily: boolean;
}

export interface ClaimDailyResponse {
  success: boolean;
  yield: DailyYieldResult;
  message: string;
}

export interface TransactionsResponse {
  success: boolean;
  transactions: TokenTransaction[];
  total: number;
}

export interface QuestsResponse {
  success: boolean;
  quests: QuestPanelData;
  streak: UserStreak;
}

export interface TransmuteResponse {
  success: boolean;
  result: TransmutationResult;
  message: string;
}
