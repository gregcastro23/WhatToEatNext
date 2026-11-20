"use client";

import { Suspense, type JSX } from "react";
import { SauceLabApp } from "./_lab/SauceLabApp";
import "./_lab/sauceLab.css";

/**
 * `/kitchen-lab/sauces` — the Sauce Lab inside Kitchen Lab.
 *
 * Dual-lens workbench: Real Physics (emulsion packing, Stokes creaming, starch/yolk
 * thermal windows, open-pan reduction mass balance) paired alongside Alchm Pairing
 * Studio and Mother-Sauce Phylogeny Forest.
 *
 * @file src/app/(alchm)/kitchen-lab/sauces/page.tsx
 */
export default function KitchenLabSaucesPage(): JSX.Element {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-white/50">Loading the Sauce Lab…</p>}>
      <SauceLabApp />
    </Suspense>
  );
}
