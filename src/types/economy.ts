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
   * Re-credit of an `unlock-cosmic-recipe` debit when the Planetary Agents
   * generation produced no recipe — upstream non-2xx, the 45s deadline breach,
   * schema drift, or an unexpected fault. Idempotency key shape:
   * `cosmic_recipe_refund:<transactionGroupId>`, the group id of the debit
   * being reversed. See src/app/api/generate-cosmic-recipe/route.ts.
   */
  | "cosmic_recipe_refund"
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
   * four coins are debited atomically and on-chain claims are recorded per target
   * CAIP-2 chain (`eip155:8453`, `eip155:84532`, `solana:mainnet-beta`, `solana:devnet`).
   * Scaled to 18 decimals on EVM / Base contracts and 4 decimals on Solana SPL tokens.
   * source_id is the esms_onchain_claims row id; idempotency key shape: `onchain_claim:<claimRowId>`.
   * See src/app/api/economy/claim-onchain/route.ts.
   */
  | "onchain_claim"
  /**
   * Re-credit of an `onchain_claim` debit when the claim could not be minted
   * and was verified never-claimed on-chain on its target chain rail. Idempotency key shape:
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

export interface TokenDistribution {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

/** Inputs used to colour a faucet grant after its resonance sets the magnitude. */
export interface GlobalSupplyState extends TokenDistribution {
  total?: number;
  /** True when the live balance query failed and the audited snapshot was used. */
  isDegraded?: boolean;
}

export interface TokenYieldBreakdown {
  natalRatio: number;
  transitRatio: number;
  antiGlutFactor: number;
  finalYield: number;
}

export interface FaucetResonanceBreakdown {
  /** Signed, degree-level natal-to-current-sky aspect score S(N,t). */
  score: number;
  /** The chart's deterministic fixed-epoch mean S-bar(N). */
  baseline: number;
  /** Self-normalised resonance z = S(N,t) / S-bar(N). */
  ratio: number;
}

/** Pure result from the untethered resonance faucet before persistence. */
export interface DiscriminantYieldResult extends TokenDistribution {
  total: number;
  resonance: FaucetResonanceBreakdown;
  breakdown: Record<Lowercase<TokenType>, TokenYieldBreakdown>;
}

/** Result of calculating a daily yield */
export interface DailyYieldResult {
  totalTokens: number;
  distribution: TokenDistribution;
  resonance: FaucetResonanceBreakdown;
  breakdown: DiscriminantYieldResult["breakdown"];
  newBalances: TokenBalances;
  streakCount: number;
  /** Set when this claim crossed a streak milestone and its bonus was granted. */
  milestoneBonus?: {
    days: number;
    totalTokens: number;
  };
}

/**
 * What a daily-yield claim actually did.
 *
 * `claimDailyYield` used to return `DailyYieldResult | null`, and that `null`
 * collapsed two opposite outcomes: the day was already claimed (nothing owed)
 * versus the credit transaction rolled back (the day is still owed). Both
 * callers read it as the first, so a database fault told the user "return
 * tomorrow" and cost them a day's yield.
 */
export type DailyYieldClaim =
  /** Tokens were credited. */
  | { status: "claimed"; result: DailyYieldResult }
  /** Today's yield was already credited — nothing further is owed. */
  | { status: "already_claimed" }
  /** The transaction rolled back. Nothing was credited and the day is STILL claimable. */
  | {
      status: "failed";
      /** SQLSTATE, when the driver supplied one. */
      code: string | null;
      constraint: string | null;
      message: string;
    };

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

/**
 * Untethered per-site faucet band. Twelve is the self-normalised centre, not a
 * conserved total: authentic natal-to-sky resonance can move a claim anywhere
 * in this 8x range.
 */
export const PROTOCOL_BAND = { min: 3, center: 12, max: 24 } as const;

/** Every claim funds at least one 0.30-SPIRIT conversational operation per axis. */
export const AXIS_FLOOR = 0.3;

/** Streak progress display calibration; deliberately not applied to daily claims. */
export const MAX_STREAK_MULTIPLIER = 2;

/** Legacy streak progress signal retained for the streak API and UI only. */
export function getStreakMultiplier(streakCount: number): number {
  return Math.min(
    1 + (streakCount * (MAX_STREAK_MULTIPLIER - 1)) / 30,
    MAX_STREAK_MULTIPLIER,
  );
}

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
