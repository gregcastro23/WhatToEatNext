import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * The page is a client component and cannot export metadata, so its title
 * and canonical live here. A leaf segment: no child route inherits them
 * (canonicals.test.ts).
 */
export const metadata: Metadata = {
  title: "Baking Lab",
  description:
    "Formulate, substitute and bake in one instrument: USDA-sourced ingredient vectors, true hydration, water activity, a counter-balance patch solver, and a 1D heat-and-moisture oven simulator.",
  alternates: { canonical: "/kitchen-lab/baking" },
};

export default function KitchenLabBakingLayout({ children }: { children: ReactNode }): ReactNode {
  return children;
}
