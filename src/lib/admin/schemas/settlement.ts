/**
 * Client-side validators for /api/admin/restaurants/settlement (SettlementPanel).
 *
 * @file src/lib/admin/schemas/settlement.ts
 */

import { z } from "zod";
import type { AssertTrue, ServerSatisfies } from "@/lib/admin/schemas/drift";
import type {
  SettlementActionResponse,
  SettlementListResponse,
  SettlementPendingOrder,
} from "@/types/adminSettlement";

export const SettlementPendingOrderSchema = z.object({
  id: z.string(),
  user_id: z.string().nullable(),
  restaurant_name: z.string(),
  currency: z.string(),
  transfer_amount_cents: z.number(),
  stripe_connected_account_id: z.string().nullable(),
  stripe_transfer_id: z.string().nullable(),
  status: z.string(),
  payment_status: z.string().nullable(),
  transfer_status: z.string().nullable(),
  created_at: z.string(),
});

type _PendingOrderDrift = AssertTrue<
  ServerSatisfies<SettlementPendingOrder, z.infer<typeof SettlementPendingOrderSchema>>
>;
type _PendingOrderExact = AssertTrue<
  ServerSatisfies<z.infer<typeof SettlementPendingOrderSchema>, SettlementPendingOrder>
>;

export const SettlementListResponseSchema = z.object({
  success: z.literal(true),
  pending: z.array(SettlementPendingOrderSchema),
  lifetime: z.object({ orders: z.number(), restaurants: z.number() }).nullable(),
});

type _SettlementListDrift = AssertTrue<
  ServerSatisfies<SettlementListResponse, z.infer<typeof SettlementListResponseSchema>>
>;

/** The fields the panel reads from either successful outcome. */
export const SettlementActionSuccessSchema = z.object({
  success: z.literal(true),
  action: z.enum(["retry", "refund"]),
  orderId: z.string(),
  transferId: z.string().exactOptional(),
  status: z.string(),
});

type _SettlementActionDrift = AssertTrue<
  ServerSatisfies<SettlementActionResponse, z.infer<typeof SettlementActionSuccessSchema>>
>;

/** Any failure body: `{ success: false, message }`. */
export const SettlementFailureSchema = z.object({ message: z.string().optional() });
