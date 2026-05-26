/**
 * /account/billing/mcp — buy-button page for the MCP top-up SKUs.
 *
 * Server component shell mounts the client panel; auth and DB I/O all
 * happen inside the panel's fetch calls so this segment stays fast.
 *
 * Wrapped in <Suspense> because the panel uses useSearchParams to
 * surface ?status=success / ?status=canceled after the Stripe return —
 * Next.js requires Suspense around any client component that reads
 * search params in app router.
 *
 * @file src/app/(alchm)/account/billing/mcp/page.tsx
 */

import { Suspense } from "react";
import { McpTopUpPanel } from "@/components/account/McpTopUpPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "MCP top-up — alchm.kitchen",
  description:
    "Buy ESMS bundles to use against the alchm.kitchen MCP tools.",
};

export default function McpBillingPage() {
  return (
    <Suspense fallback={null}>
      <McpTopUpPanel />
    </Suspense>
  );
}
