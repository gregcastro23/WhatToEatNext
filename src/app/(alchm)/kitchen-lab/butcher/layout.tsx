import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Route metadata and self-canonical for `/kitchen-lab/butcher`.
 * Keeps canonical isolated to this leaf segment (`canonicals.test.ts`).
 */
export const metadata: Metadata = {
  title: "Butcher Shop",
  description:
    "Interactive 3D anatomical butcher shop & meat physics lab: explore 52 USDA-pinned cuts across 5 species, slice across the grain, and model collagen-to-gelatin kinetics.",
  alternates: { canonical: "/kitchen-lab/butcher" },
};

export default function KitchenLabButcherLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return children;
}
