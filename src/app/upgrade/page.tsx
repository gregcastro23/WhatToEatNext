/**
 * /upgrade — Server-side redirect to /premium.
 *
 * Several places in the app link to /upgrade (PremiumGate component,
 * TokenGate component, middleware redirects for premium-gated routes).
 * The actual pricing/checkout dashboard lives at /premium, so this route
 * is a thin redirect that preserves any query params (`?from=...`,
 * `?checkout=...`) so the destination can show contextual messaging.
 *
 * @file src/app/upgrade/page.tsx
 */

import { redirect } from "next/navigation";

interface UpgradePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const params = await searchParams;
  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      queryString.set(key, value);
    } else if (Array.isArray(value) && value.length > 0) {
      queryString.set(key, value[0]);
    }
  }

  const qs = queryString.toString();
  redirect(qs ? `/premium?${qs}` : "/premium");
}
