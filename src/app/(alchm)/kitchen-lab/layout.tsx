import type { ReactNode, JSX } from "react";
import { LabShell } from "@/components/lab/LabShell";

/**
 * Kitchen Lab chrome.
 *
 * Sits INSIDE the `(alchm)` route group on purpose. That group's layout sets
 * `export const dynamic = "force-dynamic"` and supplies the per-request
 * Chakra/User/Alchemical providers. Hoisting either lab to a top-level segment
 * would silently drop both — and a segment-cached lab page can serve one
 * user's stored chart to the next visitor, which is a data leak rather than a
 * styling regression.
 *
 * The accent is the only thing that differs between the two labs; everything
 * structural lives in LabShell so the labs stay navigable as siblings.
 */
export default function KitchenLabLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <LabShell lab="kitchenLab" accent="text-amber-200">
      {children}
    </LabShell>
  );
}
