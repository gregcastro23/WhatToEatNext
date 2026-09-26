/**
 * Wire types for /api/admin/restaurants/settlement (restaurant ESMS order
 * settlement: retry a failed Stripe transfer, or refund the ESMS debit).
 *
 * @file src/types/adminSettlement.ts
 */

import type { TokenBalances, TokenType } from "@/types/economy";

/** A queued order as the GET returns it (snake_case: straight from SQL). */
export interface SettlementPendingOrder {
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
  created_at: string;
}

/** GET — `lifetime: null` means the totals query failed (unknown, not zero). */
export interface SettlementListResponse {
  success: true;
  pending: SettlementPendingOrder[];
  lifetime: { orders: number; restaurants: number } | null;
}

/** POST — the two successful outcomes. Failures are `{ success: false, message }`. */
export type SettlementActionResponse =
  | { success: true; action: "retry"; orderId: string; transferId: string; status: "paid" }
  | {
      success: true;
      action: "refund";
      orderId: string;
      credited: Array<{ tokenType: TokenType; amount: number }>;
      balances: TokenBalances;
      status: "refunded";
    };
