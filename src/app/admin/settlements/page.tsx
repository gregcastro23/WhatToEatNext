"use client";

import React from "react";
import SettlementPanel from "@/components/admin/SettlementPanel";

/**
 * /admin/settlements — restaurant ESMS settlement operator screen.
 *
 * The handle for the crypto-food payment rail: resolve orders where ESMS was
 * debited but the restaurant's fiat transfer isn't confirmed. See
 * docs/payments/CRYPTO_FOOD_PAYMENTS.md.
 */
export default function AdminSettlementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Restaurant Settlements
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Resolve orders where ESMS was debited but the restaurant transfer is
          unconfirmed. Retry re-issues the transfer idempotently; refund
          re-credits ESMS only when no transfer exists.
        </p>
      </div>

      <SettlementPanel />
    </div>
  );
}
