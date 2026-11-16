"use client";

import { Suspense, type JSX } from "react";
import { BakingLabApp } from "./_lab/BakingLabApp";
import "./_lab/baking.css";

/**
 * `/kitchen-lab/baking` — the Baking Lab.
 *
 * One formula, read four ways: its molecular telemetry (USDA-sourced
 * functional vectors, true hydration, Norrish water activity, POD/PAC, the
 * acid–base balance), what a substitution breaks and how to counter-balance
 * it, a 1D heat-moisture-gas simulation of the bake, and — on its own tab,
 * under its own banner — the alchm elemental projection of the same numbers.
 *
 * The tab is derived from `?tab=` (bakingTabs.ts), so it needs a Suspense
 * boundary: the route is prerendered without a query, and the lab resolves on
 * the client.
 *
 * @file src/app/(alchm)/kitchen-lab/baking/page.tsx
 */
export default function KitchenLabBakingPage(): JSX.Element {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-white/50">Loading the Baking Lab…</p>}>
      <BakingLabApp />
    </Suspense>
  );
}
