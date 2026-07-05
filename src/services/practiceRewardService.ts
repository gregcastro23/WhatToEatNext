/**
 * Invisible practice rewards — recognize a natural product action, dedupe it,
 * credit the coin, and hand back the delight line.
 *
 * Flow per event: validate against the catalog → INSERT the practice_events
 * row (the unique constraint IS the dedupe — a duplicate act is a silent
 * no-op) → count today's rewarded rows against the daily cap (past the cap the
 * act still records with amount 0, keeping the personalization signal) →
 * credit token_transactions (source_type 'practice_reward', idempotency key
 * mirroring the dedupe key so ledger and practice ledger can never disagree).
 *
 * PR2 slots transit modulation + the per-user celestial budget into
 * computeReward() — everything else stays put.
 */

import { executeQuery } from "@/lib/database";
import { getCelestialRewardContext, type CelestialRewardContext } from "@/lib/economy/celestial";
import {
  DISCOVERABLE_SURFACES,
  PRACTICES,
  pickHint,
  type PracticeDefinition,
  type PracticeType,
} from "@/lib/economy/practices";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { TokenBalances } from "@/types/economy";

export interface PracticeResult {
  rewarded: boolean;
  /** 'already' = dedupe hit; 'capped' = recorded but past today's cap; 'invalid' = bad input. */
  reason?: "already" | "capped" | "invalid" | "error";
  tokenType?: string;
  amount?: number;
  hint?: string;
  balances?: TokenBalances | null;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Normalize a client target into a bounded, index-friendly key segment. */
function normalizeTarget(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().slice(0, 180);
  return /^[\w:./-]+$/.test(t) ? t : null;
}

function dedupeKeyFor(def: PracticeDefinition, target: string | null): string {
  const base = target ?? "-";
  return def.dedupe === "daily" ? `${base}:${todayKey()}` : base;
}

/**
 * Sky × chart modulation: the same act pays more when the user's natal
 * weights resonate with today's transits (see lib/economy/celestial.ts).
 */
function computeReward(def: PracticeDefinition, ctx: CelestialRewardContext): number {
  const coin = def.tokenType.toLowerCase() as "spirit" | "essence" | "matter" | "substance";
  const modulated = def.baseAmount * ctx.perCoinReward[coin];
  return Math.round(modulated * 100) / 100;
}

export const practiceRewardService = {
  async recognize(userId: string, type: string, rawTarget?: unknown): Promise<PracticeResult> {
    const def = PRACTICES[type as PracticeType];
    if (!def) return { rewarded: false, reason: "invalid" };

    const target = normalizeTarget(rawTarget);
    if (def.requiresTarget && !target) return { rewarded: false, reason: "invalid" };
    if (def.type === "surface_discovered" && (!target || !DISCOVERABLE_SURFACES.has(target))) {
      return { rewarded: false, reason: "invalid" };
    }

    const dedupeKey = dedupeKeyFor(def, target);
    const day = todayKey();
    const hint = pickHint(def, userId, day);
    const ctx = await getCelestialRewardContext(userId);

    try {
      // One statement decides everything: the insert only lands if this act is
      // new (unique dedupe), and the amount is zero when today's rewarded rows
      // already reached the per-type cap OR the day's celestial budget is
      // spent — no separate read races the write. The budget check is
      // strictly-before ($10), so the final grant may overshoot by at most one
      // reward — accepted, documented in-world as the sky's generosity.
      const res = await executeQuery<{ amount: string }>(
        `WITH todays AS (
           SELECT
             COUNT(*) FILTER (WHERE practice_type = $2 AND amount > 0) AS rewarded_today,
             COALESCE(SUM(amount), 0) AS spent_today
           FROM practice_events
           WHERE user_id = $1 AND created_at >= $6::date
         ),
         ins AS (
           INSERT INTO practice_events (user_id, practice_type, dedupe_key, target_id, token_type, amount, hint)
           SELECT $1, $2, $3, $4, $5,
                  CASE
                    WHEN t.rewarded_today < $7 AND t.spent_today < $10 THEN $8::decimal
                    ELSE 0
                  END,
                  $9
           FROM todays t
           ON CONFLICT ON CONSTRAINT uniq_practice_dedupe DO NOTHING
           RETURNING amount
         )
         SELECT amount FROM ins`,
        [
          userId,
          def.type,
          dedupeKey,
          target,
          def.tokenType,
          day,
          def.dailyCap,
          computeReward(def, ctx),
          hint,
          ctx.dailyBudget,
        ],
      );

      if (res.rows.length === 0) {
        // Dedupe hit — this exact act already recognized. Stay silent.
        return { rewarded: false, reason: "already" };
      }

      const amount = parseFloat(res.rows[0].amount) || 0;
      if (amount <= 0) {
        return { rewarded: false, reason: "capped" };
      }

      const balances = await tokenEconomy.creditTokens(
        userId,
        def.tokenType,
        amount,
        "practice_reward",
        {
          sourceId: def.type,
          description: hint,
          idempotencyKey: `practice:${userId}:${def.type}:${dedupeKey}`,
        },
      );

      // Credit failed (DB blip) after the practice row landed: zero the row so
      // the celestial budget isn't charged for tokens that never credited, and
      // stay silent — never toast a reward that didn't happen.
      if (!balances) {
        await executeQuery(
          `UPDATE practice_events SET amount = 0
           WHERE user_id = $1 AND practice_type = $2 AND dedupe_key = $3`,
          [userId, def.type, dedupeKey],
        ).catch(() => {});
        return { rewarded: false, reason: "error" };
      }

      return { rewarded: true, tokenType: def.tokenType, amount, hint, balances };
    } catch (err) {
      console.error("[practiceRewardService] recognize failed:", err);
      return { rewarded: false, reason: "error" };
    }
  },

  /** Tokens already drawn from today's celestial allowance (all practice types). */
  async todaysSpend(userId: string): Promise<number> {
    try {
      const res = await executeQuery<{ spent: string }>(
        `SELECT COALESCE(SUM(amount), 0) AS spent
         FROM practice_events
         WHERE user_id = $1 AND created_at >= $2::date`,
        [userId, todayKey()],
      );
      return parseFloat(res.rows[0]?.spent ?? "0") || 0;
    } catch {
      return 0;
    }
  },

  /** The surfaces a user has already discovered (client seeds its local cache). */
  async discoveredSurfaces(userId: string): Promise<string[]> {
    try {
      const res = await executeQuery<{ target_id: string }>(
        `SELECT target_id FROM practice_events
         WHERE user_id = $1 AND practice_type = 'surface_discovered'`,
        [userId],
      );
      return res.rows.map((r) => r.target_id).filter(Boolean);
    } catch {
      return [];
    }
  },
};
