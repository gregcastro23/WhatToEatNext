/**
 * Webhook handler — credits ESMS for a paid MCP top-up Checkout session.
 *
 * Lives outside the Next.js route file so it can be unit-tested in
 * isolation (`route.ts` files can only export HTTP method handlers).
 *
 * Idempotency: the Stripe session id is the idempotency key, so a webhook
 * redelivery cannot double-credit. `creditMultipleTokensDetailed` reports
 * that replay as `status: "replayed"` — a DISTINCT outcome from a rolled-back
 * transaction, which is the distinction this handler exists to respect.
 *
 * ─── Why a failed credit must not answer 200 ───
 *
 * Stripe has already taken the customer's money by the time this runs. Stripe
 * retries a delivery only while the endpoint answers non-2xx, for up to three
 * days; once it sees a 2xx the event is settled forever. So an unhandled write
 * failure that still reports success is an unrecoverable loss of paid-for
 * tokens — there is no later attempt to fix it.
 *
 * The two error directions are therefore NOT symmetric:
 *
 *   - retrying a credit that already landed is FREE — the idempotency key
 *     turns the retry into a no-op replay;
 *   - answering 200 on a credit that did not land is UNRECOVERABLE.
 *
 * Hence the rule below: throw (⇒ retry) unless the failure is provably
 * permanent, in which case retrying for three days is pure noise and the
 * event needs an operator instead.
 */

import { _logger } from "@/lib/logger";
import { buildCreditPayload, findSku } from "./mcpTopUp";

/** Minimal subset of Stripe.Checkout.Session this handler needs. */
export interface McpTopUpCheckoutSession {
  id: string;
  payment_status: string;
  metadata?: Record<string, string> | null;
}

export interface McpTopUpHandlerResult {
  outcome:
    /** Ledger rows were written. Tokens are in the user's balance. */
    | "credited"
    /** This session was already credited; the tokens are already there. */
    | "replayed"
    | "pending-payment"
    | "missing-metadata"
    | "unknown-sku"
    /**
     * The credit rolled back for a reason a retry cannot fix (no such user).
     * The customer HAS PAID and holds no tokens — this outcome always needs
     * an operator, and is deliberately not retried.
     */
    | "credit-failed";
  userId?: string;
  sku?: string;
}

/**
 * Pure-ish handler — DB I/O is fully delegated to
 * `tokenEconomy.creditMultipleTokensDetailed`.
 * Returns a structured outcome so the webhook route can log uniformly
 * and tests can assert on the path without inspecting log output.
 *
 * Throws when the credit failed for a reason a retry might fix, so the route
 * answers non-2xx and Stripe redelivers. Missing metadata, an unknown SKU, and
 * a credit rejected because the user does not exist all return a non-throwing
 * outcome: those are permanent, and no number of retries changes them.
 */
export async function handleMcpTopUpCheckout(
  session: McpTopUpCheckoutSession,
): Promise<McpTopUpHandlerResult> {
  if (session.payment_status !== "paid") {
    return { outcome: "pending-payment" };
  }

  const userId = session.metadata?.userId;
  const sku = session.metadata?.sku;
  if (!userId || !sku) {
    return { outcome: "missing-metadata" };
  }

  const def = findSku(sku);
  if (!def) {
    return { outcome: "unknown-sku", userId, sku };
  }

  // Both symbols come from ONE import call: jest runs with `resetModules`, so a
  // second `await import()` would resolve into a fresh registry and miss a spy
  // installed on the first.
  const { tokenEconomy, isMissingUserFailure } = await import(
    "@/services/TokenEconomyService"
  );
  const credits = buildCreditPayload(def);
  const result = await tokenEconomy.creditMultipleTokensDetailed(
    userId,
    credits,
    "mcp_top_up",
    {
      sourceId: def.sku,
      description: `MCP top-up · ${def.label}`,
      idempotencyKey: `mcp_top_up:${session.id}`,
    },
  );

  switch (result.status) {
    case "credited":
      // A partial write means some axes hit their per-type idempotency key and
      // others did not — the customer got an uneven bundle. Rows DID land, so
      // this is not a failure and must not be retried, but it is anomalous
      // enough to name in the logs.
      if (result.written < result.requested) {
        // Error level, not warn: the credits run in ONE all-or-nothing
        // transaction, so a partial write should be impossible — and
        // `_logger.warn` is compiled out in production, which is the only
        // environment where a real customer's bundle can come out uneven.
        _logger.error(
          `[mcp-top-up] partial credit for user=${userId} sku=${def.sku} session=${session.id}: ` +
            `${result.written}/${result.requested} axes written`,
        );
      }
      return { outcome: "credited", userId, sku };

    case "replayed":
      // Stripe redelivered an event already credited under this key. Expected,
      // not an error: the tokens are already in the balance.
      return { outcome: "replayed", userId, sku };

    case "already_applied":
      // Unreachable here: this status comes from the daily-yield uniqueness
      // index, whose partial index covers only DAILY_YIELD_SOURCES
      // (`agents_yield`, `daily_yield`) — never `mcp_top_up`. Handled anyway so
      // the switch stays exhaustive if that source list ever grows. The name is
      // the contract: the credit IS applied, so this is not a loss.
      _logger.warn(
        `[mcp-top-up] unexpected already_applied for user=${userId} sku=${def.sku} session=${session.id} — ` +
          "did DAILY_YIELD_SOURCES change?",
      );
      return { outcome: "replayed", userId, sku };

    case "failed": {
      if (isMissingUserFailure(result)) {
        // Permanent: the row can never be written for this user id, so three
        // days of retries would only delay the alert. The customer has paid and
        // has no tokens — this needs a human, not another delivery attempt.
        _logger.error(
          `[mcp-top-up] PAID BUT NOT CREDITED — no such user. user=${userId} sku=${def.sku} ` +
            `session=${session.id} code=${result.code ?? "—"} constraint=${result.constraint ?? "—"}. ` +
            "Refund or credit manually; Stripe will NOT retry this event.",
        );
        return { outcome: "credit-failed", userId, sku };
      }

      // Everything else — connection loss, deadlock, serialization failure,
      // shutdown — is possibly transient. Throwing makes the route answer
      // non-2xx so Stripe redelivers; the idempotency key makes that safe even
      // if the write actually did land.
      throw new Error(
        `MCP top-up credit failed for user=${userId} sku=${def.sku} session=${session.id} ` +
          `(code=${result.code ?? "—"} constraint=${result.constraint ?? "—"}): ${result.message}`,
      );
    }
  }
}
