/**
 * Settlement logic for cosmic recipe token economy refunds.
 *
 * Slices B1 / Phase 45: Ensure refund responses and telemetry reflect the
 * ACTUAL outcome of the credit operation (confirmed, failed, pending),
 * rather than assuming success merely from the presence of a debit.
 *
 * @file src/app/api/generate-cosmic-recipe/cosmicRefundSettlement.ts
 */

import type { RefundOutcomeStatus } from "@/lib/cooking/recipePipelineTelemetry";
import { tokenEconomy, type CreditResult } from "@/services/TokenEconomyService";
import type { TokenType } from "@/types/economy";
import { logger } from "@/utils/logger";

export interface SpendRecord {
  userId: string;
  groupId: string;
  costs: { spirit: number; essence: number; matter: number; substance: number };
  refund: { spirit: number; essence: number; matter: number; substance: number };
}

export interface CosmicRefundOutcome {
  refunded: boolean;
  refundStatus: RefundOutcomeStatus | null;
  refundAmounts: {
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
  } | null;
  creditResult?: CreditResult;
  error?: string;
}

function buildRefundCredits(
  refund: SpendRecord["refund"],
): Array<{ tokenType: TokenType; amount: number }> {
  return [
    { tokenType: "Spirit", amount: refund.spirit },
    { tokenType: "Essence", amount: refund.essence },
    { tokenType: "Matter", amount: refund.matter },
    { tokenType: "Substance", amount: refund.substance },
  ];
}

function handleCreditFailure(
  spend: SpendRecord,
  outcome: Extract<CreditResult, { status: "failed" }>,
): CosmicRefundOutcome {
  logger.error(
    "[generate-cosmic-recipe] REFUND FAILED - user charged, no recipe",
    {
      userId: spend.userId,
      transactionGroupId: spend.groupId,
      code: outcome.code,
      constraint: outcome.constraint,
      message: outcome.message,
    },
  );
  return {
    refunded: false,
    refundStatus: "failed",
    refundAmounts: spend.refund,
    creditResult: outcome,
  };
}

/**
 * Execute a truthful refund for an incomplete cosmic recipe generation.
 *
 * Guarantees:
 * 1. Only positive net axes generate ledger rows in TokenEconomyService.
 * 2. Uses the debit's groupId as the sourceId and idempotent key shape.
 * 3. Maps TokenEconomy CreditResult to explicit, truthful settlement states:
 *    - "credited" | "replayed" | "already_applied" -> "confirmed" (refunded: true)
 *    - "failed" -> "failed" (refunded: false)
 *    - throws / exceptions -> "failed" (refunded: false)
 */
export async function settleCosmicRecipeRefund(
  spend: SpendRecord | null,
): Promise<CosmicRefundOutcome> {
  if (!spend) {
    return {
      refunded: false,
      refundStatus: null,
      refundAmounts: null,
    };
  }

  try {
    const outcome = await tokenEconomy.creditMultipleTokensDetailed(
      spend.userId,
      buildRefundCredits(spend.refund),
      "cosmic_recipe_refund",
      {
        sourceId: spend.groupId,
        idempotencyKey: `cosmic_recipe_refund:${spend.groupId}`,
        description: "Refund - cosmic recipe generation produced no recipe",
      },
    );

    if (
      outcome.status === "credited" ||
      outcome.status === "replayed" ||
      outcome.status === "already_applied"
    ) {
      return {
        refunded: true,
        refundStatus: "confirmed",
        refundAmounts: spend.refund,
        creditResult: outcome,
      };
    }

    return handleCreditFailure(spend, outcome);
  } catch (error) {
    logger.error("[generate-cosmic-recipe] refund threw", error);
    return {
      refunded: false,
      refundStatus: "failed",
      refundAmounts: spend.refund,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
