/**
 * Admin Restaurant ESMS Settlement Operations
 *
 * GET  /api/admin/restaurants/settlement — list orders stuck in
 *      settlement_pending (token already debited, restaurant transfer not
 *      confirmed).
 * POST /api/admin/restaurants/settlement — resolve one such order:
 *      { orderId, action: "retry" | "refund" }
 *
 *   - "retry": re-issue the Stripe transfer using the SAME deterministic
 *     idempotency key the original attempt used
 *     (`restaurant_order_esms_transfer_<orderId>`). If a transfer was in fact
 *     created the first time, Stripe returns that same transfer rather than
 *     double-paying. On success the order is marked paid and fulfillment is
 *     (re)triggered.
 *   - "refund": only after confirming via Stripe that NO transfer exists for
 *     this order's transfer_group, re-credit the exact ESMS the order debited
 *     (idempotency-guarded) and mark the order refunded.
 *
 * This is the authenticated operator workflow required by
 * docs/payments/CRYPTO_FOOD_PAYMENTS.md before a public launch.
 *
 * @file src/app/api/admin/restaurants/settlement/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { getStripe } from "@/lib/stripe/stripe";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { TOKEN_TYPES, type TokenType } from "@/types/economy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface OrderRow {
  id: string;
  user_id: string | null;
  restaurant_name: string;
  currency: string;
  transfer_amount_cents: number;
  stripe_connected_account_id: string | null;
  stripe_transfer_id: string | null;
  status: string;
  payment_status: string | null;
  transfer_status: string | null;
}

const bodySchema = z.object({
  orderId: z.string().min(8).max(120),
  action: z.enum(["retry", "refund"]),
});

async function loadOrder(orderId: string): Promise<OrderRow | null> {
  const result = await executeQuery<OrderRow>(
    `SELECT id, user_id, restaurant_name, currency, transfer_amount_cents,
            stripe_connected_account_id, stripe_transfer_id,
            status, payment_status, transfer_status
     FROM restaurant_order_intents
     WHERE id = $1`,
    [orderId],
  );
  return result.rows[0] ?? null;
}

async function updateOrder(input: {
  orderId: string;
  status: string;
  transferId?: string | null;
  transferStatus: string;
  paymentStatus: string;
  completed: boolean;
  metadata: Record<string, unknown>;
}): Promise<void> {
  await executeQuery(
    `UPDATE restaurant_order_intents
     SET status = $2,
         stripe_transfer_id = COALESCE($3, stripe_transfer_id),
         transfer_status = $4,
         payment_status = $5,
         metadata = metadata || $6::jsonb,
         completed_at = CASE WHEN $7 THEN NOW() ELSE completed_at END,
         updated_at = NOW()
     WHERE id = $1`,
    [
      input.orderId,
      input.status,
      input.transferId ?? null,
      input.transferStatus,
      input.paymentStatus,
      JSON.stringify(input.metadata),
      input.completed,
    ],
  );
}

/** Sum the exact ESMS this order debited (source_type='restaurant_order'). */
async function debitedBasket(
  orderId: string,
): Promise<Array<{ tokenType: TokenType; amount: number }>> {
  const result = await executeQuery<{ token_type: string; total: string }>(
    `SELECT token_type, SUM(amount) AS total
     FROM token_transactions
     WHERE source_type = 'restaurant_order'
       AND source_id = $1
       AND amount < 0
     GROUP BY token_type`,
    [orderId],
  );
  const credits: Array<{ tokenType: TokenType; amount: number }> = [];
  for (const row of result.rows) {
    const tokenType = TOKEN_TYPES.find((t) => t === row.token_type);
    if (!tokenType) continue;
    const debited = Number(row.total); // negative
    const refundAmount = Math.abs(debited);
    if (refundAmount > 0) credits.push({ tokenType, amount: refundAmount });
  }
  return credits;
}

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  try {
    const result = await executeQuery<OrderRow & { created_at: string }>(
      `SELECT id, user_id, restaurant_name, currency, transfer_amount_cents,
              stripe_connected_account_id, stripe_transfer_id,
              status, payment_status, transfer_status, created_at
       FROM restaurant_order_intents
       WHERE status = 'settlement_pending'
          OR transfer_status = 'retry_required'
       ORDER BY created_at DESC
       LIMIT 100`,
    );
    return NextResponse.json({ success: true, pending: result.rows });
  } catch (error) {
    _logger.error("[admin/restaurants/settlement] list failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not list pending settlements." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? err.issues[0]?.message ?? "Invalid body"
        : "Invalid JSON";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }

  const { orderId, action } = body;
  const operator = authResult.user.email;

  const order = await loadOrder(orderId);
  if (!order) {
    return NextResponse.json(
      { success: false, message: "Order not found." },
      { status: 404 },
    );
  }

  // Only ESMS orders left in a pending/retry state are eligible.
  const isPending =
    order.status === "settlement_pending" ||
    order.transfer_status === "retry_required";
  if (!isPending) {
    return NextResponse.json(
      {
        success: false,
        message: `Order is not awaiting settlement (status=${order.status}, transfer_status=${order.transfer_status}).`,
      },
      { status: 409 },
    );
  }

  const transferGroup = `restaurant_order_${orderId}`;
  const stripe = getStripe();

  if (action === "retry") {
    if (!order.stripe_connected_account_id || order.transfer_amount_cents <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order is missing a connected account or transfer amount; cannot retry.",
        },
        { status: 409 },
      );
    }
    try {
      const transfer = await stripe.transfers.create(
        {
          amount: order.transfer_amount_cents,
          currency: order.currency,
          destination: order.stripe_connected_account_id,
          transfer_group: transferGroup,
          metadata: {
            purpose: "restaurant_order_esms_settlement_retry",
            orderId,
            operator,
          },
        },
        { idempotencyKey: `restaurant_order_esms_transfer_${orderId}` },
      );

      await updateOrder({
        orderId,
        status: "paid",
        transferId: transfer.id,
        transferStatus: "created",
        paymentStatus: "paid_with_esms",
        completed: true,
        metadata: {
          settlementRetry: {
            at: new Date().toISOString(),
            operator,
            transferId: transfer.id,
          },
        },
      });

      try {
        const { triggerOrderFulfillment } = await import(
          "@/lib/orders/fulfillment"
        );
        await triggerOrderFulfillment(orderId);
      } catch (error) {
        _logger.error(
          `[admin/restaurants/settlement] retry fulfillment failed: ${orderId}`,
          error,
        );
      }

      return NextResponse.json({
        success: true,
        action,
        orderId,
        transferId: transfer.id,
        status: "paid",
      });
    } catch (error) {
      _logger.error(
        `[admin/restaurants/settlement] retry transfer failed: ${orderId}`,
        error,
      );
      return NextResponse.json(
        {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Stripe transfer retry failed.",
        },
        { status: 502 },
      );
    }
  }

  // action === "refund"
  try {
    // Refund is only safe if NO transfer was actually created for this order.
    const existing = await stripe.transfers.list({
      transfer_group: transferGroup,
      limit: 1,
    });
    if (existing.data.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A Stripe transfer already exists for this order — the restaurant was paid. Use retry to mark it paid instead of refunding ESMS.",
          transferId: existing.data[0]?.id,
        },
        { status: 409 },
      );
    }

    if (!order.user_id) {
      return NextResponse.json(
        { success: false, message: "Order has no user to refund." },
        { status: 409 },
      );
    }

    const credits = await debitedBasket(orderId);
    if (credits.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No ESMS debit found for this order; nothing to refund.",
        },
        { status: 409 },
      );
    }

    // Idempotency-guarded re-credit of the exact debited basket. Repeating the
    // refund returns the existing balance without double-crediting.
    const balances = await tokenEconomy.creditMultipleTokens(
      order.user_id,
      credits,
      "restaurant_refund",
      {
        sourceId: orderId,
        idempotencyKey: `restaurant_refund:${orderId}`,
        description: `Refund for ${order.restaurant_name} (settlement failed) by ${operator}`,
      },
    );

    if (balances === null) {
      return NextResponse.json(
        { success: false, message: "Refund credit failed." },
        { status: 500 },
      );
    }

    await updateOrder({
      orderId,
      status: "refunded",
      transferStatus: "refunded",
      paymentStatus: "esms_refunded",
      completed: false,
      metadata: {
        settlementRefund: {
          at: new Date().toISOString(),
          operator,
          credited: credits,
        },
      },
    });

    return NextResponse.json({
      success: true,
      action,
      orderId,
      credited: credits,
      balances,
      status: "refunded",
    });
  } catch (error) {
    _logger.error(
      `[admin/restaurants/settlement] refund failed: ${orderId}`,
      error,
    );
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "ESMS refund failed.",
      },
      { status: 502 },
    );
  }
}
