/**
 * Webhook handler — credits ESMS for a paid MCP top-up Checkout session.
 *
 * Lives outside the Next.js route file so it can be unit-tested in
 * isolation (`route.ts` files can only export HTTP method handlers).
 *
 * Idempotency: the Stripe session id is the idempotency key so a
 * webhook retry (Stripe retries on any 5xx) won't double-credit.
 * `creditMultipleTokens` detects the conflict via the
 * `token_transactions.idempotency_key` unique constraint and returns
 * null on the replay — which is treated as success here.
 */

import { buildCreditPayload, findSku } from "./mcpTopUp";

/** Minimal subset of Stripe.Checkout.Session this handler needs. */
export interface McpTopUpCheckoutSession {
  id: string;
  payment_status: string;
  metadata?: Record<string, string> | null;
}

export interface McpTopUpHandlerResult {
  outcome:
    | "credited"
    | "pending-payment"
    | "missing-metadata"
    | "unknown-sku"
    | "credit-failed";
  userId?: string;
  sku?: string;
}

/**
 * Pure-ish handler — DB I/O is fully delegated to `tokenEconomy.creditMultipleTokens`.
 * Returns a structured outcome so the webhook route can log uniformly
 * and tests can assert on the path without inspecting log output.
 *
 * Throws only on transient DB failures (so Stripe retries the webhook).
 * Missing metadata or unknown SKUs return a non-throwing outcome —
 * those are permanent data errors that won't be fixed by a retry.
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

  const { tokenEconomy } = await import("@/services/TokenEconomyService");
  const credits = buildCreditPayload(def);
  await tokenEconomy.creditMultipleTokens(userId, credits, "mcp_top_up", {
    sourceId: def.sku,
    description: `MCP top-up · ${def.label}`,
    idempotencyKey: `mcp_top_up:${session.id}`,
  });
  return { outcome: "credited", userId, sku };
}
