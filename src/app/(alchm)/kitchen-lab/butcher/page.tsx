"use client";

import { Suspense, type JSX } from "react";
import { ButcherLabApp } from "./_lab/ButcherLabApp";
import "./_lab/butcher.css";

/**
 * `/kitchen-lab/butcher` — the Alchm Kitchen Butcher Shop.
 *
 * Uses a Suspense boundary around `useSearchParams()` so the route prerenders
 * cleanly and resolves `?species=`, `?cut=`, and `?tab=` on the client.
 *
 * @file src/app/(alchm)/kitchen-lab/butcher/page.tsx
 */
export default function KitchenLabButcherPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <p className="px-5 py-8 text-sm text-white/50">
          Loading the Butcher Shop…
        </p>
      }
    >
      <ButcherLabApp />
    </Suspense>
  );
}
