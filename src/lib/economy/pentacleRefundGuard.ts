/**
 * A `pentacle_conversion_refund` returns ESMS that sync-debit took for an
 * ESMS → Pentacles conversion whose pentacles never landed. It is
 * compensation, not income, so it may return at most what that conversion
 * debited, axis by axis. Without this check a refund with no debit behind it
 * would mint ESMS.
 *
 * The agents app debits under `pentacle_conv:<quoteId>` and refunds under
 * `pentacle_conv_refund:<quoteId>`. The refund key is single-use (sync-credit's
 * idempotency check), so a quote refunds once.
 *
 * @file src/lib/economy/pentacleRefundGuard.ts
 */

import { executeQuery } from "@/lib/database";
import { pentacleConversionDebitsSql } from "@/services/tokenEconomyQueries";
import type { TokenType } from "@/types/economy";

const REFUND_KEY_PREFIX = "pentacle_conv_refund:";
/** Half an atom at DECIMAL(12,4): the debit and the refund carry the same 4-dp amount. */
const ATOM_TOLERANCE = 0.00005;

export interface RefundCredit {
  tokenType: TokenType;
  amount: number;
}

/**
 * Why a refund is not covered by its conversion's debit, or null when every
 * axis it credits is covered.
 */
export async function uncoveredPentacleRefund(
  userId: string,
  idempotencyKey: string,
  credits: readonly RefundCredit[],
): Promise<string | null> {
  const quoteId = idempotencyKey.startsWith(REFUND_KEY_PREFIX)
    ? idempotencyKey.slice(REFUND_KEY_PREFIX.length)
    : "";
  if (quoteId.length === 0) {
    return `A pentacle conversion refund must be keyed ${REFUND_KEY_PREFIX}<quoteId>.`;
  }

  const query = pentacleConversionDebitsSql({ userId, quoteId });
  const debited = await executeQuery<{ token_type: string; debited: string }>(
    query.sql,
    query.values,
  );
  const byType = new Map(debited.rows.map((r) => [r.token_type, Number(r.debited)]));

  for (const { tokenType, amount } of credits) {
    const available = byType.get(tokenType) ?? 0;
    if (amount > available + ATOM_TOLERANCE) {
      return `The ${tokenType} refund (${amount}) exceeds the ${available} this conversion debited.`;
    }
  }
  return null;
}
