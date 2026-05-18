/**
 * /upgrade — premium gate.
 *
 * The site's middleware redirects free users here with `?from=<route>`
 * whenever they hit a premium-gated route. This page renders the
 * 3-tier picker (Apprentice / Practitioner / Alchemist) and surfaces
 * the route the user was reaching for via the locked preview panel.
 *
 * The pricing dashboard at /premium remains the full marketing/billing
 * surface; this route is the conversion gate.
 *
 * @file src/app/upgrade/page.tsx
 */

import { Suspense } from "react";
import { UpgradeGateFromQuery } from "@/components/auth/AuthFollowups";
import { auth } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
  const session = await auth();
  const isPremium =
    (session?.user as { tier?: "free" | "premium" } | undefined)?.tier === "premium";
  const tier: "free" | "alchemist" = isPremium ? "alchemist" : "free";

  return (
    <Suspense fallback={null}>
      <UpgradeGateFromQuery currentTier={tier} />
    </Suspense>
  );
}
